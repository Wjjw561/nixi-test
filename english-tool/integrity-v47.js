(()=>{
'use strict';
const BUILD='47';
const APP_VERSION='v3.8.4';
const FUNCTION_WORDS=new Set(['a','an','the','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','our','their','am','is','are','was','were','be','been','being','do','does','did','have','has','had','can','could','may','might','must','should','will','would','shall','in','on','at','to','from','for','with','of','by','about','under','over','between','and','but','or','because','if','so','although','while','when','what','who','where','why','how','which','whose','this','that','these','those']);
const USAGE={
  say:{role:'say 的重点是“说出的内容”。',pattern:'say + 内容 / say that + 句子 / say to + 人',examples:[['Say your name.','说出你的名字。'],['He said that he was tired.','他说他累了。']],compare:[['say something','说某件事，重点在内容'],['tell somebody something','告诉某人某件事，tell 后常直接跟“人”']]},
  tell:{role:'tell 的重点是“把信息告诉某个人”。',pattern:'tell + 人 + 内容 / tell + 人 + to do',examples:[['Tell me the truth.','告诉我真相。'],['She told me to wait.','她叫我等一下。']],compare:[['say something','说某件事'],['tell somebody something','告诉某人某件事']]},
  speak:{role:'speak 常用于“说某种语言”或较正式地和某人说话。',pattern:'speak + 语言 / speak to + 人',examples:[['I speak Chinese.','我说中文。'],['Can I speak to Tom?','我能和汤姆说话吗？']],compare:[['speak English','说英语'],['talk about the problem','谈论这个问题']]},
  talk:{role:'talk 强调“交谈、谈论”。',pattern:'talk to/with + 人 / talk about + 事情',examples:[['I talked with my teacher.','我和老师谈了谈。'],['We talked about school.','我们谈到了学校。']],compare:[['talk with somebody','和某人交谈'],['say something','说出某句话或内容']]},
  study:{role:'study 更偏“系统学习某门学科、为考试学习”。',pattern:'study + 学科 / study for + 考试',examples:[['I study English.','我学习英语。'],['I am studying for the exam.','我正在为考试复习。']],compare:[['study English','学习英语这门学科'],['learn English','学会、掌握英语']]},
  learn:{role:'learn 强调“学会、获得知识或技能”。',pattern:'learn + 内容 / learn to + 动词 / learn from + 人或经历',examples:[['I am learning English.','我正在学英语。'],['She learned to drive.','她学会了开车。']],compare:[['learn from him','向他学习'],['study the lesson','学习这节课的内容']]}
};
const word=x=>String(x||'').trim().toLowerCase();
const escapeHTML=x=>typeof esc==='function'?esc(x):String(x||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function todayK(){try{return todayKey()}catch(e){return new Date().toLocaleDateString('en-CA')}}
function dateK(ts){const d=new Date(Number(ts)||0);return Number.isNaN(d.getTime())||!Number(ts)?'':d.toLocaleDateString('en-CA')}
function isFunctionWord(w){w=word(w);if(FUNCTION_WORDS.has(w))return true;try{return (window.ZBZLexicon?.wordPos?.(w)||[]).some(x=>x?.kind==='function')}catch(e){return false}}
function usageHTML(w){const d=USAGE[w];if(!d)return'';return `<div class="word-specific-usage" data-word="${escapeHTML(w)}"><div class="structure-title">⭐ ${escapeHTML(w)} 怎么用</div><div class="structure-role">${escapeHTML(d.role)}</div><div class="structure-pattern"><b>常用结构</b><span>${escapeHTML(d.pattern)}</span></div><div class="structure-examples">${d.examples.map(x=>`<div><b>${escapeHTML(x[0])}</b><span>${escapeHTML(x[1])}</span></div>`).join('')}</div><div class="structure-compare"><b>别混淆</b>${d.compare.map(x=>`<div><strong>${escapeHTML(x[0])}</strong><span>${escapeHTML(x[1])}</span></div>`).join('')}</div></div>`}
function cleanRoot(root,w,mode){
  if(!root||!w)return;w=word(w);const keep=isFunctionWord(w);
  for(const card of [...root.querySelectorAll('.structure-card')]){
    if(keep){const t=card.querySelector('.structure-title');if(t)t.textContent='🧩 句子里的作用'}else card.remove();
  }
  for(const n of [...root.querySelectorAll('.word-specific-usage')])if(n.dataset.word!==w)n.remove();
  if(keep||!USAGE[w]||root.querySelector(`.word-specific-usage[data-word="${w}"]`))return;
  const html=usageHTML(w);if(!html)return;
  if(mode==='study'){
    const answer=root.querySelector('.study-answer'),anchor=answer?.querySelector('.study-core-block');if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }else if(mode==='search'){
    const card=root.querySelector('.card')||root,anchor=card.querySelector('.wordtop');if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }else if(mode==='category'){
    const anchor=root.querySelector('.category-detail-meaning');if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }
}
function cleanSemantics(){
  try{cleanRoot(document.getElementById('homeStudyCardWrap'),word(typeof studyCurrent==='function'?studyCurrent()?.w:''),'study')}catch(e){}
  try{cleanRoot(document.getElementById('result'),word(document.getElementById('q')?.value||''),'search')}catch(e){}
  try{const c=document.querySelector('.category-detail-card');cleanRoot(c,word(c?.querySelector('.category-detail-word')?.textContent||''),'category')}catch(e){}
}
function ensureState(){S.words=S.words||{};S.dailyWordEvidence=S.dailyWordEvidence||{};S.planWordEvidence=S.planWordEvidence||{};S.planDone=S.planDone||{};S.studyV3=S.studyV3||{}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function explicitPlanWords(){const out=new Set();for(const bucket of Object.values(S.planDone||{}))for(const w of Object.keys(bucket||{}))out.add(word(w));return out}
function syncLearnedEvidence(){
  ensureState();let changed=false;const tk=todayK(),daily=S.dailyWordEvidence[tk]||(S.dailyWordEvidence[tk]={}),legacy=S.planWordEvidence.__audioLegacy||(S.planWordEvidence.__audioLegacy={}),planWords=explicitPlanWords();
  for(const [raw,r] of Object.entries(S.words||{})){
    const w=word(raw);if(!w||!r?.seen)continue;
    const explicit=r.self!==null&&r.self!==undefined||planWords.has(w)||(Number(r.correct||0)+Number(r.wrong||0)>0);if(!explicit)continue;
    const ts=Number(r.lastSeen||r.firstSeen||Date.now());
    if(!legacy[w]?.ratedAt){legacy[w]={ratedAt:ts,grade:r.self??1,learnedOn:dateK(ts)||''};changed=true}
    if(dateK(ts)===tk&&!daily[w]?.ratedAt){daily[w]={...(daily[w]||{}),ratedAt:ts,grade:r.self??1,lastAction:'rating'};changed=true}
  }
  for(const w of planWords){if(!w)continue;const r=S.words?.[w]||{},ts=Number(r.lastSeen||r.firstSeen||Date.now());if(!legacy[w]?.ratedAt){legacy[w]={ratedAt:ts,grade:r.self??1,learnedOn:dateK(ts)||''};changed=true}}
  let td=0;try{td=today()}catch(e){}
  const st=S.studyV3?.[td];if(st){const rated=new Set([...Object.keys(st.first||{}),...Object.keys(st.last||{}),...(st.queue||[]).filter(x=>x?.rated).map(x=>word(x.w))]);for(const w of rated){if(!w)continue;const g=st.last?.[w]??st.first?.[w]??S.words?.[w]?.self??1;if(!daily[w]?.ratedAt){daily[w]={...(daily[w]||{}),ratedAt:Date.now(),grade:Number(g),lastAction:'rating'};changed=true}if(!legacy[w]?.ratedAt){legacy[w]={ratedAt:Date.now(),grade:Number(g),learnedOn:tk};changed=true}}}
  if(changed)persist();return changed
}
function refreshAudio(){try{if(typeof window.portableScope==='function')window.portableScope(S.routineSettings?.scope||'all')}catch(e){}}
const style=document.createElement('style');style.id='integrityV47Style';style.textContent=`.word-specific-usage{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,var(--card),var(--soft))}.word-specific-usage .structure-title{font-size:12px;color:var(--blue);font-weight:900}.word-specific-usage .structure-role{font-size:16px;font-weight:900;line-height:1.5;margin-top:5px}.word-specific-usage .structure-pattern{display:flex;gap:8px;margin-top:9px;font-size:12px}.word-specific-usage .structure-pattern span{color:var(--muted)}.word-specific-usage .structure-examples{display:grid;gap:6px;margin-top:10px}.word-specific-usage .structure-examples>div,.word-specific-usage .structure-compare>div{padding:8px 9px;background:var(--card);border-radius:10px;border:1px solid var(--line)}.word-specific-usage .structure-examples b,.word-specific-usage .structure-compare strong{display:block;font-size:13px}.word-specific-usage .structure-examples span,.word-specific-usage .structure-compare span{display:block;color:var(--muted);font-size:11px;margin-top:2px;line-height:1.5}.word-specific-usage .structure-compare{margin-top:10px}.word-specific-usage .structure-compare>b{display:block;font-size:12px;margin-bottom:6px}.word-specific-usage .structure-compare>div{margin-top:5px}`;document.head.appendChild(style);
let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;setTimeout(()=>{cleanSemantics();busy=false},0)}).observe(document.body,{childList:true,subtree:true});
cleanSemantics();if(syncLearnedEvidence())setTimeout(refreshAudio,80);else setTimeout(refreshAudio,300);
setInterval(()=>{const changed=syncLearnedEvidence();cleanSemantics();if(changed)refreshAudio()},1200);
const tag=document.querySelector('.tag');if(tag)tag.textContent=APP_VERSION;
window.ZBZIntegrity={ready:true,version:BUILD,syncLearnedEvidence,cleanSemantics};window.__ZBZ_READY__=true;
})();