(()=>{
const DAY_MS=86400000;
const CONCEPTS={
  articles:{label:'冠词 a / an / the',short:'冠词',words:['a','an','the'],tip:'重点判断：不特定用 a/an，特定或已提到用 the。'},
  be:{label:'be 动词 am / is / are',short:'be 动词',words:['am','is','are'],tip:'先看主语：I am；he/she/it is；you/we/they are。'},
  do:{label:'do / does / did',short:'助动词',words:['do','does','did'],tip:'实义动词的疑问和否定常需要 do；第三人称单数用 does，过去时用 did。'},
  prepositions:{label:'介词 in / on / at',short:'介词',words:['in','on','at'],tip:'in 看范围或里面，on 看表面或具体某天，at 看点位或具体时刻。'},
  demonstratives:{label:'this / that / these / those',short:'指示词',words:['this','that','these','those'],tip:'先判断远近，再判断单复数：近 this/these，远 that/those。'},
  pronouns:{label:'人称代词主格 / 宾格 / 所有格',short:'代词',words:['i','me','my','he','him','his','she','her','we','us','our','they','them','their'],tip:'句子前面做主语用 I/he/we/they；动词后做宾语用 me/him/us/them；名词前表示“谁的”用 my/his/our/their。'},
  modals:{label:'情态动词 can / should / must',short:'情态动词',words:['can','should','must'],tip:'情态动词后面直接接动词原形；can 偏“能”，should 偏“应该”，must 偏“必须”。'},
  questions:{label:'疑问词 what / where / when / why / how',short:'疑问词',words:['what','where','when','why','how'],tip:'先判断题目究竟在问什么信息：事物、地点、时间、原因还是方式。'},
  conjunctions:{label:'连词 and / but / because / if',short:'连词',words:['and','but','because','if'],tip:'并列 and，转折 but，原因 because，条件 if。'}
};
const WORD_TO_CONCEPT={};Object.entries(CONCEPTS).forEach(([k,v])=>v.words.forEach(w=>WORD_TO_CONCEPT[w]=k));
S.concepts=S.concepts||{};

function conceptRec(key){
  if(!S.concepts[key])S.concepts[key]={attempts:0,correct:0,wrong:0,streak:0,last:0,lastWrong:0,due:0,confusions:{},words:{}};
  const r=S.concepts[key];r.confusions=r.confusions||{};r.words=r.words||{};return r;
}
function conceptKeyFor(w){return WORD_TO_CONCEPT[String(w||'').toLowerCase()]||''}
function accuracy(r){return r.attempts?Math.round((r.correct||0)/r.attempts*100):0}
function weakness(r){const acc=r.attempts?(r.correct||0)/r.attempts:1;return (r.wrong||0)*2+(1-acc)*4-(r.streak||0)*.7+(r.lastWrong&&Date.now()-r.lastWrong<DAY_MS?1:0)}
function activeConcepts(){
  return Object.entries(S.concepts).filter(([k,r])=>CONCEPTS[k]&&(r.wrong||0)>0&&((r.streak||0)<3||accuracy(r)<80)).sort((a,b)=>weakness(b[1])-weakness(a[1])||(b[1].lastWrong||0)-(a[1].lastWrong||0));
}
function dueConcepts(){const now=Date.now();return activeConcepts().filter(([,r])=>(r.due||0)<=now)}
function confusionText(r){const a=Object.entries(r.confusions||{}).sort((x,y)=>y[1]-x[1])[0];return a?`最常误选：${a[0]}`:''}
function recordConcept(x,ok,selected){
  if(!x||x.mode!=='context')return;const key=conceptKeyFor(x.w);if(!key)return;
  const r=conceptRec(key),now=Date.now(),w=String(x.w||'').toLowerCase();r.attempts++;r.last=now;r.words[w]=r.words[w]||{correct:0,wrong:0};
  if(ok){r.correct++;r.streak=(r.streak||0)+1;r.words[w].correct++;const d=[1,3,7,14][Math.min(r.streak-1,3)];r.due=now+d*DAY_MS}
  else{r.wrong++;r.streak=0;r.lastWrong=now;r.words[w].wrong++;r.due=now+10*60*1000;const s=String(selected||'').toLowerCase();if(s&&s!==String(x.answer||'').toLowerCase())r.confusions[s]=(r.confusions[s]||0)+1}
  save();
}

const baseAnswer=typeof answerQuestion==='function'?answerQuestion:null;
if(baseAnswer){answerQuestion=function(btn,x){const selected=btn?.dataset?.answer||'';const ok=selected===x.answer;const r=baseAnswer(btn,x);recordConcept(x,ok,selected);return r}}

function injectReviewStyle(){
  if(document.getElementById('reviewV28Style'))return;const s=document.createElement('style');s.id='reviewV28Style';s.textContent=`
  .concept-review{margin:12px 0 16px;padding:13px;border:1px solid var(--line);border-radius:16px;background:var(--soft)}.concept-review-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.concept-review-head b{font-size:14px}.concept-review-head span{font-size:10px;color:var(--muted)}.concept-review-list{display:grid;gap:8px;margin-top:10px}.concept-review-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px;background:var(--card);border:1px solid var(--line);border-radius:13px}.concept-review-item strong{display:block;font-size:13px}.concept-review-item small{display:block;color:var(--muted);font-size:10px;line-height:1.5;margin-top:3px}.concept-review-item button{border:0;border-radius:10px;padding:9px 10px;background:var(--blue);color:white;font-weight:850}.concept-review-item.due{box-shadow:inset 3px 0 0 var(--blue)}.concept-review-empty{font-size:11px;color:var(--muted);line-height:1.6}.concept-chip-row{display:flex;gap:7px;overflow:auto;margin-top:10px}.concept-chip{white-space:nowrap;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:8px 10px;font-size:11px;color:var(--text)}
  @media(max-width:620px){.concept-review-item{grid-template-columns:1fr}.concept-review-item button{width:100%}}
  `;document.head.appendChild(s)
}
function renderConceptPanel(){
  const list=$('reviewList');if(!list)return;let panel=$('conceptReviewPanel');if(!panel){panel=document.createElement('div');panel.id='conceptReviewPanel';panel.className='concept-review';list.parentNode.insertBefore(panel,list)}
  const a=activeConcepts().slice(0,5),due=dueConcepts();
  if(!a.length){panel.innerHTML=`<div class="concept-review-head"><div><b>薄弱结构</b><span>句子题答错后，这里会自动出现专项复习。</span></div></div><div class="concept-review-empty">目前还没有明显的结构弱项。先正常测试，系统不会凭空怀疑你。</div>`}
  else panel.innerHTML=`<div class="concept-review-head"><div><b>薄弱结构</b><span>根据你真正答错的句子生成，不是机械重复单词。</span></div><span>${due.length?due.length+' 项到期':'持续跟踪中'}</span></div><div class="concept-review-list">${a.map(([k,r])=>{const d=CONCEPTS[k],isDue=(r.due||0)<=Date.now();return`<div class="concept-review-item ${isDue?'due':''}"><div><strong>${esc(d.label)}</strong><small>句子正确率 ${accuracy(r)}% · 错 ${r.wrong||0} 次${confusionText(r)?' · '+esc(confusionText(r)):''}</small><small>${esc(d.tip)}</small></div><button onclick="startConceptDrill('${k}')">${isDue?'现在专项练':'再练一组'}</button></div>`}).join('')}</div>`;
  const hasWord=typeof dueWords==='function'&&dueWords().length>0;$('startReview').disabled=!(hasWord||a.length);
}

window.startConceptDrill=function(key){
  const d=CONCEPTS[key];if(!d)return;const pool=d.words.filter(Boolean),words=[];while(words.length<6){const round=typeof shuffle==='function'?shuffle(pool):[...pool];words.push(...round)}
  quizSession={words:words.slice(0,6),i:0,score:0,title:d.label+' 专项',forceContext:true,contextRight:0,contextTotal:0,lexicalRight:0,lexicalTotal:0,conceptKey:key};page('testPage');nextQuestion();
};
function smartReview(){const a=dueConcepts();if(a.length)return startConceptDrill(a[0][0]);const weak=activeConcepts();if(weak.length)return startConceptDrill(weak[0][0]);if(typeof reviewTest==='function')reviewTest()}

const baseRenderReview=typeof renderReview==='function'?renderReview:null;
if(baseRenderReview){renderReview=function(...a){const r=baseRenderReview(...a);renderConceptPanel();return r}}
const startBtn=$('startReview');if(startBtn)startBtn.onclick=smartReview;

const baseRenderHome=typeof renderTestHome==='function'?renderTestHome:null;
if(baseRenderHome){renderTestHome=function(...a){const r=baseRenderHome(...a),weak=activeConcepts().slice(0,4);if(weak.length){const card=$('testCard');card.insertAdjacentHTML('beforeend',`<div class="title space-top">根据错题生成的专项</div><div class="concept-chip-row">${weak.map(([k,v])=>`<button class="concept-chip" onclick="startConceptDrill('${k}')">${esc(CONCEPTS[k].short)} · ${accuracy(v)}%</button>`).join('')}</div>`)}return r}}

injectReviewStyle();renderConceptPanel();const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.7';window.__ZBZ_READY__=true;
})();