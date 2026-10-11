(()=>{
S.wordEvents=S.wordEvents||{};
S.masteredOn=S.masteredOn||{};
const M_DAY=86400000;

function persistMastery(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function mWord(w){return String(w||'').trim().toLowerCase()}
function mDates(r){try{return uniqueDays(r?.correctDays||[])}catch(e){return[...new Set(r?.correctDays||[])].sort()}}
function mMetrics(w){
  w=mWord(w);const r=S.words?.[w]||{},days=mDates(r),correct=r.correct||0,wrong=r.wrong||0,total=correct+wrong,acc=total?Math.round(correct/total*100):0,span=days.length>1?dateDiffDays(days[0],days[days.length-1]):0;
  const criteria=[
    {key:'correct',label:'测试答对 ≥ 4 次',value:`${correct} / 4`,pass:correct>=4},
    {key:'streak',label:'连续答对 ≥ 3 次',value:`${r.streak||0} / 3`,pass:(r.streak||0)>=3},
    {key:'days',label:'至少 3 个不同日期答对',value:`${days.length} / 3 天`,pass:days.length>=3},
    {key:'span',label:'首次到最近正确跨度 ≥ 6 天',value:`${span} / 6 天`,pass:span>=6},
    {key:'accuracy',label:'总测试正确率 ≥ 80%',value:total?`${acc}%`:'暂无测试',pass:total>0&&acc>=80}
  ];
  return{w,r,days,correct,wrong,total,acc,span,criteria,passed:criteria.filter(x=>x.pass).length,status:statusOf(w)}
}
function nextReviewText(w){
  const r=S.words?.[mWord(w)];if(!r?.seen)return'先完成一次学习判断';const due=Number(r.due||0),now=Date.now();if(!due)return'完成测试后自动安排';if(due<=now)return'现在已到期';
  const d=new Date(due),n=new Date();if(d.toDateString()===n.toDateString())return`今天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const tom=new Date();tom.setDate(tom.getDate()+1);if(d.toDateString()===tom.toDateString())return`明天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return`${d.getMonth()+1}月${d.getDate()}日`;
}
function nextAction(w){
  const m=mMetrics(w),r=m.r;if(!r.seen)return'先看核心义并选择一次“不会 / 模糊 / 认识 / 很熟”。';
  if(r.lastQuizCorrect===false)return'最近一次测试答错。先等到复习时间，再重新测试，不要靠连续狂刷把答案背成肌肉记忆。';
  if(m.correct<4)return`还差 ${4-m.correct} 次正确测试。`;
  if((r.streak||0)<3)return`还差 ${3-(r.streak||0)} 次连续答对。`;
  if(m.days.length<3)return`还差 ${3-m.days.length} 个不同日期的正确验证。`;
  if(m.span<6)return`时间跨度还差 ${6-m.span} 天。现在重复刷题不会提前获得“已掌握”。`;
  if(m.total&&m.acc<80)return`当前总正确率 ${m.acc}%，需要回到至少 80%。`;
  return m.status==='mastered'?'长期掌握条件已经满足，后面按间隔复测维持即可。':'继续按系统安排验证。'
}
function todayLearningState(w){
  const e=S.dailyWordEvidence?.[todayKey()]?.[mWord(w)];
  if(!e)return{key:'none',label:'今日未学'};
  if(!e.ratedAt&&e.quizTotal)return{key:'quizonly',label:'只测试·未计学习'};
  if(!e.ratedAt)return{key:'none',label:'今日未学'};
  if(e.lastQuizAt&&e.lastQuizCorrect===true)return{key:'verified',label:'今日已验证'};
  if(e.lastQuizAt&&e.lastQuizCorrect===false)return{key:'wrong',label:'今日已学·测试有错'};
  if(Number(e.grade)<=1)return{key:'weak',label:'今日已学·待巩固'};
  return{key:'learned',label:'今日已学'}
}
function addEvent(w,type,label,meta=''){
  w=mWord(w);if(!w)return;const now=Date.now(),arr=S.wordEvents[w]||(S.wordEvents[w]=[]),last=arr[arr.length-1];
  if(last&&last.type===type&&last.label===label&&now-last.ts<800)return;
  arr.push({ts:now,type,label,meta});if(arr.length>40)arr.splice(0,arr.length-40);persistMastery()
}
function eventHistoryHTML(w){
  const a=(S.wordEvents?.[mWord(w)]||[]).slice(-6).reverse();if(!a.length)return`<div class="mastery-history-empty">详细学习轨迹从 v3.4 开始记录。旧的正确次数、答对日期和掌握状态仍然保留。</div>`;
  return`<div class="mastery-history">${a.map(e=>{const d=new Date(e.ts);return`<div><span>${d.getMonth()+1}月${d.getDate()}日</span><b>${esc(e.label)}</b>${e.meta?`<small>${esc(e.meta)}</small>`:''}</div>`}).join('')}</div>`
}
function masteryCardHTML(w,compact=false){
  const m=mMetrics(w),today=todayLearningState(w),pct=Math.round(m.passed/5*100);
  if(compact)return`<div class="mastery-mini"><div><b>长期：${esc(statusLabel(m.status))}</b><span>掌握条件 ${m.passed}/5 · 下次 ${esc(nextReviewText(w))}</span></div><span class="today-state ${today.key}">${esc(today.label)}</span></div>`;
  return`<div class="mastery-evidence"><div class="mastery-head"><div><div class="title">长期掌握证据</div><div class="small">今日状态和长期掌握分开算。今天学过，不等于已经掌握。</div></div>${statusPill(w)}</div><div class="mastery-progress"><span style="width:${pct}%"></span></div><div class="mastery-meta"><span class="today-state ${today.key}">${esc(today.label)}</span><b>掌握条件 ${m.passed} / 5</b><span>下次复习：${esc(nextReviewText(w))}</span></div><div class="mastery-checks">${m.criteria.map(c=>`<div class="${c.pass?'pass':'wait'}"><i>${c.pass?'✓':'○'}</i><span>${esc(c.label)}</span><b>${esc(c.value)}</b></div>`).join('')}</div><div class="mastery-next"><b>下一步</b><span>${esc(nextAction(w))}</span></div><details class="mastery-details"><summary>查看最近学习轨迹</summary>${eventHistoryHTML(w)}</details></div>`
}

function mountSearchMastery(){
  const w=mWord(currentWord||$('q')?.value),card=document.querySelector('#result .card');if(!w||!card)return;card.querySelector('.mastery-evidence')?.remove();
  const actions=[...card.querySelectorAll('.title')].find(x=>(x.textContent||'').includes('你的感觉'));
  if(actions)actions.insertAdjacentHTML('beforebegin',masteryCardHTML(w));else card.insertAdjacentHTML('beforeend',masteryCardHTML(w))
}
function mountStudyMastery(){
  const x=typeof studyCurrent==='function'?studyCurrent():null;if(!x?.w)return;const card=document.querySelector('#homeStudyCardWrap .study-flashcard');if(!card)return;card.querySelector('.mastery-mini')?.remove();const rate=card.querySelector('.study-rate-block');if(rate)rate.insertAdjacentHTML('beforebegin',masteryCardHTML(x.w,true))
}
function mountPlanMastery(){
  let words=[];try{words=plan(curDay)||[]}catch(e){};[...document.querySelectorAll('#dayWords .plan-word-card')].forEach((row,i)=>{const w=words[i]?.w,detail=row.querySelector('.plan-inline-detail');if(!w||!detail)return;detail.querySelector('.mastery-mini')?.remove();detail.insertAdjacentHTML('afterbegin',masteryCardHTML(w,true))})
}

function verificationQueue(){
  const now=Date.now(),a=[];for(const [w,r] of Object.entries(S.words||{})){
    if(!r?.seen||statusOf(w)==='mastered'||!mainMeaning(w))continue;if((r.due||0)>now)continue;
    const m=mMetrics(w),recentWrong=r.lastQuizCorrect===false||((r.wrong||0)>0&&(r.streak||0)===0),score=(recentWrong?100:0)+(statusOf(w)==='familiar'?45:0)+m.passed*8+Math.min(20,Math.max(0,(now-(r.due||now))/3600000));a.push({w,m,score,recentWrong})
  }
  return a.sort((a,b)=>b.score-a.score).slice(0,6)
}
function mountVerificationQueue(){
  const pg=$('reviewPage'),list=$('reviewList');if(!pg||!list)return;let box=$('masteryVerifyV36');if(!box){box=document.createElement('div');box.id='masteryVerifyV36';box.className='mastery-verify';list.parentNode.insertBefore(box,list)}
  const a=verificationQueue();box.innerHTML=`<div class="mastery-verify-head"><div><b>掌握验证队列</b><span>按“刚答错 → 已到期 → 接近掌握”排序。没到时间的词不会提前硬刷。</span></div><span>${a.length?a.length+' 个现在可验证':'暂无到期'}</span></div>${a.length?`<div class="mastery-verify-list">${a.map(x=>`<div><section><strong>${esc(x.w)} ${statusPill(x.w)}</strong><small>${esc(nextAction(x.w))}</small><small>掌握条件 ${x.m.passed}/5 · 正确率 ${x.m.total?x.m.acc+'%':'暂无'}</small></section><button onclick="startMasteryVerification('${esc(x.w)}')">现在验证</button></div>`).join('')}</div>`:`<div class="mastery-verify-empty">当前没有需要立即验证的单词。间隔还没到就先别狂刷，记忆不是靠把同一张卡摩擦到发热。</div>`}
}
window.startMasteryVerification=function(w){startSingleTest(w)};

function tomorrowDueCount(){
  const t=new Date();t.setDate(t.getDate()+1);t.setHours(0,0,0,0);const a=t.getTime(),b=a+M_DAY;return Object.entries(S.words||{}).filter(([w,r])=>r?.seen&&statusOf(w)!=='mastered'&&(r.due||0)>=a&&(r.due||0)<b).length
}
function masteryOverview(){
  const pg=$('myPage');if(!pg)return;let box=$('masteryOverviewV36');if(!box){box=document.createElement('div');box.id='masteryOverviewV36';box.className='card mastery-overview';const report=$('learningReportV32');if(report)report.insertAdjacentElement('afterend',box);else pg.appendChild(box)}
  const today=S.dailyWordEvidence?.[todayKey()]||{},learned=Object.values(today).filter(x=>x?.ratedAt).length,verified=Object.values(today).filter(x=>x?.ratedAt&&x.lastQuizCorrect===true).length,familiar=Object.keys(S.words||{}).filter(w=>statusOf(w)==='familiar').length,newMastered=Object.entries(S.masteredOn||{}).filter(([,d])=>d===todayKey()).length,tomorrow=tomorrowDueCount();
  const near=Object.keys(S.words||{}).filter(w=>S.words[w]?.seen&&statusOf(w)!=='mastered').map(w=>({w,m:mMetrics(w)})).sort((a,b)=>b.m.passed-a.m.passed||b.m.correct-a.m.correct).slice(0,3);
  box.innerHTML=`<div class="mastery-head"><div><div class="section-head">掌握进度</div><div class="small">系统现在会告诉你“为什么还没掌握”，而不是只扔给你一个状态标签。</div></div><span class="badge">v3.4</span></div><div class="mastery-overview-grid"><div><b>${learned}</b><span>今日明确学习</span></div><div><b>${verified}</b><span>今日验证通过</span></div><div><b>${familiar}</b><span>基本认识</span></div><div><b>${newMastered}</b><span>今日新增掌握</span></div><div><b>${tomorrow}</b><span>明天计划验证</span></div></div>${near.length?`<div class="mastery-near"><b>离“已掌握”最近</b>${near.map(x=>`<div><strong>${esc(x.w)}</strong><span>${x.m.passed}/5 · ${esc(nextAction(x.w))}</span></div>`).join('')}</div>`:''}`
}

function refreshMasteryUI(){try{mountSearchMastery()}catch(e){}try{mountStudyMastery()}catch(e){}try{mountPlanMastery()}catch(e){}try{mountVerificationQueue()}catch(e){}try{masteryOverview()}catch(e){}}

// 从 v3.4 开始记录关键轨迹。多入口可能触发同一动作，addEvent 会在短时间内自动去重。
try{const f=subjective;subjective=function(w,g){const before=statusOf(w),r=f(w,g);addEvent(w,'rating',['不会','模糊','认识','很熟'][Number(g)]||'熟悉度判断');const after=statusOf(w);if(before!==after)addEvent(w,'status',`长期状态变为：${statusLabel(after)}`);refreshMasteryUI();return r}}catch(e){}
try{const f=studyRate;studyRate=function(g){const x=typeof studyCurrent==='function'?studyCurrent():null,w=x?.w||'';const before=w?statusOf(w):'';const r=f(g);if(w){addEvent(w,'rating',['不会','模糊','认识','很熟'][Number(g)]||'熟悉度判断');const after=statusOf(w);if(before!==after)addEvent(w,'status',`长期状态变为：${statusLabel(after)}`)}setTimeout(refreshMasteryUI,160);return r}}catch(e){}
try{const f=planInlineRate;planInlineRate=function(w,g){const before=statusOf(w),r=f(w,g);addEvent(w,'rating',['不会','模糊','认识','很熟'][Number(g)]||'熟悉度判断');const after=statusOf(w);if(before!==after)addEvent(w,'status',`长期状态变为：${statusLabel(after)}`);refreshMasteryUI();return r}}catch(e){}
if(typeof window.categoryRate==='function'){const f=window.categoryRate;window.categoryRate=function(w,g){const before=statusOf(w),r=f(w,g);addEvent(w,'rating',['不会','模糊','认识','很熟'][Number(g)]||'熟悉度判断');const after=statusOf(w);if(before!==after)addEvent(w,'status',`长期状态变为：${statusLabel(after)}`);refreshMasteryUI();return r}}
try{const f=quizResult;quizResult=function(w,ok){const before=statusOf(w),r=f(w,ok),after=statusOf(w);addEvent(w,'quiz',ok?'测试答对':'测试答错',ok?'增加掌握证据':'已重新安排优先复习');if(before!==after)addEvent(w,'status',`长期状态变为：${statusLabel(after)}`);if(before!=='mastered'&&after==='mastered'){S.masteredOn[mWord(w)]=todayKey();addEvent(w,'mastered','达到长期掌握','已满足全部掌握条件');persistMastery()}refreshMasteryUI();return r}}catch(e){}

try{const f=renderWord;renderWord=async function(...a){const r=await f(...a);mountSearchMastery();return r}}catch(e){}
try{const f=studyRender;studyRender=function(...a){const r=f(...a);mountStudyMastery();return r}}catch(e){}
try{const f=renderDay;renderDay=function(...a){const r=f(...a);mountPlanMastery();return r}}catch(e){}
try{const f=renderReview;renderReview=function(...a){const r=f(...a);mountVerificationQueue();return r}}catch(e){}
try{const f=renderLearningReport;renderLearningReport=function(...a){const r=f(...a);masteryOverview();return r}}catch(e){}
try{const f=page;page=function(id,...rest){const r=f(id,...rest);if(id==='reviewPage')mountVerificationQueue();if(id==='myPage')masteryOverview();return r}}catch(e){}
try{const f=stats;stats=function(...a){const r=f(...a);masteryOverview();return r}}catch(e){}

function injectMasteryStyle(){if($('masteryV36Style'))return;const s=document.createElement('style');s.id='masteryV36Style';s.textContent=`
.mastery-evidence{margin:14px 0;padding:13px;border:1px solid var(--line);border-radius:16px;background:var(--card)}.mastery-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.mastery-progress{height:7px;background:var(--bg);border-radius:999px;overflow:hidden;margin:11px 0}.mastery-progress span{display:block;height:100%;background:var(--blue);border-radius:999px}.mastery-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:10px;color:var(--muted)}.mastery-meta b{color:var(--text)}.mastery-checks{display:grid;gap:6px;margin-top:11px}.mastery-checks>div{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:8px 9px;border-radius:11px;background:var(--soft);font-size:10px}.mastery-checks i{font-style:normal;font-weight:900}.mastery-checks .pass i{color:#2d8a55}.mastery-checks .wait i{color:#9aa2b1}.mastery-checks b{font-size:10px}.mastery-next{margin-top:10px;padding:10px;border-radius:12px;background:var(--soft);font-size:10px;line-height:1.6}.mastery-next b,.mastery-next span{display:block}.mastery-details{margin-top:9px}.mastery-details summary{cursor:pointer;font-size:10px;font-weight:850;color:var(--blue)}.mastery-history{display:grid;gap:6px;margin-top:8px}.mastery-history>div{display:grid;grid-template-columns:54px 1fr;gap:5px 8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:10px}.mastery-history span{color:var(--muted)}.mastery-history small{grid-column:2;color:var(--muted)}.mastery-history-empty{margin-top:8px;font-size:10px;color:var(--muted);line-height:1.6}.mastery-mini{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:10px 0;padding:9px 10px;border-radius:12px;background:var(--soft)}.mastery-mini b,.mastery-mini span{display:block}.mastery-mini>div>span{font-size:9px;color:var(--muted);margin-top:2px}.mastery-mini>div>b{font-size:10px}.mastery-verify{margin:12px 0 16px;padding:13px;border:1px solid var(--line);border-radius:16px;background:var(--soft)}.mastery-verify-head{display:flex;justify-content:space-between;gap:10px}.mastery-verify-head b,.mastery-verify-head span{display:block}.mastery-verify-head>div>span,.mastery-verify-head>span{font-size:10px;color:var(--muted);margin-top:3px}.mastery-verify-list{display:grid;gap:8px;margin-top:10px}.mastery-verify-list>div{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px;background:var(--card);border-radius:13px;border:1px solid var(--line)}.mastery-verify-list strong,.mastery-verify-list small{display:block}.mastery-verify-list small{font-size:9px;color:var(--muted);line-height:1.5;margin-top:3px}.mastery-verify-list button{border:0;border-radius:9px;background:var(--blue);color:#fff;padding:8px 10px;font-weight:850}.mastery-verify-empty{font-size:10px;color:var(--muted);line-height:1.6;margin-top:9px}.mastery-overview{margin-top:14px}.mastery-overview-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:12px}.mastery-overview-grid>div{padding:10px 7px;border-radius:12px;background:var(--soft);text-align:center}.mastery-overview-grid b{display:block;font-size:18px}.mastery-overview-grid span{display:block;font-size:9px;color:var(--muted);margin-top:3px}.mastery-near{margin-top:12px;padding:10px;border-radius:12px;background:var(--soft)}.mastery-near>b{font-size:11px}.mastery-near>div{display:grid;grid-template-columns:70px 1fr;gap:8px;margin-top:7px;font-size:10px}.mastery-near span{color:var(--muted);line-height:1.5}@media(max-width:620px){.mastery-overview-grid{grid-template-columns:repeat(2,1fr)}.mastery-verify-list>div{grid-template-columns:1fr}.mastery-verify-list button{width:100%}.mastery-mini{align-items:flex-start}.mastery-checks>div{grid-template-columns:18px 1fr}.mastery-checks b{grid-column:2}.mastery-near>div{grid-template-columns:62px 1fr}}
`;document.head.appendChild(s)}

injectMasteryStyle();setTimeout(refreshMasteryUI,350);const masteryBoot=setInterval(()=>{if(L?.p?.length){clearInterval(masteryBoot);refreshMasteryUI()}},200);setTimeout(()=>clearInterval(masteryBoot),15000);const tag=document.querySelector('.tag');if(tag)tag.textContent='v3.4';window.__ZBZ_READY__=true;
})();