'use strict';
// Forecast boundary, cache and failure tests are deterministic and make no network calls.
const assert = require('node:assert/strict');
const W = require('../prototype/weather.js');
const NOW = Date.parse('2026-10-23T03:25:00Z'); // 10:25 in Da Nang
const SEC = value => Date.parse(value) / 1000;
const tests = [];
function test(name,fn) { tests.push([name,fn]); }
function fixture(overrides={}) {
  const first = SEC('2026-10-23T02:00:00Z');
  return {
    latitude:16.125,longitude:108.25,timezone:'Asia/Ho_Chi_Minh',utc_offset_seconds:25200,
    generationtime_ms:123,
    current_units:{temperature_2m:'°C',apparent_temperature:'°C',wind_speed_10m:'km/h'},
    current:{time:SEC('2026-10-23T03:15:00Z'),temperature_2m:28.4,apparent_temperature:32.1,weather_code:3,is_day:1,wind_speed_10m:8.6},
    hourly_units:{temperature_2m:'°C',precipitation_probability:'%'},
    hourly:{time:Array.from({length:12},(_,i)=>first+i*3600),temperature_2m:Array.from({length:12},(_,i)=>27+i/10),precipitation_probability:Array.from({length:12},(_,i)=>i*5),weather_code:Array(12).fill(2),is_day:Array(12).fill(1)},
    daily_units:{temperature_2m_max:'°C',temperature_2m_min:'°C',precipitation_probability_max:'%'},
    daily:{time:['2026-10-22T17:00:00Z','2026-10-23T17:00:00Z','2026-10-24T17:00:00Z'].map(SEC),temperature_2m_max:[30,29,31],temperature_2m_min:[25,24,26],sunrise:['2026-10-22T22:45:00Z','2026-10-23T22:46:00Z','2026-10-24T22:46:00Z'].map(SEC),sunset:['2026-10-23T10:25:00Z','2026-10-24T10:25:00Z','2026-10-25T10:24:00Z'].map(SEC),precipitation_probability_max:[70,60,20],weather_code:[61,3,2]},
    ...overrides
  };
}
function storage(initial) {
  const values = new Map(initial ? [[W.CACHE_KEY,initial]] : []);
  return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),values};
}
function cached(raw=fixture(),fetchedAt=NOW) { return JSON.stringify({version:1,fetchedAt:new Date(fetchedAt).toISOString(),raw}); }
function response(raw=fixture()) { return {ok:true,json:async()=>raw}; }

