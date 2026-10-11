let homeStudyDay=1,homeStudyIndex=0,homeStudyRevealed=false,homeStudyTouch={x:0,y:0,swiped:0};
S.studyPos=S.studyPos||{};

function studyWords(){try{return plan(homeStudyDay)||[]}catch(e){return[]}}
function studyCurrent(){const a=studyWords();return a[Math.max(0,Math.min(a.length-1,homeStudyIndex))]||null}
function studyMeta(){
  const a=studyWords(),done=S.planDone[homeStudyDay]||{},n=a.filter(x=>done[x.w]).length;
  $('homeStudyMeta').textContent=L.p.length?`第 ${homeStudyDay} 天 · ${stage(homeStudyDay)} · 已处理 ${n}/${a.length}`:'正在载入今天的单词…';
  $('homeStudyToday').classList.toggle('hidden',homeStudyDay===today());
}
function setStudyDay(day,{resume=true}={}){
  homeStudyDay=Math.max(1,Math.min(180,Number(day)||today()));
  const a=studyWords();
  if(!a.length){homeStudyIndex=0;homeStudyRevealed=false;studyRender();return}
  let idx=resume?Number(S.studyPos[homeStudyDay]??-1):-1;
  if(!(idx>=0&&idx<a.length)){
    const done=S.planDone[homeStudyDay]||{};
    idx=a.findIndex(x=>!done[x.w]);
    if(idx<0)idx=a.findIndex(x=>statusOf(x.w)!=='mastered');
    if(idx<0)idx=0;
  }
  homeStudyIndex=Math.max(0,Math.min(a.length-1,idx));
  homeStudyRevealed=false;
  S.studyPos[homeStudyDay]=homeStudyIndex;
  save();studyRender();
}
function studyPrimaryDetail(w){
  const c=CURATED[w];
  if(c?.must?.length){
    return c.must.slice(0,3).map(m=>`<div class="study-detail-item"><b>${esc(m[0])}</b><div class="phrase">${esc(m[1])}</div><div class="example">${esc(m[2])}</div><div class="translation">${esc(m[3])}</div></div>`).join('');
  }
  const z=mainMeaning(w);
  return z?`<div class="study-detail-item"><b>${esc(z)}</b><div class="translation">今天先记这个核心意思，其他义项以后在语境里补。</div></div>`:'<div class="study-detail-item"><b>暂无中文释义</b><div class="translation">点“详细查词”查看在线词典。</div></div>';
}
function studyRender(anim=''){
  const a=studyWords(),wrap=$('homeStudyCardWrap');
  studyMeta();
  if(!a.length){
    wrap.innerHTML='<div class="study-loading"><b>正在准备今天的单词</b><span>词表加载完成后会自动出现。</span></div>';
    $('homeStudyCounter').textContent='0 / 0';$('homeStudyHint').textContent='';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;return;
  }
  homeStudyIndex=Math.max(0,Math.min(a.length-1,homeStudyIndex));
  S.studyPos[homeStudyDay]=homeStudyIndex;
  const x=a[homeStudyIndex],w=x.w,it=L.map[w]||x,meaning=mainMeaning(w),done=!!(S.planDone[homeStudyDay]||{})[w],pct=((homeStudyIndex+1)/a.length*100).toFixed(1);
  $('homeStudyCounter').textContent=`${homeStudyIndex+1} / ${a.length}`;
  $('homeStudyHint').textContent=homeStudyRevealed?'选掌握感觉后自动进入下一个':'先回忆 · 点卡片看答案 · 左滑下一个';
  $('homeStudyPrev').disabled=homeStudyIndex===0;$('homeStudyNext').disabled=homeStudyIndex===a.length-1;
  const mastered=statusOf(w)==='mastered';
  const tip=CURATED[w]?.tip?`<div class="tip">💡 ${esc(CURATED[w].tip)}</div>`:'';
  wrap.innerHTML=`<div class="study-flashcard ${anim}" id="studyFlashcard">
    <div class="study-top">
      <div><div class="study-day">第 ${homeStudyDay} 天 · ${stage(homeStudyDay)}</div><div class="small space-top">${statusPill(w)} ${done?'· 今日已处理':''}</div></div>
      <div class="voices"><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-GB')">🇬🇧</button></div>
    </div>
    <div class="study-progress"><span style="width:${pct}%"></span></div>
    <div class="study-word">${esc(w)}</div>
    <div class="study-phon">${esc(it.p||'')}</div>
    ${homeStudyRevealed?`
      <div class="study-answer-label">核心意思</div>
      <div class="study-meaning">${esc(meaning||'暂无核心释义')}</div>
      <div class="study-detail">${studyPrimaryDetail(w)}</div>${tip}
      <div class="study-rate">
        <div class="small">按你现在的真实感觉选。真正“掌握”仍要靠后面的跨天测试验证。</div>
        <div class="actions"><button onclick="event.stopPropagation();studyRate(0)">不会</button><button onclick="event.stopPropagation();studyRate(1)">模糊</button><button onclick="event.stopPropagation();studyRate(2)">认识</button><button onclick="event.stopPropagation();studyRate(3)">很熟</button></div>
      </div>`:`
      <div class="study-cover"><div><b>${mastered?'先确认自己还记得':'先别偷看答案'}</b>在脑子里说出这个词最常用的中文意思。<br><span>想好了以后点卡片翻开。</span></div></div>`}
    <div class="study-foot">
      <div class="small">${homeStudyRevealed?'再次点卡片可隐藏答案':'支持左右滑动，也可以用下面箭头'}</div>
      <div class="button-group"><button class="secondary" onclick="event.stopPropagation();studyToggleBook('${esc(w)}')">${S.book[w]?'★':'☆'} 生词本</button><button class="secondary" onclick="event.stopPropagation();openWord('${esc(w)}')">详细查词</button></div>
    </div>
  </div>`;
  const card=$('studyFlashcard');
  if(card)card.onclick=e=>{if(e.target.closest('button')||Date.now()-(homeStudyTouch.swiped||0)<350)return;homeStudyRevealed=!homeStudyRevealed;studyRender()};
}
function studyMove(step){
  const a=studyWords();if(!a.length)return;
  const next=homeStudyIndex+step;
  if(next<0){toast('已经是第一个词');return}
  if(next>=a.length){toast('这一天已经翻到最后一个词');return}
  const card=$('studyFlashcard');if(card)card.classList.add(step>0?'slide-left':'slide-right');
  setTimeout(()=>{homeStudyIndex=next;S.studyPos[homeStudyDay]=homeStudyIndex;homeStudyRevealed=false;save();studyRender()},120);
}
function studyRate(g){
  const x=studyCurrent();if(!x)return;
  const {delay,d}=recordSubjective(x.w,g);
  if(d===curDay)renderDay();
  const msg=g===0?'记为不会，稍后会优先复习':g===3?'记为很熟，但仍要靠测试验证':`${delay} 天后复习`;
  toast(msg);
  const a=studyWords();
  if(homeStudyIndex<a.length-1){homeStudyIndex++;S.studyPos[homeStudyDay]=homeStudyIndex;homeStudyRevealed=false;save();studyRender()}
  else{homeStudyRevealed=true;studyRender();toast('这一日的卡片过完了，接下来做本日小测')}
}
function startFlipStudy(day=curDay){
  if(!L.p.length){toast('词表还在加载，等一两秒再开始');return}
  setStudyDay(day,{resume:true});
  page('searchPage');
  setTimeout(()=>$('homeStudySection').scrollIntoView({behavior:'smooth',block:'start'}),30);
}
function studyDayTest(){startQuiz(plan(homeStudyDay).map(x=>x.w),`第 ${homeStudyDay} 天小测`)}
function studyToggleBook(w){if(S.book[w]){delete S.book[w];toast('已移出生词本')}else{S.book[w]=Date.now();toast('已加入生词本')}save();studyRender()}

