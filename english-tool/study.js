let homeStudyDay=1,homeStudyTouch={x:0,y:0,swiped:0};
S.studyPos=S.studyPos||{};
S.studySettings=S.studySettings||{mode:'direct',autoSpeak:false,skipMastered:false};
if(!['direct','recall'].includes(S.studySettings.mode))S.studySettings.mode='direct';
S.studyV3=S.studyV3||{};
let planExpandedWord='';
let studyReveal=false,studyMoreOpen=false;

function studyWords(){try{return plan(homeStudyDay)||[]}catch(e){return[]}}
function daySignature(){return studyWords().map(x=>x.w).join('|')}
function groupSource(group){const a=studyWords(),start=(group-1)*10;return a.slice(start,start+10).filter(x=>!S.studySettings.skipMastered||statusOf(x.w)!=='mastered')}
function blankStudyState(group=1){return{sig:daySignature(),group,phase:'cards',queue:[],cursor:0,attempts:{},first:{},last:{},groups:{},mini:null}}
function savedStudy(){return S.studyV3[homeStudyDay]||null}
function putStudy(st){S.studyV3[homeStudyDay]=st;S.studyPos[homeStudyDay]=st.cursor||0;try{save()}catch(e){}}
function makeGroup(st,group){
  const src=groupSource(group);st.group=group;st.phase='cards';st.queue=src.map(x=>({w:x.w,rated:false,g:null}));st.cursor=0;st.attempts={};st.first={};st.last={};st.mini=null;studyReveal=false;studyMoreOpen=false;
  if(!src.length){if(group===1&&groupSource(2).length)return makeGroup(st,2);st.phase='finished'}
  putStudy(st);return st
}
function ensureStudyState({resume=true}={}){
  const sig=daySignature();let st=resume?savedStudy():null;
  if(!st||st.sig!==sig||!Array.isArray(st.queue)||!st.groups||(st.phase==='cards'&&!st.queue.length)){
    st=blankStudyState(1);makeGroup(st,1)
  }else{st.sig=sig;putStudy(st)}
  return st
}
function currentState(){return ensureStudyState({resume:true})}
function studyCurrent(){
  const st=currentState();if(st.phase!=='cards'||!st.queue.length)return null;const e=st.queue[Math.max(0,Math.min(st.queue.length-1,st.cursor))];if(!e)return null;
  return studyWords().find(x=>x.w===e.w)||L.map[e.w]||{w:e.w}
}
function studyEntry(){const st=currentState();return st.phase==='cards'?st.queue[st.cursor]||null:null}
function studyMeta(){
  const a=studyWords(),done=S.planDone[homeStudyDay]||{},n=a.filter(x=>done[x.w]).length,mastered=a.filter(x=>statusOf(x.w)==='mastered').length,st=currentState();
  $('homeStudyMeta').textContent=L.p.length?`第 ${homeStudyDay} 天 · ${a.length} 词分两组 · 今日已处理 ${n}/${a.length} · 已掌握 ${mastered} · 当前第 ${Math.min(st.group||1,2)} 组`:'正在载入今天的单词…';
  $('homeStudyToday').classList.toggle('hidden',homeStudyDay===today());
}
function setStudyDay(day,{resume=true}={}){
  homeStudyDay=Math.max(1,Math.min(180,Number(day)||today()));studyReveal=false;studyMoreOpen=false;
  if(!resume)delete S.studyV3[homeStudyDay];
  const st=ensureStudyState({resume});
  if(st.phase==='cards'&&st.cursor>=st.queue.length)finishGroup(st);
  studyRender();if(S.studySettings.autoSpeak&&st.phase==='cards')studySpeakCurrent()
}
function studySpeakCurrent(){const x=studyCurrent();if(x)speak(x.w,'en-US')}
function studyToggleMode(){S.studySettings.mode=S.studySettings.mode==='direct'?'recall':'direct';studyReveal=false;studyMoreOpen=false;save();studyRender()}
function studyToggleAuto(){S.studySettings.autoSpeak=!S.studySettings.autoSpeak;save();studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}
function studyToggleSkipMastered(){S.studySettings.skipMastered=!S.studySettings.skipMastered;save();delete S.studyV3[homeStudyDay];setStudyDay(homeStudyDay,{resume:false})}
function studyCoreHTML(w){
  const c=CURATED[w];
  if(c?.must?.length){const m=c.must[0];return `<div class="study-core-block"><div class="study-core-meaning">${esc(m[0])}</div>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}${m[2]?`<div class="study-core-example">${esc(m[2])}</div><div class="study-core-translation">${esc(m[3]||'')}</div>`:''}</div>`}
  const z=mainMeaning(w);return `<div class="study-core-block"><div class="study-core-meaning">${esc(z||'暂无中文释义')}</div></div>`
}
function studyMoreHTML(w){
  const c=CURATED[w],it=L.map[w]||{};
  if(c){
    const must=c.must.map((m,i)=>`<div class="study-more-item"><span class="study-more-tag must">${i===0?'核心':'常用'}</span><b>${esc(m[0])}</b>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}${m[2]?`<div class="study-core-example">${esc(m[2])}</div><div class="study-core-translation">${esc(m[3]||'')}</div>`:''}</div>`).join('');
    const rec=(c.rec||[]).map(m=>`<div class="study-more-item"><span class="study-more-tag rec">认识即可</span><b>${esc(m[0])}</b>${m[1]?`<div class="study-core-phrase">${esc(m[1])}</div>`:''}</div>`).join('');
    const skip=(c.skip||[]).length?`<div class="study-skip"><b>暂时不用背</b><div>${c.skip.map(x=>'• '+esc(x)).join('<br>')}</div></div>`:'';
    const tip=c.tip?`<div class="tip">💡 ${esc(c.tip)}</div>`:'';return `${must}${rec}${skip}${tip}`
  }
  const full=cleanMeaning(it.z||'');return `<div class="study-more-item"><span class="study-more-tag must">词表释义</span><div>${esc(full||mainMeaning(w)||'暂无更多中文义项')}</div></div>`
}
function groupSummary(st){
  const src=groupSource(st.group),ws=src.map(x=>x.w),firstWeak=ws.filter(w=>(st.first[w]??3)<=1).length,recovered=ws.filter(w=>(st.first[w]??3)<=1&&(st.last[w]??0)>=2).length,remain=ws.filter(w=>(st.last[w]??3)<=1).length,stable=ws.filter(w=>(st.last[w]??-1)>=2).length;
  return{total:ws.length,firstWeak,recovered,remain,stable}
}
function finishGroup(st){st.groups[st.group]=groupSummary(st);st.phase='checkpoint';st.cursor=Math.max(0,st.queue.length-1);putStudy(st);studyReveal=false;studyMoreOpen=false}
function insertReview(st,w,g){const gap=g===0?4:9,idx=Math.min(st.queue.length,st.cursor+gap);st.queue.splice(idx,0,{w,rated:false,g:null})}
function studyRate(g){
  const st=currentState(),e=studyEntry(),x=studyCurrent();if(!e||!x||e.rated)return;
  const w=x.w;st.attempts[w]=(st.attempts[w]||0)+1;if(st.first[w]===undefined)st.first[w]=g;st.last[w]=g;e.rated=true;e.g=g;
  try{recordSubjective(w,g)}catch(err){try{subjective(w,g)}catch(x){}}
  if(g<=1&&st.attempts[w]<3)insertReview(st,w,g);
  try{if(navigator.vibrate)navigator.vibrate(10)}catch(err){}
  putStudy(st);
  const msg=g===0?(st.attempts[w]<3?'不会，3 张左右后再见它':'这轮还没稳，留到复习系统继续处理'):g===1?(st.attempts[w]<3?'模糊，稍后再见一次':'已经记录为模糊'):g===2?'认识，这轮先放行':'很熟，后面用测试验证';toast(msg);
  setTimeout(()=>{const s=currentState();if(s.cursor<s.queue.length-1){s.cursor++;putStudy(s);studyReveal=false;studyMoreOpen=false;studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}else{finishGroup(s);studyRender()}},120)
}
function studyMove(step){
  const st=currentState();if(st.phase!=='cards')return;
  if(step<0){if(st.cursor<=0)return toast('已经是这一组最前面了');st.cursor--;putStudy(st);studyReveal=false;studyMoreOpen=false;studyRender();return}
  const e=studyEntry();if(e&&!e.rated)return toast('先判断一下：不会、模糊、认识还是很熟');
  if(st.cursor<st.queue.length-1){st.cursor++;putStudy(st);studyReveal=false;studyMoreOpen=false;studyRender()}else{finishGroup(st);studyRender()}
}
function studyToggleMore(){studyMoreOpen=!studyMoreOpen;studyRender()}
function studyToggleReveal(){if(S.studySettings.mode!=='recall')return;studyReveal=!studyReveal;studyRender()}
function chooseMiniWords(st){
  const src=groupSource(st.group).map(x=>x.w),remain=src.filter(w=>(st.last[w]??3)<=1),recovered=src.filter(w=>(st.first[w]??3)<=1&&(st.last[w]??0)>=2),rest=src.filter(w=>!remain.includes(w)&&!recovered.includes(w));
  return [...new Set([...remain,...recovered,...rest])].filter(w=>mainMeaning(w)).slice(0,3)
}
function studyStartMini(){
  const st=currentState();if(st.phase!=='checkpoint')return;const ws=chooseMiniWords(st),qs=[];
  for(const w of ws){try{const q=makeQuestion(w,'en-zh');if(q)qs.push(q)}catch(e){}}
  if(!qs.length){st.mini={questions:[],i:0,score:0};st.phase='miniDone';putStudy(st);studyRender();return}
  st.mini={questions:qs,i:0,score:0,answered:false,selected:'',ok:false};st.phase='mini';putStudy(st);studyRender()
}
function studyMiniAnswer(btn){
  const st=currentState();if(st.phase!=='mini'||!st.mini||st.mini.answered)return;const q=st.mini.questions[st.mini.i],selected=btn.dataset.answer||'',ok=selected===q.answer;st.mini.answered=true;st.mini.selected=selected;st.mini.ok=ok;if(ok)st.mini.score++;
  try{quizResult(q.w,ok)}catch(e){}putStudy(st);studyRender()
}
function studyMiniNext(){const st=currentState();if(st.phase!=='mini'||!st.mini?.answered)return;st.mini.i++;st.mini.answered=false;st.mini.selected='';st.mini.ok=false;if(st.mini.i>=st.mini.questions.length)st.phase='miniDone';putStudy(st);studyRender()}
function studyNextGroup(){const st=currentState();if(st.group===1){makeGroup(st,2);studyRender();if(S.studySettings.autoSpeak)studySpeakCurrent()}else{st.phase='finished';putStudy(st);studyRender()}}
function studyRestart(){delete S.studyV3[homeStudyDay];setStudyDay(homeStudyDay,{resume:false})}
function studyRestartGroup(){const st=currentState();makeGroup(st,st.group);studyRender()}
function startFlipStudy(day=curDay){if(!L.p.length){toast('词表还在加载，等一两秒再开始');return}setStudyDay(day,{resume:true});page('searchPage');setTimeout(()=>$('homeStudySection').scrollIntoView({behavior:'smooth',block:'start'}),30)}
function studyDayTest(){startQuiz(plan(homeStudyDay).map(x=>x.w),`第 ${homeStudyDay} 天小测`)}
function studyToggleBook(w){if(S.book[w]){delete S.book[w];toast('已移出生词本')}else{S.book[w]=Date.now();toast('已加入生词本')}save();studyRender()}
function renderCheckpoint(st,wrap){
  const s=st.groups[st.group]||groupSummary(st),g1=st.groups[1]?.total??groupSource(1).length,g2=st.groups[2]?.total??groupSource(2).length,total=Math.max(0,g1+g2),done=st.group===1?s.total:g1+s.total,groupTotal=s.total||0;
  $('homeStudyCounter').textContent=`第 ${st.group} 组完成`;$('homeStudyHint').textContent='先做 3 题快测，再进入下一组';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;
  wrap.innerHTML=`<div class="study-finish v3-checkpoint"><div class="v3-group-mark">${done} / ${total}</div><div class="study-finish-title">第 ${st.group} 组 ${groupTotal} 词完成</div><div class="v3-summary-grid"><div><b>${s.firstWeak}</b><span>首轮不会/模糊</span></div><div><b>${s.recovered}</b><span>当场拉回</span></div><div><b>${s.remain}</b><span>仍需复习</span></div></div><div class="small v3-summary-note">不会和模糊的词已经在这一组里重新出现过，不再等到明天才想起它。</div><button class="primary v3-wide" onclick="studyStartMini()">开始 3 题快测</button><button class="secondary v3-wide" onclick="studyRestartGroup()">这 ${groupTotal} 个再过一遍</button></div>`
}
function renderMini(st,wrap){
  const m=st.mini,q=m.questions[m.i];$('homeStudyCounter').textContent=`快测 ${m.i+1} / ${m.questions.length}`;$('homeStudyHint').textContent='用测试验证，不靠“感觉很熟”';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;
  const selected=m.selected;
  wrap.innerHTML=`<div class="study-flashcard v3-mini"><div class="study-day">第 ${st.group} 组 · 3 题快测</div><div class="quiz-word">${esc(q.prompt)}</div><div class="quiz-prompt">选出最合适的中文核心意思</div><div class="quiz-options">${q.opts.map(o=>`<button class="quiz-option ${m.answered&&o===q.answer?'correct':''} ${m.answered&&o===selected&&o!==q.answer?'wrong':''}" data-answer="${esc(o)}" onclick="studyMiniAnswer(this)" ${m.answered?'disabled':''}>${esc(o)}</button>`).join('')}</div>${m.answered?`<div class="quiz-feedback">${m.ok?'✅ 正确':'❌ 正确答案：<b>'+esc(q.answer)+'</b>'}<button class="primary quiz-next" onclick="studyMiniNext()">${m.i===m.questions.length-1?'查看结果':'下一题'}</button></div>`:''}</div>`
}
function renderMiniDone(st,wrap){
  const m=st.mini||{questions:[],score:0},total=m.questions.length,s=st.groups[st.group]||{};$('homeStudyCounter').textContent=`第 ${st.group} 组已验证`;$('homeStudyHint').textContent=st.group===1?'准备进入第二组':'准备查看今日总结';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;
  const nextCount=groupSource(2).length;
  wrap.innerHTML=`<div class="study-finish"><div class="study-finish-icon">✓</div><div class="study-finish-title">第 ${st.group} 组快测完成</div><div class="quiz-word">${m.score} / ${total||0}</div><div class="small">${total&&m.score===total?'这一组暂时稳住了。':'错题已经写回复习系统，后面还会再见。'}</div><button class="primary v3-wide" onclick="studyNextGroup()">${st.group===1?(nextCount?`进入第二组 ${nextCount} 词`:'查看今日总结'):'查看今日总结'}</button>${s.remain?`<div class="v3-remain">这一组还有 ${s.remain} 个词主观上不稳，后续复习会继续处理。</div>`:''}</div>`
}
function renderFinished(st,wrap){
  const g1=st.groups[1]||{firstWeak:0,recovered:0,remain:0},g2=st.groups[2]||{firstWeak:0,recovered:0,remain:0},a=studyWords(),done=S.planDone[homeStudyDay]||{},doneN=a.filter(x=>done[x.w]).length,mastered=a.filter(x=>statusOf(x.w)==='mastered').length,remain=(g1.remain||0)+(g2.remain||0),recovered=(g1.recovered||0)+(g2.recovered||0);
  $('homeStudyCounter').textContent=`${a.length} / ${a.length}`;$('homeStudyHint').textContent='今日两组完成';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;
  wrap.innerHTML=`<div class="study-finish v3-final"><div class="study-finish-icon">✓</div><div class="study-finish-title">今天的 ${a.length} 个新词处理完了</div><div class="v3-summary-grid"><div><b>${doneN}</b><span>已处理</span></div><div><b>${recovered}</b><span>当场拉回</span></div><div><b>${remain}</b><span>仍需复习</span></div></div><div class="small">当前真正达到“已掌握”的有 ${mastered} 个。这里故意不把“翻完”冒充“掌握”。</div><div class="button-group study-finish-actions"><button class="primary" onclick="studyDayTest()">做本日小测</button><button class="secondary" onclick="studyRestart()">今天 ${a.length} 个重学</button><button class="secondary" onclick="page('planPage');setDay(${homeStudyDay})">查看计划</button></div></div>`
}
function studyRender(anim=''){
  const a=studyWords(),wrap=$('homeStudyCardWrap');studyMeta();if(!wrap)return;
  if(!a.length){wrap.innerHTML='<div class="study-loading"><b>正在准备今天的单词</b><span>词表加载完成后会自动出现。</span></div>';$('homeStudyCounter').textContent='0 / 0';$('homeStudyHint').textContent='';$('homeStudyPrev').disabled=true;$('homeStudyNext').disabled=true;return}
  const st=currentState();if(st.phase==='checkpoint')return renderCheckpoint(st,wrap);if(st.phase==='mini')return renderMini(st,wrap);if(st.phase==='miniDone')return renderMiniDone(st,wrap);if(st.phase==='finished')return renderFinished(st,wrap);
  if(!st.queue.length){finishGroup(st);return studyRender()}
  st.cursor=Math.max(0,Math.min(st.queue.length-1,st.cursor));const e=st.queue[st.cursor],x=studyCurrent(),w=e.w,it=L.map[w]||x,recall=S.studySettings.mode==='recall',showAnswer=!recall||studyReveal,pct=((st.cursor+1)/Math.max(1,st.queue.length)*100).toFixed(1),src=groupSource(st.group),firstDone=Object.keys(st.first).length,g1=groupSource(1).length,g2=groupSource(2).length;
  $('homeStudyCounter').textContent=`第 ${st.group} 组 · ${st.cursor+1}/${st.queue.length}`;$('homeStudyHint').textContent=e.rated?'这张已判断，左滑/下一张继续':recall&&!studyReveal?'先回忆，再点卡片看答案':'点熟悉度后自动下一张';$('homeStudyPrev').disabled=st.cursor===0;$('homeStudyNext').disabled=!e.rated||st.cursor===st.queue.length-1;
  wrap.innerHTML=`<div class="study-flashcard ${anim}" id="studyFlashcard">
    <div class="study-top"><div><div class="study-day">第 ${homeStudyDay} 天 · 第 ${st.group} 组（${firstDone}/${src.length} 首轮已判断）</div><div class="small space-top">${statusPill(w)} ${e.rated?`· 本轮已选 ${['不会','模糊','认识','很熟'][e.g]}`:''}</div></div><div class="voices"><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button class="voice" onclick="event.stopPropagation();speak('${esc(w)}','en-GB')">🇬🇧</button></div></div>
    <div class="study-progress"><span style="width:${pct}%"></span></div>
    <div class="v3-group-strip"><span class="${st.group===1?'active':''}">第一组 ${g1} 词</span><span class="${st.group===2?'active':''}">第二组 ${g2} 词</span></div>
    <div class="study-tools"><button class="study-tool ${S.studySettings.mode==='direct'?'active':''}" onclick="event.stopPropagation();studyToggleMode()">${S.studySettings.mode==='direct'?'释义直显':'先回忆'}</button><button class="study-tool ${S.studySettings.autoSpeak?'active':''}" onclick="event.stopPropagation();studyToggleAuto()">${S.studySettings.autoSpeak?'自动发音开':'自动发音关'}</button><button class="study-tool ${S.studySettings.skipMastered?'active':''}" onclick="event.stopPropagation();studyToggleSkipMastered()">${S.studySettings.skipMastered?'跳过掌握词':'不过滤掌握词'}</button></div>
    <div class="study-word-zone"><div class="study-word">${esc(w)}</div><div class="study-phon">${esc(it?.p||'')}</div></div>
    ${showAnswer?`<div class="study-answer">${studyCoreHTML(w)}<button class="study-more-btn" onclick="event.stopPropagation();studyToggleMore()">${studyMoreOpen?'收起更多':'查看更多高频义项'}</button>${studyMoreOpen?`<div class="study-more-panel">${studyMoreHTML(w)}</div>`:''}</div>`:`<div class="study-recall-cover" onclick="event.stopPropagation();studyToggleReveal()"><b>先在脑子里说出最常用意思</b><span>点这里看答案。不会不会扣分，只是会更快再出现。</span></div>`}
    <div class="study-rate-block"><div class="small">${e.rated?'这一张已经进入动态队列。':'不会会在约 3 张后回来，模糊会在约 8 张后回来。最多当场回炉 3 次。'}</div><div class="study-rate-grid"><button class="rate0" onclick="event.stopPropagation();studyRate(0)" ${e.rated?'disabled':''}><b>不会</b><span>约 3 张后再见</span></button><button class="rate1" onclick="event.stopPropagation();studyRate(1)" ${e.rated?'disabled':''}><b>模糊</b><span>约 8 张后再见</span></button><button class="rate2" onclick="event.stopPropagation();studyRate(2)" ${e.rated?'disabled':''}><b>认识</b><span>退出本轮队列</span></button><button class="rate3" onclick="event.stopPropagation();studyRate(3)" ${e.rated?'disabled':''}><b>很熟</b><span>等待测试验证</span></button></div></div>
    <div class="study-foot"><div class="small">点熟悉度会自动前进 · 右滑可回看上一张</div><button class="secondary" onclick="event.stopPropagation();studyToggleBook('${esc(w)}')">${S.book[w]?'★ 已收藏':'☆ 生词本'}</button></div>
  </div>`;
  const card=$('studyFlashcard');if(card)card.onclick=e=>{if(e.target.closest('button')||Date.now()-(homeStudyTouch.swiped||0)<350)return;if(recall&&!studyReveal)studyToggleReveal()}
}
renderDay=function(){
  if(!L.p.length)return;const a=plan(curDay),done=S.planDone[curDay]||{},n=a.filter(x=>done[x.w]).length;
  $('stage').textContent=stage(curDay);$('daySummary').textContent=`第 ${curDay} 天 · ${a.length} 个新词 · 10 + 10 两组学习`;$('bar').style.width=(a.length?n/a.length*100:0)+'%';$('progressText').textContent=`今日已处理 ${n} / ${a.length}`;
  $('dayWords').innerHTML=a.map((x,i)=>{const it=L.map[x.w]||x,w=x.w,ok=!!done[w],expanded=planExpandedWord===w;return `<div class="plan-word-card ${expanded?'expanded':''}"><div class="row plan-word-row"><div class="row-main" onclick="togglePlanWord('${esc(w)}')"><div class="rowword">${i+1}. ${esc(w)} ${statusPill(w)}</div><div class="small">${esc(it.p||'')} ${expanded?'点击收起':'点击查看意思'}</div></div><div class="row-actions"><button onclick="event.stopPropagation();speak('${esc(w)}','en-US')">🇺🇸</button><button onclick="event.stopPropagation();togglePlanDone(${curDay},'${esc(w)}')">${ok?'撤销今日':'今日已学'}</button></div></div>${expanded?`<div class="plan-inline-detail"><div class="plan-inline-meaning">${esc(mainMeaning(w)||cleanMeaning(it.z||'')||'暂无中文释义')}</div>${CURATED[w]?`<div class="plan-inline-extra">${studyMoreHTML(w)}</div>`:''}<div class="plan-inline-actions"><button onclick="planInlineRate('${esc(w)}',0)">不会</button><button onclick="planInlineRate('${esc(w)}',1)">模糊</button><button onclick="planInlineRate('${esc(w)}',2)">认识</button><button onclick="planInlineRate('${esc(w)}',3)">很熟</button></div></div>`:''}</div>`}).join('')
}
function togglePlanWord(w){planExpandedWord=planExpandedWord===w?'':w;renderDay()}
function planInlineRate(w,g){try{recordSubjective(w,g)}catch(e){try{subjective(w,g)}catch(x){}}renderDay();stats();toast('已记录，会同步进入复习系统')}
function injectStudyV3Style(){if($('studyV3Style'))return;const s=document.createElement('style');s.id='studyV3Style';s.textContent=`.v3-group-strip{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}.v3-group-strip span{padding:7px 9px;border-radius:999px;background:var(--bg);color:var(--muted);font-size:10px;text-align:center;font-weight:850}.v3-group-strip span.active{background:var(--soft);color:var(--blue)}.v3-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.v3-summary-grid>div{padding:11px;border-radius:13px;background:var(--soft);text-align:center}.v3-summary-grid b{display:block;font-size:21px}.v3-summary-grid span{display:block;color:var(--muted);font-size:10px;margin-top:3px}.v3-group-mark{font-size:12px;font-weight:900;color:var(--blue);margin-bottom:7px}.v3-wide{width:100%;margin-top:9px}.v3-summary-note,.v3-remain{margin-top:10px;line-height:1.65}.v3-remain{padding:10px;border-radius:12px;background:var(--soft);font-size:11px;color:var(--muted)}.study-rate-grid button:disabled{opacity:.45}.v3-mini .quiz-options{margin-top:14px}.v3-final .study-finish-actions{margin-top:14px}`;document.head.appendChild(s)}
$('learnNext').onclick=()=>startFlipStudy(curDay);
$('homeStudyPlan').onclick=()=>{page('planPage');setDay(homeStudyDay)};
$('homeStudyToday').onclick=()=>setStudyDay(today(),{resume:true});
$('homeStudyQuiz').onclick=studyDayTest;
$('homeStudyPrev').onclick=()=>studyMove(-1);
$('homeStudyNext').onclick=()=>studyMove(1);
$('homeStudyCardWrap').addEventListener('touchstart',e=>{const t=e.changedTouches?.[0];if(t)homeStudyTouch={x:t.clientX,y:t.clientY,swiped:homeStudyTouch.swiped||0}},{passive:true});
$('homeStudyCardWrap').addEventListener('touchend',e=>{const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-homeStudyTouch.x,dy=t.clientY-homeStudyTouch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){homeStudyTouch.swiped=Date.now();studyMove(dx<0?1:-1)}},{passive:true});
document.addEventListener('keydown',e=>{if(!$('searchPage')||$('searchPage').classList.contains('hidden'))return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight')studyMove(1);if(e.key==='ArrowLeft')studyMove(-1);if(e.key===' '&&S.studySettings.mode==='recall'){e.preventDefault();studyToggleReveal()}});
injectStudyV3Style();
window.ZBZStudy={ready:true,version:'40',setStudyDay,studyRender,studyRate,studyCurrent};window.__ZBZ_READY__=true;
const studyBoot=setInterval(()=>{if(L.p.length){clearInterval(studyBoot);setStudyDay(today(),{resume:true});renderDay()}},120);
setTimeout(()=>clearInterval(studyBoot),15000);