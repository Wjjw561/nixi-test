(()=>{
'use strict';
const BUILD='46';
const FUNCTION_WORDS=new Set(['a','an','the','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','our','their','am','is','are','was','were','be','been','being','do','does','did','have','has','had','can','could','may','might','must','should','will','would','shall','in','on','at','to','from','for','with','of','by','about','under','over','between','and','but','or','because','if','so','although','while','when','what','who','where','when','why','how','which','whose','this','that','these','those']);
const USAGE={
  say:{role:'say 重点是“说出的内容”。',pattern:'say + 内容 / say that + 句子 / say to + 人',examples:[['Say your name.','说出你的名字。'],['He said that he was tired.','他说他累了。']],compare:[['say something','说某件事，重点在内容'],['tell somebody something','告诉某人某件事，tell 后常直接跟“人”']]},
  tell:{role:'tell 重点是“告诉某个人”。',pattern:'tell + 人 + 内容 / tell + 人 + to do',examples:[['Tell me the truth.','告诉我真相。'],['She told me to wait.','她叫我等一下。']],compare:[['say something','说某件事'],['tell somebody something','告诉某人某件事']]},
  speak:{role:'speak 常用于“说某种语言”或较正式地和某人交谈。',pattern:'speak + 语言 / speak to + 人',examples:[['I speak Chinese.','我说中文。'],['Can I speak to Tom?','我能和汤姆说话吗？']],compare:[['speak English','说英语'],['talk about the problem','谈论这个问题']]},
  talk:{role:'talk 强调“交谈、谈论”。',pattern:'talk to/with + 人 / talk about + 事情',examples:[['I talked with my teacher.','我和老师谈了谈。'],['We talked about school.','我们谈到了学校。']],compare:[['talk with somebody','和某人交谈'],['say something','说出某句话或内容']]},
  study:{role:'study 更偏“系统学习某门学科、为考试学习”。',pattern:'study + 学科 / study for + 考试',examples:[['I study English.','我学习英语。'],['I am studying for the exam.','我正在为考试复习。']],compare:[['study English','学习英语这门学科'],['learn English','学会、掌握英语']]},
  learn:{role:'learn 强调“学会、获得知识或技能”。',pattern:'learn + 内容 / learn to + 动词 / learn from + 人或经历',examples:[['I am learning English.','我正在学英语。'],['She learned to drive.','她学会了开车。']],compare:[['learn from him','向他学习'],['study the lesson','学习这节课的内容']]}
};
const word=x=>String(x||'').trim().toLowerCase();
const esc2=x=>typeof esc==='function'?esc(x):String(x||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isFunctionWord(w){
  w=word(w);if(FUNCTION_WORDS.has(w))return true;
  try{return (window.ZBZLexicon?.wordPos?.(w)||[]).some(x=>x?.kind==='function')}catch(e){return false}
}
function specificHTML(w){const d=USAGE[w];if(!d)return'';return `<div class="word-specific-usage" data-word="${esc2(w)}"><div class="structure-title">⭐ ${esc2(w)} 的常用用法</div><div class="structure-role">${esc2(d.role)}</div><div class="structure-pattern"><b>结构</b><span>${esc2(d.pattern)}</span></div><div class="structure-examples">${d.examples.map(x=>`<div><b>${esc2(x[0])}</b><span>${esc2(x[1])}</span></div>`).join('')}</div><div class="structure-compare"><b>对比一下</b>${d.compare.map(x=>`<div><strong>${esc2(x[0])}</strong><span>${esc2(x[1])}</span></div>`).join('')}</div></div>`}
function cleanOne(root,w,mode){
  if(!root||!w)return;w=word(w);const fn=isFunctionWord(w);
  const cards=[...root.querySelectorAll('.structure-card')];
  if(fn){for(const c of cards){const t=c.querySelector('.structure-title');if(t)t.textContent='🧩 句子里的作用'}}
  else cards.forEach(c=>c.remove());
  root.querySelectorAll('.word-specific-usage').forEach(n=>{if(n.dataset.word!==w)n.remove()});
  if(fn||!USAGE[w]||root.querySelector(`.word-specific-usage[data-word="${w}"]`))return;
  const html=specificHTML(w);if(!html)return;
  if(mode==='study'){
    const a=root.querySelector('.study-answer');const core=a?.querySelector('.study-core-block');
    if(core)core.insertAdjacentHTML('afterend',html);
  }else if(mode==='search'){
    const card=root.querySelector('.card')||root;const top=card.querySelector('.wordtop');
    if(top)top.insertAdjacentHTML('afterend',html);
  }else if(mode==='category'){
    const meaning=root.querySelector('.category-detail-meaning');
    if(meaning)meaning.insertAdjacentHTML('afterend',html);
  }
}
function cleanupVocabularyUI(){
  try{const w=word(typeof studyCurrent==='function'?studyCurrent()?.w:'');cleanOne(document.getElementById('homeStudyCardWrap'),w,'study')}catch(e){}
  try{const w=word(document.getElementById('q')?.value||window.currentWord||'');cleanOne(document.getElementById('result'),w,'search')}catch(e){}
  try{const card=document.querySelector('.category-detail-card'),w=word(card?.querySelector('.category-detail-word')?.textContent||'');cleanOne(card,w,'category')}catch(e){}
}
function dateKey(ts){const d=new Date(Number(ts)||Date.now());return Number.isNaN(d.getTime())?new Date().toLocaleDateString('en-CA'):d.toLocaleDateString('en-CA')}
function todayKeySafe(){try{return todayKey()}catch(e){return new Date().toLocaleDateString('en-CA')}}
function planDaySafe(){try{return today()}catch(e){return 1}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function ensureBuckets(){S.dailyWordEvidence=S.dailyWordEvidence||{};S.planWordEvidence=S.planWordEvidence||{};S.planDone=S.planDone||{};S.words=S.words||{}}
function markEvidence(w,g,ts=Date.now(),k=todayKeySafe()){
  w=word(w);if(!w)return;ensureBuckets();const b=S.dailyWordEvidence[k]||(S.dailyWordEvidence[k]={}),e=b[w]||(b[w]={});e.ratedAt=Math.max(Number(e.ratedAt)||0,Number(ts)||Date.now());if(g!==undefined&&g!==null)e.grade=Number(g);e.lastAction=e.lastAction||'rating';
  let pd=0;try{pd=L?.day?.[w]||0}catch(e2){}if(pd){const p=S.planWordEvidence[pd]||(S.planWordEvidence[pd]={}),x=p[w]||(p[w]={});x.ratedAt=Math.max(Number(x.ratedAt)||0,Number(ts)||Date.now());if(g!==undefined&&g!==null)x.grade=Number(g);x.learnedOn=x.learnedOn||k;S.planDone[pd]=S.planDone[pd]||{};S.planDone[pd][w]=1}
}
function migrateLearnedEvidence(){
  ensureBuckets();let changed=false;const now=Date.now(),todayK=todayKeySafe(),todayD=planDaySafe();
  for(const [w,r] of Object.entries(S.words||{})){
    if(!r?.seen||r.self===null||r.self===undefined)continue;const ts=Number(r.lastSeen||r.firstSeen||now),k=dateKey(ts),before=!!S.dailyWordEvidence?.[k]?.[w]?.ratedAt;markEvidence(w,r.self,ts,k);if(!before)changed=true;
  }
  for(const [d,obj] of Object.entries(S.planDone||{}))for(const w of Object.keys(obj||{})){
    const p=S.planWordEvidence[d]||(S.planWordEvidence[d]={}),x=p[w]||(p[w]={});if(!x.ratedAt){x.ratedAt=Number(S.words?.[w]?.lastSeen||now);x.grade=S.words?.[w]?.self??1;x.learnedOn=x.learnedOn||'';changed=true}
    if(Number(d)===Number(todayD)&&!S.dailyWordEvidence?.[todayK]?.[w]?.ratedAt){markEvidence(w,S.words?.[w]?.self??1,Number(S.words?.[w]?.lastSeen||now),todayK);changed=true}
  }
  const st=S.studyV3?.[todayD];if(st){const rated=new Set([...Object.keys(st.first||{}),...Object.keys(st.last||{})]);for(const w of rated)if(!S.dailyWordEvidence?.[todayK]?.[w]?.ratedAt){markEvidence(w,st.last?.[w]??st.first?.[w]??1,now,todayK);changed=true}}
  if(changed)persist();return changed
}
function refreshPortableSoon(){setTimeout(()=>{try{if(typeof window.portableScope==='function')window.portableScope(S.routineSettings?.scope||'all')}catch(e){}},60)}
function wrapRating(name,getWord){
  try{const old=window[name]||eval(name);if(typeof old!=='function'||old.__v46)return;const wrapped=function(...args){const w=word(getWord(...args));const out=old.apply(this,args);if(w){const g=args[name==='studyRate'?0:1]??1;markEvidence(w,g,Date.now(),todayKeySafe());persist();refreshPortableSoon()}cleanupVocabularyUI();return out};wrapped.__v46=true;if(window[name])window[name]=wrapped;try{eval(`${name}=wrapped`)}catch(e){} }catch(e){}
}
function installRatingGuards(){
  wrapRating('studyRate',()=>{try{return studyCurrent()?.w||''}catch(e){return''}});
  wrapRating('subjective',(w)=>w);
  wrapRating('planInlineRate',(w)=>w);
  if(typeof window.categoryRate==='function'&&!window.categoryRate.__v46){const old=window.categoryRate;const f=function(w,g){const out=old(w,g);markEvidence(w,g,Date.now(),todayKeySafe());persist();refreshPortableSoon();cleanupVocabularyUI();return out};f.__v46=true;window.categoryRate=f}
}
const style=document.createElement('style');style.id='integrityV46Style';style.textContent=`.word-specific-usage{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,var(--card),var(--soft))}.word-specific-usage .structure-title{font-size:12px;color:var(--blue);font-weight:900}.word-specific-usage .structure-role{font-size:16px;font-weight:900;line-height:1.5;margin-top:5px}.word-specific-usage .structure-pattern{display:flex;gap:8px;margin-top:9px;font-size:12px}.word-specific-usage .structure-pattern span{color:var(--muted)}.word-specific-usage .structure-examples{display:grid;gap:6px;margin-top:10px}.word-specific-usage .structure-examples>div,.word-specific-usage .structure-compare>div{padding:8px 9px;background:var(--card);border-radius:10px;border:1px solid var(--line)}.word-specific-usage .structure-examples b,.word-specific-usage .structure-compare strong{display:block;font-size:13px}.word-specific-usage .structure-examples span,.word-specific-usage .structure-compare span{display:block;color:var(--muted);font-size:11px;margin-top:2px;line-height:1.5}.word-specific-usage .structure-compare{margin-top:10px}.word-specific-usage .structure-compare>b{display:block;font-size:12px;margin-bottom:6px}.word-specific-usage .structure-compare>div{margin-top:5px}`;document.head.appendChild(style);
migrateLearnedEvidence();installRatingGuards();cleanupVocabularyUI();refreshPortableSoon();
let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;setTimeout(()=>{cleanupVocabularyUI();busy=false},0)}).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{const changed=migrateLearnedEvidence();installRatingGuards();cleanupVocabularyUI();if(changed)refreshPortableSoon()},1800);
window.ZBZIntegrity={ready:true,version:BUILD,migrateLearnedEvidence,cleanupVocabularyUI};
})();