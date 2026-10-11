const C='zbz-v2-20261011-v28-error-driven-review';
const A=['./','./index.html','./unified.html','./unified.css','./unified.js','./study.css','./study.js','./categories-v25.js','./quiz-v27.js','./review-v28.js','./manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const z=r.clone();caches.open(C).then(c=>c.put(e.request,z));return r}).catch(()=>caches.match(e.request)))})