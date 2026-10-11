(()=>{
const DAILY_TARGET=20;
const CATCHUP_LIMIT=5;
const ERROR_LABELS={
  article_ref:'冠词：特指 / 泛指',article_sound:'冠词：a / an 发音判断',be_agreement:'be 动词：am / is / are',be_vs_do:'句型：be / do 不混用',do_form:'助动词：do / does / did',prep_time:'时间介词：in / on / at',prep_place:'地点介词：in / on / at',pronoun_case:'代词：主格 / 宾格 / 所有格',demonstrative:'指示词：远近 + 单复数',modal_meaning:'情态动词：can / should / must',wh_choice:'疑问词：问什么信息',conjunction_logic:'连词：并列 / 转折 / 原因 / 条件'
};
S.dailyNewTarget=DAILY_TARGET;
S.dailyStats=S.dailyStats||{};
let corePlan=[];

function rawSave(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}
function activeDayKey(){return todayKey()}
function dayStats(key=activeDayKey()){
  S.dailyStats[key]=S.dailyStats[key]||{quizCorrect:0,quizTotal:0};
  return S.dailyStats[key]
}
function markActiveDay(){const d=activeDayKey();if(!S.days.includes(d))S.days.push(d)}
function meaningfulToday(){
  const t=startOfToday(),pd=S.planDone?.[typeof today==='function'?today():1]||{},ds=S.dailyStats?.[activeDayKey()]||{};
  if(Object.keys(pd).length||(ds.quizTotal||0)>0)return true;
  return Object.values(S.words||{}).some(r=>(r.lastSeen||0)>=t||(r.lastQuiz||0)>=t)
}
function cleanPhantomDay(){
  const d=activeDayKey();
  if(S.days.includes(d)&&!meaningfulToday()){
    S.days=S.days.filter(x=>x!==d);rawSave();try{stats()}catch(e){}
  }
}

cleanPhantomDay();
try{touch=function(){}}catch(e){}
try{
  const oldSubjective=subjective;
  subjective=function(w,g){markActiveDay();const r=oldSubjective(w,g);advanceCatchUp(w);return r}
}catch(e){}
try{
  const oldQuizResult=quizResult;
  quizResult=function(w,correct){
    markActiveDay();const ds=dayStats();ds.quizTotal=(ds.quizTotal||0)+1;if(correct)ds.quizCorrect=(ds.quizCorrect||0)+1;
    const rr=rec(w);rr.lastQuizCorrect=!!correct;
    return oldQuizResult(w,correct)
  }
}catch(e){}
try{
  const oldTogglePlanDone=togglePlanDone;
  togglePlanDone=function(day,w){markActiveDay();const r=oldTogglePlanDone(day,w);rawSave();renderLearningReport();return r}
}catch(e){}
try{
  const oldStudyRate=studyRate;
  studyRate=function(g){markActiveDay();const r=oldStudyRate(g);rawSave();renderLearningReport();return r}
}catch(e){}
try{
  const oldPlanInlineRate=planInlineRate;
  planInlineRate=function(w,g){markActiveDay();const r=oldPlanInlineRate(w,g);rawSave();renderLearningReport();return r}
}catch(e){}

function takeUnique(arr,n,used){const out=[];for(const x of arr||[]){if(out.length>=n)break;if(!x?.w||used.has(x.w))continue;used.add(x.w);out.push(x)}return out}
function rebuildCorePlan(){
  if(!L?.p?.length)return false;
  const used=new Set();
  const s1=takeUnique(L.p,600,used);if(s1.length<600)s1.push(...takeUnique(L.m,600-s1.length,used));
  const s2=takeUnique(L.m,1200,used);if(s2.length<1200)s2.push(...takeUnique(L.c,1200-s2.length,used));
  const s3=takeUnique(L.c,1800,used);if(s3.length<1800)s3.push(...takeUnique([...L.p,...L.m,...L.c],1800-s3.length,used));
  corePlan=[...s1,...s2,...s3].slice(0,3600);L.corePlan=corePlan;
  L.day={};for(let d=1;d<=180;d++)for(const x of plan(d))if(x?.w&&!L.day[x.w])L.day[x.w]=d;
  const doneWords=new Set();for(const obj of Object.values(S.planDone||{}))for(const w of Object.keys(obj||{}))doneWords.add(w);
  const normalized={};for(const w of doneWords){const d=L.day[w];if(d){normalized[d]=normalized[d]||{};normalized[d][w]=1}}S.planDone=normalized;
  rawSave();
  const pm=$('planMeta');if(pm)pm.textContent=`每天 ${DAILY_TARGET} 个新词 · 180 天主计划 ${corePlan.length} 词 · 漏学旧词每天最多补 ${CATCHUP_LIMIT} 个`;
  return true
}
const basePlan=typeof plan==='function'?plan:null;
plan=function(day){
  const d=Math.max(1,Math.min(180,Number(day)||1));
  if(corePlan.length)return corePlan.slice((d-1)*DAILY_TARGET,d*DAILY_TARGET);
  return basePlan?basePlan(d):[]
};

function weakTypes(){
  return Object.entries(S.errorTypes||{}).filter(([k,r])=>ERROR_LABELS[k]&&(r.wrong||0)>0&&((r.streak||0)<3||(r.attempts?Math.round((r.correct||0)/r.attempts*100):100)<80)).sort((a,b)=>{
    const ra=a[1],rb=b[1],sa=(ra.wrong||0)*2.5+(1-(ra.attempts?(ra.correct||0)/ra.attempts:1))*5-(ra.streak||0)*.6,sb=(rb.wrong||0)*2.5+(1-(rb.attempts?(rb.correct||0)/rb.attempts:1))*5-(rb.streak||0)*.6;
    return sb-sa
  })
}
function dueCount(){try{return dueWords().length}catch(e){return 0}}
function missedWords(limit=CATCHUP_LIMIT){
  if(!corePlan.length)return[];const t=today(),out=[];
  for(let d=1;d<t;d++){
    const done=S.planDone[d]||{};
    for(const x of plan(d)){
      if(!done[x.w]&&statusOf(x.w)!=='mastered')out.push({w:x.w,d});
      if(out.length>=limit)return out
    }
  }
  return out
}
window.startCatchUpBatch=function(){
  const list=missedWords(CATCHUP_LIMIT);
  if(!list.length)return toast('没有欠下的旧词，今天不用补课');
  S.catchUpActive={words:list.map(x=>x.w),days:list.map(x=>x.d),i:0,started:Date.now()};markActiveDay();rawSave();
  page('searchPage');openWord(list[0].w)
};
window.cancelCatchUp=function(){delete S.catchUpActive;rawSave();toast('已退出补课模式');renderLearningReport();renderAdaptiveDay()};
function advanceCatchUp(w){
  const c=S.catchUpActive;if(!c||!Array.isArray(c.words)||c.words[c.i]!==w)return;
  c.i++;
  if(c.i>=c.words.length){delete S.catchUpActive;rawSave();setTimeout(()=>{toast('今天的补课 5 词完成');page('planPage');setDay(today());renderAdaptiveDay();renderLearningReport()},180);return}
  rawSave();setTimeout(()=>openWord(c.words[c.i]),220)
}
function catchUpBanner(){
  const c=S.catchUpActive,card=document.querySelector('#result .card');if(!c||!card||!c.words?.length)return;
  let old=card.querySelector('.catchup-banner');if(old)old.remove();const box=document.createElement('div');box.className='catchup-banner';
  box.innerHTML=`<div><b>补课模式 ${Math.min(c.i+1,c.words.length)} / ${c.words.length}</b><span>给这个词选一次熟悉度后，自动进入下一个旧词。</span></div><button onclick="cancelCatchUp()">退出</button>`;
  const top=card.querySelector('.wordtop');top?.insertAdjacentElement('afterend',box)
}
try{const oldRenderWord=renderWord;renderWord=async function(...a){const r=await oldRenderWord(...a);catchUpBanner();return r}}catch(e){}

function renderAdaptiveDay(){
  const panel=$('planListPanel');if(!panel)return;let box=$('adaptiveDayCard');if(!box){box=document.createElement('div');box.id='adaptiveDayCard';box.className='card adaptive-day-card';panel.parentNode.insertBefore(box,panel)}
  const weak=weakTypes().slice(0,2),due=dueCount(),words=plan(curDay),done=S.planDone[curDay]||{},doneN=words.filter(x=>done[x.w]).length,isToday=curDay===today(),catchup=isToday?missedWords(CATCHUP_LIMIT):[];
  const extra=weak.length?weak.map(([k,r])=>{const acc=r.attempts?Math.round((r.correct||0)/r.attempts*100):0;return`<div class="adaptive-weak"><div><b>${esc(ERROR_LABELS[k])}</b><span>正确率 ${acc}% · 错 ${r.wrong||0} 次</span></div><button onclick="startErrorDrill('${k}')">专项 6 题</button></div>`}).join(''):`<div class="adaptive-ok">目前没有明显结构弱项。今天主要任务就是把新词真正留下来。</div>`;
  const catchHTML=isToday?(catchup.length?`<div class="catchup-box"><div><b>补课 ${catchup.length} 词</b><span>${catchup.map(x=>esc(x.w)).join(' · ')}</span><small>旧词每天最多补 ${CATCHUP_LIMIT} 个，不把昨天的债一股脑砸到今天。</small></div><button class="primary" onclick="startCatchUpBatch()">开始补课</button></div>`:`<div class="adaptive-ok">没有漏学旧词，今天不用补课。</div>`):'';
  box.innerHTML=`<div class="adaptive-head"><div><div class="section-head">今日学习路线</div><div class="small">正常计划 20 个新词；漏学时额外补最多 5 个旧词。</div></div><span class="badge">${doneN}/${words.length}</span></div><div class="adaptive-stats"><div><b>${words.length}</b><span>新词</span></div><div><b>${due}</b><span>到期复习</span></div><div><b>${isToday?catchup.length:0}</b><span>补课词</span></div><div><b>${weak.length}</b><span>结构弱项</span></div></div>${due>12?`<div class="adaptive-warn">今天有 ${due} 个到期词，先复习再学新词更划算。脑子不是无限缓存，虽然软件经常假装它是。</div>`:''}${catchHTML}${weak.length?`<div class="adaptive-title">额外加练约 5 分钟</div>`:''}${extra}`
}

function dayForDate(date){
  const a=new Date(S.start+'T00:00:00'),b=new Date(date+'T00:00:00');return Math.floor((b-a)/DAY)+1
}
function dateKeyOffset(offset){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+offset);return d.toLocaleDateString('en-CA')}
function weekSummary(){
  let handled=0,qc=0,qt=0,active=0;
  for(let i=-6;i<=0;i++){
    const key=dateKeyOffset(i),pd=dayForDate(key),ds=S.dailyStats[key]||{};
    if(pd>=1&&pd<=180){const words=plan(pd),done=S.planDone[pd]||{};handled+=words.filter(x=>done[x.w]).length}
    qc+=ds.quizCorrect||0;qt+=ds.quizTotal||0;if(S.days.includes(key))active++
  }
  return{handled,qc,qt,active}
}
function retentionSummary(){
  const verified=Object.entries(S.words||{}).filter(([,r])=>r.firstSeen&&typeof r.lastQuizCorrect==='boolean'&&(r.lastQuiz||0)-r.firstSeen>=6*DAY);
  const kept=verified.filter(([,r])=>r.lastQuizCorrect).length;
  return{verified:verified.length,kept,rate:verified.length?Math.round(kept/verified.length*100):null}
}
function todaySummary(){
  const d=today(),words=plan(d),done=S.planDone[d]||{},handled=words.filter(x=>done[x.w]).length,st=S.studyV3?.[d]||{},g1=st.groups?.[1]||{},g2=st.groups?.[2]||{},recovered=(g1.recovered||0)+(g2.recovered||0),remain=(g1.remain||0)+(g2.remain||0),ds=S.dailyStats[activeDayKey()]||{};
  return{handled,recovered,remain,qc:ds.quizCorrect||0,qt:ds.quizTotal||0,due:dueCount(),weak:weakTypes().slice(0,2)}
}
function ensureReportBox(){
  const pg=$('myPage');if(!pg)return null;let box=$('learningReportV32');if(box)return box;box=document.createElement('div');box.id='learningReportV32';box.className='card learning-report';const first=pg.querySelector('.card');if(first)first.insertAdjacentElement('afterend',box);else pg.appendChild(box);return box
}
function renderLearningReport(){
  const box=ensureReportBox();if(!box)return;const t=todaySummary(),w=weekSummary(),ret=retentionSummary(),acc=t.qt?Math.round(t.qc/t.qt*100):null,wacc=w.qt?Math.round(w.qc/w.qt*100):null;
  const weak=t.weak.length?t.weak.map(([k,r])=>`<span>${esc(ERROR_LABELS[k])} ${r.attempts?Math.round((r.correct||0)/r.attempts*100):0}%</span>`).join(''):'<span>暂时没有明显结构弱项</span>';
  box.innerHTML=`<div class="report-head"><div><div class="section-head">学习报告</div><div class="small">看“留下多少”，不只看“翻了多少”。</div></div><span class="badge">v3.2</span></div><div class="report-title">今天</div><div class="report-grid"><div><b>${t.handled}</b><span>20 个中新词已处理</span></div><div><b>${t.recovered}</b><span>当场拉回</span></div><div><b>${t.remain}</b><span>仍需复习</span></div><div><b>${acc===null?'—':acc+'%'}</b><span>今日测试正确率</span></div></div><div class="report-weak"><b>当前重点</b>${weak}</div><div class="report-title">近 7 天</div><div class="report-grid week"><div><b>${w.handled}</b><span>处理新词</span></div><div><b>${w.active}</b><span>实际学习天数</span></div><div><b>${wacc===null?'—':wacc+'%'}</b><span>测试正确率</span></div><div><b>${ret.rate===null?'积累中':ret.rate+'%'}</b><span>7 天复测保留率</span></div></div><div class="small report-note">7 天保留率只统计“首次学习至少 6 天后又被测试过”的词。没有足够数据时宁可显示积累中，也不拿漂亮数字哄人。</div>`
}

function injectStyle(){
  if($('learningV32Style'))return;const s=document.createElement('style');s.id='learningV32Style';s.textContent=`
  .adaptive-day-card{margin-top:14px}.adaptive-head,.report-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.adaptive-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.adaptive-stats>div,.report-grid>div{padding:10px;border-radius:13px;background:var(--soft);text-align:center}.adaptive-stats b,.report-grid b{display:block;font-size:19px}.adaptive-stats span,.report-grid span{display:block;font-size:10px;color:var(--muted);margin-top:2px}.adaptive-title,.report-title{font-size:12px;font-weight:900;margin-top:14px}.adaptive-weak{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;margin-top:8px;padding:10px 11px;border:1px solid var(--line);border-radius:13px}.adaptive-weak b{display:block;font-size:12px}.adaptive-weak span{display:block;font-size:10px;color:var(--muted);margin-top:3px}.adaptive-weak button{border:0;border-radius:9px;padding:8px 10px;background:var(--blue);color:#fff;font-weight:850}.adaptive-ok,.adaptive-warn{margin-top:10px;padding:10px 11px;border-radius:12px;background:var(--soft);font-size:11px;line-height:1.6}.adaptive-warn{background:#fff6e8}.catchup-box{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;margin-top:10px;padding:11px;border:1px solid var(--line);border-radius:14px}.catchup-box b,.catchup-box span,.catchup-box small{display:block}.catchup-box span{font-size:11px;margin-top:4px}.catchup-box small{font-size:10px;color:var(--muted);margin-top:4px}.catchup-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;padding:10px 11px;border-radius:12px;background:var(--soft)}.catchup-banner b,.catchup-banner span{display:block}.catchup-banner span{font-size:10px;color:var(--muted);margin-top:2px}.catchup-banner button{border:0;background:transparent;color:var(--blue);font-weight:850}.learning-report{margin-top:14px}.report-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px}.report-weak{margin-top:10px;padding:10px;border-radius:12px;background:var(--soft);font-size:11px}.report-weak b{display:block;margin-bottom:6px}.report-weak span{display:inline-block;margin:3px 5px 0 0;padding:5px 7px;border-radius:999px;background:var(--card)}.report-note{margin-top:10px;line-height:1.6}
  @media(max-width:620px){.adaptive-stats,.report-grid{grid-template-columns:repeat(2,1fr)}.adaptive-weak,.catchup-box{grid-template-columns:1fr}.adaptive-weak button,.catchup-box button{width:100%}}
  `;document.head.appendChild(s)
}

function dataHealthCheck(){
  if(L?.p?.length&&plan(today()).length)return;
  const wrap=$('homeStudyCardWrap');if(wrap)wrap.innerHTML=`<div class="study-loading"><b>词库仍未载入</b><span>现在使用的是站内本地词库。可以点下面按钮清掉旧词表缓存并重新加载。</span><button class="primary" style="margin-top:12px" onclick="retryWordDataV32()">重新载入词库</button></div>`;
  const pm=$('planMeta');if(pm)pm.textContent='词库没有完成载入，点击首页“重新载入词库”修复。'
}
window.retryWordDataV32=function(){try{['p','m','c','f'].forEach(k=>localStorage.removeItem('zbz:source:'+k))}catch(e){}location.replace(location.pathname+'?v=34&r='+Date.now())};

const prevRenderDay=typeof renderDay==='function'?renderDay:null;if(prevRenderDay){renderDay=function(...a){const r=prevRenderDay(...a);renderAdaptiveDay();return r}};
const prevPage=typeof page==='function'?page:null;if(prevPage){page=function(id,...rest){const r=prevPage(id,...rest);if(id==='planPage')renderAdaptiveDay();if(id==='myPage')renderLearningReport();return r}};
const prevStats=typeof stats==='function'?stats:null;if(prevStats){stats=function(...a){const r=prevStats(...a);renderLearningReport();return r}};

injectStyle();renderLearningReport();
const boot=setInterval(()=>{if(rebuildCorePlan()){clearInterval(boot);try{setDay(curDay)}catch(e){}try{setStudyDay(homeStudyDay,{resume:true})}catch(e){}renderAdaptiveDay();renderLearningReport()}},200);
setTimeout(()=>{clearInterval(boot);dataHealthCheck()},12000);
const tag=document.querySelector('.tag');if(tag)tag.textContent='v3.2';window.__ZBZ_READY__=true;
})();