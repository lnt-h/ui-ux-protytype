/* GoNarra V7: original vector scenes over inherited V6 review imagery.
 * Illustrative geography and routes only. No map tiles, routing SDK or live GPS.
 */
(function (root) {
  'use strict';
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function data() {
    if (root.GN_DATA) return root.GN_DATA;
    if (typeof require === 'function') {
      try { return require('./data.js'); } catch (_) { /* browser-only usage */ }
    }
    return { places: {} };
  }
  var serial = 0;
  function mapScene(plan, options) {
    options = options || {};
    var catalog = data().places || {};
    var allStops = plan && Array.isArray(plan.stops) ? plan.stops : [];
    var ordered = allStops.map(function (stop, i) {
      var id = typeof stop === 'string' ? stop : stop.id;
      return { place: catalog[id], number: i + 1 };
    }).filter(function (item) { return item.place && item.place.coordinates; });
    var rows = plan ? ordered : Object.keys(catalog).map(function (id) {
      return { place: catalog[id], number: null };
    }).filter(function (item) { return item.place.coordinates; });
    var hasMountain = rows.some(function (item) { return item.place.id === 'mountain'; });
    var bounds = { west: 108.201, east: 108.264, north: 16.083, south: hasMountain ? 15.995 : 16.025 };
    function point(lat, lng) {
      return {
        x: Math.max(23, Math.min(457, (lng - bounds.west) / (bounds.east - bounds.west) * 480)),
        y: Math.max(32, Math.min(548, (bounds.north - lat) / (bounds.north - bounds.south) * 580))
      };
    }
    function coord(lat, lng) { var p = point(lat, lng); return p.x.toFixed(1) + ',' + p.y.toFixed(1); }
    function poly(coords) { return coords.map(function (p) { return coord(p[0], p[1]); }).join(' '); }
    function pathLine(coords, cls, attrs) {
      return '<polyline points="' + poly(coords) + '" class="' + cls + '" ' + (attrs || '') + '/>';
    }
    var key = 'gn-map-' + (++serial);
    // The mouth of the Han opens northward. The coast is east of the river.
    var river = 'M' + coord(16.091,108.224) + ' C' + coord(16.079,108.230) + ' ' + coord(16.073,108.230) + ' ' + coord(16.062,108.228)
      + ' C' + coord(16.048,108.226) + ' ' + coord(16.040,108.220) + ' ' + coord(16.031,108.219)
      + ' C' + coord(16.019,108.219) + ' ' + coord(16.012,108.208) + ' ' + coord(15.986,108.203);
    var oceanEdge = 'M' + coord(16.089,108.250) + ' C' + coord(16.078,108.248) + ' ' + coord(16.064,108.249) + ' ' + coord(16.053,108.249)
      + ' C' + coord(16.033,108.252) + ' ' + coord(16.015,108.257) + ' ' + coord(15.988,108.262);
    var ocean = oceanEdge + ' L480,580 L480,0 Z';
    var svg = '<svg class="geo-map-svg" viewBox="0 0 480 580" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
      + '<defs><pattern id="' + key + '-grid" width="39" height="31" patternUnits="userSpaceOnUse" patternTransform="rotate(-7)">'
      + '<rect x="3" y="3" width="31" height="23" rx="3" fill="#e9ebe8"/>'
      + '<path d="M0 0H39M0 0V31" stroke="#fafbf9" stroke-width="5"/></pattern>'
      + '<clipPath id="' + key + '-land"><rect width="480" height="580"/></clipPath></defs>'
      + '<rect width="480" height="580" fill="#f0f1ed"/>'
      + '<rect x="0" y="0" width="480" height="580" fill="url(#' + key + '-grid)" opacity=".72"/>';
    // Several finer side streets and wider connecting avenues make the map legible at phone size.
    var streets = [
      [[16.080,108.206],[16.066,108.209],[16.053,108.214],[16.036,108.212],[15.998,108.210]],
      [[16.081,108.215],[16.069,108.217],[16.056,108.217],[16.042,108.218]],
      [[16.082,108.237],[16.069,108.238],[16.054,108.240],[16.038,108.243],[15.998,108.254]],
      [[16.081,108.244],[16.065,108.245],[16.049,108.247],[16.030,108.251],[15.998,108.259]],
      [[16.076,108.201],[16.077,108.218]],
      [[16.068,108.201],[16.069,108.221]],
      [[16.059,108.201],[16.061,108.220]],
      [[16.050,108.201],[16.051,108.218]],
      [[16.039,108.201],[16.041,108.214]],
      [[16.074,108.232],[16.075,108.248]],
      [[16.066,108.231],[16.067,108.249]],
      [[16.055,108.230],[16.057,108.250]],
      [[16.043,108.226],[16.045,108.251]],
      [[16.020,108.217],[16.024,108.254]],
      [[16.005,108.214],[16.008,108.260]]
    ];
    streets.forEach(function (s) { svg += pathLine(s, 'geo-side-street', 'fill="none" stroke="#fcfcfa" stroke-width="6" stroke-linejoin="round"'); });
    var parks = [
      { lat:16.077, lng:108.216, w:42, h:34, rotate:-9 },
      { lat:16.056, lng:108.221, w:29, h:45, rotate:8 },
      { lat:16.075, lng:108.242, w:30, h:43, rotate:-8 },
      { lat:16.047, lng:108.244, w:39, h:30, rotate:2 },
      { lat:16.022, lng:108.245, w:46, h:42, rotate:-12 }
    ];
    parks.forEach(function (park) {
      var p = point(park.lat,park.lng);
      svg += '<rect x="' + p.x + '" y="' + p.y + '" width="' + park.w + '" height="' + park.h + '" rx="9" fill="#dce6d7" transform="rotate(' + park.rotate + ' ' + p.x + ' ' + p.y + ')"/>';
    });
    svg += '<path d="' + ocean + '" fill="#dce9e9"/>'
      + '<path d="' + oceanEdge + '" fill="none" stroke="#eee8d9" stroke-width="11"/>'
      + '<path d="' + oceanEdge + '" fill="none" stroke="#fffdf6" stroke-width="2"/>'
      + '<path d="' + river + '" fill="none" stroke="#cbdfe2" stroke-width="43" stroke-linecap="round"/>'
      + '<path d="' + river + '" fill="none" stroke="#d5e5e6" stroke-width="34" stroke-linecap="round"/>';
    // Stylised bridges are placed at the latitude of their actual river crossings.
    [[16.071,108.222,108.235],[16.061,108.221,108.233],[16.046,108.217,108.232]].forEach(function (bridge) {
      var a = point(bridge[0],bridge[1]), b=point(bridge[0],bridge[2]);
      svg += '<path d="M' + a.x + ' ' + a.y + 'L' + b.x + ' ' + b.y + '" stroke="#c3c9c7" stroke-width="9"/>'
        + '<path d="M' + a.x + ' ' + a.y + 'L' + b.x + ' ' + b.y + '" stroke="#fffefa" stroke-width="5"/>';
    });
    var city = point(16.052,108.209), sea = point(16.067,108.257), riverLabel = point(16.077,108.227), beachLabel=point(16.047,108.249);
    svg += '<g font-family="Inter,Arial,sans-serif" fill="#8c9691" font-size="12" letter-spacing="2.2">'
      + '<text x="' + city.x + '" y="' + city.y + '" text-anchor="middle">DA NANG</text>'
      + '<text x="' + sea.x + '" y="' + sea.y + '" text-anchor="middle" fill="#91a9ab" font-size="10" letter-spacing="1.4">EAST SEA</text>'
      + '<text x="' + riverLabel.x + '" y="' + riverLabel.y + '" text-anchor="middle" fill="#7d9fa6" font-size="10" letter-spacing=".7" transform="rotate(83 ' + riverLabel.x + ' ' + riverLabel.y + ')">Han River</text>'
      + '<text x="' + beachLabel.x + '" y="' + beachLabel.y + '" text-anchor="middle" fill="#a39e8d" font-size="10" letter-spacing=".8" transform="rotate(80 ' + beachLabel.x + ' ' + beachLabel.y + ')">My Khe</text></g>';
    var first = ordered[0] && ordered[0].place;
    var startPlace = plan && catalog[plan.startId];
    var startCoord = startPlace && startPlace.coordinates ? startPlace.coordinates : { lat:16.0651, lng:108.2237 };
    var start = point(startCoord.lat,startCoord.lng);
    if (ordered.length) {
      var routePoints = [start].concat(ordered.map(function (row) { return point(row.place.coordinates.lat,row.place.coordinates.lng); }));
      var route = 'M' + routePoints[0].x + ',' + routePoints[0].y;
      for (var i=1;i<routePoints.length;i++) {
        var prev=routePoints[i-1], next=routePoints[i];
        var midY=(prev.y+next.y)/2;
        route += ' C' + prev.x + ',' + midY + ' ' + next.x + ',' + midY + ' ' + next.x + ',' + next.y;
      }
      svg += '<path class="geo-route-underlay" d="' + route + '" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path class="geo-route" d="' + route + '" fill="none" stroke="#2d6aff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<circle cx="' + start.x + '" cy="' + start.y + '" r="7" fill="#fff" stroke="#4579ae" stroke-width="3"/>';
    }
    var pins = '', seen = {};
    rows.forEach(function (row) {
      var p = row.place;
      if (seen[p.id]) return;
      seen[p.id] = true;
      var anchor = point(p.coordinates.lat,p.coordinates.lng), visual = {x:anchor.x,y:anchor.y};
      // Short leader lines prevent the nearby museum and bridge pins hiding each other.
      if (seen.museum || rows.some(function(r){return r.place.id==='museum';})) {
        if (p.id==='bridge') { visual.x += 51; visual.y -= 8; }
        if (p.id==='museum' && rows.some(function(r){return r.place.id==='bridge';})) { visual.x -= 22; visual.y += 9; }
      }
      var selected = options.selectedId === p.id;
      if (selected) svg += '<circle class="geo-selected-halo" cx="'+anchor.x+'" cy="'+anchor.y+'" r="25" fill="#4c80b4" opacity=".13"/>';
      if (anchor.x!==visual.x || anchor.y!==visual.y) svg += '<path d="M'+anchor.x+','+anchor.y+'L'+visual.x+','+visual.y+'" stroke="#8a9ca8" stroke-width="1.2"/>';
      svg += '<circle cx="'+anchor.x+'" cy="'+anchor.y+'" r="3.2" fill="'+(selected?'#25619a':'#627f8d')+'" stroke="#fff" stroke-width="1.3"/>';
      var attrs=' class="geo-pin'+(selected?' is-selected':'')+'" style="left:'+(visual.x/4.8).toFixed(3)+'%;top:'+(visual.y/5.8).toFixed(3)+'%"';
      var inside='<span class="geo-pin-photo"><img src="'+esc(p.image)+'" alt="" loading="lazy"/></span>'
        +(row.number ? '<span class="geo-pin-number">'+row.number+'</span>' : '')
        +'<span class="geo-pin-name">'+esc(p.id==='museum'?'Cham Museum':p.id==='bridge'?'Dragon Bridge':p.name)+'</span>';
      if (options.interactive !== false) pins += '<button type="button"'+attrs+' data-action="map-place" data-id="'+esc(p.id)+'" aria-label="'+esc((row.number ? 'Stop '+row.number+': ':'')+p.name)+'" aria-pressed="'+selected+'">'+inside+'</button>';
      else pins += '<div'+attrs+'>'+inside+'</div>';
    });
    if (options.showPosition) {
      var pos=point(16.064,108.221);
      svg += '<circle cx="'+pos.x+'" cy="'+pos.y+'" r="21" fill="#2d6aff" opacity=".10"/>'
        +'<circle class="geo-position" cx="'+pos.x+'" cy="'+pos.y+'" r="6" fill="#2d6aff" stroke="#fff" stroke-width="3"/>';
    }
    svg += '</svg>';
    var steps = options.steps && ordered.length ? '<div class="geo-map-step-list">'+ordered.slice(0,3).map(function(row){
      return '<span class="geo-map-step"><b>'+row.number+'</b>'+esc(row.place.id==='museum'?'Cham Museum':row.place.name)+'</span>';
    }).join('')+'</div>' : '';
    return '<div class="geo-map'+(plan?' has-route':'')+(options.showPosition?' has-demo-position':'')+'" role="group" aria-label="Illustrative Da Nang map, not live navigation">'
      +svg+'<div class="geo-map-pins">'+pins+'</div>'+steps
      +'<span class="geo-map-caption">Demo map · illustrative route'+(options.showPosition?' · simulated position':'')+'</span></div>';
  }
  function onboardArtwork(step) {
    if (Number(step) === 2) return '<div class="onboard-art onboard-art-2" aria-hidden="true">'
      +'<img class="onboard-beach-backdrop" src="assets/beach.png" alt=""/>'
      +'<div class="onboard-art-shade"></div>'
      +'<svg class="onboard-route onboard-route-2" viewBox="0 0 400 460" fill="none"><path d="M72 342C7 300 58 176 166 202S361 161 318 74" stroke="white" stroke-width="1.8" stroke-dasharray="3 7" opacity=".8"/><circle cx="72" cy="342" r="5" fill="white"/><circle cx="318" cy="74" r="5" fill="white"/></svg>'
      +'<div class="onboard-mini-card onboard-mini-card-1"><span class="onboard-mini-num">1</span><img src="assets/cathedral.png" alt=""/><span><b>A little culture</b><small>Da Nang Cathedral</small></span><span class="onboard-mini-check">✓</span></div>'
      +'<div class="onboard-mini-card onboard-mini-card-2"><span class="onboard-mini-num">2</span><img src="assets/beach.png" alt=""/><span><b>More time by the sea</b><small>My Khe Beach</small></span><span class="onboard-mini-check">✓</span></div>'
      +'<div class="onboard-floating-note"><span>✦</span> Your day, your pace</div></div>';
    return '<div class="onboard-art onboard-art-1" aria-hidden="true"><div class="onboard-collage">'
      +'<svg class="onboard-route onboard-route-1" viewBox="0 0 400 460" fill="none"><path d="M31 251C-8 144 121 20 200 86S395 188 336 344C303 435 157 440 146 360" stroke="#a6b9b4" stroke-width="1.5" stroke-dasharray="3 7"/><circle cx="31" cy="251" r="5" fill="#5c7d72"/><circle cx="146" cy="360" r="5" fill="#5c7d72"/></svg>'
      +'<div class="onboard-photo onboard-photo-bridge"><img src="assets/coast.png" alt=""/><span>Da Nang</span></div>'
      +'<div class="onboard-photo onboard-photo-cathedral"><img src="assets/cathedral.png" alt=""/></div>'
      +'<div class="onboard-photo onboard-photo-museum"><img src="assets/museum.png" alt=""/></div>'
      +'<div class="onboard-story-tag"><span>♫</span> A story at every stop</div>'
      +'<span class="onboard-spark onboard-spark-1">✦</span><span class="onboard-spark onboard-spark-2">✧</span></div></div>';
  }
  var api = { mapScene:mapScene, onboardArtwork:onboardArtwork };
  root.GN_VISUALS=api;
  if (typeof module!=='undefined' && module.exports) module.exports=api;
})(typeof globalThis!=='undefined' ? globalThis : this);
