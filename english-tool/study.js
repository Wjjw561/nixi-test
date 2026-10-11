let flipMode='list',flipIndex=0,flipRevealed=false,flipTouch={x:0,y:0,swiped:0};

function flipWords(){try{return plan(curDay)||[]}catch(e){return[]}}
function flipCurrent(){const a=flipWords();return a[Math.max(0,Math.min(a.length-1,flipIndex))]||null}
function flipSetMode(mode){
  flipMode=mode==='card'?'card':'list';
  $('planListPanel').classList.toggle('hidden',flipMode!=='list');
  $('planStudyPanel').classList.toggle('hidden',flipMode!=='card');
  $('listModeBtn').classList.toggle('active',flipMode==='list');
  $('cardModeBtn').classList.toggle('active',flipMode==='card');
  if(flipMode==='card')flipPrepare();
}
function flipPrepare(){
  const a=flipWords();
  if(!a.length){flipIndex=0;flipRevealed=false;flipRender();return}
  const done=S.planDone[curDay]||{};
  let idx=a.findIndex(x=>!done[x.w]);
  if(idx<0)idx=a.findIndex(x=>statusOf(x.w)!=='mastered');
  if(idx<0)idx=0;
  flipIndex=Math.max(0,Math.min(a.length-1,idx));flipRevealed=false;flipRender();
}
function startFlipStudy(){
  if(!L.p.length){toast('词表还在加载，等一两秒再进翻卡');return}
  flipSetMode('card');
}
function flipDetail(w){
  const c=CURATED[w];
  if(c?.must?.length){
    return c.must.slice(0,3).map(m=>`<div class="study-detail-item"><b>${esc(m[0])}</b><div class="phrase">${esc(m[1])}</div><div class="translation">${esc(m[3])}</div></div>`).join('');
  }
  const z=mainMeaning(w);
  return z?`<div class="study-detail-item"><b>${esc(z)}</b></div>`:'<div class="study-detail-item"><b>暂无中文释义</b><div class="translation">点“详细查词”查看在线词典。</div></div>';
}
function flipRender(anim=''){
  if(flipMode!=='card')return;
  const a=flipWords(),wrap=$('studyCardWrap');
  if(!a.length){
    wrap.innerHTML='<div class="card empty"><strong>这一天暂时没有可显示的单词</strong>词表可能还在加载。</div>';
    $('studyCounter').textContent='0 / 0';$('studyHint').textContent='';$('studyPrev').disabled=true;$('studyNext').disabled=true;return;
  }
  flipIndex=Math.max(0,Math.min(a.length-1,flipIndex));
  const x=a[flipIndex],w=x.w,it=L.map[w]||x,meaning=mainMeaning(w),done=!!(S.planDone[curDay]||{})[w],pct=((flipIndex+1)/a.length*100).toFixed(1);
  $('studyCounter').textContent=`${flipIndex+1} / ${a.length}`;
  $('studyHint').textContent=flipRevealed?'左右滑动继续 · 也可以先评分':'点卡片显示释义 · 左滑下一个';
  $('studyPrev').disabled=flipIndex===0;$('studyNext').disabled=flipIndex===a.length-1;
  const tip=CURATED[w]?.tip?`<div class="tip">💡 ${esc(CURATED[w].tip)}</div>`:'';
  wrap.innerHTML=`<div class="study-flashcard ${anim}" id="studyFlashcard">
    <div class="study-top"><div><div class="study-day">第 ${curDay} 天 · ${stage(curDay)}</div><div class="small space-top">${statusPill(w)} ${done?'· 今日已处理':''}</div></div><div class="voices"><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-GB')">🇬🇧</button></div></div>
    <div class="study-progress"><span style="width:${pct}%"></span></div>
    <div class="study-word">${esc(w)}</div><div class="study-phon">${esc(it.p||'')}</div>
    ${flipRevealed?`<div class="study-meaning">${esc(meaning||'暂无核心释义')}</div><div class="study-detail">${flipDetail(w)}</div>${tip}<div class="study-rate"><div class="small">先按真实感觉选。它只安排复习，不会直接把词判成“掌握”。</div><div class="actions"><button onclick="event.stopPropagation();flipRate(0)">不会</button><button onclick="event.stopPropagation();flipRate(1)">有印象</button><button onclick="event.stopPropagation();flipRate(2)">认识</button><button onclick="event.stopPropagation();flipRate(3)">很熟</button></div></div>`:`<div class="study-cover"><div><b>先回忆，再看答案</b>在脑子里想一下它是什么意思。<br>然后点卡片翻开释义。</div></div>`}
    <div class="study-foot"><div class="small">${flipRevealed?'点卡片可重新隐藏释义':'手指左滑下一个，右滑上一个'}</div><button class="secondary" onclick="event.stopPropagation();openWord('${esc(w)}')">详细查词</button></div>
  </div>`;
  const card=$('studyFlashcard');
  if(card)card.onclick=e=>{if(e.target.closest('button')||Date.now()-(flipTouch.swiped||0)<350)return;flipRevealed=!flipRevealed;flipRender()};
}
function flipMove(step){
  const a=flipWords();if(!a.length)return;
  const next=flipIndex+step;
  if(next<0){toast('已经是第一个词');return}
  if(next>=a.length){toast('今天的卡片已经翻完了');return}
  const card=$('studyFlashcard');if(card)card.classList.add(step>0?'slide-left':'slide-right');
  setTimeout(()=>{flipIndex=next;flipRevealed=false;flipRender()},120);
}
function flipRate(g){
  const x=flipCurrent();if(!x)return;
  subjective(x.w,g);
  const a=flipWords();
  if(flipIndex<a.length-1){flipIndex++;flipRevealed=false;flipRender()}
  else{flipRevealed=true;flipRender();toast('今天的卡片过完了，接下来做本日小测更靠谱')}
}

$('learnNext').onclick=startFlipStudy;
$('listModeBtn').onclick=()=>flipSetMode('list');
$('cardModeBtn').onclick=startFlipStudy;
$('backToList').onclick=()=>flipSetMode('list');
$('studyQuiz').onclick=dayTest;
$('studyPrev').onclick=()=>flipMove(-1);
$('studyNext').onclick=()=>flipMove(1);
$('studyCardWrap').addEventListener('touchstart',e=>{const t=e.changedTouches?.[0];if(t)flipTouch={x:t.clientX,y:t.clientY,swiped:flipTouch.swiped||0}},{passive:true});
$('studyCardWrap').addEventListener('touchend',e=>{const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-flipTouch.x,dy=t.clientY-flipTouch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){flipTouch.swiped=Date.now();flipMove(dx<0?1:-1)}},{passive:true});

['prevDay','nextDay','todayBtn'].forEach(id=>$(id).addEventListener('click',()=>setTimeout(()=>{if(flipMode==='card')flipPrepare()},0)));
$('dayInput').addEventListener('change',()=>setTimeout(()=>{if(flipMode==='card')flipPrepare()},0));
document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{if(flipMode==='card')flipPrepare()},0)));

document.addEventListener('keydown',e=>{
  if($('planPage').classList.contains('hidden')||flipMode!=='card')return;
  if(e.key==='ArrowRight')flipMove(1);
  if(e.key==='ArrowLeft')flipMove(-1);
  if(e.key===' '){e.preventDefault();flipRevealed=!flipRevealed;flipRender()}
});

document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.page==='planPage')setTimeout(()=>flipSetMode(flipMode),0);
}));