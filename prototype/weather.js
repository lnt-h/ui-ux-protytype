/* Optional city forecast. Open-Meteo model data, never GPS or a station reading.
 * Free endpoint is for non-commercial use; retain visible CC BY attribution.
 * No network request is made until the app calls load(). */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GN_WEATHER = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  const LOCATION = Object.freeze({name:'Da Nang',latitude:16.0678,longitude:108.2208,timezone:'Asia/Ho_Chi_Minh'});
  const FRESH_MS = 30 * 60 * 1000;
  const MAX_CACHE_MS = 6 * 60 * 60 * 1000;
  const CACHE_KEY = 'gonarra-weather-danang-v1';
  const ATTRIBUTION = Object.freeze({name:'Open-Meteo',url:'https://open-meteo.com/',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'});
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=16.0678&longitude=108.2208&timezone=Asia%2FHo_Chi_Minh&timeformat=unixtime&forecast_days=3&temperature_unit=celsius&wind_speed_unit=kmh&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,weather_code';
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const number = (value,min,max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
  const isDay = value => value === 1 ? true : value === 0 ? false : null;
  const arrayAt = (object,key,index) => Array.isArray(object && object[key]) ? object[key][index] : null;
  function timestamp(value) {
    // API contract requests epoch seconds. Reject strings, null and milliseconds.
    if (number(value,946684800,7258118400) === null) return null;
    return new Date(value * 1000).toISOString();
  }
  function dateNumber(value) {
    const result = typeof value === 'number' ? value : Date.parse(value);
    return Number.isFinite(result) ? result : NaN;
  }
  function localDate(value) {
    const ms = dateNumber(value);
    if (!Number.isFinite(ms)) return null;
    // Da Nang has UTC+7 all year. Numeric conversion avoids the viewer's zone.
    return new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(0,10);
  }
  function formatTime(value) {
    const ms = dateNumber(value);
    return Number.isFinite(ms) ? new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(11,16) : '—';
  }
  function formatDate(value) {
    const date = localDate(value);
    return date ? date.slice(8,10) + '/' + date.slice(5,7) : '—';
  }
  function classify(code,day) {
    if (!Number.isInteger(code)) return {label:'Condition unavailable',icon:'cloud',kind:'unknown'};
    const night = day === false || day === 0;
    if (code === 0) return {label:night?'Clear night':'Clear sky',icon:night?'moon':'sun',kind:'clear'};
    if (code === 1) return {label:night?'Mainly clear':'Mainly clear',icon:night?'moon':'sun',kind:'clear'};
    if (code === 2) return {label:'Partly cloudy',icon:'cloud-sun',kind:'cloud'};
    if (code === 3) return {label:'Overcast',icon:'cloud',kind:'cloud'};
    if ([45,48].includes(code)) return {label:code===48?'Rime fog':'Fog',icon:'fog',kind:'fog'};
    if ([51,53,55].includes(code)) return {label:({51:'Light drizzle',53:'Drizzle',55:'Dense drizzle'})[code],icon:'rain',kind:'rain'};
    if ([56,57].includes(code)) return {label:'Freezing drizzle',icon:'rain',kind:'ice'};
    if ([61,63,65].includes(code)) return {label:({61:'Light rain',63:'Rain',65:'Heavy rain'})[code],icon:'rain',kind:'rain'};
    if ([66,67].includes(code)) return {label:'Freezing rain',icon:'rain',kind:'ice'};
    if ([71,73,75,77].includes(code)) return {label:code===77?'Snow grains':({71:'Light snow',73:'Snow',75:'Heavy snow'})[code],icon:'snow',kind:'snow'};
    if ([80,81,82].includes(code)) return {label:({80:'Light rain showers',81:'Rain showers',82:'Heavy rain showers'})[code],icon:'rain',kind:'rain'};
    if ([85,86].includes(code)) return {label:'Snow showers',icon:'snow',kind:'snow'};
    if ([95,96,99].includes(code)) return {label:code===95?'Thunderstorm':'Thunderstorm with hail',icon:'storm',kind:'storm'};
    return {label:'Condition unavailable',icon:'cloud',kind:'unknown'};
  }
  function weatherCode(value) { return Number.isInteger(value) && value >= 0 && value <= 99 ? value : null; }
  function fail(code,message) { const error = new Error(message); error.code = code; return error; }
  function normalize(raw,options) {
    options = options || {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.error) throw fail('invalid-data','The weather service returned an invalid forecast.');
    const fetchedMs = dateNumber(options.fetchedAt == null ? Date.now() : options.fetchedAt);
    const nowMs = dateNumber(options.now == null ? fetchedMs : options.now);
    if (!Number.isFinite(fetchedMs) || !Number.isFinite(nowMs)) throw fail('invalid-time','The forecast timestamp is invalid.');
    if (raw.timezone !== LOCATION.timezone || raw.utc_offset_seconds !== 25200) throw fail('invalid-data','The forecast timezone does not match Da Nang.');
    // The provider returns the selected grid cell, which can differ from the city coordinate.
    if (number(raw.latitude,-90,90) === null || number(raw.longitude,-180,180) === null || Math.abs(raw.latitude-LOCATION.latitude) > .6 || Math.abs(raw.longitude-LOCATION.longitude) > .6) throw fail('invalid-data','The forecast location does not match Da Nang.');
    const units = raw.current_units || {};
    const hourlyUnits = raw.hourly_units || {};
    const dailyUnits = raw.daily_units || {};
    // Missing units never cause a Celsius/kmh number to be inferred from another unit.
    const temp = (value,unit) => unit === '°C' ? number(value,-90,65) : null;
    const precip = (value,unit) => unit === '%' ? number(value,0,100) : null;
    const currentRaw = raw.current || {};
    const currentTime = timestamp(currentRaw.time);
    const current = currentTime ? {
      time:currentTime,
      temperature:temp(currentRaw.temperature_2m,units.temperature_2m),
      apparentTemperature:temp(currentRaw.apparent_temperature,units.apparent_temperature),
      weatherCode:weatherCode(currentRaw.weather_code),
      isDay:isDay(currentRaw.is_day),
      windKph:units.wind_speed_10m === 'km/h' ? number(currentRaw.wind_speed_10m,0,500) : null,
      condition:classify(weatherCode(currentRaw.weather_code),isDay(currentRaw.is_day))
    } : null;
    const firstHour = Math.floor(nowMs / 3600000) * 3600000;
    const hourly = (Array.isArray(raw.hourly && raw.hourly.time) ? raw.hourly.time : []).map((time,index) => {
      const iso = timestamp(time), code = weatherCode(arrayAt(raw.hourly,'weather_code',index));
      return {
        time:iso,
        temperature:temp(arrayAt(raw.hourly,'temperature_2m',index),hourlyUnits.temperature_2m),
        precipProbability:precip(arrayAt(raw.hourly,'precipitation_probability',index),hourlyUnits.precipitation_probability),
        weatherCode:code,
        condition:classify(code,isDay(arrayAt(raw.hourly,'is_day',index)))
      };
    }).filter(row => row.time && dateNumber(row.time) >= firstHour && dateNumber(row.time) < firstHour + 8*3600000 && (row.temperature !== null || row.precipProbability !== null || row.weatherCode !== null))
      .sort((a,b)=>dateNumber(a.time)-dateNumber(b.time)).filter((row,index,rows)=>!index || row.time !== rows[index-1].time).slice(0,8);
    const today = localDate(nowMs);
    const daily = (Array.isArray(raw.daily && raw.daily.time) ? raw.daily.time : []).map((time,index) => {
      const code = weatherCode(arrayAt(raw.daily,'weather_code',index));
      const max = temp(arrayAt(raw.daily,'temperature_2m_max',index),dailyUnits.temperature_2m_max);
      const min = temp(arrayAt(raw.daily,'temperature_2m_min',index),dailyUnits.temperature_2m_min);
      return {
        date:localDate(timestamp(time)),
        max:max !== null && min !== null && max < min ? null : max,
        min:max !== null && min !== null && max < min ? null : min,
        sunrise:timestamp(arrayAt(raw.daily,'sunrise',index)),
        sunset:timestamp(arrayAt(raw.daily,'sunset',index)),
        precipProbability:precip(arrayAt(raw.daily,'precipitation_probability_max',index),dailyUnits.precipitation_probability_max),
        weatherCode:code,condition:classify(code,true)
      };
    }).filter(row=>row.date && row.date >= today && (row.max !== null || row.min !== null || row.weatherCode !== null || row.precipProbability !== null))
      .sort((a,b)=>a.date.localeCompare(b.date)).filter((row,index,rows)=>!index || row.date !== rows[index-1].date).slice(0,3);
    if ((!current || [current.temperature,current.apparentTemperature,current.windKph,current.weatherCode].every(value=>value===null)) && !hourly.length && !daily.length) throw fail('invalid-data','No usable weather values are available.');
    // current.time is the model's valid time. generationtime_ms is NOT an update time.
    return {location:{...LOCATION},fetchedAt:new Date(fetchedMs).toISOString(),forecastAt:currentTime || (hourly[0] && hourly[0].time) || null,modelUpdatedAt:null,current,hourly,daily,attribution:{...ATTRIBUTION}};
  }
  function create(options) {
    options = options || {};
    const now = typeof options.now === 'function' ? options.now : Date.now;
    const fetcher = Object.prototype.hasOwnProperty.call(options,'fetch') ? options.fetch : typeof root.fetch === 'function' ? root.fetch.bind(root) : null;
    let storage = Object.prototype.hasOwnProperty.call(options,'storage') ? options.storage : null;
    if (!Object.prototype.hasOwnProperty.call(options,'storage')) { try { storage = root.localStorage; } catch (_) { /* Local storage can be unavailable in private mode. */ } }
    const timeoutMs = number(options.timeoutMs,1,60000) || 9000;
    let data = null, rawCache = null, source = null, error = null, loading = false, inflight = null, epoch = 0;
    function safeNow() { const value = dateNumber(now()); return Number.isFinite(value) ? value : Date.now(); }
    function age(snapshot) { return snapshot ? safeNow()-dateNumber(snapshot.fetchedAt) : null; }
    function usable(snapshot) { const value = age(snapshot); return snapshot && value >= 0 && value <= MAX_CACHE_MS; }
    function readCache() {
      try {
        const saved = storage && JSON.parse(storage.getItem(CACHE_KEY));
        if (!saved || saved.version !== 1 || !Number.isFinite(dateNumber(saved.fetchedAt))) return;
        const candidate = normalize(saved.raw,{fetchedAt:saved.fetchedAt,now:safeNow()});
        if (usable(candidate)) { data = candidate; rawCache = saved.raw; source = 'cache'; }
      } catch (_) { /* Corrupt/missing cache is not substituted with fixture data. */ }
    }
    readCache();
    function getState() {
      if (data && !usable(data)) { data = null; rawCache = null; source = null; }
      const ageMs = age(data), stale = !!data && ageMs >= FRESH_MS;
      const status = loading ? 'loading' : data ? (stale || error ? 'stale' : 'ready') : error ? error.code === 'unsupported' ? 'unsupported' : 'error' : 'idle';
      return clone({status,loading,stale:stale || !!(data && error),data,error,source,ageMs});
    }
    function load(params) {
      if (inflight) return inflight;
      params = params || {};
      if (!params.force && usable(data) && age(data) < FRESH_MS && !error) return Promise.resolve(getState());
      if (typeof fetcher !== 'function') { error = {code:'unsupported',message:'This browser cannot load weather. You can still explore and plan your trip.'}; return Promise.resolve(getState()); }
      loading = true; error = null;
      const run = ++epoch;
      const controller = typeof root.AbortController === 'function' ? new root.AbortController() : null;
      let timer;
      const task = Promise.resolve().then(()=>fetcher(URL,{method:'GET',credentials:'omit',cache:'no-store',...(controller ? {signal:controller.signal} : {})})).then(response=>{
        if (!response || !response.ok) throw fail('http','Weather is temporarily unavailable. Please try again.');
        return response.json();
      });
      const timeout = new Promise((_,reject)=>{
        timer = setTimeout(()=>{ reject(fail('timeout','The weather request timed out. Please try again.')); if (controller) controller.abort(); },timeoutMs);
      });
      inflight = Promise.race([task,timeout]).then(raw=>{
        if (run !== epoch) return getState();
        const fetchedAt = new Date(safeNow()).toISOString();
        data = normalize(raw,{fetchedAt,now:safeNow()}); rawCache = raw; source = 'network'; error = null;
        try { if (storage) storage.setItem(CACHE_KEY,JSON.stringify({version:1,fetchedAt,raw:rawCache})); } catch (_) { /* Successful weather remains usable even if storage is full. */ }
      }).catch(reason=>{
        if (run === epoch) error = {code:reason && reason.code || 'network',message:reason && reason.code ? reason.message : 'Could not connect to the weather service. Please try again.'};
      }).then(()=>{
        clearTimeout(timer);
        if (run === epoch) { loading = false; inflight = null; }
        return getState();
      });
      return inflight;
    }
    function clear() {
      epoch++; data = null; rawCache = null; source = null; error = null; loading = false; inflight = null;
      try { if (storage) storage.removeItem(CACHE_KEY); } catch (_) { /* Optional storage. */ }
      return getState();
    }
    return {getState,load,clear};
  }
  return {LOCATION,FRESH_MS,MAX_CACHE_MS,CACHE_KEY,ATTRIBUTION,URL,classify,formatTime,formatDate,normalize,create};
});