$('learnNext').onclick=()=>startFlipStudy(curDay);
$('homeStudyPlan').onclick=()=>{page('planPage');setDay(homeStudyDay)};
$('homeStudyToday').onclick=()=>setStudyDay(today(),{resume:true});
$('homeStudyQuiz').onclick=studyDayTest;
$('homeStudyPrev').onclick=()=>studyMove(-1);
$('homeStudyNext').onclick=()=>studyMove(1);
$('homeStudyCardWrap').addEventListener('touchstart',e=>{const t=e.changedTouches?.[0];if(t)homeStudyTouch={x:t.clientX,y:t.clientY,swiped:homeStudyTouch.swiped||0}},{passive:true});
$('homeStudyCardWrap').addEventListener('touchend',e=>{const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-homeStudyTouch.x,dy=t.clientY-homeStudyTouch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){homeStudyTouch.swiped=Date.now();studyMove(dx<0?1:-1)}},{passive:true});

document.addEventListener('keydown',e=>{
  if(!$('searchPage')||$('searchPage').classList.contains('hidden'))return;
  if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(e.key==='ArrowRight')studyMove(1);
  if(e.key==='ArrowLeft')studyMove(-1);
  if(e.key===' '){e.preventDefault();homeStudyRevealed=!homeStudyRevealed;studyRender()}
});

// 词表是异步载入的，加载完成后自动把首页学习卡切到“今天”。
const studyBoot=setInterval(()=>{
  if(L.p.length){clearInterval(studyBoot);setStudyDay(today(),{resume:true})}
},120);
setTimeout(()=>clearInterval(studyBoot),15000);