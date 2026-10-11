let homeStudyDay=1,homeStudyIndex=0,homeStudyTouch={x:0,y:0,swiped:0},homeStudyExpanded=false,homeStudyFinished=false;
S.studyPos=S.studyPos||{};
S.studySettings=S.studySettings||{mode:'direct',autoSpeak:false,skipMastered:false};
if(!['direct','recall'].includes(S.studySettings.mode))S.studySettings.mode='direct';
let planExpandedWord='';

function studyWords(){try{return plan(homeStudyDay)||[]}catch(e){return[]}}
function studyCurrent(){const a=studyWords();return a[Math.max(0,Math.min(a.length-1,homeStudyIndex))]||null}
function studyMeta(){
  const a=studyWords(),done=S.planDone[homeStudyDay]||{},n=a.filter(x=>done[x.w]).length,mastered=a.filter(x=>statusOf(x.w)==='mastered').length;
  $('homeStudyMeta').textContent=L.p.length?`第 ${homeStudyDay} 天 · ${stage(homeStudyDay)} · 已处理 ${n}/${a.length} · 已掌握 ${mastered}`:'正在载入今天的单词…';
  $('homeStudyToday').classList.toggle('hidden',homeStudyDay===today());
}
function firstStudyIndex(a){
  const done=S.planDone[homeStudyDay]||{};
  let idx=a.findIndex(x=>!done[x.w]&&(!S.studySettings.skipMastered||statusOf(x.w)!=='mastered'));
  if(idx<0)idx=a.findIndex(x=>!S.studySettings.skipMastered||statusOf(x.w)!=='mastered');
  return idx<0?0:idx;
}
function setStudyDay(day,{resume=true}={}){
  homeStudyDay=Math.max(1,Math.min(180,Number(day)||today()));
  const a=studyWords();
  homeStudyFinished=false;homeStudyExpanded=false;
  if(!a.length){homeStudyIndex=0;studyRender();return}
  let idx=resume?Number(S.studyPos[homeStudyDay]??-1):-1;
  if(!(idx>=0&&idx<a.length)||S.studySettings.skipMastered&&statusOf(a[idx]?.w)==='mastered')idx=firstStudyIndex(a);
  homeStudyIndex=Math.max(0,Math.min(a.length-1,idx));
  S.studyPos[homeStudyDay]=homeStudyIndex;
  save();studyRender();
  if(S.studySettings.autoSpeak)studySpeakCurrent();
}
function studySpeakCurrent(){const x=studyCurrent();if(x)speak(x.w,'en-US')}
function studyToggleMode(){S.studySettings.mode=S.studySettings.mode==='direct'?'recall':'direct';homeStudyExpanded=false;save();studyRender()}
function studyToggleAuto(){S.studySettings.autoSpeak=!S.studySettings.autoSpeak;save();studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}
function studyToggleSkipMastered(){S.studySettings.skipMastered=!S.studySettings.skipMastered;save();setStudyDay(homeStudyDay,{resume:true})}
function studyCoreHTML(w){
  const c=CURATED[w];
  if(c?.must?.length){const m=c.must[0];return `<div class="study-core-block"><div class="study-core-meaning">${esc(m[0])}</div>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}${m[2]?`<div class="study-core-example">${esc(m[2])}</div><div class="study-core-translation">${esc(m[3]||'')}</div>`:''}</div>`}
  const z=mainMeaning(w);return `<div class="study-core-block"><div class="study-core-meaning">${esc(z||'暂无中文释义')}</div></div>`;
}
function studyMoreHTML(w){
  const c=CURATED[w],it=L.map[w]||{};
  if(c){
    const must=c.must.map((m,i)=>`<div class="study-more-item"><span class="study-more-tag must">${i===0?'核心':'常用'}</span><b>${esc(m[0])}</b>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}${m[2]?`<div class="study-core-example">${esc(m[2])}</div><div class="study-core-translation">${esc(m[3]||'')}</div>`:''}</div>`).join('');
    const rec=(c.rec||[]).map(m=>`<div class="study-more-item"><span class="study-more-tag rec">认识即可</span><b>${esc(m[0])}</b>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}</div>`).join('');
    const skip=(c.skip||[]).length?`<div class="study-skip"><b>暂时不用背</b><div>${c.skip.map(x=>'• '+esc(x)).join('<br>')}</div></div>`:'';
    const tip=c.tip?`<div class="tip">💡 ${esc(c.tip)}</div>`:'';
    return `${must}${rec}${skip}${tip}`;
  }
  const full=cleanMeaning(it.z||'');
  return `<div class="study-more-item"><span class="study-more-tag must">词表释义</span><div>${esc(full||mainMeaning(w)||'暂无更多中文义项')}</div></div><div class="small study-inline-note">这个区域直接在卡片里展开，不再跳去查词页。</div>`;
}
function studyRender(anim=''){
  const a=studyWords(),wrap=$('homeStudyCardWrap');studyMeta();
  if(!a.length){wrap.innerHTML='<div class="study-loading"><b>正在准备今天的单词</b><span>词表加载完成后会自动出现。</span></div>';$('homeStudyCounter').textContent='0 / 0';$('homeStudyHint').textContent='';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;return}
  if(homeStudyFinished){
    const mastered=a.filter(x=>statusOf(x.w)==='mastered').length,done=a.filter(x=>(S.planDone[homeStudyDay]||{})[x.w]).length;
    wrap.innerHTML=`<div class="study-finish"><div class="study-finish-icon">✓</div><div class="study-finish-title">第 ${homeStudyDay} 天翻完了</div><div class="study-finish-sub">已处理 ${done}/${a.length} · 已掌握 ${mastered}/${a.length}</div><div class="button-group study-finish-actions"><button class="primary" onclick="studyDayTest()">本日小测</button><button class="secondary" onclick="studyRestart()">再过一遍</button><button class="secondary" onclick="page('planPage');setDay(${homeStudyDay})">查看列表</button></div></div>`;
    $('homeStudyCounter').textContent=`${a.length} / ${a.length}`;$('homeStudyHint').textContent='完成后建议做本日小测';$('homeStudyPrev').disabled=false;$('homeStudyNext').disabled=true;return;
  }
  homeStudyIndex=Math.max(0,Math.min(a.length-1,homeStudyIndex));S.studyPos[homeStudyDay]=homeStudyIndex;
  const x=a[homeStudyIndex],w=x.w,it=L.map[w]||x,done=!!(S.planDone[homeStudyDay]||{})[w],pct=((homeStudyIndex+1)/a.length*100).toFixed(1),recall=S.studySettings.mode==='recall';
  $('homeStudyCounter').textContent=`${homeStudyIndex+1} / ${a.length}`;$('homeStudyHint').textContent=recall&&!homeStudyExpanded?'先回忆，再点卡片看答案':'左右滑动切换单词';
  $('homeStudyPrev').disabled=homeStudyIndex===0;$('homeStudyNext').disabled=homeStudyIndex===a.length-1;
  wrap.innerHTML=`<div class="study-flashcard ${anim}" id="studyFlashcard">
    <div class="study-top"><div><div class="study-day">第 ${homeStudyDay} 天 · ${stage(homeStudyDay)}</div><div class="small space-top">${statusPill(w)} ${done?'· 今日已处理':''}</div></div><div class="voices"><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-GB')">🇬🇧</button></div></div>
    <div class="study-progress"><span style="width:${pct}%"></span></div>
    <div class="study-tools"><button class="study-tool ${S.studySettings.mode==='direct'?'active':''}" onclick="event.stopPropagation();studyToggleMode()">${S.studySettings.mode==='direct'?'释义直显':'先回忆'}</button><button class="study-tool ${S.studySettings.autoSpeak?'active':''}" onclick="event.stopPropagation();studyToggleAuto()">${S.studySettings.autoSpeak?'自动发音开':'自动发音关'}</button><button class="study-tool ${S.studySettings.skipMastered?'active':''}" onclick="event.stopPropagation();studyToggleSkipMastered()">${S.studySettings.skipMastered?'已跳过掌握词':'不过滤掌握词'}</button></div>
    <div class="study-word-zone"><div class="study-word">${esc(w)}</div><div class="study-phon">${esc(it.p||'')}</div></div>
    ${recall&&!homeStudyExpanded?`<div class="study-recall-cover"><b>先在脑子里说出最常用意思</b><span>点卡片查看，不会直接给你判错。</span></div>`:`<div class="study-answer">${studyCoreHTML(w)}<button class="study-more-btn" onclick="event.stopPropagation();studyToggleMore()">${homeStudyExpanded?'收起更多义项':'查看更多义项'}</button>${homeStudyExpanded?`<div class="study-more-panel">${studyMoreHTML(w)}</div>`:''}</div>`}
    <div class="study-rate-block"><div class="small">你现在的感觉只影响复习时间，真正“掌握”仍由后续测试决定。</div><div class="study-rate-grid"><button class="rate0" onclick="event.stopPropagation();studyRate(0)"><b>不会</b><span>尽快再见</span></button><button class="rate1" onclick="event.stopPropagation();studyRate(1)"><b>模糊</b><span>短期复习</span></button><button class="rate2" onclick="event.stopPropagation();studyRate(2)"><b>认识</b><span>拉开间隔</span></button><button class="rate3" onclick="event.stopPropagation();studyRate(3)"><b>很熟</b><span>等待验证</span></button></div></div>
    <div class="study-foot"><div class="small">${recall?'点空白区域显示/隐藏释义 · ':''}左滑下一个，右滑上一个</div><button class="secondary" onclick="event.stopPropagation();studyToggleBook('${esc(w)}')">${S.book[w]?'★ 已收藏':'☆ 生词本'}</button></div>
  </div>`;
  const card=$('studyFlashcard');if(card)card.onclick=e=>{if(e.target.closest('button')||Date.now()-(homeStudyTouch.swiped||0)<350)return;if(S.studySettings.mode==='recall'){homeStudyExpanded=!homeStudyExpanded;studyRender()}};
}
function studyToggleMore(){homeStudyExpanded=!homeStudyExpanded;studyRender()}
function nextIndex(step){
  const a=studyWords();let i=homeStudyIndex+step;
  while(i>=0&&i<a.length){if(!S.studySettings.skipMastered||statusOf(a[i].w)!=='mastered')return i;i+=step}return -1;
}
function studyMove(step){
  const a=studyWords();if(!a.length)return;const next=nextIndex(step);
  if(next<0){toast(step>0?'已经到这一日最后一个可学单词':'已经到第一个可学单词');return}
  const card=$('studyFlashcard');if(card)card.classList.add(step>0?'slide-left':'slide-right');
  setTimeout(()=>{homeStudyIndex=next;S.studyPos[homeStudyDay]=homeStudyIndex;homeStudyExpanded=false;save();studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()},120)
}
function studyRate(g){
  const x=studyCurrent();if(!x)return;const {delay,d}=recordSubjective(x.w,g);if(d===curDay)renderDay();
  try{if(navigator.vibrate)navigator.vibrate(10)}catch(e){}
  toast(g===0?'记为不会，系统会尽快安排复习':g===3?'记为很熟，但仍需测试验证':`${delay} 天后复习`);
  const next=nextIndex(1);if(next>=0){homeStudyIndex=next;S.studyPos[homeStudyDay]=homeStudyIndex;homeStudyExpanded=false;save();studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}else{homeStudyFinished=true;save();studyRender()}
}
function studyRestart(){homeStudyFinished=false;homeStudyIndex=firstStudyIndex(studyWords());homeStudyExpanded=false;studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}
function startFlipStudy(day=curDay){if(!L.p.length){toast('词表还在加载，等一两秒再开始');return}setStudyDay(day,{resume:true});page('searchPage');setTimeout(()=>$('homeStudySection').scrollIntoView({behavior:'smooth',block:'start'}),30)}
function studyDayTest(){startQuiz(plan(homeStudyDay).map(x=>x.w),`第 ${homeStudyDay} 天小测`)}
function studyToggleBook(w){if(S.book[w]){delete S.book[w];toast('已移出生词本')}else{S.book[w]=Date.now();toast('已加入生词本')}save();studyRender()}