test('request uses city coordinates, Celsius/kmh, fixed local zone and no API key',()=>{
  const url = new URL(W.URL);
  assert.equal(url.origin,'https://api.open-meteo.com');
  assert.equal(url.searchParams.get('latitude'),'16.0678');
  assert.equal(url.searchParams.get('longitude'),'108.2208');
  assert.equal(url.searchParams.get('timezone'),'Asia/Ho_Chi_Minh');
  assert.equal(url.searchParams.get('timeformat'),'unixtime');
  assert.equal(url.searchParams.get('forecast_days'),'3');
  assert.equal(url.searchParams.get('apikey'),null);
});
test('normalization keeps actual model valid time separate from fetch time',()=>{
  const data = W.normalize(fixture(),{fetchedAt:NOW,now:NOW});
  assert.equal(data.fetchedAt,'2026-10-23T03:25:00.000Z');
  assert.equal(data.forecastAt,'2026-10-23T03:15:00.000Z');
  assert.equal(data.modelUpdatedAt,null);
  assert.equal(data.current.temperature,28.4);
  assert.equal(data.current.apparentTemperature,32.1);
  assert.equal(data.current.windKph,8.6);
  assert.equal(data.current.isDay,true);
  assert.equal(data.current.condition.label,'Overcast');
  assert.equal(data.attribution.name,'Open-Meteo');
});
test('hourly forecast includes this hour and next seven, sorted with correct aligned values',()=>{
  const data = W.normalize(fixture(),{fetchedAt:NOW,now:NOW});
  assert.equal(data.hourly.length,8);
  assert.equal(data.hourly[0].time,'2026-10-23T03:00:00.000Z');
  assert.equal(data.hourly[0].precipProbability,5);
  assert.equal(data.hourly[7].time,'2026-10-23T10:00:00.000Z');
});
test('daily dates and sunrise/sunset use Da Nang time rather than viewer timezone',()=>{
  const data = W.normalize(fixture(),{fetchedAt:NOW,now:NOW});
  assert.equal(data.daily.length,3);
  assert.equal(data.daily[0].date,'2026-10-23');
  assert.equal(W.formatTime(data.daily[0].sunrise),'05:45');
  assert.equal(W.formatTime(data.daily[0].sunset),'17:25');
  assert.equal(W.formatDate(data.current.time),'23/10');
  assert.equal(W.formatTime(null),'—');
  assert.equal(W.formatDate('invalid'),'—');
});
test('null, strings, impossible values and missing parallel series never turn into zero',()=>{
  const raw = fixture();
  raw.current.temperature_2m = null;
  raw.current.apparent_temperature = '30';
  raw.current.wind_speed_10m = -1;
  raw.current.is_day = null;
  raw.hourly.precipitation_probability = [null,101];
  raw.hourly.temperature_2m[1] = 999;
  const data = W.normalize(raw,{fetchedAt:NOW,now:NOW});
  assert.equal(data.current.temperature,null);
  assert.equal(data.current.apparentTemperature,null);
  assert.equal(data.current.windKph,null);
  assert.equal(data.current.isDay,null);
  assert.equal(data.hourly[0].temperature,null);
  assert.equal(data.hourly[0].precipProbability,null);
  assert.equal(data.hourly[1].precipProbability,null);
});
test('unrecognized temperature/wind units are not mislabeled as Celsius or kmh',()=>{
  const raw = fixture({current_units:{temperature_2m:'°F',apparent_temperature:'°F',wind_speed_10m:'mp/h'}});
  const data = W.normalize(raw,{fetchedAt:NOW,now:NOW});
  assert.equal(data.current.temperature,null);
  assert.equal(data.current.apparentTemperature,null);
  assert.equal(data.current.windKph,null);
});
test('daily inverted temperature range is unavailable rather than shown as valid',()=>{
  const raw = fixture(); raw.daily.temperature_2m_max[0] = 20; raw.daily.temperature_2m_min[0] = 30;
  const data = W.normalize(raw,{fetchedAt:NOW,now:NOW});
  assert.equal(data.daily[0].max,null); assert.equal(data.daily[0].min,null);
});
test('invalid payload, foreign location/timezone and entirely missing data are rejected',()=>{
  for (const raw of [null,[],{error:true},fixture({timezone:'Europe/London'}),fixture({latitude:51}),fixture({current:null,hourly:null,daily:null})]) {
    assert.throws(()=>W.normalize(raw,{fetchedAt:NOW,now:NOW}),/invalid|match|usable/);
  }
});
test('partial forecast remains usable without fabricated current conditions',()=>{
  const raw = fixture({current:null});
  const data = W.normalize(raw,{fetchedAt:NOW,now:NOW});
  assert.equal(data.current,null); assert.equal(data.hourly.length,8);
  assert.equal(data.forecastAt,data.hourly[0].time);
});
test('all WMO groups and night clear conditions have explicit readable labels',()=>{
  for (const code of [0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]) assert.notEqual(W.classify(code,true).kind,'unknown');
  assert.equal(W.classify(0,false).label,'Clear night');
  assert.equal(W.classify(999).kind,'unknown');
  assert.equal(W.classify(null).kind,'unknown');
});
test('fresh cache is reused without a request, with source and age preserved',async()=>{
  let calls = 0;
  const client = W.create({storage:storage(cached()),now:()=>NOW+10*60000,fetch:async()=>{calls++;return response();}});
  const state = await client.load();
  assert.equal(calls,0); assert.equal(state.status,'ready'); assert.equal(state.source,'cache'); assert.equal(state.ageMs,10*60000);
});
test('stale cache refresh failure preserves last valid snapshot with explicit stale/error',async()=>{
  const client = W.create({storage:storage(cached()),now:()=>NOW+40*60000,fetch:async()=>{throw new Error('offline');}});
  assert.equal(client.getState().status,'stale');
  const state = await client.load();
  assert.equal(state.status,'stale'); assert.equal(state.stale,true); assert.equal(state.source,'cache');
  assert.equal(state.error.code,'network'); assert.equal(state.data.current.temperature,28.4);
});
test('cache expires after six hours and future fetched timestamp is rejected',()=>{
  for (const at of [NOW-6*3600000-1,NOW+60000]) {
    const client = W.create({storage:storage(cached(fixture(),at)),now:()=>NOW,fetch:null});
    assert.equal(client.getState().data,null);
  }
});
test('cache corruption and storage access errors cannot break weather or the app',async()=>{
  const broken = {getItem(){throw new Error('denied');},setItem(){throw new Error('quota');},removeItem(){throw new Error('denied');}};
  const a = W.create({storage:storage('not json'),now:()=>NOW,fetch:null});
  assert.equal(a.getState().status,'idle');
  const b = W.create({storage:broken,now:()=>NOW,fetch:async()=>response()});
  const state = await b.load(); assert.equal(state.status,'ready'); assert.equal(state.source,'network');
  assert.equal(b.clear().status,'idle');
});
test('concurrent loads deduplicate one request including forced refresh calls',async()=>{
  let calls = 0, resolve;
  const client = W.create({now:()=>NOW,storage:null,fetch:()=>{calls++;return new Promise(done=>{resolve=done;});}});
  const a = client.load(), b = client.load({force:true});
  assert.equal(a,b); assert.equal(client.getState().loading,true);
  await Promise.resolve(); resolve(response());
  const state = await a;
  assert.equal(calls,1); assert.equal(state.status,'ready'); assert.equal(state.loading,false);
});
test('forced refresh bypasses fresh cache and persists only a valid network response',async()=>{
  let calls = 0; const store = storage(cached());
  const client = W.create({now:()=>NOW+60000,storage:store,fetch:async()=>{calls++;return response();}});
  const state = await client.load({force:true});
  assert.equal(calls,1); assert.equal(state.source,'network');
  assert.equal(JSON.parse(store.getItem(W.CACHE_KEY)).fetchedAt,'2026-10-23T03:26:00.000Z');
});
test('HTTP, invalid JSON and invalid payload show errors without invented fallback',async()=>{
  for (const fetch of [async()=>({ok:false}),async()=>({ok:true,json:async()=>{throw new SyntaxError('bad JSON');}}),async()=>response({})]) {
    const state = await W.create({now:()=>NOW,storage:null,fetch}).load();
    assert.equal(state.status,'error'); assert.equal(state.data,null); assert.ok(state.error.message);
  }
});
test('timeout resolves even if fetch ignores AbortSignal and a late result cannot replace state',async()=>{
  let resolve;
  const client = W.create({now:()=>NOW,storage:null,timeoutMs:5,fetch:()=>new Promise(done=>{resolve=done;})});
  const state = await client.load();
  assert.equal(state.status,'error'); assert.equal(state.error.code,'timeout'); assert.equal(state.loading,false);
  resolve(response()); await new Promise(done=>setImmediate(done));
  assert.equal(client.getState().data,null);
});
test('unsupported fetch preserves cache visibly stale or exposes unsupported without data',async()=>{
  const a = W.create({now:()=>NOW,storage:null,fetch:null});
  assert.equal((await a.load()).status,'unsupported');
  const b = W.create({now:()=>NOW+40*60000,storage:storage(cached()),fetch:null});
  const state = await b.load(); assert.equal(state.status,'stale'); assert.equal(state.error.code,'unsupported'); assert.ok(state.data);
});
test('state snapshots are copies and expiration is recalculated as the clock advances',async()=>{
  let now = NOW;
  const client = W.create({now:()=>now,storage:null,fetch:async()=>response()});
  const state = await client.load(); state.data.current.temperature = -50;
  assert.equal(client.getState().data.current.temperature,28.4);
  now += W.FRESH_MS; assert.equal(client.getState().status,'stale');
  now = NOW+W.MAX_CACHE_MS+1; assert.equal(client.getState().data,null);
});
test('clear during an in-flight request prevents cache or state being repopulated',async()=>{
  let resolve; const store = storage();
  const client = W.create({now:()=>NOW,storage:store,fetch:()=>new Promise(done=>{resolve=done;})});
  const pending = client.load(); await Promise.resolve(); client.clear(); resolve(response()); await pending;
  assert.equal(client.getState().data,null); assert.equal(store.getItem(W.CACHE_KEY),null);
});

(async()=>{
  let failures = 0;
  for (const [name,fn] of tests) {
    try { await fn(); process.stdout.write('PASS '+name+'\n'); }
    catch (error) { failures++; process.stderr.write('FAIL '+name+'\n'+error.stack+'\n'); }
  }
  process.stdout.write(`${tests.length-failures}/${tests.length} weather tests passed.\n`);
  process.exitCode = failures ? 1 : 0;
})();
