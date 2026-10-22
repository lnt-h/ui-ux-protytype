'use strict';
/* State/action tests in a minimal Node VM. This is not browser, layout,
 * service-worker, audio-device, GPS, native or live-model verification. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const data=require('../prototype/data.js');
const core=require('../prototype/core.js');
const source=fs.readFileSync(path.join(__dirname,'../prototype/app.js'),'utf8');
const visualSource=fs.readFileSync(path.join(__dirname,'../prototype/visuals.js'),'utf8');
const clone=x=>JSON.parse(JSON.stringify(x));

function environment(){
  const listeners={},errors=[],storage=new Map(),nodes={};
  function node(id){return nodes[id]||(nodes[id]={innerHTML:'',textContent:'',value:'',scrollTop:0,scrollHeight:100,focus(){},querySelector(){return null}})}
  class FakeAudio{constructor(){this.paused=true;this.currentTime=0;this.duration=NaN;this.playbackRate=1}addEventListener(){}pause(){this.paused=true}play(){this.paused=false;return Promise.resolve()}}
  class FakeFormData{constructor(form){this.fields=form.fields||{}}get(key){return this.fields[key]??null}getAll(key){const value=this.fields[key];return value==null?[]:Array.isArray(value)?value:[value]}}
  const document={
    addEventListener(type,fn){(listeners[type]||(listeners[type]=[])).push(fn)},
    getElementById(id){return ['app','toast-root','adjust-input','announce'].includes(id)?node(id):null},
    querySelector(selector){return selector==='.scroll'?node('scroll'):selector.includes('h1')?node('heading'):null},
    querySelectorAll(){return []},activeElement:null,
    documentElement:{dataset:{},style:{}},body:{classList:{add(){},remove(){}}},
    createElement(){return {click(){},style:{}}}
  };
  const sandbox={GN_DATA:data,GN_CORE:core,document,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    Audio:FakeAudio,FormData:FakeFormData,navigator:{onLine:true},
    location:{protocol:'http:',href:'http://localhost:8765/prototype/index.html',search:''},
    URL,URLSearchParams,Blob,Date,Math,JSON,Set,Map,Promise,
    setTimeout(){return 1},clearTimeout(){},requestAnimationFrame(fn){fn();return 1},
    console:{log(){},warn(){},error(...args){errors.push(args.map(String).join(' '))}},
    isSecureContext:false,addEventListener(){},matchMedia(){return {matches:false,addEventListener(){}}},
    open(){},scrollTo(){},performance:{now:()=>0}
  };
  sandbox.window=sandbox;
  vm.createContext(sandbox);vm.runInContext(visualSource,sandbox,{filename:'visuals.js'});vm.runInContext(source,sandbox,{filename:'app.js'});
  function click(action,params={}){
    const element={dataset:{action,...params},disabled:false};element.closest=()=>element;
    for(const fn of listeners.click||[])fn({target:element,preventDefault(){}});
  }
  function change(dataset,props={}){
    const element={dataset,value:'',checked:false,...props};
    for(const fn of listeners.change||[])fn({target:element});
  }
  function submit(form,fields){for(const fn of listeners.submit||[])fn({target:{dataset:{form},fields},preventDefault(){}})}
  function addTrip({active=true,index=0,arrived=false,locked=[]}={}){
    const plan={id:'input',title:'State test tour',revision:0,startId:'river',startMinutes:510,budget:360,mode:'car',endMode:'last',date:'2026-10-22',
      stops:[['cathedral',40],['museum',75],['lunch',60],['beach',75]].map(([id,duration])=>({id,duration,locked:locked.includes(id)}))};
    sandbox.GN.saveTrip(plan);const t=sandbox.GN.currentTrip;
    t.status=active?'active':'upcoming';t.progress={index,phase:arrived?'stop':'leg',visited:t.plan.stops.slice(0,index+(arrived?1:0)).map(s=>s.id),skipped:[]};
    sandbox.GN.render();return t;
  }
  return {g:sandbox.GN,click,change,submit,addTrip,errors};
}
const tests=[];
function test(name,fn){tests.push([name,fn])}
function assertNoRenderError(e){assert.deepEqual(e.errors,[],'VM rendering/action errors: '+e.errors.join('\n'))}

test('finishing before arrival and double-finishing cannot advance an unconfirmed next stop',()=>{
  const e=environment(),t=e.addTrip();
  e.click('finish-stop');assert.equal(t.progress.index,0);assert.equal(t.progress.visited.length,0);
  e.click('confirm-arrive');assert.deepEqual(clone(t.progress.visited),['cathedral']);
  e.click('finish-stop');assert.equal(t.progress.index,1);assert.equal(t.progress.phase,'leg');
  e.click('finish-stop');assert.equal(t.progress.index,1);assertNoRenderError(e);
});
test('arrival and manual playback context never complete a stop by themselves',()=>{
  const e=environment(),t=e.addTrip();e.click('confirm-arrive');
  assert.equal(t.progress.index,0);assert.equal(t.status,'active');
  e.click('story',{id:'bridge'});assert.equal(t.progress.index,0);assert.equal(t.plan.stops[0].id,'cathedral');assertNoRenderError(e);
});
test('skip confirmation is consumed once and cannot skip the next stop on a repeat event',()=>{
  const e=environment(),t=e.addTrip();e.click('skip-stop');assert.equal(e.g.ui.modal.kind,'skip');
  e.click('confirm-skip');assert.equal(t.progress.index,1);assert.deepEqual(clone(t.progress.skipped),['cathedral']);
  e.click('confirm-skip');assert.equal(t.progress.index,1);assert.deepEqual(clone(t.progress.skipped),['cathedral']);assertNoRenderError(e);
});
test('+15 is a preview; discard leaves accepted duration/revision/progress unchanged',()=>{
  const e=environment(),t=e.addTrip({arrived:true}),before=clone(t);
  e.click('extend-stop');assert.equal(t.plan.stops[0].duration,40);assert.equal(e.g.ui.pending.stops[0].duration,55);
  e.click('discard-extend');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('explicit +15 Apply changes only confirmed current duration and bumps one plan revision',()=>{
  const e=environment(),t=e.addTrip({arrived:true}),progress=clone(t.progress);
  e.click('extend-stop');e.click('apply-extend');
  assert.equal(t.plan.stops[0].duration,55);assert.equal(t.plan.revision,1);
  assert.equal(t.plan.stops[1].duration,75);assert.deepEqual(clone(t.progress),progress);assertNoRenderError(e);
});
test('explicit current +15 keeps a must-visit locked instead of silently unlocking it',()=>{
  const e=environment(),t=e.addTrip({arrived:true,locked:['cathedral']});
  e.click('extend-stop');e.click('apply-extend');
  assert.equal(t.plan.stops[0].duration,55);assert.equal(t.plan.stops[0].locked,true);assertNoRenderError(e);
});
test('pending +15 survives manual future edits and one explicit Apply',()=>{
  const e=environment(),t=e.addTrip({arrived:true});e.click('extend-stop');e.click('edit-pending');
  e.change({editDuration:'museum'},{value:'90'});e.click('review-manual');
  assert.equal(t.plan.stops[0].duration,40);assert.equal(e.g.ui.review.plan.stops[0].duration,55);
  e.click('apply-review');assert.equal(t.plan.stops[0].duration,55);assert.equal(t.plan.stops[1].duration,90);
  assert.equal(t.progress.index,0);assert.equal(t.plan.revision,1);assertNoRenderError(e);
});
test('pending +15 survives Adjust remaining without allowing AI to change past/current identity',()=>{
  const e=environment(),t=e.addTrip({arrived:true,locked:['cathedral']});
  e.click('extend-stop');e.click('adjust-pending');e.submit('adjust',{intent:'Only culture',locks:[]});
  assert.equal(e.g.ui.route,'review');assert.equal(t.plan.stops[0].duration,40);
  e.click('apply-review');assert.equal(t.plan.stops[0].id,'cathedral');assert.equal(t.plan.stops[0].duration,55);
  assert.equal(t.plan.stops[0].locked,true);assert.ok(!t.plan.stops.some(s=>s.id==='lunch'));assertNoRenderError(e);
});
test('pending +15 cannot become +30 through an invalid proposal mutation',()=>{
  const e=environment(),t=e.addTrip({arrived:true});e.click('extend-stop');e.g.ui.pending.stops[0].duration=70;e.click('apply-extend');
  assert.equal(t.plan.stops[0].duration,40);assert.equal(t.plan.revision,0);assertNoRenderError(e);
});
test('stale pending extension cannot overwrite a newer accepted plan',()=>{
  const e=environment(),t=e.addTrip({arrived:true});e.click('extend-stop');t.plan.revision++;t.plan.stops[1].duration=80;e.click('apply-extend');
  assert.equal(t.plan.stops[0].duration,40);assert.equal(t.plan.stops[1].duration,80);assert.equal(t.plan.revision,1);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('manual stale-revision review rejects overwrite after the editor opened',()=>{
  const e=environment(),t=e.addTrip();e.click('edit-trip');e.change({editDuration:'museum'},{value:'90'});
  t.plan.revision++;t.plan.stops[2].duration=65;e.click('review-manual');e.click('apply-review');
  assert.equal(t.plan.stops[1].duration,75);assert.equal(t.plan.stops[2].duration,65);assert.equal(t.plan.revision,1);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('AI stale-revision protection uses the snapshot at Adjust entry, not late review creation',()=>{
  const e=environment(),t=e.addTrip();e.click('adjust-trip');t.plan.revision++;t.plan.stops[2].duration=65;
  e.submit('adjust',{intent:'More beach time',locks:[]});e.click('apply-review');
  assert.equal(t.plan.stops.find(s=>s.id==='beach').duration,75);assert.equal(t.plan.stops[2].duration,65);assert.equal(t.plan.revision,1);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('progress advancing while a manual preview waits makes that preview stale',()=>{
  const e=environment(),t=e.addTrip();e.click('edit-trip');e.change({editDuration:'beach'},{value:'90'});e.click('review-manual');
  t.progress.index=1;t.progress.visited.push('cathedral');e.click('apply-review');
  assert.equal(t.plan.stops.find(s=>s.id==='beach').duration,75);assert.equal(t.progress.index,1);assert.equal(t.plan.revision,0);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('forged disabled actions cannot remove, move or resize fixed prefix or locked future stop',()=>{
  const e=environment(),t=e.addTrip({index:1,locked:['beach']});e.click('edit-trip');const before=clone(e.g.ui.edit.plan);
  e.click('remove-stop',{id:'cathedral'});e.click('move-stop',{id:'museum',value:'1'});e.change({editDuration:'cathedral'},{value:'75'});e.click('remove-stop',{id:'beach'});
  assert.deepEqual(clone(e.g.ui.edit.plan),before);assert.deepEqual(clone(t.plan),before);assertNoRenderError(e);
});
test('adjust checkboxes cannot silently unlock an existing must-visit',()=>{
  const e=environment(),t=e.addTrip({locked:['beach']});e.click('adjust-trip');e.submit('adjust',{intent:'Only culture',locks:[]});
  assert.ok(e.g.ui.review.plan.stops.some(s=>s.id==='beach'&&s.locked));e.click('apply-review');
  assert.ok(t.plan.stops.some(s=>s.id==='beach'&&s.locked));assertNoRenderError(e);
});
test('manual future unlock requires confirmation and authorises only that draft removal',()=>{
  const e=environment(),t=e.addTrip({locked:['museum']});e.click('edit-trip');
  e.change({editLock:'museum'},{checked:false});assert.equal(e.g.ui.edit.plan.stops[1].locked,true);assert.equal(e.g.ui.modal.kind,'unlock');
  e.click('confirm-unlock',{id:'museum'});e.click('remove-stop',{id:'museum'});e.click('review-manual');e.click('apply-review');
  assert.ok(!t.plan.stops.some(s=>s.id==='museum'));assert.equal(t.plan.stops[0].id,'cathedral');assert.equal(t.plan.revision,1);assertNoRenderError(e);
});
test('no-op manual review does not create a review or increment revision',()=>{
  const e=environment(),t=e.addTrip();e.click('edit-trip');e.click('review-manual');
  assert.equal(e.g.ui.route,'edit');assert.equal(e.g.ui.review,null);assert.equal(t.plan.revision,0);assert.match(e.g.ui.toast,/No changes/);assertNoRenderError(e);
});
test('header Back prompts for dirty editor and discard preserves the saved plan',()=>{
  const e=environment(),t=e.addTrip(),before=clone(t.plan);e.click('edit-trip');e.change({editDuration:'museum'},{value:'90'});e.click('back');
  assert.equal(e.g.ui.modal.kind,'leaveEdit');e.click('close-modal');assert.equal(e.g.ui.edit.plan.stops[1].duration,90);
  e.click('back');e.click('confirm-cancel-edit');assert.deepEqual(clone(t.plan),before);assert.equal(e.g.ui.edit,null);assertNoRenderError(e);
});
test('Back from Add stop returns to the same unsaved draft without discard',()=>{
  const e=environment();e.addTrip();e.click('edit-trip');e.change({editDuration:'museum'},{value:'90'});e.click('add-stop');e.click('back');
  assert.equal(e.g.ui.route,'edit');assert.equal(e.g.ui.modal,null);assert.equal(e.g.ui.edit.plan.stops[1].duration,90);assertNoRenderError(e);
});
test('unvisited unavailable current stop has an explicit replacement preview and safe apply',()=>{
  const e=environment(),t=e.addTrip(),before=clone(t.plan);e.g.ui.closedId='cathedral';e.click('replace-closed');
  assert.equal(e.g.ui.route,'replacement');e.click('choose-replacement',{id:'bridge'});assert.equal(e.g.ui.route,'review');assert.deepEqual(clone(t.plan),before);
  e.click('apply-review');assert.equal(t.plan.stops[0].id,'bridge');assert.equal(t.progress.index,0);assert.equal(t.progress.phase,'leg');assert.deepEqual(clone(t.progress.visited),[]);assert.equal(t.plan.revision,1);assertNoRenderError(e);
});
test('replacement of locked unavailable current stop requires explicit unlock consent',()=>{
  const e=environment(),t=e.addTrip({locked:['cathedral','museum']});e.click('replace-closed');assert.equal(e.g.ui.modal.kind,'replaceLocked');
  assert.equal(t.plan.stops[0].id,'cathedral');e.click('confirm-replace-unlock');e.click('choose-replacement',{id:'bridge'});e.click('apply-review');
  assert.equal(t.plan.stops[0].id,'bridge');assert.equal(t.plan.stops.find(s=>s.id==='museum').locked,true);assertNoRenderError(e);
});
test('confirmed current stop cannot be replaced; only future editing is offered',()=>{
  const e=environment(),t=e.addTrip({arrived:true});e.click('replace-closed');
  assert.equal(t.plan.stops[0].id,'cathedral');assert.equal(e.g.ui.route,'edit');assert.equal(e.g.ui.replacement,undefined);assert.match(e.g.ui.toast,/already confirmed/);assertNoRenderError(e);
});
test('arrival after replacement preview makes the replacement stale',()=>{
  const e=environment(),t=e.addTrip();e.click('replace-closed');e.click('choose-replacement',{id:'bridge'});
  t.progress.visited.push('cathedral');t.progress.phase='stop';e.click('apply-review');
  assert.equal(t.plan.stops[0].id,'cathedral');assert.equal(t.progress.phase,'stop');assert.equal(t.plan.revision,0);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('resuming a paused tour requires confirmation before pausing another active tour',()=>{
  const e=environment(),first=e.addTrip({arrived:true}),before=clone(first.progress),second=e.addTrip();second.status='paused';
  e.click('resume-trip');assert.equal(e.g.ui.modal.kind,'switch');assert.equal(first.status,'active');assert.equal(second.status,'paused');
  e.click('confirm-start');assert.equal(first.status,'paused');assert.equal(second.status,'active');assert.deepEqual(clone(first.progress),before);assertNoRenderError(e);
});
test('no reviewed mutation may change an earlier visited prefix even if the draft is corrupted',()=>{
  const e=environment(),t=e.addTrip({index:1});e.click('edit-trip');e.g.ui.edit.plan.stops[0].duration=55;e.click('review-manual');e.click('apply-review');
  assert.equal(t.plan.stops[0].duration,40);assert.equal(t.plan.revision,0);assert.match(e.g.ui.toast,/must stay unchanged/);assertNoRenderError(e);
});
test('completed journeys cannot resume or be edited in place',()=>{
  const e=environment(),t=e.addTrip();t.status='completed';e.click('edit-trip');assert.equal(e.g.ui.edit,null);e.click('resume-trip');assert.equal(t.status,'completed');assertNoRenderError(e);
});
test('new/adapted proposal selection cannot reuse the previous saved-trip route context',()=>{
  const e=environment(),old=e.addTrip({arrived:true}),before=clone(old);
  e.click('adapt',{id:'slow-coast'});
  assert.equal(e.g.ui.tripId,null);assert.equal(e.g.ui.proposal.plan.templateId,'slow-coast');
  assert.equal(e.g.currentTrip,undefined);assert.deepEqual(clone(old),before);
  e.click('create');assert.equal(e.g.ui.tripId,null);assert.equal(e.g.ui.route,'requirements');assert.equal(old.status,'active');assertNoRenderError(e);
});
test('keeping current tour after pending adjustment clears the unapplied extension',()=>{
  const e=environment(),t=e.addTrip({arrived:true}),before=clone(t.plan);
  e.click('extend-stop');e.click('adjust-pending');e.submit('adjust',{intent:'Only culture',locks:[]});e.click('cancel-review');
  assert.deepEqual(clone(t.plan),before);assert.equal(e.g.ui.pending,null);assert.equal(e.g.ui.pendingBase,null);assert.equal(e.g.ui.review,null);assertNoRenderError(e);
});

const results=[];
for(const [name,fn] of tests){try{fn();results.push({name,status:'PASS'});process.stdout.write('PASS '+name+'\n')}catch(error){results.push({name,status:'FAIL',error:error.message,stack:error.stack});process.stderr.write('FAIL '+name+'\n'+error.stack+'\n')}}
const passed=results.filter(r=>r.status==='PASS').length;
const evidence={generatedAt:new Date().toISOString(),suite:'V7 app action/state guards in Node VM',environment:process.version,
  scope:'Minimal DOM and fake Audio; real app.js, core.js and data.js are evaluated. No browser rendering, service worker, real audio, GPS, provider or live AI verified.',
  appSha256:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed,total:results.length,results};
const out=path.join(__dirname,'../evidence/app-state-tests.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write('\n'+passed+'/'+results.length+' action/state tests passed. Node VM only. Evidence: '+out+'\n');
if(passed!==results.length)process.exitCode=1;
