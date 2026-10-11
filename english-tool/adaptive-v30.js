(()=>{
const DAILY_TARGET=20;
S.dailyNewTarget=DAILY_TARGET;
const ERROR_LABELS={
 article_ref:'冠词：特指 / 泛指',article_sound:'冠词：a / an 发音判断',be_agreement:'be 动词：am / is / are',be_vs_do:'句型：be / do 不混用',do_form:'助动词：do / does / did',prep_time:'时间介词：in / on / at',prep_place:'地点介词：in / on / at',pronoun_case:'代词：主格 / 宾格 / 所有格',demonstrative:'指示词：远近 + 单复数',modal_meaning:'情态动词：can / should / must',wh_choice:'疑问词：问什么信息',conjunction_logic:'连词：并列 / 转折 / 原因 / 条件'
};
let corePlan=[];
function takeUnique(arr,n,used){const out=[];for(const x of arr||[]){if(out.length>=n)break;if(!x?.w||used.has(x.w))continue;used.add(x.w);out.push(x)}return out}
function rebuildCorePlan(){
 if(!L?.p?.length)return false;
 const used=new Set();
 const s1=takeUnique(L.p,600,used);if(s1.length<600)s1.push(...takeUnique(L.m,600-s1.length,used));
 const s2=takeUnique(L.m,1200,used);if(s2.length<1200)s2.push(...takeUnique(L.c,1200-s2.length,used));
 const s3=takeUnique(L.c,1800,used);if(s3.length<1800)s3.push(...takeUnique([...L.p,...L.m,...L.c],1800-s3.length,used));
 corePlan=[...s1,...s2,...s3].slice(0,3600);
 L.corePlan=corePlan;
 L.day={};for(let d=1;d<=180;d++)for(const x of plan(d))if(x?.w&&!L.day[x.w])L.day[x.w]=d;
 const doneWords=new Set();for(const obj of Object.values(S.planDone||{}))for(const w of Object.keys(obj||{}))doneWords.add(w);
 const normalized={};for(const w of doneWords){const d=L.day[w];if(d){normalized[d]=normalized[d]||{};normalized[d][w]=1}}S.planDone=normalized;
 try{save()}catch(e){}
 const pm=$('planMeta');if(pm)pm.textContent=`主计划固定每天 ${DAILY_TARGET} 个新词 · 180 天共 ${corePlan.length} 个高优先级词 · 薄弱结构另外加练`;
 return true;
}
const oldPlan=typeof plan==='function'?plan:null;
plan=function(day){
 const d=Math.max(1,Math.min(180,Number(day)||1));
 if(corePlan.length)return corePlan.slice((d-1)*DAILY_TARGET,d*DAILY_TARGET);
 return oldPlan?oldPlan(d):[];
};
function weakTypes(){
 return Object.entries(S.errorTypes||{}).filter(([k,r])=>ERROR_LABELS[k]&&(r.wrong||0)>0&&((r.streak||0)<3||((r.attempts?Math.round((r.correct||0)/r.attempts*100):100)<80))).sort((a,b)=>{
   const ra=a[1],rb=b[1],sa=(ra.wrong||0)*2.5+(1-(ra.attempts?(ra.correct||0)/ra.attempts:1))*5-(ra.streak||0)*.6,sb=(rb.wrong||0)*2.5+(1-(rb.attempts?(rb.correct||0)/rb.attempts:1))*5-(rb.streak||0)*.6;return sb-sa
 });
}
function dueCount(){try{return dueWords().length}catch(e){return 0}}
function renderAdaptiveDay(){
 const panel=$('planListPanel');if(!panel)return;let box=$('adaptiveDayCard');if(!box){box=document.createElement('div');box.id='adaptiveDayCard';box.className='card adaptive-day-card';panel.parentNode.insertBefore(box,panel)}
 const weak=weakTypes().slice(0,2),due=dueCount(),words=plan(curDay),done=S.planDone[curDay]||{},doneN=words.filter(x=>done[x.w]).length;
 const extra=weak.length?weak.map(([k,r])=>{const acc=r.attempts?Math.round((r.correct||0)/r.attempts*100):0;return`<div class="adaptive-weak"><div><b>${esc(ERROR_LABELS[k])}</b><span>当前正确率 ${acc}% · 错 ${r.wrong||0} 次</span></div><button onclick="startErrorDrill('${k}')">专项 6 题</button></div>`}).join(''):`<div class="adaptive-ok">目前没有明显结构弱项，今天把 20 个新词吃稳就行。</div>`;
 box.innerHTML=`<div class="adaptive-head"><div><div class="section-head">今日学习路线</div><div class="small">固定 20 个新词，薄弱结构单独加练，不占新词名额。</div></div><span class="badge">${doneN}/${words.length}</span></div><div class="adaptive-stats"><div><b>${words.length}</b><span>新词</span></div><div><b>${due}</b><span>到期单词</span></div><div><b>${weak.length}</b><span>重点弱项</span></div></div>${due>12?`<div class="adaptive-warn">今天有 ${due} 个到期词，建议先复习再学新词。20 个新词照常保留，不让计划靠逃债维持体面。</div>`:''}${weak.length?`<div class="adaptive-title">今天额外加练约 5 分钟</div>`:''}${extra}`;
}
function injectAdaptiveStyle(){if($('adaptiveV30Style'))return;const s=document.createElement('style');s.id='adaptiveV30Style';s.textContent=`.adaptive-day-card{margin-top:14px}.adaptive-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.adaptive-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.adaptive-stats>div{padding:10px;border-radius:13px;background:var(--soft);text-align:center}.adaptive-stats b{display:block;font-size:19px}.adaptive-stats span{display:block;font-size:10px;color:var(--muted);margin-top:2px}.adaptive-title{font-size:12px;font-weight:900;margin-top:12px}.adaptive-weak{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;margin-top:8px;padding:10px 11px;border:1px solid var(--line);border-radius:13px}.adaptive-weak b{display:block;font-size:12px}.adaptive-weak span{display:block;font-size:10px;color:var(--muted);margin-top:3px}.adaptive-weak button{border:0;border-radius:9px;padding:8px 10px;background:var(--blue);color:#fff;font-weight:850}.adaptive-ok,.adaptive-warn{margin-top:10px;padding:10px 11px;border-radius:12px;background:var(--soft);font-size:11px;line-height:1.6}.adaptive-warn{background:#fff6e8}@media(max-width:620px){.adaptive-weak{grid-template-columns:1fr}.adaptive-weak button{width:100%}}`;document.head.appendChild(s)}
const prevRenderDay=typeof renderDay==='function'?renderDay:null;if(prevRenderDay){renderDay=function(...a){const r=prevRenderDay(...a);renderAdaptiveDay();return r}}
const prevPage=typeof page==='function'?page:null;if(prevPage){page=function(id,...rest){const r=prevPage(id,...rest);if(id==='planPage')renderAdaptiveDay();return r}}
injectAdaptiveStyle();
const boot=setInterval(()=>{if(rebuildCorePlan()){clearInterval(boot);try{setDay(curDay)}catch(e){try{renderDay()}catch(x){}}try{setStudyDay(homeStudyDay,{resume:true})}catch(e){}renderAdaptiveDay()}},200);setTimeout(()=>clearInterval(boot),15000);
const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.9';window.__ZBZ_READY__=true;
})();