renderDay=function(){
  if(!L.p.length)return;const a=plan(curDay),done=S.planDone[curDay]||{},n=a.filter(x=>done[x.w]).length;
  $('stage').textContent=stage(curDay);$('daySummary').textContent=`第 ${curDay} 天 · ${a.length} 个新词 · 点击单词直接展开释义`;$('bar').style.width=(a.length?n/a.length*100:0)+'%';$('progressText').textContent=`今日已处理 ${n} / ${a.length}`;
  $('dayWords').innerHTML=a.map((x,i)=>{const it=L.map[x.w]||x,w=x.w,ok=!!done[w],expanded=planExpandedWord===w;return `<div class="plan-word-card ${expanded?'expanded':''}"><div class="row plan-word-row"><div class="row-main" onclick="togglePlanWord('${esc(w)}')"><div class="rowword">${i+1}. ${esc(w)} ${statusPill(w)}</div><div class="small">${esc(it.p||'')} ${expanded?'点击收起':'点击查看意思'}</div></div><div class="row-actions"><button onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button onclick="event.stopPropagation();togglePlanDone(${curDay},'${esc(w)}')">${ok?'撤销今日':'今日已学'}</button></div></div>${expanded?`<div class="plan-inline-detail"><div class="plan-inline-meaning">${esc(mainMeaning(w)||cleanMeaning(it.z||'')||'暂无中文释义')}</div>${CURATED[w]?`<div class="plan-inline-extra">${studyMoreHTML(w)}</div>`:''}<div class="plan-inline-actions"><button onclick="planInlineRate('${esc(w)}',0)">不会</button><button onclick="planInlineRate('${esc(w)}',1)">模糊</button><button onclick="planInlineRate('${esc(w)}',2)">认识</button><button onclick="planInlineRate('${esc(w)}',3)">很熟</button></div></div>`:''}</div>`}).join('');
}
function togglePlanWord(w){planExpandedWord=planExpandedWord===w?'':w;renderDay()}
function planInlineRate(w,g){recordSubjective(w,g);renderDay();stats();toast('已记录，会同步进入复习系统')}

