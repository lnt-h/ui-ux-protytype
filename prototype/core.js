/* Pure V7 DEMO engine. Travel below is an explicit fixture, never live routing.
 * No AI/network/GPS/audio APIs. Callers preview proposals before accepting them. */
(function (root, factory) {
  const api = factory(function () {
    if (root.GN_DATA) return root.GN_DATA;
    if (typeof module === 'object' && module.exports) return require('./data.js');
    throw new Error('Load data.js before using GN_CORE.');
  });
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GN_CORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (getData) {
  'use strict';
  const MAX_STOPS = 4;
  const MODES = ['car', 'walking', 'motorbike'];
  // [origin, destination, km, car min, walking min, motorbike min]. Symmetric
  // sample values are authored independently; they do not verify road access.
  const TRAVEL_ROWS = [
    ['river','cathedral',1.2,4,16,4], ['river','museum',1.8,6,24,5],
    ['river','bridge',2.0,7,27,6], ['river','beach',4.2,13,55,11],
    ['river','mountain',11.0,28,145,24],
    ['cathedral','museum',0.9,5,12,4], ['cathedral','bridge',1.3,6,18,5],
    ['cathedral','beach',3.7,12,49,10], ['cathedral','mountain',10.2,26,135,23],
    ['museum','bridge',0.3,3,5,3], ['museum','beach',3.6,12,48,10],
    ['museum','mountain',9.6,25,128,22], ['bridge','beach',3.4,11,45,10],
    ['bridge','mountain',9.4,25,125,22], ['beach','mountain',7.8,21,104,19]
  ];
  const TRAVEL = {};
  for (const [a,b,km,car,walking,motorbike] of TRAVEL_ROWS) {
    const value = {distanceKm:km,car,walking,motorbike};
    TRAVEL[a+'>'+b] = value;
    TRAVEL[b+'>'+a] = value;
  }
  const supportedIntents = ['more-beach','less-walking','culture-only','three-hours'];
  function places() { return getData().places; }
  function normalize(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
  }
  function modeOf(mode) { return mode === 'walk' ? 'walking' : mode; }
  function clone(plan) { return {...plan,stops:(plan.stops || []).map(s=>({...s}))}; }
  function minutes(value) { return Number.isInteger(value) && value >= 0; }
  function formatTime(n) {
    if (!Number.isFinite(n)) return 'Unavailable';
    const rounded = Math.round(n), day = ((rounded % 1440) + 1440) % 1440;
    return String(Math.floor(day / 60)).padStart(2,'0')+':'+String(day % 60).padStart(2,'0');
  }
  function formatDuration(n) {
    if (!Number.isFinite(n)) return 'Unavailable';
    const rounded = Math.max(0,Math.round(n)), h = Math.floor(rounded/60), m = rounded%60;
    return h && m ? h+' hr '+m+' min' : h ? h+' hr' : m+' min';
  }
  function leg(a,b,mode) {
    if (a === b) return {minutes:0,distanceKm:0};
    const row = TRAVEL[a+'>'+b];
    if (!row || !MODES.includes(modeOf(mode))) throw new Error('No demo travel fixture for '+a+' → '+b+' ('+mode+').');
    return {minutes:row[modeOf(mode)],distanceKm:row.distanceKm};
  }
  function schedule(plan) {
    const catalog = places();
    let now = plan.startMinutes, origin = plan.startId, travelMinutes = 0, visitMinutes = 0;
    if (!minutes(now)) throw new Error('A valid start time is required.');
    const stops = (plan.stops || []).map(stop=>{
      if (!catalog[stop.id]) throw new Error('Unknown place: '+stop.id);
      if (!Number.isFinite(stop.duration) || stop.duration <= 0) throw new Error('A positive visit duration is required.');
      // A generic lunch block has no restaurant coordinate. Stay at the last
      // known anchor; the next real leg starts there. Never invent a venue.
      const travel = stop.id === 'lunch' ? {minutes:0,distanceKm:0} : leg(origin,stop.id,plan.mode);
      now += travel.minutes;
      const arrival = now;
      now += stop.duration;
      travelMinutes += travel.minutes;
      visitMinutes += stop.duration;
      if (stop.id !== 'lunch') origin = stop.id;
      return {...stop,arrival,departure:now,travelMinutes:travel.minutes,distanceKm:travel.distanceKm};
    });
    const back = plan.endMode === 'start' ? leg(origin,plan.startId,plan.mode) : {minutes:0,distanceKm:0};
    now += back.minutes;
    travelMinutes += back.minutes;
    return {stops,totalMinutes:now-plan.startMinutes,finishMinutes:now,
      overBudget:Math.max(0,now-plan.startMinutes-plan.budget),travelMinutes,visitMinutes,
      returnMinutes:back.minutes,returnDistanceKm:back.distanceKm,
      distanceKm:Number((stops.reduce((n,s)=>n+s.distanceKm,0)+back.distanceKm).toFixed(1)),
      routeKind:'demo-fixture',hoursStatus:'unverified'};
  }
  function validate(plan) {
    if (!plan || typeof plan !== 'object') return ['A plan is required.'];
    const errors = [], catalog = places();
    if (!MODES.includes(modeOf(plan.mode))) errors.push('Choose a supported demo transport mode.');
    if (plan.startId !== 'river' && (!catalog[plan.startId] || plan.startId === 'lunch')) errors.push('Choose a reviewed demo start point.');
    if (!minutes(plan.startMinutes) || plan.startMinutes >= 1440) errors.push('Start time must be within one local day.');
    if (!Number.isInteger(plan.budget) || plan.budget <= 0 || plan.budget > 720) errors.push('Time budget must be 1–720 minutes.');
    if (minutes(plan.startMinutes) && Number.isFinite(plan.budget) && plan.startMinutes+plan.budget > 1440) errors.push('The time window may not cross midnight.');
    if (!['last','start'].includes(plan.endMode)) errors.push('End at the final stop or return to the start.');
    if (typeof plan.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.date) || Number.isNaN(Date.parse(plan.date+'T00:00:00Z')) || new Date(plan.date+'T00:00:00Z').toISOString().slice(0,10) !== plan.date) errors.push('Choose a valid calendar date.');
    if (!Array.isArray(plan.stops) || !plan.stops.length) errors.push('Add at least one stop.');
    if (Array.isArray(plan.stops)) {
      if (plan.stops.length > MAX_STOPS) errors.push('This demo supports at most four stops.');
      const seen = new Set();
      for (const stop of plan.stops) {
        if (!catalog[stop.id]) { errors.push('Unknown place: '+stop.id); continue; }
        if (seen.has(stop.id)) errors.push('Duplicate stop: '+catalog[stop.id].name);
        seen.add(stop.id);
        if (!Number.isInteger(stop.duration) || stop.duration < (catalog[stop.id].minDuration || 15) || stop.duration > 180) {
          errors.push(catalog[stop.id].name+': visit must be '+(catalog[stop.id].minDuration || 15)+'–180 minutes.');
        }
      }
    }
    if (!errors.length) {
      try {
        const result = schedule(plan);
        if (result.overBudget) errors.push('The plan exceeds your time budget by '+formatDuration(result.overBudget)+'.');
        if (result.finishMinutes > 1440) errors.push('The actual scheduled finish crosses midnight. Shorten the trip or start earlier.');
      } catch (error) { errors.push(error.message); }
    }
    return errors;
  }
  function permutations(items) {
    if (items.length < 2) return [items.slice()];
    return items.flatMap((item,i)=>permutations(items.filter((_,j)=>j!==i)).map(rest=>[item,...rest]));
  }
  function subsets(items,max) {
    const out = [];
    function visit(index,chosen) {
      if (chosen.length) out.push(chosen);
      if (chosen.length === max) return;
      for (let i=index;i<items.length;i++) visit(i+1,[...chosen,items[i]]);
    }
    visit(0,[]); return out;
  }
  function tagsOf(p) { return new Set([p.category,...(p.tags || [])].map(normalize)); }
  function score(p,interests) {
    const tags = tagsOf(p);
    return interests.reduce((n,i)=>n+(tags.has(i)?12:0),0)+2;
  }
  function durationFor(p,pace) {
    const value = p.duration || 45;
    const scaled = pace === 'relaxed' ? Math.ceil(value*1.15/5)*5 : pace === 'active' ? Math.floor(value*.85/5)*5 : value;
    return Math.min(180,Math.max(p.minDuration || 15,scaled));
  }
  function fail(reason,requiredMinutes) {
    const result = {ok:false,reason,changes:[],explanations:[]};
    if (Number.isFinite(requiredMinutes)) result.requiredMinutes = requiredMinutes;
    return result;
  }
  function generate(req) {
    req = req || {};
    const catalog = places(), required = req.mustVisit || [];
    if (!Array.isArray(required) || required.some(id=>!catalog[id])) return fail('A must-visit is outside the demo catalogue.');
    if (new Set(required).size !== required.length) return fail('Choose each must-visit only once.');
    if (required.length > MAX_STOPS) return fail('Four stops is the maximum; unlock a place or split the trip.');
    const interests = (req.interests || []).map(normalize);
    const base = {id:req.id || 'demo-'+(req.date || '2026-10-22')+'-'+(req.startMinutes ?? 510),
      title:'My Da Nang day',revision:0,stops:[],startId:req.startId || 'river',
      startMinutes:req.startMinutes ?? 510,budget:req.budget ?? 360,mode:modeOf(req.mode || 'car'),
      endMode:req.endMode || 'last',date:req.date || '2026-10-22'};
    const probe = {...base,stops:[{id:'cathedral',duration:catalog.cathedral.duration || 40,locked:false}]};
    const inputErrors = validate(probe).filter(message=>!message.startsWith('The plan exceeds'));
    if (inputErrors.length) return fail(inputErrors.join(' '));
    const pool = Object.keys(catalog).filter(id=>id !== 'lunch' || required.includes(id));
    let winner = null, winnerScore = -Infinity, minimumRequired = Infinity, minimumTwo = Infinity;
    for (const ids of subsets(pool,MAX_STOPS)) {
      if (!required.every(id=>ids.includes(id))) continue;
      for (const ordered of permutations(ids)) {
        const candidate = {...base,stops:ordered.map(id=>({id,duration:durationFor(catalog[id],req.pace),locked:required.includes(id)}))};
        const timing = schedule(candidate);
        if (ids.length === required.length && required.length) minimumRequired = Math.min(minimumRequired,timing.totalMinutes);
        if (ids.length >= 2) minimumTwo = Math.min(minimumTwo,timing.totalMinutes);
        if (ids.length < 2 || timing.overBudget) continue;
        const candidateScore = ids.reduce((n,id)=>n+score(catalog[id],interests),0)*100 - timing.travelMinutes;
        if (candidateScore > winnerScore) {winner=candidate;winnerScore=candidateScore;}
      }
    }
    if (!winner) {
      const needed = Number.isFinite(minimumRequired) && minimumRequired > base.budget ? minimumRequired : minimumTwo;
      return fail(required.length ? 'Your must-visits and at least two stops do not fit. Add time or unlock a place.' : 'Two demo stops do not fit this time window. Add time or choose another mode.',needed);
    }
    return {ok:true,plan:winner,explanations:[
      'Local demo ranking uses your interests; no AI model was called.',
      'Must-visits are kept and locked. Travel uses explicit sample values, not live Routes.',
      'Opening hours and entrance conditions remain unverified.'
    ]};
  }
  const aliases = {
    'more-beach':'more-beach','more beach':'more-beach','more beach time':'more-beach',
    'more time at the beach':'more-beach','them bien':'more-beach','nhieu bien hon':'more-beach','them thoi gian o bien':'more-beach',
    'less-walking':'less-walking','less walking':'less-walking','it di bo':'less-walking','di bo it hon':'less-walking',
    'culture-only':'culture-only','culture only':'culture-only','only culture':'culture-only','chi van hoa':'culture-only','chi cac diem van hoa':'culture-only',
    'three-hours':'three-hours','three hours':'three-hours','3 hours':'three-hours','make it 3 hours':'three-hours',
    '3 gio':'three-hours','ba gio':'three-hours','con 3 gio':'three-hours','rut con 3 gio':'three-hours'
  };
  function parseIntent(value) {
    const text = normalize(value).replace(/[.!?]+$/,'').trim();
    if (aliases[text]) return [aliases[text]];
    const clauses = text.split(/\s*[,;]\s*|\s+and\s+|\s+va\s+/).filter(Boolean);
    if (clauses.length > 1 && clauses.every(c=>aliases[c])) return [...new Set(clauses.map(c=>aliases[c]))];
    return null;
  }
  function diff(before,after) {
    const catalog = places(), changes = [], old = before.stops || [], next = after.stops || [];
    for (const stop of old) if (!next.some(s=>s.id===stop.id)) changes.push('Remove '+(catalog[stop.id]?.name || stop.id));
    for (const stop of next) {
      const previous = old.find(s=>s.id===stop.id), name = catalog[stop.id]?.name || stop.id;
      if (!previous) changes.push('Add '+name+' · '+formatDuration(stop.duration));
      else if (previous.duration !== stop.duration) changes.push(name+': '+formatDuration(previous.duration)+' → '+formatDuration(stop.duration));
    }
    const commonBefore = old.filter(s=>next.some(n=>n.id===s.id)).map(s=>s.id).join(',');
    const commonAfter = next.filter(s=>old.some(n=>n.id===s.id)).map(s=>s.id).join(',');
    if (commonBefore !== commonAfter) changes.push('Reorder the remaining stops');
    if (before.budget !== after.budget) changes.push('Time budget: '+formatDuration(before.budget)+' → '+formatDuration(after.budget));
    if (before.mode !== after.mode) changes.push('Transport: '+before.mode+' → '+after.mode);
    return changes;
  }
  function adjust(plan,options) {
    options = options || {};
    const catalog = places(), intents = parseIntent(options.intent);
    if (!intents) return fail('This demo understands only More beach time, Less walking, Only culture, or Make it 3 hours. Your tour is unchanged.');
    if (intents.includes('culture-only') && intents.includes('more-beach')) return fail('Only culture and more beach time conflict. Choose one supported change.');
    const structural = validate(plan).filter(message=>!message.startsWith('The plan exceeds'));
    if (structural.length) return fail(structural.join(' '));
    const before = clone(plan), proposed = clone(plan);
    const lockIds = new Set([...(options.lockedIds || []),...before.stops.filter(s=>s.locked).map(s=>s.id)]);
    const preserveIds = options.preserveIds || [];
    if ([...lockIds,...preserveIds].some(id=>!before.stops.some(s=>s.id===id))) return fail('A protected stop is not part of this tour.');
    const lastFixed = Math.max(-1,...preserveIds.map(id=>before.stops.findIndex(s=>s.id===id)));
    const fixed = before.stops.slice(0,lastFixed+1).map(s=>({...s}));
    const fixedIds = new Set(fixed.map(s=>s.id));
    const protectedIds = new Set([...lockIds,...fixedIds]);
    for (const stop of proposed.stops) if (lockIds.has(stop.id)) stop.locked = true;
    if (intents.includes('three-hours')) proposed.budget = 180;
    if (intents.includes('culture-only')) {
      proposed.stops = proposed.stops.filter(s=>protectedIds.has(s.id) || tagsOf(catalog[s.id]).has('culture'));
      if (!proposed.stops.some(s=>s.id==='museum') && !fixedIds.has('museum') && proposed.stops.length < MAX_STOPS) {
        proposed.stops.push({id:'museum',duration:durationFor(catalog.museum,'standard'),locked:false});
      }
    }
    if (intents.includes('more-beach')) {
      const beach = proposed.stops.find(s=>s.id==='beach');
      if (beach && protectedIds.has('beach')) return fail('Beach time is locked or already current/visited. Unlock it before changing its duration.');
      if (beach) beach.duration = Math.min(180,beach.duration+20);
      else if (proposed.stops.length < MAX_STOPS) proposed.stops.push({id:'beach',duration:catalog.beach.duration || 60,locked:false});
      else {
        const replaceable = proposed.stops.findLastIndex(s=>!protectedIds.has(s.id) && s.id !== 'beach');
        if (replaceable < 0) return fail('Every stop is protected. Unlock a future stop to add beach time.');
        proposed.stops.splice(replaceable,1,{id:'beach',duration:catalog.beach.duration || 60,locked:false});
      }
      protectedIds.add('beach');
    }
    if (intents.includes('less-walking')) {
      // Within this demo, "less walking" means avoiding the tagged Many steps
      // venue and a shorter walking itinerary, never silently changing mode.
      proposed.stops = proposed.stops.filter(s=>protectedIds.has(s.id) || ![...tagsOf(catalog[s.id])].some(t=>/many steps|many-steps|stairs/.test(t)));
      if (modeOf(proposed.mode) === 'walking') {
        let best = schedule(proposed).travelMinutes;
        for (let i=proposed.stops.length-1;i>=lastFixed+1;i--) {
          if (protectedIds.has(proposed.stops[i].id) || proposed.stops.length <= Math.max(1,fixed.length)) continue;
          const trial = {...proposed,stops:proposed.stops.filter((_,j)=>i!==j)};
          if (schedule(trial).travelMinutes < best) {proposed.stops=trial.stops;best=schedule(trial).travelMinutes;break;}
        }
      }
    }
    // Only the three-hours intent may shorten/remove additional mutable visits.
    // Other intents return a conflict rather than silently changing extra stops.
    if (intents.includes('three-hours')) {
      for (let i=proposed.stops.length-1;i>=lastFixed+1 && schedule(proposed).overBudget;i--) {
        const stop = proposed.stops[i];
        if (protectedIds.has(stop.id)) continue;
        const spare = stop.duration-(catalog[stop.id].minDuration || 15);
        stop.duration -= Math.min(spare,schedule(proposed).overBudget);
      }
      while (schedule(proposed).overBudget && proposed.stops.length > 1) {
        const index = proposed.stops.findLastIndex(s=>!protectedIds.has(s.id));
        if (index < 0) break;
        proposed.stops.splice(index,1);
      }
    }
    if (!proposed.stops.length) return fail('No remaining stop matches this change. Your current tour is unchanged.');
    // Fixed prefix retains identity, duration, order and lock flags exactly.
    proposed.stops = [...fixed,...proposed.stops.filter(s=>!fixedIds.has(s.id))];
    for (const locked of before.stops.filter(s=>lockIds.has(s.id))) {
      const next = proposed.stops.find(s=>s.id===locked.id);
      if (!next || next.duration !== locked.duration) return fail('The request would change a locked visit. Your tour is unchanged.');
    }
    const issues = validate(proposed);
    if (issues.length) return fail('The change does not fit without altering protected visits. '+issues.join(' '),schedule(proposed).totalMinutes);
    const changes = diff(before,proposed);
    if (!changes.length) return fail('Your tour already meets that supported demo change; nothing was changed.');
    proposed.revision = (before.revision || 0)+1;
    return {ok:true,plan:proposed,changes,explanations:[
      'Preview only: your accepted tour remains unchanged until you apply it.',
      'Local demo rules, not a live AI interpretation. Fixed and locked visits are preserved.'
    ]};
  }
  return {schedule,validate,generate,adjust,diff,formatTime,formatDuration,
    supportedIntents,modes:MODES.slice(),maxStops:MAX_STOPS,
    travelFixtureNotice:'Illustrative pairwise fixtures only — no live routes, traffic or opening-hours verification.'};
});
