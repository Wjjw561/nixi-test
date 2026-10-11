const C='zbz-v3-20261012-v38-unified-core';
const A=['./','./index.html','./unified.html','./unified.css','./unified.js','./study.css','./study.js','./study-v31-fix.js','./categories-v25.js','./quiz-v27.js','./review-v28.js','./profile-v29.js','./learning-core-v38.js','./preload-v33.js','./manifest.webmanifest','./data/primary.txt','./data/middle.txt','./data/cet4.txt','./data/frequency.txt','./data/source.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.allSettled(A.map(x=>c.add(x)))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const z=r.clone();caches.open(C).then(c=>c.put('./index.html',z)).catch(()=>{})}return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));return
  }
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const z=r.clone();caches.open(C).then(c=>c.put(e.request,z)).catch(()=>{})}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))
});