$('learnNext').onclick=()=>startFlipStudy(curDay);
$('homeStudyPlan').onclick=()=>{page('planPage');setDay(homeStudyDay)};
$('homeStudyToday').onclick=()=>setStudyDay(today(),{resume:true});
$('homeStudyQuiz').onclick=studyDayTest;
$('homeStudyPrev').onclick=()=>studyMove(-1);
$('homeStudyNext').onclick=()=>studyMove(1);
$('homeStudyCardWrap').addEventListener('touchstart',e=>{const t=e.changedTouches?.[0];if(t)homeStudyTouch={x:t.clientX,y:t.clientY,swiped:homeStudyTouch.swiped||0}},{passive:true});
$('homeStudyCardWrap').addEventListener('touchend',e=>{const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-homeStudyTouch.x,dy=t.clientY-homeStudyTouch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){homeStudyTouch.swiped=Date.now();studyMove(dx<0?1:-1)}},{passive:true});

document.addEventListener('keydown',e=>{if(!$('searchPage')||$('searchPage').classList.contains('hidden'))return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight')studyMove(1);if(e.key==='ArrowLeft')studyMove(-1);if(e.key===' '&&S.studySettings.mode==='recall'){e.preventDefault();homeStudyExpanded=!homeStudyExpanded;studyRender()}});

const studyBoot=setInterval(()=>{if(L.p.length){clearInterval(studyBoot);setStudyDay(today(),{resume:true});renderDay()}},120);
setTimeout(()=>clearInterval(studyBoot),15000);