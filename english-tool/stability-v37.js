(()=>{
'use strict';
const BUILD='v3.5';
const BUILD_ID='37';
const ERR_KEY='zbz-runtime-errors-v37';
const REQUIRED=['unified.js','study.js','categories-v25.js','quiz-v27.js','review-v28.js','profile-v29.js','study-v31-fix.js','learning-v32.js','activity-v35.js','mastery-v36.js','stability-v37.js'];

const core=window.ZBZCore=window.ZBZCore||{};
core.version=BUILD;core.build=BUILD_ID;core.hooks=core.hooks||{};
core.on=function(name,fn){if(typeof fn!=='function')return()=>{};(core.hooks[name]||(core.hooks[name]=new Set())).add(fn);return()=>core.hooks[name]?.delete(fn)};
core.emit=function(name,payload){for(const fn of core.hooks[name]||[]){try{fn(payload)}catch(e){captureError(e,'hook:'+name)}}};

function errorMessage(x){return String(x?.message||x?.reason?.message||x?.reason||x||'未知错误').slice(0,500)}
function loadErrors(){try{return JSON.parse(sessionStorage.getItem(ERR_KEY)||'[]')}catch(e){return[]}}
let runtimeErrors=loadErrors();
function persistErrors(){try{sessionStorage.setItem(ERR_KEY,JSON.stringify(runtimeErrors.slice(-12)))}catch(e){}}
function captureError(err,source='runtime'){
  const item={time:Date.now(),source,message:errorMessage(err)};
  const last=runtimeErrors[runtimeErrors.length-1];
  if(!last||last.message!==item.message||item.time-last.time>1500)runtimeErrors.push(item);
  runtimeErrors=runtimeErrors.slice(-12);persistErrors();core.emit('error',item);setTimeout(renderHealth,0)
}
window.addEventListener('error',e=>captureError(e.error||e.message,'window'));
window.addEventListener('unhandledrejection',e=>captureError(e.reason,'promise'));
core.captureError=captureError;

function storageWritable(){
  try{const k='__zbz_test__'+Date.now();localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch(e){return false}
}
function sourceNames(){return [...document.scripts].map(s=>(s.getAttribute('src')||'').split('?')[0].split('/').pop()).filter(Boolean)}
function safePlanCount(){try{return typeof plan==='function'?plan(typeof today==='function'?today():1).length:0}catch(e){return 0}}
function dataCounts(){return{p:L?.p?.length||0,m:L?.m?.length||0,c:L?.c?.length||0,f:Object.keys(L?.freq||{}).length}}
function appChecks(){
  const src=sourceNames(),counts=dataCounts(),planN=safePlanCount();
  const globals=typeof S==='object'&&typeof L==='object'&&typeof plan==='function'&&typeof statusOf==='function'&&typeof page==='function'&&typeof studyRender==='function';
  const missing=REQUIRED.filter(x=>!src.includes(x));
  return[
    {key:'core',label:'核心脚本',ok:globals,detail:globals?'主要函数已就绪':'有核心函数没有加载'},
    {key:'assets',label:'模块完整性',ok:missing.length===0,detail:missing.length?'缺少：'+missing.join('、'):'当前版本模块均已加载'},
    {key:'words',label:'本地词库',ok:counts.p>0&&counts.c>0,detail:`基础 ${counts.p} · 中学 ${counts.m} · CET-4 ${counts.c}`},
    {key:'plan',label:'今日计划',ok:planN===20,detail:planN?`今日可读取 ${planN} 个新词`:'今日计划尚未生成'},
    {key:'storage',label:'学习数据存储',ok:storageWritable(),detail:storageWritable()?'本地存储可写':'本地存储不可写，学习记录可能无法保存'},
    {key:'errors',label:'运行错误',ok:runtimeErrors.length===0,detail:runtimeErrors.length?`本次打开记录到 ${runtimeErrors.length} 个错误`:'本次打开暂未捕获错误'}
  ]
}
core.health=function(){const checks=appChecks();return{version:BUILD,build:BUILD_ID,ok:checks.every(x=>x.ok),checks,errors:[...runtimeErrors],counts:dataCounts(),planCount:safePlanCount()}};

function ensureHealthPanel(){
  const pg=document.getElementById('myPage');if(!pg)return null;
  let box=document.getElementById('stabilityV37');if(box)return box;
  box=document.createElement('div');box.id='stabilityV37';box.className='card stability-panel';
  const dataCard=[...pg.querySelectorAll(':scope > .card')].find(x=>(x.textContent||'').includes('数据'));
  if(dataCard)dataCard.insertAdjacentElement('beforebegin',box);else pg.appendChild(box);
  return box
}
function renderHealth(){
  const box=ensureHealthPanel();if(!box)return;const h=core.health();
  const rows=h.checks.map(x=>`<div class="health-row ${x.ok?'ok':'bad'}"><i>${x.ok?'✓':'!'}</i><div><b>${esc(x.label)}</b><span>${esc(x.detail)}</span></div></div>`).join('');
  const err=runtimeErrors.length?`<details class="health-errors"><summary>查看最近错误</summary>${runtimeErrors.slice(-5).reverse().map(e=>`<div><b>${new Date(e.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b><span>${esc(e.message)}</span></div>`).join('')}</details>`:'';
  box.innerHTML=`<div class="health-head"><div><div class="section-head">系统状态</div><div class="small">v3.5 开始先把地基管起来。这里检查词库、计划、存储和运行错误。</div></div><span class="health-total ${h.ok?'ok':'bad'}">${h.ok?'运行正常':'需要处理'}</span></div><div class="health-list">${rows}</div>${err}<div class="health-actions"><button class="secondary" onclick="zbzCheckV37()">重新检查</button><button class="primary" onclick="zbzRefreshV37()">更新缓存并重载</button></div><div class="small health-note">“更新缓存并重载”只清网页缓存和 Service Worker，不删除你的学习数据。</div>`
}
window.zbzCheckV37=function(){renderHealth();try{toast(core.health().ok?'系统检查通过':'检查到异常，详情已经列出来')}catch(e){}};
window.zbzRefreshV37=async function(){
  try{
    if('caches'in window){for(const k of await caches.keys())if(k.startsWith('zbz-'))await caches.delete(k)}
    if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.update().catch(()=>{})}
  }catch(e){captureError(e,'refresh')}
  location.replace(location.pathname+'?v=37&r='+Date.now()+location.hash)
};

function injectStyle(){if(document.getElementById('stabilityV37Style'))return;const s=document.createElement('style');s.id='stabilityV37Style';s.textContent=`
.stability-panel{margin-top:14px}.health-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.health-total{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.health-total.ok{background:#eaf7ef;color:#257448}.health-total.bad{background:#fff0f0;color:#b13d3d}.health-list{display:grid;gap:7px;margin-top:12px}.health-row{display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:center;padding:9px 10px;border-radius:12px;background:var(--soft)}.health-row i{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:900}.health-row.ok i{background:#e3f5e9;color:#257448}.health-row.bad i{background:#ffe6e6;color:#b13d3d}.health-row b,.health-row span{display:block}.health-row b{font-size:10px}.health-row span{font-size:9px;color:var(--muted);margin-top:2px;line-height:1.45}.health-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.health-errors{margin-top:10px}.health-errors summary{font-size:10px;font-weight:850;color:var(--blue);cursor:pointer}.health-errors>div{display:grid;grid-template-columns:45px 1fr;gap:7px;padding:6px 0;border-bottom:1px solid var(--line);font-size:9px}.health-errors span{color:var(--muted);word-break:break-word}.health-note{margin-top:8px;line-height:1.55}@media(max-width:620px){.health-actions{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

// 不再为了状态刷新继续包一层业务函数，改用页面导航和轻量轮询更新诊断面板。
document.addEventListener('click',e=>{const b=e.target.closest?.('.nav button');if(b?.dataset?.page==='myPage')setTimeout(renderHealth,60)});
let healthTimer=setInterval(()=>{if(document.getElementById('myPage')&&!document.getElementById('myPage').classList.contains('hidden'))renderHealth()},4000);
window.addEventListener('pagehide',()=>clearInterval(healthTimer),{once:true});

injectStyle();renderHealth();
const tag=document.querySelector('.tag');if(tag)tag.textContent=BUILD;
window.__ZBZ_READY__=true;core.emit('ready',core.health());
})();