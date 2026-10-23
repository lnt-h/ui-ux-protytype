'use strict';
/* Static file integrity and a finite set of explicitly named color pairs.
 * No browser, audible quality, field accuracy, rights or global WCAG claim. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base=path.resolve(__dirname,'..'),prototype=path.join(base,'prototype');
const data=require(path.join(prototype,'data.js'));
const checks=[],audio=[],images=[],references=[],networkDependencies=[];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function check(name,fn){try{const detail=fn();checks.push({name,status:'PASS',...(detail===undefined?{}:{detail})})}catch(error){checks.push({name,status:'FAIL',error:error.message})}}
function localFile(ref,from=prototype){
  assert.equal(typeof ref,'string','Asset reference must be a string.');
  assert.ok(!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref),'Expected a local reference, received '+ref);
  const clean=decodeURIComponent(ref.split(/[?#]/)[0]);
  const file=path.resolve(from,clean);
  assert.ok(file===base||file.startsWith(base+path.sep),'Asset escapes the V7 deliverable: '+ref);
  assert.ok(fs.existsSync(file),'Missing local asset: '+ref);
  assert.ok(fs.statSync(file).isFile(),'Reference is not a file: '+ref);
  assert.ok(fs.statSync(file).size>0,'Empty local asset: '+ref);
  return file;
}
function wavInfo(file){
  const buffer=fs.readFileSync(file);
  assert.ok(buffer.length>=12,'WAV is smaller than a RIFF header.');
  assert.equal(buffer.toString('ascii',0,4),'RIFF','Expected little-endian RIFF.');
  assert.equal(buffer.toString('ascii',8,12),'WAVE','Expected WAVE form type.');
  const riffEnd=buffer.readUInt32LE(4)+8;
  assert.ok(riffEnd>=12&&riffEnd<=buffer.length,'Declared RIFF length exceeds the available file.');
  let offset=12,fmt=null,dataBytes=0,nonZeroDataBytes=0;
  const chunks=[];
  while(offset+8<=riffEnd){
    const id=buffer.toString('ascii',offset,offset+4),bytes=buffer.readUInt32LE(offset+4),start=offset+8,end=start+bytes;
    assert.ok(end<=riffEnd,'Truncated '+JSON.stringify(id)+' chunk at '+offset+'.');
    chunks.push({id,offset,payloadOffset:start,bytes});
    if(id==='fmt '){
      assert.ok(bytes>=16,'fmt chunk is too short.');
      let format=buffer.readUInt16LE(start);
      if(format===65534){assert.ok(bytes>=40,'Extensible fmt chunk is too short.');format=buffer.readUInt16LE(start+24)}
      fmt={format,channels:buffer.readUInt16LE(start+2),sampleRate:buffer.readUInt32LE(start+4),byteRate:buffer.readUInt32LE(start+8),blockAlign:buffer.readUInt16LE(start+12),bitsPerSample:buffer.readUInt16LE(start+14)};
    }
    if(id==='data'){
      dataBytes+=bytes;
      for(let i=start;i<end;i++)if(buffer[i]!==0)nonZeroDataBytes++;
    }
    offset=end+(bytes%2); // RIFF chunks have an even-byte boundary.
  }
  assert.ok(fmt,'WAV has no fmt chunk.');
  assert.ok([1,3].includes(fmt.format),'Duration validation supports PCM/IEEE float WAV; this file needs a decoder.');
  assert.ok(fmt.channels>0&&fmt.sampleRate>0&&fmt.byteRate>0&&fmt.blockAlign>0,'Invalid WAV sample format.');
  assert.equal(fmt.blockAlign,fmt.channels*Math.ceil(fmt.bitsPerSample/8),'PCM block alignment does not match channels/bit depth.');
  assert.equal(fmt.byteRate,fmt.sampleRate*fmt.blockAlign,'WAV byteRate does not match the sample format.');
  assert.ok(dataBytes>0,'WAV has no nonempty data chunk.');
  assert.equal(dataBytes%fmt.blockAlign,0,'Audio data ends in a partial sample frame.');
  assert.ok(nonZeroDataBytes>0,'Audio payload contains only zero bytes.');
  const durationSeconds=dataBytes/fmt.byteRate;
  assert.ok(Number.isFinite(durationSeconds)&&durationSeconds>0,'No positive duration can be derived.');
  return {file:path.relative(base,file),fileBytes:buffer.length,riffBytes:riffEnd,dataBytes,nonZeroDataBytes,durationSeconds,sampleFrames:dataBytes/fmt.blockAlign,...fmt,chunks,sha256:hash(file)};
}

const globalSources=new Map();
check('Source definitions have stable unique IDs and valid linked URLs',()=>{
  for(const p of Object.values(data.places))for(const s of p.sources||[]){
    assert.ok(s.id&&s.title&&s.url,'Incomplete source definition at '+p.id);
    const url=new URL(s.url);assert.ok(['http:','https:'].includes(url.protocol),'Unsupported source URL scheme.');
    if(globalSources.has(s.id))assert.equal(globalSources.get(s.id).url,s.url,'One source ID resolves to conflicting URLs.');
    globalSources.set(s.id,s);
  }
  return {definedSourceIds:globalSources.size,limit:'URL syntax and identifiers only; no network source access or claim entailment tested.'};
});
let resolvedReferences=0,emptyQuestionReferences=0;
for(const p of Object.values(data.places)){
  check(p.id+': source IDs in story and answers resolve',()=>{
    const scope=new Map((p.sources||[]).map(s=>[s.id,s]));
    const groups=[{label:'story',ids:p.story?.sourceIds||[]},...(p.questions||[]).map((q,i)=>({label:'answer '+(i+1),ids:q.sourceIds||[]}))];
    for(const group of groups){
      assert.ok(Array.isArray(group.ids),'Evidence references must be arrays.');
      if(group.label!=='story'&&!group.ids.length)emptyQuestionReferences++;
      for(const id of group.ids){assert.ok(scope.has(id),'Unresolved '+group.label+' source ID '+id+' at '+p.id);resolvedReferences++}
    }
    if(p.story?.audio){assert.ok(p.story.script?.trim(),'Audio requires a matching nonempty script.');assert.ok(p.story.sourceIds.length,'Narrated editorial story has no source reference.');}
  });
  check(p.id+': local image exists and is nonempty',()=>{
    const file=localFile(p.image),buffer=fs.readFileSync(file);
    const item={placeId:p.id,file:path.relative(base,file),bytes:buffer.length,sha256:hash(file)};
    if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
      assert.ok(buffer.length>=24,'Truncated PNG IHDR.');item.width=buffer.readUInt32BE(16);item.height=buffer.readUInt32BE(20);assert.ok(item.width>0&&item.height>0,'PNG dimensions are empty.');
    }
    images.push(item);return {file:item.file,bytes:item.bytes,width:item.width,height:item.height};
  });
  if(p.story?.audio)check(p.id+': real WAV data and duration',()=>{
    const file=localFile(p.story.audio);assert.equal(path.extname(file).toLowerCase(),'.wav','Expected the bundled WAV preview.');
    const info={placeId:p.id,storyId:p.story.id,...wavInfo(file)};audio.push(info);
    return {file:info.file,durationSeconds:info.durationSeconds,dataBytes:info.dataBytes,dataChunkOffsets:info.chunks.filter(c=>c.id==='data').map(c=>c.payloadOffset)};
  });
}
check('Templates contain only real catalogue IDs, with valid bounded visit durations',()=>{
  for(const template of data.templates){
    assert.ok(template.id&&Array.isArray(template.stops)&&template.stops.length,'Empty template.');
    const seen=new Set();
    for(const stop of template.stops){const p=data.places[stop.id];assert.ok(p,'Unknown template stop '+stop.id);assert.ok(!seen.has(stop.id),'Duplicate template stop '+stop.id);seen.add(stop.id);assert.ok(Number.isInteger(stop.duration)&&stop.duration>=p.minDuration&&stop.duration<=180,'Invalid visit duration in '+template.id)}
    if(template.image)localFile(template.image);
  }
});

const htmlFile=path.join(prototype,'index.html'),html=fs.readFileSync(htmlFile,'utf8');
const scriptRefs=[...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const styleRefs=[...html.matchAll(/<link\b[^>]*>/gi)].filter(m=>/\brel\s*=\s*["']stylesheet["']/i.test(m[0])).map(m=>/\bhref\s*=\s*["']([^"']+)["']/i.exec(m[0])?.[1]);
check('Prototype HTML JS/CSS dependencies exist locally, including visuals and theme',()=>{
  for(const ref of [...scriptRefs,...styleRefs]){
    if(/^(?:https?:)?\/\//i.test(ref))networkDependencies.push({kind:'HTML script/stylesheet',ref});
    else references.push({from:'prototype/index.html',ref,file:path.relative(base,localFile(ref))});
  }
  for(const ref of ['data.js','core.js','visuals.js','app.js'])assert.ok(scriptRefs.includes(ref),'Missing script dependency '+ref);
  for(const ref of ['styles.css','theme.css'])assert.ok(styleRefs.includes(ref),'Missing stylesheet '+ref);
  assert.ok(scriptRefs.indexOf('data.js')<scriptRefs.indexOf('core.js'),'Data must load before the engine.');
  assert.ok(scriptRefs.indexOf('visuals.js')<scriptRefs.indexOf('app.js'),'Visual helpers must load before app.js.');
});
check('Production logo assets share the refined master geometry and have no live text',()=>{
  const brandDir=path.join(prototype,'assets','brand');
  const expected=['gonarra-wordmark-color.svg','gonarra-wordmark-tagline-color.svg','gonarra-wordmark-reverse.svg','gonarra-wordmark-mono.svg','gonarra-mark-color.svg','gonarra-mark-reverse.svg','gonarra-app-icon.svg'];
  for(const name of expected){
    const file=path.join(brandDir,name);assert.ok(fs.existsSync(file),'Missing brand asset '+name);
    const svg=fs.readFileSync(file,'utf8');assert.match(svg,/^<svg\b/,'Brand asset is not standalone SVG: '+name);assert.ok(!/<text\b/i.test(svg),'Production logo contains live text: '+name);
    assert.match(svg,/#0B3045|#FFFFFF|#000000/,'Brand asset has no approved base color: '+name);
  }
  const primary=fs.readFileSync(path.join(brandDir,'gonarra-wordmark-color.svg'),'utf8');
  for(const id of ['letter-g','letter-o','letter-n','letter-a-1','letter-r-1','letter-r-2','letter-a-2'])assert.ok(primary.includes(`id="${id}"`),'Primary wordmark misses '+id);
  assert.match(primary,/#0B8EA8/);assert.match(primary,/#F6A623/);assert.match(primary,/stroke-width="26"/);
  const mark=fs.readFileSync(path.join(brandDir,'gonarra-mark-color.svg'),'utf8');
  assert.match(mark,/id="gonarra-g"/);assert.match(mark,/id="gonarra-sun"/);
  return {productionSvgFiles:expected.length,master:'prototype/assets/brand/gonarra-logo-master.svg',kerning:'o/n 15; n/a, a/r, r/r, r/a 14 units'};
});
check('Brand asset library is local, copy-enabled and linked from the prototype review panel',()=>{
  const page=fs.readFileSync(path.join(base,'brand-assets.html'),'utf8'),app=fs.readFileSync(path.join(prototype,'app.js'),'utf8'),sw=fs.readFileSync(path.join(prototype,'sw.js'),'utf8');
  for(const ref of ['brand-assets.css','brand-assets.js','prototype/assets/brand/brand-assets-data.js','prototype/assets/brand/gonarra-logo-master.svg'])assert.ok(fs.existsSync(path.join(base,ref)),'Missing brand library dependency '+ref);
  assert.match(page,/data-copy-master/);assert.match(page,/id="asset-grid"/);assert.match(app,/brand-assets\.html/);assert.match(app,/gonarra-wordmark-color\.svg/);
  assert.ok(!app.includes('<span class="brand-mark"'),'Legacy headphone/text logo is still rendered by the prototype.');
  assert.match(sw,/assets\/brand\/gonarra-wordmark-color\.svg/);assert.match(sw,/assets\/brand\/gonarra-mark-color\.svg/);
  assert.ok(!/<script[^>]+src=["']https?:/i.test(page),'Brand library must not load remote scripts.');
  return {copyMethod:'ClipboardItem HTML/SVG with rich-selection fallback',runtimeLogo:'prototype/assets/brand/gonarra-wordmark-color.svg'};
});
check('Stylesheet imports and file URLs have no missing or remote runtime dependencies',()=>{
  for(const ref of styleRefs){
    if(/^(?:https?:)?\/\//i.test(ref))continue;
    const file=localFile(ref),css=fs.readFileSync(file,'utf8');
    const deps=[...css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)].map(m=>m[1]);
    for(const m of css.matchAll(/@import\s+["']([^"']+)["']/gi))deps.push(m[1]);
    for(const dep of deps){
      if(/^(?:data:|#)/i.test(dep))continue;
      if(/^(?:https?:)?\/\//i.test(dep))networkDependencies.push({kind:'CSS import/asset',ref:dep});
      else references.push({from:path.relative(base,file),ref:dep,file:path.relative(base,localFile(dep,path.dirname(file)))});
    }
  }
});
check('Service-worker shell dependencies exist and include the actual HTML shell',()=>{
  const sw=fs.readFileSync(path.join(prototype,'sw.js'),'utf8'),match=/\b(?:const|let|var)\s+shell\s*=\s*\[([\s\S]*?)\]/.exec(sw);
  assert.ok(match,'No reviewable shell reference list was found.');
  const shell=[...match[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
  for(const ref of shell){
    if(/^(?:https?:)?\/\//i.test(ref))networkDependencies.push({kind:'SW shell',ref});
    else references.push({from:'prototype/sw.js',ref,file:path.relative(base,localFile(ref==='./'?'index.html':ref))});
  }
  for(const ref of ['index.html',...scriptRefs,...styleRefs])assert.ok(shell.includes(ref),'Offline shell omits '+ref);
  return {shellReferences:shell,limit:'File existence only; install/fetch/cache behavior must be tested in a browser.'};
});
check('No external script, stylesheet, font or shell dependency is needed to boot the prototype',()=>{
  for(const ref of scriptRefs){if(/^(?:https?:)?\/\//i.test(ref))continue;const js=fs.readFileSync(localFile(ref),'utf8');
    for(const m of js.matchAll(/\b(?:import\s*\(|require\s*\()\s*["']((?:https?:)?\/\/[^"']+)["']/g))networkDependencies.push({kind:'JS module import',ref:m[1]});
  }
  assert.deepEqual(networkDependencies,[],'External runtime dependencies found.');
  return {scope:'Static HTML script/style references, CSS import/url assets, SW shell and URL module imports. User-opened source/Maps links are intentional outbound navigation, not boot dependencies. Same-origin media download still requires a local server before caching.'};
});

function rgb(hex){const clean=hex.replace('#','');assert.match(clean,/^[\da-f]{6}$/i);return [0,2,4].map(i=>parseInt(clean.slice(i,i+2),16)/255)}
function luminance(hex){const a=rgb(hex).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722}
function contrast(fg,bg){const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
const pairs=[
  ['Navy on white','#021024','#ffffff'],
  ['Button white on navy','#ffffff','#052659'],
  ['Body copy on page','#4a5c6a','#f7f9fb'],
  ['White on action blue','#ffffff','#2d6aff'],
  ['Muted copy on white','#597081','#ffffff'],
  ['Small badge copy','#285484','#e8f0f9'],
  ['Eyebrow on white','#557b8a','#ffffff'],
  ['Secondary chip copy','#052659','#edf4fa'],
  ['Caption on white','#526772','#ffffff']
];
const contrastPairs=pairs.map(([name,foreground,background])=>{const ratio=contrast(foreground,background);return {name,foreground,background,ratio,ratioDisplay:ratio.toFixed(2)+':1',normalTextMinimum:4.5,passesNormalText:ratio>=4.5}});
for(const pair of contrastPairs)check('Known contrast pair: '+pair.name,()=>{
  assert.ok(pair.passesNormalText,pair.foreground+' on '+pair.background+' = '+pair.ratioDisplay+', below 4.5:1.');
  return {ratio:pair.ratio,normalTextMinimum:4.5};
});

const failed=checks.filter(c=>c.status==='FAIL'),report={
  generatedAt:new Date().toISOString(),tool:'GoNarra V7 static assets and finite contrast-pair audit',node:process.version,
  counts:{passed:checks.length-failed.length,total:checks.length,failed:failed.length,realWavFiles:audio.length,localImages:images.length,sourceDefinitions:globalSources.size,resolvedSourceReferences:resolvedReferences,answersWithEmptySourceReferences:emptyQuestionReferences},
  passed:failed.length===0,checks,audio,images,references,networkDependencies,contrastPairs,
  limits:[
    'No global WCAG conformance or accessibility certification. Only these nine explicit solid-color pairs were calculated.',
    'No photographic/dynamic overlay contrast, text size, focus, target size, keyboard, screen reader or browser rendering was verified.',
    'WAV chunk/data integrity and computed duration do not establish audible quality, pronunciation, script accuracy or factual correctness.',
    'Source ID resolution and URL syntax do not establish that claims are entailed, sources remain current, or media/content rights are granted.',
    'Static local-dependency checks do not prove service-worker installation, offline playback or absence of all possible network behavior.'
  ],inputs:{dataSha256:hash(path.join(prototype,'data.js')),htmlSha256:hash(htmlFile),swSha256:hash(path.join(prototype,'sw.js'))}
};
const out=path.join(base,'evidence/assets-and-contrast.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
for(const item of checks)process.stdout.write(item.status+' '+item.name+(item.error?' — '+item.error:'')+'\n');
for(const pair of contrastPairs)process.stdout.write(pair.name+': '+pair.ratioDisplay+' '+(pair.passesNormalText?'PASS':'FAIL')+'\n');
process.stdout.write('\n'+report.counts.passed+'/'+checks.length+' static checks passed; '+audio.length+' WAV files. Evidence: '+out+'\n');
if(failed.length)process.exitCode=1;
