'use strict';
/* State/action tests in a minimal Node VM. This is not browser, layout,
 * service-worker, audio-device, GPS, native or live-model verification. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const data=require('../prototype/data.js');
const core=require('../prototype/core.js');
const content=require('../prototype/content.js');
const source=fs.readFileSync(path.join(__dirname,'../prototype/app.js'),'utf8');
const visualSource=fs.readFileSync(path.join(__dirname,'../prototype/visuals.js'),'utf8');
const companionSources=['content.js','weather.js','experience.js'].map(file=>[file,fs.readFileSync(path.join(__dirname,'../prototype',file),'utf8')]);
const clone=x=>JSON.parse(JSON.stringify(x));

function environment(options={}){
  const listeners={},errors=[],storage=options.storage||new Map(),nodes={};
  function node(id){return nodes[id]||(nodes[id]={innerHTML:'',textContent:'',value:'',scrollTop:0,scrollHeight:100,focus(){},querySelector(){return null}})}
  class FakeAudio{
    constructor(){this.paused=true;this.currentTime=0;this.duration=120;this.playbackRate=1;this.listeners={};this.playCalls=0}
    addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn)}
    emit(type){for(const fn of this.listeners[type]||[])fn({target:this})}
    pause(){const changed=!this.paused;this.paused=true;if(changed)this.emit('pause')}
    play(){const changed=this.paused;this.paused=false;this.playCalls++;if(changed)this.emit('play');return Promise.resolve()}
    load(){this.emit('loadedmetadata')}
  }
  class FakeFormData{constructor(form){this.fields=form.fields||{}}get(key){return this.fields[key]??null}getAll(key){const value=this.fields[key];return value==null?[]:Array.isArray(value)?value:[value]}}
  const document={
    addEventListener(type,fn){(listeners[type]||(listeners[type]=[])).push(fn)},
    getElementById(id){return ['app','toast-root','adjust-input','announce'].includes(id)?node(id):null},
    querySelector(selector){return selector==='.scroll'?node('scroll'):selector.includes('h1')?node('heading'):null},
    querySelectorAll(){return []},activeElement:null,
    documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}},body:{classList:{add(){},remove(){}}},
    createElement(){return {click(){},style:{}}}
  };
  const sandbox={GN_DATA:data,GN_CORE:core,document,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    Audio:FakeAudio,FormData:FakeFormData,navigator:{onLine:true},
    location:{protocol:'http:',href:'http://localhost:8765/prototype/index.html',search:''},
    URL,URLSearchParams,Blob,Date,Math,JSON,Set,Map,Promise,
    setTimeout(fn){if(options.immediateTimers)Promise.resolve().then(fn);return 1},clearTimeout(){},requestAnimationFrame(fn){fn();return 1},
    console:{log(){},warn(){},error(...args){errors.push(args.map(String).join(' '))}},
    isSecureContext:false,addEventListener(){},matchMedia(){return {matches:false,addEventListener(){}}},
    open(){},scrollTo(){},performance:{now:()=>0}
  };
  if(Object.prototype.hasOwnProperty.call(options,'fetch'))sandbox.fetch=options.fetch;
  sandbox.window=sandbox;
  vm.createContext(sandbox);vm.runInContext(visualSource,sandbox,{filename:'visuals.js'});
  for(const [filename,text]of companionSources)vm.runInContext(text,sandbox,{filename});
  vm.runInContext(source,sandbox,{filename:'app.js'});
  function click(action,params={}){
    const element={dataset:{action,...params},disabled:false,classList:{contains:name=>action==='backdrop'&&name==='modal-backdrop'}};element.closest=()=>element;
    for(const fn of listeners.click||[])fn({target:element,preventDefault(){}});
  }
  function clickModalFormControl(){
    const backdrop={dataset:{action:'backdrop'},classList:{contains:name=>name==='modal-backdrop'}},control={closest:()=>backdrop};
    let defaultPrevented=false;for(const fn of listeners.click||[])fn({target:control,preventDefault(){defaultPrevented=true}});
    return {defaultPrevented};
  }
  function change(dataset,props={}){
    const element={dataset,value:'',checked:false,...props};
    for(const fn of listeners.change||[])fn({target:element});
  }
  function submit(form,fields){for(const fn of listeners.submit||[])fn({target:{dataset:{form},fields,reset(){}},preventDefault(){}})}
  function addTrip({active=true,index=0,arrived=false,locked=[]}={}){
    const plan={id:'input',title:'State test tour',revision:0,startId:'river',startMinutes:510,budget:360,mode:'car',endMode:'last',date:'2026-10-22',
      stops:[['cathedral',40],['museum',75],['lunch',60],['beach',75]].map(([id,duration])=>({id,duration,locked:locked.includes(id)}))};
    sandbox.GN.saveTrip(plan);const t=sandbox.GN.currentTrip;
    t.status=active?'active':'upcoming';t.progress={index,phase:arrived?'stop':'leg',visited:t.plan.stops.slice(0,index+(arrived?1:0)).map(s=>s.id),skipped:[]};
    sandbox.GN.render();return t;
  }
  return {g:sandbox.GN,click,change,submit,addTrip,errors,storage,clickModalFormControl,html:()=>node('app').innerHTML};
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
test('an unsupported AI adjustment explains its refusal without changing active progress or a locked visit',()=>{
  const e=environment(),t=e.addTrip({index:1,arrived:true,locked:['beach']}),before=clone(t);
  e.click('adjust-trip');e.submit('adjust',{intent:'Book a hotel and remove the museum',locks:[]});
  assert.equal(e.g.ui.review,null);assert.ok(e.g.ui.error.length>0,'A refusal needs an explanation');
  assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('cycling Home sheet visibility never creates or mutates a journey',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('home');e.g.ui.homeSnap='compact';
  e.click('drawer-cycle');assert.equal(e.g.ui.homeSnap,'medium');
  e.click('drawer-cycle');assert.equal(e.g.ui.homeSnap,'full');
  e.click('drawer-cycle');assert.equal(e.g.ui.homeSnap,'compact');
  assert.equal(e.g.db.trips.length,1);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('welcome completion needs three steps and replay never resets saved trips',()=>{
  const e=environment();assert.equal(e.g.ui.route,'welcome');assert.equal(e.g.ui.welcomeStep,1);
  e.click('welcome-next');assert.equal(e.g.ui.route,'welcome');assert.equal(e.g.ui.welcomeStep,2);assert.equal(e.g.db.onboarded,false);
  e.click('welcome-next');assert.equal(e.g.ui.route,'welcome');assert.equal(e.g.ui.welcomeStep,3);assert.equal(e.g.db.onboarded,false);
  e.click('welcome-back');assert.equal(e.g.ui.welcomeStep,2);
  e.click('welcome-next');e.click('welcome-next');assert.equal(e.g.ui.route,'home');assert.equal(e.g.db.onboarded,true);
  const t=e.addTrip({index:1}),before=clone(t);e.click('welcome-replay');
  assert.equal(e.g.ui.route,'welcome');assert.equal(e.g.ui.welcomeStep,1);assert.deepEqual(clone(t),before);
  e.click('welcome-skip');assert.equal(e.g.ui.route,'home');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('welcome Skip is available before completion and does not create a tour',()=>{
  const e=environment();e.click('welcome-skip');
  assert.equal(e.g.ui.route,'home');assert.equal(e.g.db.onboarded,true);assert.equal(e.g.db.trips.length,0);assertNoRenderError(e);
});
test('direct template Start saves and activates once without an intermediate Ready route',()=>{
  const e=environment();e.click('start-template',{id:'river-coast'});
  const t=e.g.currentTrip;assert.equal(e.g.db.trips.length,1);assert.equal(t.status,'active');assert.equal(e.g.ui.route,'leg');
  assert.equal(t.plan.templateId,'river-coast');assert.ok(t.plan.title.includes(t.plan.date),'Personal names include the trip date');
  t.progress.index=1;t.progress.visited=['cathedral'];const before=clone(t);
  e.click('start-template',{id:'river-coast'});
  assert.equal(e.g.db.trips.length,1);assert.equal(e.g.currentTrip.id,t.id);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Save for later and Start reuse one unchanged unstarted template copy for the same date',()=>{
  const e=environment();e.click('save-template',{id:'river-coast'});const t=e.g.currentTrip;
  assert.equal(t.status,'upcoming');e.click('save-template',{id:'river-coast'});assert.equal(e.g.db.trips.length,1);
  e.click('start-template',{id:'river-coast'});
  assert.equal(e.g.db.trips.length,1);assert.equal(e.g.currentTrip.id,t.id);assert.equal(t.status,'active');assert.equal(e.g.ui.route,'leg');assertNoRenderError(e);
});
test('Start never overwrites a customized saved copy when opening the source template',()=>{
  const e=environment();e.click('save-template',{id:'river-coast'});const custom=e.g.currentTrip;
  custom.plan.stops.find(s=>s.id==='museum').duration=90;custom.plan.revision=1;const before=clone(custom);
  e.click('start-template',{id:'river-coast'});
  assert.equal(e.g.db.trips.length,2);assert.notEqual(e.g.currentTrip.id,custom.id);assert.equal(e.g.currentTrip.status,'active');
  assert.deepEqual(clone(custom),before);assertNoRenderError(e);
});
test('another active trip must be explicitly paused before direct Start creates a new journey',()=>{
  const e=environment(),first=e.addTrip({index:1,arrived:true}),before=clone(first);
  e.click('start-template',{id:'slow-coast'});
  assert.equal(e.g.ui.modal.kind,'startSwitch');assert.equal(first.status,'active');assert.equal(e.g.db.trips.length,1);assert.deepEqual(clone(first),before);
  e.click('confirm-start');const next=e.g.currentTrip;
  assert.equal(first.status,'paused');assert.equal(next.status,'active');assert.equal(e.g.db.trips.length,2);
  assert.deepEqual(clone(first.progress),before.progress);assert.deepEqual(clone(first.plan),before.plan);
  e.click('confirm-start');assert.equal(e.g.db.trips.length,2);assert.equal(e.g.currentTrip.id,next.id);assertNoRenderError(e);
});
test('canceling direct Start creates no copy and a canceled confirmation cannot switch another selected trip',()=>{
  const e=environment(),first=e.addTrip({index:1}),second=e.addTrip();second.status='upcoming';const before=clone(e.g.db.trips);
  e.click('start-template',{id:'slow-coast'});assert.equal(e.g.ui.modal.kind,'startSwitch');
  e.click('close-modal');assert.equal(e.g.ui.modal,null);assert.deepEqual(clone(e.g.db.trips),before);
  e.click('confirm-start');assert.deepEqual(clone(e.g.db.trips),before);assert.equal(first.status,'active');assert.equal(second.status,'upcoming');assertNoRenderError(e);
});
test('Start switch confirmation becomes stale if the active stop changes while it waits',()=>{
  const e=environment(),first=e.addTrip();e.click('start-template',{id:'slow-coast'});assert.equal(e.g.ui.modal.kind,'startSwitch');
  first.progress.index=1;first.progress.visited=['cathedral'];const before=clone(first);
  e.click('confirm-start');assert.equal(e.g.db.trips.length,1);assert.deepEqual(clone(first),before);assert.match(e.g.ui.toast,/changed/);assertNoRenderError(e);
});
test('starting an AI proposal is one explicit acceptance and repeat events cannot create another copy',()=>{
  const e=environment();e.click('adapt',{id:'slow-coast'});const proposal=clone(e.g.ui.proposal.plan);
  e.click('start-proposal');assert.equal(e.g.db.trips.length,1);assert.equal(e.g.currentTrip.status,'active');assert.equal(e.g.ui.route,'leg');
  assert.deepEqual(clone(e.g.currentTrip.plan.stops),proposal.stops);e.click('start-proposal');assert.equal(e.g.db.trips.length,1);assertNoRenderError(e);
});
test('Home Search uses Explore and preserves the query across a place detail round trip',()=>{
  const e=environment();e.g.go('home');e.click('home-search');assert.equal(e.g.ui.route,'explore');
  e.submit('search',{q:'  Chăm  '});assert.equal(e.g.ui.route,'explore');assert.equal(e.g.ui.search,'Chăm');assert.equal(e.g.ui.exploreTab,'places');
  e.click('place',{id:'museum'});assert.equal(e.g.ui.route,'place');e.click('back');
  assert.equal(e.g.ui.route,'explore');assert.equal(e.g.ui.search,'Chăm');assertNoRenderError(e);
});
test('Home quick-plan time chips open one short form without saving or altering an existing trip',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('home');
  for(const minutes of [120,240,360]){e.click('quick-plan',{value:String(minutes)});assert.equal(e.g.ui.modal.kind,'quickPlan');assert.equal(e.g.db.req.budget,minutes);assert.equal(e.g.db.trips.length,1);assert.deepEqual(clone(t),before);e.click('close-modal')}
  assertNoRenderError(e);
});
test('quick-plan generates an unsaved proposal and retains must-visits without touching the active tour',async()=>{
  const e=environment({immediateTimers:true}),t=e.addTrip({index:1}),before=clone(t);e.g.db.req.mustVisit=['museum'];
  e.click('quick-plan',{value:'240'});e.submit('quick-plan',{date:'2026-10-23',time:'09:00',budget:'240',mode:'car',startId:'river',interests:['culture'],pace:'relaxed'});
  for(let i=0;i<12;i++)await Promise.resolve();
  assert.equal(e.g.ui.route,'proposal');assert.equal(e.g.ui.modal,null);assert.ok(e.g.ui.proposal.plan.stops.some(s=>s.id==='museum'&&s.locked));
  assert.equal(e.g.db.trips.length,1);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Ask from Detail opens a contextual sheet and closing it preserves the detail and active pointer',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.click('place',{id:'beach'});e.click('ask-place',{id:'beach'});
  assert.equal(e.g.ui.route,'place');assert.equal(e.g.ui.modal.kind,'aiSheet');assert.equal(e.g.ui.modal.context.scope,'poi');assert.equal(e.g.ui.modal.context.id,'beach');
  e.click('close-modal');assert.equal(e.g.ui.route,'place');assert.equal(e.g.ui.placeId,'beach');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('expanding contextual Ask to AI Guide retains its POI and Back returns to that same Detail',()=>{
  const e=environment();e.click('place',{id:'museum'});e.click('ask-place',{id:'museum'});e.click('ai-expand');
  assert.equal(e.g.ui.route,'ai');assert.equal(e.g.ui.modal,null);assert.equal(e.g.ui.aiContext.scope,'poi');assert.equal(e.g.ui.aiContext.id,'museum');
  e.click('back');assert.equal(e.g.ui.route,'place');assert.equal(e.g.ui.placeId,'museum');assertNoRenderError(e);
});
test('focused navigation can Ask about its current stop without leaving the leg or advancing progress',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('leg');e.click('ask-current');
  assert.equal(e.g.ui.route,'leg');assert.equal(e.g.ui.modal.kind,'aiSheet');assert.equal(e.g.ui.modal.context.scope,'poi');assert.equal(e.g.ui.modal.context.id,'museum');assert.equal(e.g.ui.modal.context.tripId,t.id);
  e.click('close-modal');assert.equal(e.g.ui.route,'leg');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('AI Guide handles city, POI and current-trip context while keeping their conversations separate',()=>{
  const e=environment(),t=e.addTrip();e.click('ai-open');assert.equal(e.g.ui.route,'ai');assert.equal(e.g.ui.aiContext.scope,'city');
  e.submit('ai',{q:'How do audio stories work?'});assert.equal(e.g.db.aiConversations.city.length,2);
  e.g.openAI({scope:'poi',id:'cathedral'});e.submit('ai',{q:data.places.cathedral.questions[0].q});
  assert.equal(e.g.db.aiConversations['poi:cathedral'].length,2);assert.ok(e.g.db.aiConversations['poi:cathedral'][1].sourceIds.length>0);
  e.click('ai-context',{value:'trip'});assert.equal(e.g.ui.aiContext.scope,'trip');assert.equal(e.g.ui.aiContext.tripId,t.id);
  e.submit('ai',{q:'More beach time'});assert.equal(e.g.db.aiConversations['trip:'+t.id].length,2);assert.equal(e.g.db.aiConversations.city.length,2);assertNoRenderError(e);
});
test('AI chat adjustment is a preview that preserves current/past and locked future visits until Apply',()=>{
  const e=environment(),t=e.addTrip({index:1,arrived:true,locked:['lunch']}),before=clone(t);
  e.g.openAI({scope:'trip',tripId:t.id});e.submit('ai',{q:'More beach time'});
  assert.deepEqual(clone(t),before);assert.ok(e.g.ui.aiDrafts['trip:'+t.id]);e.click('ai-review');
  assert.equal(e.g.ui.route,'review');assert.deepEqual(clone(e.g.ui.review.plan.stops.slice(0,3)),before.plan.stops.slice(0,3));
  e.click('apply-review');assert.equal(t.plan.stops.find(s=>s.id==='beach').duration,95);assert.equal(t.plan.revision,1);
  assert.deepEqual(clone(t.plan.stops.slice(0,3)),before.plan.stops.slice(0,3));assert.deepEqual(clone(t.progress),before.progress);assertNoRenderError(e);
});
test('AI chat preview cannot overwrite a newer accepted revision',()=>{
  const e=environment(),t=e.addTrip();e.g.openAI({scope:'trip',tripId:t.id});e.submit('ai',{q:'More beach time'});
  t.plan.revision++;t.plan.stops.find(s=>s.id==='lunch').duration=65;e.click('ai-review');e.click('apply-review');
  assert.equal(t.plan.stops.find(s=>s.id==='beach').duration,75);assert.equal(t.plan.stops.find(s=>s.id==='lunch').duration,65);assert.equal(t.plan.revision,1);assert.match(e.g.ui.error,/stale/);assertNoRenderError(e);
});
test('AI chat refuses unavailable or protected changes explicitly and never mutates the itinerary',()=>{
  const e=environment(),t=e.addTrip({index:1,arrived:true,locked:['beach']}),before=clone(t);e.g.openAI({scope:'trip',tripId:t.id});
  e.submit('ai',{q:'Book a hotel'});const messages=e.g.db.aiConversations['trip:'+t.id];assert.ok(messages[1].text.length>0);assert.equal(e.g.ui.aiDrafts['trip:'+t.id],undefined);
  e.submit('ai',{q:'More beach time'});assert.ok(messages.at(-1).text.length>0);assert.equal(e.g.ui.aiDrafts['trip:'+t.id],undefined);assert.deepEqual(clone(t),before);
  e.g.ui.sim.offline=true;e.submit('ai',{q:'More beach time'});assert.match(messages.at(-1).text,/offline/i);assert.equal(e.g.ui.aiDrafts['trip:'+t.id],undefined);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('switching standalone stories saves independent playback positions without changing trip progress',async()=>{
  const e=environment(),t=e.addTrip({arrived:true}),before=clone(t);await e.g.play('cathedral');
  assert.equal(e.g.audio.paused,false);e.g.audio.currentTime=18;e.g.audio.emit('timeupdate');
  await e.g.play('museum');assert.equal(e.g.audioPlace,'museum');assert.equal(e.g.audio.currentTime,0);assert.equal(e.g.audioPositions.cathedral,18);
  e.g.audio.currentTime=9;e.g.audio.emit('timeupdate');await e.g.play('cathedral');
  assert.equal(e.g.audio.currentTime,18);assert.equal(e.g.audioPositions.museum,9);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Back to current stop pauses separate listening and never autoplays the previous story',async()=>{
  const e=environment(),t=e.addTrip({arrived:true}),before=clone(t);await e.g.play('cathedral');e.g.audio.currentTime=12;
  e.click('place',{id:'museum'});await e.g.play('museum');e.g.audio.currentTime=7;const plays=e.g.audio.playCalls;
  e.click('return-current');assert.equal(e.g.ui.route,'arrival');assert.equal(e.g.currentTrip.id,t.id);assert.equal(e.g.audio.paused,true);assert.equal(e.g.audio.playCalls,plays);assert.equal(e.g.audioPositions.cathedral,12);
  await e.g.play('cathedral');assert.equal(e.g.audio.currentTime,12);assert.equal(e.g.audio.paused,false);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('guest Profile and Settings stay optional and preserve an active journey',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('home');e.click('profile-open');
  assert.equal(e.g.ui.route,'profile');assert.ok(!e.g.db.session?.active);e.click('settings');assert.equal(e.g.ui.route,'settings');
  e.click('back');assert.equal(e.g.ui.route,'profile');e.click('guest-continue');assert.equal(e.g.ui.route,'home');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('signup validates email, password, name and demo acknowledgement before creating a session',()=>{
  const e=environment();e.click('signup-open');const valid={name:'Sample Explorer',email:'explorer@example.com',password:'SamplePass17!',terms:'on'};
  for(const invalid of [{email:'invalid'},{password:'short'},{name:'  '},{terms:''}]){
    e.submit('signup',{...valid,...invalid});assert.equal(e.g.ui.route,'signup');assert.ok(e.g.ui.error.length>0);assert.ok(!e.g.db.session?.active);assert.equal(e.g.db.account,undefined);
  }
  assertNoRenderError(e);
});
test('signup saves only a local demo profile and session, never its entered password',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t),password='NotStoredSignup17!';e.click('favorite',{id:'beach'});e.click('signup-open');
  e.submit('signup',{name:'  Hiền Explorer  ',email:'  explorer@example.com  ',password,terms:'on'});
  assert.equal(e.g.ui.route,'profile');assert.equal(e.g.db.account.name,'Hiền Explorer');assert.equal(e.g.db.account.email,'explorer@example.com');assert.equal(e.g.db.session.active,true);assert.equal(e.g.db.session.demo,true);
  assert.deepEqual(clone(t),before);assert.deepEqual(clone(e.g.db.favorites),['beach']);
  for(const text of e.storage.values())assert.ok(!text.includes(password),'The password must never enter local storage');
  const reloaded=environment({storage:e.storage});assert.equal(reloaded.g.db.session.active,true);assert.equal(reloaded.g.db.account.name,'Hiền Explorer');assert.equal(reloaded.g.db.trips[0].progress.index,1);assertNoRenderError(e);assertNoRenderError(reloaded);
});
test('login rejects invalid input and opens an explicitly local session without storing a password',()=>{
  const e=environment(),t=e.addTrip(),before=clone(t);e.click('login-open');
  e.submit('login',{email:'invalid',password:'NotStoredLogin17!'});assert.equal(e.g.ui.route,'login');assert.ok(!e.g.db.session?.active);assert.ok(e.g.ui.error.length>0);
  e.submit('login',{email:'guest@example.com',password:'short'});assert.equal(e.g.ui.route,'login');assert.ok(!e.g.db.session?.active);
  const password='NotStoredLogin17!';e.submit('login',{email:'guest@example.com',password});
  assert.equal(e.g.ui.route,'profile');assert.equal(e.g.db.session.active,true);assert.equal(e.g.db.session.demo,true);assert.equal(e.g.db.account.email,'guest@example.com');assert.deepEqual(clone(t),before);
  for(const text of e.storage.values())assert.ok(!text.includes(password));assertNoRenderError(e);
});
test('profile name editing requires a session, keeps the account email and leaves journeys unchanged',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.click('signup-open');e.submit('signup',{name:'Original',email:'profile@example.com',password:'ProfilePass17!',terms:'on'});
  e.click('profile-edit');assert.equal(e.g.ui.route,'profile-edit');e.submit('profile',{name:'  '});assert.equal(e.g.ui.route,'profile-edit');assert.equal(e.g.db.account.name,'Original');assert.ok(e.g.ui.error.length>0);
  e.submit('profile',{name:'  Updated Explorer  ',email:'forged@example.com'});assert.equal(e.g.ui.route,'profile');assert.equal(e.g.db.account.name,'Updated Explorer');assert.equal(e.g.db.account.email,'profile@example.com');assert.deepEqual(clone(t),before);
  e.click('sign-out');e.click('confirm-sign-out');e.submit('profile',{name:'Unauthorized change'});assert.equal(e.g.db.account.name,'Updated Explorer');assertNoRenderError(e);
});
test('sign out requires its confirmation and clears only the local session',()=>{
  const e=environment();e.addTrip({index:1});e.click('favorite',{id:'museum'});e.g.db.packages.sample={tripId:'sample',assets:['assets/museum.png']};
  e.click('signup-open');e.submit('signup',{name:'Keep Profile',email:'saved@example.com',password:'LogoutPass17!',terms:'on'});
  const journeys=clone(e.g.db.trips),favorites=clone(e.g.db.favorites),packages=clone(e.g.db.packages),account=clone(e.g.db.account);
  e.click('sign-out');assert.equal(e.g.ui.modal.kind,'signOut');assert.equal(e.g.db.session.active,true);e.click('close-modal');assert.equal(e.g.db.session.active,true);
  e.click('sign-out');e.click('confirm-sign-out');assert.equal(e.g.ui.route,'profile');assert.equal(e.g.db.session,null);assert.deepEqual(clone(e.g.db.account),account);
  assert.deepEqual(clone(e.g.db.trips),journeys);assert.deepEqual(clone(e.g.db.favorites),favorites);assert.deepEqual(clone(e.g.db.packages),packages);
  e.click('confirm-sign-out');assert.equal(e.g.db.session,null);const reloaded=environment({storage:e.storage});assert.equal(reloaded.g.db.session,null);assert.deepEqual(clone(reloaded.g.db.trips),journeys);assertNoRenderError(e);assertNoRenderError(reloaded);
});
test('password recovery validates inputs but never changes a stored password, session or journey',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.click('forgot-open');
  e.submit('forgot',{email:'invalid'});assert.equal(e.g.ui.route,'forgot');assert.ok(e.g.ui.error.length>0);
  e.submit('forgot',{email:'recover@example.com'});assert.equal(e.g.ui.route,'reset-password');assert.equal(e.g.ui.resetEmail,'recover@example.com');
  e.submit('reset-password',{password:'short',confirm:'short'});assert.equal(e.g.ui.route,'reset-password');assert.ok(e.g.ui.error.length>0);
  e.submit('reset-password',{password:'NotStoredReset17!',confirm:'DifferentPass17!'});assert.equal(e.g.ui.route,'reset-password');assert.ok(e.g.ui.error.length>0);
  e.submit('reset-password',{password:'NotStoredReset17!',confirm:'NotStoredReset17!'});assert.equal(e.g.ui.route,'login');assert.ok(!e.g.db.session?.active);assert.deepEqual(clone(t),before);
  assert.match(e.g.ui.toast,/No password/);for(const text of e.storage.values())assert.ok(!text.includes('NotStoredReset17!'));assertNoRenderError(e);
});
test('signing back into the same local demo profile keeps its edited name and saved progress',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.click('signup-open');e.submit('signup',{name:'Returning Explorer',email:'return@example.com',password:'ReturnPass17!',terms:'on'});
  e.click('sign-out');e.click('confirm-sign-out');e.click('login-open');e.submit('login',{email:'return@example.com',password:'AnyDemoPass17!'});
  assert.equal(e.g.db.account.name,'Returning Explorer');assert.equal(e.g.db.session.active,true);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Settings speed and motion persist across reload and reject unsupported playback speeds',()=>{
  const e=environment(),t=e.addTrip(),before=clone(t);e.click('settings');
  e.change({}, {id:'settings-speed',value:'1.25'});assert.equal(e.g.db.settings.speed,1.25);assert.equal(e.g.audio.playbackRate,1.25);
  e.change({}, {id:'settings-speed',value:'9'});assert.equal(e.g.db.settings.speed,1.25);assert.equal(e.g.audio.playbackRate,1.25);
  e.change({}, {id:'settings-motion',checked:true});assert.equal(e.g.db.settings.reducedMotion,true);assert.match(e.html(),/data-reduced-motion="true"/);
  const reloaded=environment({storage:e.storage});assert.equal(reloaded.g.db.settings.speed,1.25);assert.equal(reloaded.g.audio.playbackRate,1.25);assert.equal(reloaded.g.db.settings.reducedMotion,true);assert.match(reloaded.html(),/data-reduced-motion="true"/);
  assert.deepEqual(clone(t),before);assertNoRenderError(e);assertNoRenderError(reloaded);
});
test('changing playback speed in the story player updates Settings and survives reload',()=>{
  const e=environment();e.change({}, {id:'settings-speed',value:'1.25'});e.change({}, {id:'audio-speed',value:'1.5'});
  assert.equal(e.g.audio.playbackRate,1.5);assert.equal(e.g.db.settings.speed,1.5);
  const reloaded=environment({storage:e.storage});assert.equal(reloaded.g.audio.playbackRate,1.5);assert.equal(reloaded.g.db.settings.speed,1.5);assertNoRenderError(e);assertNoRenderError(reloaded);
});
test('Settings exposes replay, downloads, privacy and capabilities without requiring sign-in',()=>{
  const e=environment();e.click('settings');e.click('welcome-replay');assert.equal(e.g.ui.route,'welcome');assert.equal(e.g.ui.welcomeStep,1);
  e.click('welcome-skip');e.click('settings');e.click('downloads');assert.equal(e.g.ui.route,'downloads');
  e.click('settings');e.click('privacy-open');assert.equal(e.g.ui.route,'privacy');e.click('back');assert.equal(e.g.ui.route,'settings');e.click('about-open');assert.equal(e.g.ui.route,'about');assert.ok(!e.g.db.session?.active);assertNoRenderError(e);
});
test('plain form controls inside a sheet retain native click defaults and do not trigger the backdrop',()=>{
  const e=environment();e.click('quick-plan',{value:'240'});assert.equal(e.g.ui.modal.kind,'quickPlan');
  const result=e.clickModalFormControl();assert.equal(result.defaultPrevented,false,'A form submit button must retain its native default');assert.equal(e.g.ui.modal.kind,'quickPlan');
  e.click('backdrop');assert.equal(e.g.ui.modal,null);assertNoRenderError(e);
});

// These checks exercise the rendered information model and real action handlers.
// They do not infer visibility from class names or claim CSS/layout coverage.
const visibleText=html=>String(html).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim();
const placeCardIds=html=>Array.from(html.matchAll(/class="discovery-card rich-place-card" data-action="place" data-id="([^"]+)"/g),m=>m[1]);

test('medium Home keeps contextual weather, a focused collection preview, prepared tours and an essentials entry without marketing filler',()=>{
  const e=environment();e.g.go('home');assert.equal(e.g.ui.homeSnap,'medium');const html=e.html(),text=visibleText(html);
  assert.match(html,/aria-label="Da Nang weather"/);
  assert.match(text,/A story worth a stop/);assert.match(text,/Find your kind of Da Nang/);
  assert.match(text,/A day, already imagined/);assert.match(text,/Before you head out/);
  for(const collection of content.collections.slice(0,2))assert.ok(text.includes(collection.title));
  assert.doesNotMatch(html,/data-action="collection-open" data-id="shortbreak"/,'Home previews two collections; Explore holds the full catalogue');
  for(const tour of data.templates)assert.ok(text.includes(tour.title));
  assert.match(html,/city-weather-brief/);assert.doesNotMatch(html,/class="weather-card|story-spotlight|home-feed-end/,'Weather belongs in the city context, without another hero card or marketing footer');
  assert.match(html,/class="home-tour-strip"/);assert.match(html,/data-action="essentials-open"/);
  assert.ok(!html.includes('home-full-content'),'Medium feed must include its own information, not a full-snap-only container');
  assert.equal(e.g.db.trips.length,0);assertNoRenderError(e);
});
test('compact Home keeps the next action concise and expanding reveals the full feed without changing journeys',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(e.g.db.trips);e.g.go('home');e.g.ui.homeSnap='compact';e.g.render();
  const compact=visibleText(e.html());assert.ok(compact.includes(data.places.museum.name));assert.match(compact,/Continue my trip/);
  assert.doesNotMatch(compact,/Find your kind of Da Nang|A day, already imagined|Before you head out/);
  e.click('home-expand');assert.equal(e.g.ui.homeSnap,'full');assert.match(visibleText(e.html()),/Find your kind of Da Nang/);
  assert.deepEqual(clone(e.g.db.trips),before);assert.equal(t.progress.index,1);assertNoRenderError(e);
});
test('editorial collections scope actual Explore results and clear stale search and category state',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.ui.search='impossible query';e.g.ui.filter='beach';
  for(const collection of content.collections){
    e.click('collection-open',{id:collection.id});assert.equal(e.g.ui.route,'explore');assert.equal(e.g.ui.search,'');assert.equal(e.g.ui.filter,'all');
    assert.equal(e.g.ui.exploreTab,'places');assert.equal(e.g.ui.collectionId,collection.id);
    assert.deepEqual(new Set(placeCardIds(e.html())),new Set(collection.placeIds));
    e.click('collection-clear');assert.equal(e.g.ui.collectionId,null);assert.equal(placeCardIds(e.html()).length,5);
  }
  const route=e.g.ui.route;e.click('collection-open',{id:'forged-collection'});assert.equal(e.g.ui.route,route);assert.equal(e.g.ui.collectionId,null);
  assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Explore sorting changes the displayed order while combined collection, query and category filters stay coherent',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('explore');
  const catalogue=Object.values(data.places).filter(p=>!p.isBreak);
  e.change({},{id:'explore-sort',value:'short'});assert.deepEqual(placeCardIds(e.html()),catalogue.slice().sort((a,b)=>a.duration-b.duration).map(p=>p.id));
  e.change({},{id:'explore-sort',value:'long'});assert.deepEqual(placeCardIds(e.html()),catalogue.slice().sort((a,b)=>b.duration-a.duration).map(p=>p.id));
  e.change({},{id:'explore-sort',value:'unsupported'});assert.equal(e.g.ui.exploreSort,'long');
  e.click('collection-open',{id:'culture'});e.submit('search',{q:'Chăm'});assert.deepEqual(placeCardIds(e.html()),['museum']);
  e.click('filter',{value:'beach'});assert.deepEqual(placeCardIds(e.html()),[]);assert.match(visibleText(e.html()),/No matches this time/);
  e.click('explore-clear');assert.equal(e.g.ui.search,'');assert.equal(e.g.ui.filter,'all');assert.equal(e.g.ui.collectionId,null);assert.equal(placeCardIds(e.html()).length,5);
  e.change({},{id:'explore-sort',value:'curated'});assert.deepEqual(placeCardIds(e.html()),catalogue.map(p=>p.id));
  assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('place details keep two clear highlights, one visit fact and complete practical information behind appropriate disclosures',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);
  for(const [id,p]of Object.entries(data.places)){
    e.click('place',{id});const c=content.places[id],html=e.html(),text=visibleText(html),outsideDisclosures=visibleText(html.replace(/<details\b[\s\S]*?<\/details>/g,''));assert.ok(text.includes(p.name));assert.ok(text.includes(p.localName));assert.ok(text.includes(c.shortHook));
    for(const x of c.highlights.slice(0,2)){assert.ok(outsideDisclosures.includes(x.title),id+' default highlight title');assert.ok(outsideDisclosures.includes(x.text),id+' default highlight detail')}
    const rhythmDisclosure=html.match(/<details class="rich-disclosure"><summary>A suggested way to spend your visit<\/summary>([\s\S]*?)<\/details>/);
    assert.ok(rhythmDisclosure,id+' rhythm has an optional disclosure');
    for(const x of c.visitRhythm){assert.ok(text.includes(x.title),id+' visit rhythm');assert.ok(text.includes(x.text),id+' rhythm detail')}
    for(const x of c.practicalFacts.filter(x=>!/^Suggested stop$/i.test(x.label))){assert.ok(text.includes(x.label),id+' practical label');assert.ok(text.includes(x.value),id+' explicit practical value ('+x.status+')')}
    assert.equal((html.match(/<dt>Suggested visit<\/dt>/g)||[]).length,1,id+' has one primary suggested visit row');
    assert.ok(!html.includes('<dt>Suggested stop</dt>'),id+' does not repeat the same estimate');
    for(const x of [...c.visitTips,...c.etiquette,...c.mobility])assert.ok(text.includes(x),id+' useful visitor note');
    assert.doesNotMatch(e.html(),/data-rating=|4\.9\/5|4\.8\/5|Open now|Live crowd/i,'Unconnected reputation/access feeds must not be invented');
    if(!p.isBreak){e.click('detail-tab',{value:'story'});for(const takeaway of c.audioTakeaways)assert.ok(visibleText(e.html()).includes(takeaway),id+' audio comprehension');}
  }
  assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('Explore, AI Guide and Trips retain four labelled bottom destinations without repeating a top title bar',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);
  for(const route of ['explore','ai','trips']){
    e.g.go(route);const html=e.html(),nav=html.match(/<nav class="bottom-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav,route+' keeps the primary navigation');assert.doesNotMatch(html,/<header class="topbar"/,'No redundant top title bar on '+route);
    assert.deepEqual(Array.from(nav[1].matchAll(/data-action="nav" data-value="([^"]+)"/g),m=>m[1]),['home','explore','ai','trips']);
    for(const label of ['Home','Explore','AI Guide','Trips'])assert.ok(visibleText(nav[1]).includes(label));
    assert.match(html,/<h1\b/,'The screen keeps its meaningful page heading');
  }
  assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('prepared tour cards show per-tour story counts and engine totals, then Save preserves their stops and budget',()=>{
  const e=environment();e.g.go('explore');e.click('explore-tab',{value:'tours'});const html=e.html();
  const cards=Array.from(html.matchAll(/<article class="tour-card-wrapper">([\s\S]*?)<\/article>/g),m=>m[1]);
  assert.equal(cards.length,data.templates.length);assert.equal(e.g.db.trips.length,0);
  for(const template of data.templates){
    const storyCount=template.stops.filter(s=>data.places[s.id].story.audio).length;
    const card=cards.find(card=>card.includes('data-action="tour" data-id="'+template.id+'"'));assert.ok(card,template.id+' has its own card');
    assert.ok(visibleText(card).includes(storyCount+' stories'));e.click('tour',{id:template.id});
    const text=visibleText(e.html()),c=content.tours[template.id];
    for(const item of [...c.suitedFor,...c.included,...c.notIncluded])assert.ok(text.includes(item),template.id+' tour brief: '+item);
    const expected=core.schedule({startId:'river',startMinutes:510,budget:360,mode:'car',endMode:'last',stops:template.stops});
    assert.ok(text.includes(core.formatDuration(expected.totalMinutes)));assert.ok(text.includes(core.formatTime(expected.finishMinutes)));
    e.click('save-template',{id:template.id});const t=e.g.currentTrip,schedule=core.schedule(t.plan);
    assert.equal(t.plan.budget,360);assert.equal(t.status,'upcoming');assert.equal(t.plan.stops.length,template.stops.length);
    assert.ok(visibleText(e.html()).includes(core.formatDuration(schedule.totalMinutes)),template.id+' total must come from schedule');
    assert.equal(schedule.visitMinutes,template.stops.reduce((sum,s)=>sum+s.duration,0));
  }
  assert.equal(e.g.db.trips.length,2);assertNoRenderError(e);
});
test('unsupported weather stays empty rather than supplying a decorative temperature and Back restores the active trip',async()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('leg');e.click('weather-open');assert.equal(e.g.ui.route,'weather');
  await e.g.loadWeather(true);assert.equal(e.g.weather.status,'unsupported');assert.equal(e.g.weather.data,null);
  assert.match(visibleText(e.html()),/Weather is unavailable/);assert.match(visibleText(e.html()),/Open-Meteo/);
  assert.doesNotMatch(e.html(),/weather-main|hourly-weather|forecast-days/,'There must be no weather numbers without a usable provider response');
  const snapshot=e.g.weather;snapshot.status='ready';assert.equal(e.g.weather.status,'unsupported','Public weather snapshots cannot mutate the client');
  e.click('back');assert.equal(e.g.ui.route,'leg');assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('a weather network failure shows retry information while keeping trip, audio and account state untouched',async()=>{
  let calls=0;const e=environment({fetch:()=>{calls++;return Promise.reject(new Error('Simulated connection failure'))}}),t=e.addTrip({index:1}),before=clone(e.g.db);
  await e.g.play('cathedral');e.g.audio.currentTime=17;const playing=e.g.audio.paused;e.g.go('weather');await e.g.loadWeather(true);
  assert.ok(calls>0);assert.equal(e.g.weather.status,'error');assert.equal(e.g.weather.data,null);assert.match(visibleText(e.html()),/Could not connect|Weather is unavailable/);
  assert.match(e.html(),/data-action="weather-refresh"/);assert.equal(e.g.audioPlace,'cathedral');assert.equal(e.g.audio.currentTime,17);assert.equal(e.g.audio.paused,playing);
  assert.deepEqual(clone(t),before.trips[0]);assert.deepEqual(clone(e.g.db.favorites),before.favorites);assert.equal(e.g.db.session,before.session);assertNoRenderError(e);
});
test('trip essentials exposes the city guidance without signing in, saving a trip or changing the current visit',()=>{
  const e=environment(),t=e.addTrip({index:1}),before=clone(t);e.g.go('home');e.click('essentials-open');assert.equal(e.g.ui.route,'essentials');
  const text=visibleText(e.html());for(const tip of content.city.tips)assert.ok(text.includes(tip.text));
  assert.match(text,/Open-Meteo/);assert.match(text,/Local demo profile/);assert.match(e.html(),/data-action="weather-open"/);assert.match(e.html(),/data-action="downloads"/);
  e.click('back');assert.equal(e.g.ui.route,'home');assert.equal(e.g.db.trips.length,1);assert.ok(!e.g.db.session?.active);assert.deepEqual(clone(t),before);assertNoRenderError(e);
});
test('AI overview selects the real active trip even when a different saved trip is currently selected',()=>{
  const e=environment(),active=e.addTrip({index:1}),saved=e.addTrip({active:false}),before=clone(e.g.db.trips);e.click('ai-open');
  assert.match(e.html(),/data-action="ask-active-trip"/);e.click('ask-active-trip');assert.equal(e.g.ui.route,'ai');assert.equal(e.g.ui.modal.kind,'aiSheet');
  assert.equal(e.g.ui.modal.context.scope,'trip');assert.equal(e.g.ui.modal.context.tripId,active.id);assert.notEqual(e.g.ui.modal.context.tripId,saved.id);
  e.click('close-modal');assert.deepEqual(clone(e.g.db.trips),before);assertNoRenderError(e);
});

test('AI Guide exposes a truthful voice flow with review before sending',async()=>{
  const e=environment();await e.g.play('cathedral');assert.equal(e.g.audio.paused,false);
  e.click('ai-open');assert.match(e.html(),/data-action="voice-open"/);assert.match(visibleText(e.html()),/voice input.*simulated/i);
  e.click('voice-open');assert.equal(e.g.ui.modal.kind,'voice');assert.equal(e.g.ui.voice.stage,'intro');assert.equal(e.g.audio.paused,true);
  assert.match(visibleText(e.html()),/does not access or record your microphone/i);
  e.click('voice-start');assert.equal(e.g.ui.voice.stage,'listening');assert.match(visibleText(e.html()),/Listening to a sample/i);
  e.click('voice-review');assert.equal(e.g.ui.voice.stage,'review');assert.match(e.html(),/id="voice-transcript"/);
  const transcript=e.g.ui.voice.transcript;e.click('voice-send');assert.equal(e.g.ui.modal,null);assert.match(visibleText(e.html()),new RegExp(transcript.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.equal(e.g.audio.paused,true,'Sending a voice request must not restart a competing story');assertNoRenderError(e);
});
test('cancelling voice returns to the contextual AI sheet and resumes interrupted story audio',async()=>{
  const e=environment();await e.g.play('cathedral');e.g.ui.placeId='cathedral';e.click('ask-place',{id:'cathedral'});assert.equal(e.g.ui.modal.kind,'aiSheet');
  e.click('voice-open');assert.equal(e.g.ui.modal.kind,'voice');assert.equal(e.g.audio.paused,true);
  e.click('voice-cancel');assert.equal(e.g.ui.modal.kind,'aiSheet');assert.equal(e.g.audio.paused,false);assertNoRenderError(e);
});
test('comfort pass removes misleading Home filters, uses readable Explore rows and one Detail action bar',()=>{
  const e=environment();e.click('welcome-skip');assert.doesNotMatch(e.html(),/home-quick-filter-row|Da Nang Food/);
  e.g.go('explore');assert.match(e.html(),/class="place-results-list"/);assert.doesNotMatch(e.html(),/class="discover-grid"><button class="discovery-card rich-place-card"/);
  e.click('place',{id:'cathedral'});assert.doesNotMatch(e.html(),/detail-floating-bar|Listen to this story/);assert.equal((e.html().match(/class="footer"/g)||[]).length,1);assert.match(e.html(),/footer-actions/);
  assert.doesNotMatch(visibleText(e.html()),/08:00|10:30/);assert.match(visibleText(e.html()),/Suggested time · Morning light/);assertNoRenderError(e);
});
test('an empty Trips screen prioritizes its next action instead of three zero statistics',()=>{
  const e=environment();e.click('welcome-skip');e.g.go('trips');assert.doesNotMatch(e.html(),/journey-stats/);assert.match(visibleText(e.html()),/Your next day starts here/);assert.match(e.html(),/data-action="quick-plan"/);assertNoRenderError(e);
});

async function run(){
const results=[];
for(const [name,fn] of tests){try{await fn();results.push({name,status:'PASS'});process.stdout.write('PASS '+name+'\n')}catch(error){results.push({name,status:'FAIL',error:error.message,stack:error.stack});process.stderr.write('FAIL '+name+'\n'+error.stack+'\n')}}
const passed=results.filter(r=>r.status==='PASS').length;
const evidence={generatedAt:new Date().toISOString(),suite:'V7 app action/state guards in Node VM',environment:process.version,
  scope:'Minimal DOM and fake Audio; real app.js, core.js, data.js, content.js, weather.js and experience.js are evaluated. Weather failure paths use absent/failing fetch only. No browser rendering, service worker, real audio, GPS, live provider or live AI verified.',
  appSha256:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed,total:results.length,results};
const out=path.join(__dirname,'../evidence/app-state-tests.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write('\n'+passed+'/'+results.length+' action/state tests passed. Node VM only. Evidence: '+out+'\n');
if(passed!==results.length)process.exitCode=1;
}
run().catch(error=>{console.error(error);process.exitCode=1});
