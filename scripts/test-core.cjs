'use strict';
// Domain tests run on real V7 content + pure demo fixtures, not network mocks.
const assert = require('node:assert/strict');
const core = require('../prototype/core.js');
const data = require('../prototype/data.js');
const tests = [];
function test(name,fn) { tests.push([name,fn]); }
function plan(stops,overrides={}) {
  return {id:'test-trip',title:'Test day',revision:3,
    stops:stops.map(s=>typeof s==='string'?{id:s,duration:data.places[s].duration,locked:false}:{...s}),
    startId:'river',startMinutes:510,budget:360,mode:'car',endMode:'last',date:'2026-10-22',...overrides};
}
function frozen(value) {
  if (value && typeof value==='object') {Object.values(value).forEach(frozen);Object.freeze(value);}
  return value;
}

test('schedule includes start leg, every visit, inter-stop leg and return',()=>{
  const input = frozen(plan(['cathedral','museum'],{endMode:'start'}));
  const s = core.schedule(input);
  assert.equal(s.stops[0].arrival,514);
  assert.equal(s.stops[0].departure,554);
  assert.equal(s.stops[1].arrival,559);
  assert.equal(s.stops[1].departure,634);
  assert.equal(s.returnMinutes,6);
  assert.equal(s.travelMinutes,15);
  assert.equal(s.visitMinutes,115);
  assert.equal(s.totalMinutes,130);
  assert.equal(s.finishMinutes,640);
  assert.equal(s.distanceKm,3.9);
  assert.equal(s.routeKind,'demo-fixture');
  assert.equal(s.hoursStatus,'unverified');
});
test('generic lunch is a break, not a fictitious restaurant/route coordinate',()=>{
  assert.equal(data.places.lunch.coordinates,null);
  const s = core.schedule(plan(['museum','lunch','beach']));
  assert.equal(s.stops[1].travelMinutes,0);
  assert.equal(s.stops[1].arrival,s.stops[0].departure);
  assert.equal(s.stops[2].travelMinutes,12); // museum → beach, not invented lunch → beach
  assert.equal(s.totalMinutes,228);
});
test('a stop at the selected starting POI does not invent start travel',()=>{
  const s = core.schedule(plan(['cathedral'],{startId:'cathedral'}));
  assert.equal(s.travelMinutes,0);assert.equal(s.totalMinutes,40);
});
test('return trip consumes budget and can turn a fitting plan into a conflict',()=>{
  const input = plan(['cathedral','museum'],{budget:125});
  assert.equal(core.schedule(input).overBudget,0);
  assert.equal(core.schedule({...input,endMode:'start'}).overBudget,5);
  assert.match(core.validate({...input,endMode:'start'}).join(' '),/exceeds/);
});
test('invalid/duplicate POIs and out-of-bounds durations are rejected',()=>{
  assert.match(core.validate(plan(['cathedral','cathedral'])).join(' '),/Duplicate/);
  assert.match(core.validate(plan([{id:'invented',duration:40}])).join(' '),/Unknown/);
  assert.match(core.validate(plan([{id:'museum',duration:10}])).join(' '),/45–180/);
  assert.match(core.validate(plan([{id:'beach',duration:181}])).join(' '),/180/);
});
test('one-day contract rejects unsupported origins, modes and overnight windows',()=>{
  assert.match(core.validate(plan(['cathedral'],{startId:'my unlocated hotel'})).join(' '),/start point/);
  assert.match(core.validate(plan(['cathedral'],{mode:'teleport'})).join(' '),/transport/);
  assert.match(core.validate(plan(['cathedral'],{startMinutes:1410,budget:120})).join(' '),/midnight/);
  assert.throws(()=>core.schedule(plan(['cathedral'],{startId:'unrouted-place'})),/No demo travel fixture/);
  assert.match(core.validate(plan(['cathedral'],{date:'2026-02-30'})).join(' '),/valid calendar date/);
  assert.match(core.validate(plan(['mountain','museum'],{startMinutes:1320,budget:120})).join(' '),/actual scheduled finish crosses midnight/);
});
test('generation returns a bounded, valid, deterministic proposal with required places',()=>{
  const req = frozen({startId:'river',startMinutes:510,budget:360,mode:'car',endMode:'last',date:'2026-10-22',interests:['culture'],pace:'relaxed',mustVisit:['museum']});
  const result = core.generate(req);
  assert.equal(result.ok,true);
  assert.deepEqual(core.validate(result.plan),[]);
  assert.ok(result.plan.stops.length>=2 && result.plan.stops.length<=4);
  assert.equal(new Set(result.plan.stops.map(s=>s.id)).size,result.plan.stops.length);
  assert.equal(result.plan.stops.find(s=>s.id==='museum').locked,true);
  assert.deepEqual(core.generate(req),result);
  assert.ok(result.explanations.some(s=>s.includes('no AI model')));
});
test('must-visit time conflicts are explicit and never solved by dropping a required place',()=>{
  const result = core.generate({budget:180,mode:'car',mustVisit:['cathedral','museum','mountain'],interests:['culture']});
  assert.equal(result.ok,false);
  assert.match(result.reason,/must-visits/);
  assert.ok(result.requiredMinutes>180);
  assert.equal(result.plan,undefined);
});
test('impossible walking travel is not replaced with car time or a fabricated zero leg',()=>{
  const result = core.generate({startId:'river',budget:90,mode:'walking',mustVisit:['mountain'],interests:['nature']});
  assert.equal(result.ok,false);
  assert.ok(result.requiredMinutes>=265); // 145-min walking fixture + 120-min visit
});
test('generation rejects invented/duplicate must-visits and unbounded stop count',()=>{
  assert.equal(core.generate({mustVisit:['not-in-corpus']}).ok,false);
  assert.equal(core.generate({mustVisit:['museum','museum']}).ok,false);
  assert.equal(core.generate({mustVisit:['cathedral','museum','beach','mountain','bridge']}).ok,false);
});
test('unknown requests fail rather than interpreting a substring as a supported change',()=>{
  const input = frozen(plan(['cathedral','museum','beach']));
  for (const intent of ['book a hotel','more beach and book a taxi','not more beach','make it wheelchair accessible']) {
    const result = core.adjust(input,{intent});
    assert.equal(result.ok,false,intent);
    assert.match(result.reason,/understands/);
    assert.equal(result.plan,undefined);
  }
});
test('a supported beach proposal changes only requested duration and leaves input untouched',()=>{
  const input = frozen(plan(['cathedral','museum','beach']));
  const result = core.adjust(input,{intent:'More beach time'});
  assert.equal(result.ok,true);
  assert.equal(input.stops[2].duration,75);
  assert.equal(result.plan.stops.find(s=>s.id==='beach').duration,95);
  assert.equal(result.plan.revision,4);
  assert.equal(result.plan.stops[0].duration,40);
  assert.ok(result.changes.some(s=>s.includes('75 min') || s.includes('1 hr 15 min')));
});
test('active visited/current prefix survives a culture-only proposal exactly',()=>{
  const input = frozen(plan(['beach','cathedral','lunch','museum'],{budget:480}));
  const result = core.adjust(input,{intent:'Only culture',preserveIds:['beach','cathedral']});
  assert.equal(result.ok,true);
  assert.deepEqual(result.plan.stops.slice(0,2),input.stops.slice(0,2));
  assert.equal(result.plan.stops.filter(s=>s.id==='beach').length,1);
  assert.ok(!result.plan.stops.some(s=>s.id==='lunch'));
});
test('less walking recognises the real stairs tag without changing mode or protected visits',()=>{
  const input = frozen(plan(['cathedral','mountain','museum']));
  assert.ok(data.places.mountain.tags.includes('stairs'));
  const result = core.adjust(input,{intent:'less-walking',preserveIds:['cathedral']});
  assert.equal(result.ok,true);
  assert.ok(!result.plan.stops.some(s=>s.id==='mountain'));
  assert.equal(result.plan.mode,'car');
  assert.deepEqual(result.plan.stops[0],input.stops[0]);
  assert.ok(input.stops.some(s=>s.id==='mountain'));
  const protectedResult = core.adjust(input,{intent:'less-walking',lockedIds:['mountain']});
  assert.equal(protectedResult.ok,false); // No mutable stairs visit to remove.
  assert.match(protectedResult.reason,/already meets/);
});
test('locked points are never removed by culture-only and locked durations remain fixed',()=>{
  const input = frozen(plan([{id:'beach',duration:75,locked:true},'museum','cathedral'],{budget:480}));
  const result = core.adjust(input,{intent:'culture-only'});
  // Already all nonprotected stops are cultural, so no change is an honest result.
  assert.equal(result.ok,false);
  assert.match(result.reason,/already meets/);
  assert.equal(core.adjust(input,{intent:'more-beach'}).ok,false);
  assert.equal(input.stops[0].duration,75);
});
test('three-hour adjustment cannot shorten a protected current visit to manufacture feasibility',()=>{
  const input = frozen(plan([{id:'mountain',duration:180,locked:false},{id:'museum',duration:75,locked:true}],{budget:480}));
  const result = core.adjust(input,{intent:'Make it 3 hours',preserveIds:['mountain']});
  assert.equal(result.ok,false);
  assert.ok(result.requiredMinutes>180);
  assert.equal(input.stops[0].duration,180);
  assert.equal(input.stops[1].duration,75);
});
test('three-hour adjustment trims only mutable suffix and validates proposed budget',()=>{
  const input = frozen(plan(['cathedral','museum','beach'],{budget:360}));
  const result = core.adjust(input,{intent:'three-hours',preserveIds:['cathedral']});
  assert.equal(result.ok,true);
  assert.equal(result.plan.budget,180);
  assert.deepEqual(result.plan.stops[0],input.stops[0]);
  assert.deepEqual(core.validate(result.plan),[]);
});
test('English/Vietnamese supported intents agree; contradictory intents are refused',()=>{
  const input = plan(['cathedral','museum','beach']);
  assert.deepEqual(core.adjust(input,{intent:'Thêm thời gian ở biển'}).plan,core.adjust(input,{intent:'more-beach'}).plan);
  assert.deepEqual(core.adjust(input,{intent:'Rút còn 3 giờ'}).plan,core.adjust(input,{intent:'three-hours'}).plan);
  assert.equal(core.adjust(input,{intent:'Only culture, more beach time'}).ok,false);
});
test('compound less-walking plus more-beach keeps the requested new beach visit',()=>{
  const input = plan(['cathedral','museum','bridge'],{mode:'walking',budget:480});
  const result = core.adjust(input,{intent:'Less walking, more time at the beach'});
  assert.equal(result.ok,true);
  assert.ok(result.plan.stops.some(s=>s.id==='beach'));
  assert.equal(result.plan.mode,'walking');
});
test('unknown protected IDs reject safely instead of weakening protection',()=>{
  assert.equal(core.adjust(plan(['cathedral','museum']),{intent:'three-hours',preserveIds:['other-trip-stop']}).ok,false);
});
test('diff describes reorder/removal/addition/duration/budget rather than replacing whole plan',()=>{
  const a = plan(['cathedral','museum','beach']);
  const b = plan([{id:'beach',duration:90},'bridge','cathedral'],{budget:180});
  const changes = core.diff(a,b).join('\n');
  assert.match(changes,/Remove/);assert.match(changes,/Add/);assert.match(changes,/Reorder/);
  assert.match(changes,/Time budget/);assert.match(changes,/→/);
});
test('formatters handle hours, minute padding and unavailable estimates',()=>{
  assert.equal(core.formatTime(510),'08:30');assert.equal(core.formatTime(640),'10:40');
  assert.equal(core.formatDuration(75),'1 hr 15 min');assert.equal(core.formatDuration(60),'1 hr');
  assert.equal(core.formatDuration(0),'0 min');assert.equal(core.formatTime(NaN),'Unavailable');
});

let failed = 0;
for (const [name,fn] of tests) {
  try {fn();process.stdout.write('PASS '+name+'\n');}
  catch (error) {failed++;process.stderr.write('FAIL '+name+'\n'+error.stack+'\n');}
}
process.stdout.write('\n'+(tests.length-failed)+'/'+tests.length+' domain tests passed. Explicit demo fixtures only; no live AI/Routes/GPS/audio tested.\n');
if (failed) process.exitCode = 1;
