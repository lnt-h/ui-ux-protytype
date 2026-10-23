/* Offline shell and explicitly downloaded media only. No external API caching. */
const SHELL='gonarra-v7-shell-6';
const MEDIA='gonarra-v7-packages';
const shell=['./','index.html','styles.css','theme.css','data.js','core.js','visuals.js','app.js','assets/brand/gonarra-wordmark-color.svg','assets/brand/gonarra-mark-color.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(shell)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gonarra-v7-shell-')&&key!==SHELL).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const media=await caches.open(MEDIA),saved=await media.match(request,{ignoreSearch:true});
    if(saved){
      const range=request.headers.get('range');
      if(range&&saved.status===200){
        const data=await saved.arrayBuffer(),match=/bytes=(\d+)-(\d*)/.exec(range);
        if(match){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),data.byteLength-1):data.byteLength-1;
          if(start>=data.byteLength||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${data.byteLength}`}});
          return new Response(data.slice(start,end+1),{status:206,headers:{'Content-Type':saved.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${data.byteLength}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
        }
      }
      return saved;
    }
    const cache=await caches.open(SHELL);
    try{const response=await fetch(request);
      const relative=url.pathname.slice(new URL('./',self.location.href).pathname.length);
      if(response.ok&&shell.includes(relative||'./'))await cache.put(request,response.clone());
      return response}catch(error){
      const cached=await cache.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(request.mode==='navigate')return (await cache.match('index.html'))||Response.error();
      throw error;
    }
  })());
});
