(()=>{
S.dailyWordEvidence=S.dailyWordEvidence||{};
S.planWordEvidence=S.planWordEvidence||{};

const evidenceKey=()=>todayKey();
function dayBucket(key=evidenceKey()){return S.dailyWordEvidence[key]||(S.dailyWordEvidence[key]={})}
function planBucket(day){return S.planWordEvidence[day]||(S.planWordEvidence[day]={})}
function dailyEvidence(w,key=evidenceKey()){return S.dailyWordEvidence?.[key]?.[String(w||'').toLowerCase()]||null}
function planEvidence(day,w){return S.planWordEvidence?.[day]?.[String(w||'').toLowerCase()]||null}
function persistEvidence(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

function noteRating(w,g){
  w=String(w||'').toLowerCase();if(!w)return;
  const now=Date.now(),b=dayBucket(),r=b[w]||(b[w]={});
  r.ratedAt=now;r.grade=Number(g);r.lastAction='rating';
  const pd=L?.day?.[w];if(pd){const p=planBucket(pd),x=p[w]||(p[w]={});x.ratedAt=now;x.grade=Number(g);x.learnedOn=evidenceKey()}
  persistEvidence();
}
function noteQuiz(w,ok){
  w=String(w||'').toLowerCase();if(!w)return;
  const now=Date.now(),b=dayBucket(),r=b[w]||(b[w]={});
  r.quizTotal=(r.quizTotal||0)+1;if(ok)r.quizCorrect=(r.quizCorrect||0)+1;r.lastQuizAt=now;r.lastQuizCorrect=!!ok;r.lastAction='quiz';
  const pd=L?.day?.[w];if(pd){const p=planBucket(pd),x=p[w]||(p[w]={});x.quizTotal=(x.quizTotal||0)+1;if(ok)x.quizCorrect=(x.quizCorrect||0)+1;x.lastQuizAt=now;x.lastQuizCorrect=!!ok}
  persistEvidence();
}
function learnedToday(w){return !!dailyEvidence(w)?.ratedAt}
function verifiedToday(w){const r=dailyEvidence(w);return !!(r?.ratedAt&&r.lastQuizAt&&r.lastQuizCorrect===true)}
function dailyState(w){
  const r=dailyEvidence(w);if(!r)return{key:'none',label:'今日未学',detail:'还没有做熟悉度判断'};
  if(!r.ratedAt&&r.quizTotal)return{key:'quizonly',label:'已测试·未计学习',detail:'小测是验证，不代替今天学习'};
  if(!r.ratedAt)return{key:'none',label:'今日未学',detail:'还没有做熟悉度判断'};
  if(r.lastQuizAt&&r.lastQuizCorrect===true)return{key:'verified',label:'今日已验证',detail:'今天已学习，并且最近一次测试答对'};
  if(r.lastQuizAt&&r.lastQuizCorrect===false)return{key:'wrong',label:'今日已学·测试有错',detail:'今天已学习，但测试暴露了问题'};
  if(Number(r.grade)<=1)return{key:'weak',label:'今日已学·待巩固',detail:'不会/模糊也算学过，只是会更快回来'};
  return{key:'learned',label:'今日已学',detail:'今天已经做过一次明确熟悉度判断'};
}
function stateChip(w){const s=dailyState(w);return `<span class="today-state ${s.key}" title="${esc(s.detail)}">${esc(s.label)}</span>`}

// 只有一次明确熟悉度判断才计为“今天已学”。打开、朗读、收藏、单独做题都不冒充学习完成。
try{const f=subjective;subjective=function(w,g){noteRating(w,g);const r=f(w,g);refreshEvidenceUI();return r}}catch(e){}
try{const f=quizResult;quizResult=function(w,ok){noteQuiz(w,ok);const r=f(w,ok);refreshEvidenceUI();return r}}catch(e){}
try{const f=studyRate;studyRate=function(g){const x=typeof studyCurrent==='function'?studyCurrent():null;if(x?.w)noteRating(x.w,g);const r=f(g);setTimeout(refreshEvidenceUI,150);return r}}catch(e){}
try{const f=planInlineRate;planInlineRate=function(w,g){noteRating(w,g);const r=f(w,g);refreshEvidenceUI();return r}}catch(e){}
if(typeof window.categoryRate==='function'){const f=window.categoryRate;window.categoryRate=function(w,g){noteRating(w,g);const r=f(w,g);refreshEvidenceUI();return r}}

function currentDayLearnedCount(day=curDay){
  const words=plan(day)||[];
  if(day===today())return words.filter(x=>learnedToday(x.w)).length;
  return words.filter(x=>!!planEvidence(day,x.w)?.ratedAt).length;
}
function planStateFor(day,w){
  if(day===today())return dailyState(w);
  const r=planEvidence(day,w);if(!r?.ratedAt)return{key:'none',label:'未学',detail:'还没有完成熟悉度判断'};
  if(r.lastQuizCorrect===true)return{key:'verified',label:'已验证',detail:'学过并有正确测试记录'};
  if(r.lastQuizCorrect===false)return{key:'wrong',label:'已学·有错题',detail:'学过，但测试仍有错误'};
  if(Number(r.grade)<=1)return{key:'weak',label:'已学·待巩固',detail:'已经学过，但主观仍不稳'};
  return{key:'learned',label:'已学',detail:'已经完成至少一次熟悉度判断'};
}

function mountDefinition(){
  const pg=$('planPage');if(!pg||$('learnDefinitionV35'))return;
  const first=pg.querySelector(':scope > .card');if(!first)return;
  const box=document.createElement('div');box.id='learnDefinitionV35';box.className='card learn-definition';
  box.innerHTML=`<div class="learn-def-head"><div><div class="section-head">什么才算“今天学了这个词”？</div><div class="small">现在规则只有一条，不再靠模糊的“已处理”。</div></div><span class="badge">明确判定</span></div><div class="learn-def-rule"><b>点击一次「不会 / 模糊 / 认识 / 很熟」中的任意一个，才计为今天已学。</b><span>打开单词、朗读、收藏、只做小测都不算。选“不会”也算学过，但会标成待巩固并更快回炉。</span></div><div class="learn-def-states"><span class="today-state none">今日未学</span><span class="today-state learned">今日已学</span><span class="today-state weak">已学·待巩固</span><span class="today-state verified">今日已验证</span></div>`;
  first.insertAdjacentElement('afterend',box)
}

function annotatePlanEvidence(){
  const words=plan(curDay)||[],rows=[...document.querySelectorAll('#dayWords .plan-word-card')];
  rows.forEach((row,i)=>{
    const w=words[i]?.w;if(!w)return;const s=planStateFor(curDay,w),title=row.querySelector('.rowword');
    title?.querySelector('.today-state')?.remove();if(title)title.insertAdjacentHTML('beforeend',` <span class="today-state ${s.key}" title="${esc(s.detail)}">${esc(s.label)}</span>`);
    row.classList.toggle('today-learned',s.key!=='none'&&s.key!=='quizonly');
    row.querySelectorAll('.row-actions button').forEach(b=>{if(/今日已学|撤销今日/.test(b.textContent||''))b.style.display='none'})
  });
  const n=currentDayLearnedCount(curDay),total=words.length;
  if($('bar'))$('bar').style.width=(total?n/total*100:0)+'%';
  if($('progressText'))$('progressText').textContent=curDay===today()?`今天明确学过 ${n} / ${total} · 只有点过熟悉度才计数`:`该日明确学过 ${n} / ${total}`;
  if($('daySummary'))$('daySummary').textContent=`第 ${curDay} 天 · ${total} 个新词 · ${curDay===today()?'按“熟悉度判断”统计今日学习':'按明确学习证据统计完成度'}`;
}
function annotateCurrentCard(){
  const x=typeof studyCurrent==='function'?studyCurrent():null;if(x?.w){const zone=document.querySelector('#homeStudyCardWrap .study-word-zone');if(zone){zone.querySelector('.today-state')?.remove();zone.insertAdjacentHTML('beforeend',stateChip(x.w))}}
  const w=String(currentWord||$('q')?.value||'').toLowerCase(),top=document.querySelector('#result .wordtop');if(w&&top){top.parentElement?.querySelector(':scope > .today-state.search-state')?.remove();const s=dailyState(w);top.insertAdjacentHTML('afterend',`<span class="today-state search-state ${s.key}" title="${esc(s.detail)}">${esc(s.label)}</span>`)}
}
function updateStudyMetaEvidence(){
  if(!$('homeStudyMeta')||!L?.p?.length)return;const a=plan(homeStudyDay)||[],learned=homeStudyDay===today()?a.filter(x=>learnedToday(x.w)).length:a.filter(x=>!!planEvidence(homeStudyDay,x.w)?.ratedAt).length,verified=homeStudyDay===today()?a.filter(x=>verifiedToday(x.w)).length:0;
  $('homeStudyMeta').textContent=`第 ${homeStudyDay} 天 · 20 词分两组 · 明确已学 ${learned}/${a.length}${homeStudyDay===today()?` · 今日已验证 ${verified}`:''}`
}
function patchLearningReport(){
  const box=$('learningReportV32');if(!box)return;const first=box.querySelector('.report-grid > div:first-child b'),label=box.querySelector('.report-grid > div:first-child span'),badge=box.querySelector('.report-head .badge');if(first)first.textContent=currentDayLearnedCount(today());if(label)label.textContent='20 个中今日明确已学';if(badge)badge.textContent='v3.3'
}
function refreshEvidenceUI(){mountDefinition();annotatePlanEvidence();annotateCurrentCard();updateStudyMetaEvidence();patchLearningReport()}

try{const f=renderDay;renderDay=function(...a){const r=f(...a);mountDefinition();annotatePlanEvidence();return r}}catch(e){}
try{const f=studyRender;studyRender=function(...a){const r=f(...a);annotateCurrentCard();updateStudyMetaEvidence();return r}}catch(e){}
try{const f=renderWord;renderWord=async function(...a){const r=await f(...a);annotateCurrentCard();return r}}catch(e){}
try{const f=renderLearningReport;renderLearningReport=function(...a){const r=f(...a);patchLearningReport();return r}}catch(e){}
try{const f=page;page=function(id,...rest){const r=f(id,...rest);if(id==='planPage'){mountDefinition();annotatePlanEvidence()}if(id==='myPage')patchLearningReport();return r}}catch(e){}

function injectStyle(){if($('activityV35Style'))return;const s=document.createElement('style');s.id='activityV35Style';s.textContent=`
.today-state{display:inline-flex;align-items:center;white-space:nowrap;padding:4px 7px;border-radius:999px;font-size:9px;font-weight:900;vertical-align:middle;background:#eef1f5;color:#667085}.today-state.learned{background:#eaf7ef;color:#257448}.today-state.verified{background:#e7f0ff;color:#1d5fbf}.today-state.weak{background:#fff4dc;color:#9a6500}.today-state.wrong{background:#fff0f0;color:#b13d3d}.today-state.quizonly{background:#f2edff;color:#6b4db5}.today-state.search-state{margin:0 0 10px 0}.learn-definition{margin-top:14px}.learn-def-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.learn-def-rule{margin-top:12px;padding:12px;border-radius:14px;background:var(--soft);line-height:1.65}.learn-def-rule b,.learn-def-rule span{display:block}.learn-def-rule b{font-size:12px}.learn-def-rule span{font-size:10px;color:var(--muted);margin-top:5px}.learn-def-states{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.plan-word-card.today-learned{box-shadow:inset 3px 0 0 #7abf92}.study-word-zone>.today-state{margin-top:8px}
`;document.head.appendChild(s)}

injectStyle();mountDefinition();setTimeout(refreshEvidenceUI,300);const evBoot=setInterval(()=>{if(L?.p?.length){clearInterval(evBoot);refreshEvidenceUI()}},200);setTimeout(()=>clearInterval(evBoot),15000);
const tag=document.querySelector('.tag');if(tag)tag.textContent='v3.3';window.__ZBZ_READY__=true;
})();