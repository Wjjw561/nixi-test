(()=>{
'use strict';
const BUILD='48',APP_VERSION='v3.9.0';
const W=x=>String(x||'').trim().toLowerCase();
const E=x=>typeof esc==='function'?esc(x):String(x||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// 这一层只放人工校对过、适合当前学习阶段的“主干义”。
// 原始公开词表继续作为词库来源，但不再被当作绝对正确的学习解释。
const QA={
  say:{z:'v. 说；说出；表示（信息）',core:'说；说出',phon:'/seɪ/'},
  tell:{z:'v. 告诉；告知；讲述',core:'告诉；告知'},
  speak:{z:'v. 说话；讲（某种语言）',core:'说话；讲（某种语言）'},
  talk:{z:'v. 交谈；谈论',core:'交谈；谈论'},
  study:{z:'v. 学习（课程、学科）；研究',core:'学习；研究'},
  learn:{z:'v. 学习；学会；得知',core:'学习；学会'},
  be:{z:'v. 是；处于；成为（be 动词原形）',core:'是；处于；成为'},
  am:{z:'v. be 的现在时形式，和 I 搭配',core:'是；处于（I am）'},
  is:{z:'v. be 的现在时形式，常和 he/she/it 或单数主语搭配',core:'是；处于（单数）'},
  are:{z:'v. be 的现在时形式，和 you/we/they 或复数主语搭配',core:'是；处于（you/we/they、复数）'},
  was:{z:'v. be 的过去式，常和 I/he/she/it 或单数主语搭配',core:'be 的过去式（单数）'},
  were:{z:'v. be 的过去式，和 you/we/they 或复数主语搭配',core:'be 的过去式（you/we/they、复数）',phon:'UK /wɜː(r)/ · US /wɝː/'},
  been:{z:'v. be 的过去分词，常和 have/has/had 连用',core:'be 的过去分词'},
  being:{z:'v. be 的 -ing 形式',core:'be 的 -ing 形式'},
  a:{z:'art. 一个；某个（用于辅音音素开头的单数可数名词前）',core:'一个；某个'},
  an:{z:'art. 一个；某个（用于元音音素开头的单数可数名词前）',core:'一个；某个'},
  the:{z:'art. 特指某个已知、已提到或明确的人/事物',core:'特指某个明确的人或事物'},
  do:{z:'v./aux. 做；也可帮助构成一般现在时的疑问和否定',core:'做；助动词'},
  does:{z:'aux. do 的第三人称单数形式',core:'do 的第三人称单数形式'},
  did:{z:'v./aux. do 的过去式；也用于一般过去时疑问和否定',core:'do 的过去式；助动词'},
  can:{z:'modal. 能；会；可以',core:'能；会；可以'},
  could:{z:'modal. can 的过去式；也可表示较委婉的“能否/可以”',core:'能；可以；可能'},
  may:{z:'modal. 可以；可能',core:'可以；可能'},
  might:{z:'modal. 可能；也可作 may 的过去式',core:'可能'},
  must:{z:'modal. 必须；一定',core:'必须；一定'},
  should:{z:'modal. 应该；应当',core:'应该'},
  will:{z:'modal. 将；会；愿意',core:'将；会；愿意'},
  would:{z:'modal. will 的过去式；也常用于较委婉表达或假设',core:'会；愿意；将会（过去/假设）'},
  in:{z:'prep. 在……里面；在较大的地点或时间范围内',core:'在……里面；在……范围内'},
  on:{z:'prep. 在……上面；在某一天',core:'在……上面；在某一天'},
  at:{z:'prep. 在某个点；在具体时刻',core:'在某个点；在具体时刻'},
  this:{z:'pron./det. 这个；这（近处、单数）',core:'这个；这'},
  that:{z:'pron./det. 那个；那（较远、单数）',core:'那个；那'},
  these:{z:'pron./det. 这些（近处、复数）',core:'这些'},
  those:{z:'pron./det. 那些（较远、复数）',core:'那些'},
  i:{z:'pron. 我（主格）',core:'我（主格）'},
  you:{z:'pron. 你；你们（主格或宾格）',core:'你；你们'},
  he:{z:'pron. 他（主格）',core:'他（主格）'},
  she:{z:'pron. 她（主格）',core:'她（主格）'},
  it:{z:'pron. 它；这件事（主格或宾格）',core:'它；这件事'},
  we:{z:'pron. 我们（主格）',core:'我们（主格）'},
  they:{z:'pron. 他们；她们；它们（主格）',core:'他们/她们/它们（主格）'},
  me:{z:'pron. 我（宾格）',core:'我（宾格）'},
  him:{z:'pron. 他（宾格）',core:'他（宾格）'},
  her:{z:'pron./det. 她（宾格）；她的',core:'她；她的'},
  us:{z:'pron. 我们（宾格）',core:'我们（宾格）'},
  them:{z:'pron. 他们；她们；它们（宾格）',core:'他们/她们/它们（宾格）'},
  my:{z:'det. 我的',core:'我的'},
  your:{z:'det. 你的；你们的',core:'你的；你们的'},
  his:{z:'det./pron. 他的',core:'他的'},
  our:{z:'det. 我们的',core:'我们的'},
  their:{z:'det. 他们的；她们的；它们的',core:'他们/她们/它们的'}
};

const SAFE_EXISTING_STRUCTURE=new Set(['a','an','the','am','is','are','do','does','did','can','should','must','in','on','at','this','that','these','those','i','he','she','it']);
const CUSTOM={
  was:{title:'was 怎么用',role:'was 是 be 的一般过去时形式，常和 I / he / she / it 或单数主语搭配。',pattern:'I/he/she/it/单数主语 + was + 名词 / 形容词 / 地点',examples:[['I was tired.','我当时很累。'],['She was at school.','她当时在学校。']]},
  were:{title:'were 怎么用',role:'were 是 be 的一般过去时形式，和 you / we / they 或复数主语搭配。',pattern:'you/we/they/复数主语 + were + 名词 / 形容词 / 地点',examples:[['We were tired.','我们当时很累。'],['They were at school.','他们当时在学校。']],note:'If I were you... 是常见的假设表达，先把整句理解成“如果我是你”。'},
  be:{title:'be 怎么用',role:'be 是 am / is / are / was / were 的原形。',pattern:'情态动词 + be；to + be',examples:[['You should be careful.','你应该小心。'],['I want to be a teacher.','我想成为一名老师。']]},
  been:{title:'been 怎么用',role:'been 是 be 的过去分词，最常见于完成时。',pattern:'have/has/had + been',examples:[['I have been busy.','我一直很忙。'],['She has been here before.','她以前来过这里。']]},
  being:{title:'being 怎么用',role:'being 是 be 的 -ing 形式。基础阶段先认识，不必单独死背很多复杂结构。',pattern:'be + being ... / being + 形容词',examples:[['He is being careful.','他现在表现得很小心。']]}
};

function customHTML(w){const d=CUSTOM[w];if(!d)return'';return `<div class="qa-structure-card"><div class="qa-kicker">🧩 ${E(d.title)}</div><div class="qa-role">${E(d.role)}</div><div class="qa-pattern"><b>常用结构</b><span>${E(d.pattern)}</span></div><div class="qa-examples">${d.examples.map(x=>`<div><b>${E(x[0])}</b><span>${E(x[1])}</span></div>`).join('')}</div>${d.note?`<div class="qa-note">💡 ${E(d.note)}</div>`:''}</div>`}

let mainWrapped=false;
function installMeaningOverride(){
  if(mainWrapped||typeof mainMeaning!=='function')return;
  const old=mainMeaning;
  const f=function(raw){const w=W(raw);return QA[w]?.core||old(raw)};f.__qa48=true;
  try{mainMeaning=f;mainWrapped=true}catch(e){}
}
function applyLexicon(){
  try{
    if(typeof L==='undefined'||!L?.map)return;
    for(const [w,q] of Object.entries(QA)){
      if(!L.map[w])continue;
      L.map[w].z=q.z;
      if(q.phon)L.map[w].p=q.phon;
    }
    if(typeof CURATED!=='undefined'&&CURATED.pitch?.must?.[0]){
      CURATED.pitch.must[0][0]='投（球）';
      CURATED.pitch.tip='先把 pitch 和“投球 / 球场（英式）/ 音高”绑定；sales pitch 再认识。';
    }
  }catch(e){}
}
function wordFrom(root,mode){
  if(mode==='study'){try{return W(studyCurrent()?.w)}catch(e){return''}}
  if(mode==='search')return W(document.getElementById('q')?.value||'');
  if(mode==='category')return W(root?.querySelector('.category-detail-word')?.textContent||'');
  return'';
}
function addCustom(root,w,mode){
  if(!CUSTOM[w]||root.querySelector('.qa-structure-card'))return;
  const html=customHTML(w);if(!html)return;
  if(mode==='study'){
    const a=root.querySelector('.study-answer'),anchor=a?.querySelector('.study-core-block')||a?.firstElementChild;if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }else if(mode==='search'){
    const card=root.querySelector('.card')||root,anchor=card.querySelector('.wordtop');if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }else if(mode==='category'){
    const anchor=root.querySelector('.category-detail-meaning');if(anchor)anchor.insertAdjacentHTML('afterend',html);
  }
}
function qualityBadge(root,w,mode){
  if(!QA[w]||root.querySelector('.qa-badge'))return;
  let anchor=null;
  if(mode==='study')anchor=root.querySelector('.study-word-zone');
  else if(mode==='search')anchor=root.querySelector('.wordtop');
  else if(mode==='category')anchor=root.querySelector('.category-detail-top');
  if(anchor)anchor.insertAdjacentHTML('afterend',`<div class="qa-badge">✓ 已校对主干义</div>`)
}
function cleanOne(root,mode){
  if(!root)return;const w=wordFrom(root,mode);if(!w)return;
  // 旧模块对普通词会套“名词/动词是什么”这种模板。没有逐词校对就不显示。
  for(const c of [...root.querySelectorAll('.structure-card')])if(!SAFE_EXISTING_STRUCTURE.has(w))c.remove();
  root.querySelectorAll('.qa-structure-card,.qa-badge').forEach(n=>{if(n.dataset?.word&&n.dataset.word!==w)n.remove()});
  addCustom(root,w,mode);qualityBadge(root,w,mode);
  // 把容易被误解为“权威核心义”的标签降级为参考释义。
  for(const t of root.querySelectorAll('.title,.sense-title,.study-more-tag')){
    const s=(t.textContent||'').trim();if(s==='计划词表释义')t.textContent='词表参考释义';if(s==='词表释义')t.textContent='词表参考';
  }
}
function cleanAll(){cleanOne(document.getElementById('homeStudyCardWrap'),'study');cleanOne(document.getElementById('result'),'search');cleanOne(document.querySelector('.category-detail-card'),'category')}
function style(){if(document.getElementById('lexicalQA48Style'))return;const s=document.createElement('style');s.id='lexicalQA48Style';s.textContent=`.qa-badge{display:inline-flex;margin:8px 0 0;padding:4px 8px;border-radius:999px;background:#e5f5ea;color:#27764a;font-size:10px;font-weight:900}.qa-structure-card{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,var(--card),var(--soft))}.qa-kicker{font-size:12px;color:var(--blue);font-weight:900}.qa-role{font-size:16px;font-weight:900;line-height:1.55;margin-top:6px}.qa-pattern{display:flex;gap:8px;margin-top:10px;font-size:12px}.qa-pattern span{color:var(--muted)}.qa-examples{display:grid;gap:6px;margin-top:10px}.qa-examples>div{padding:8px 9px;background:var(--card);border:1px solid var(--line);border-radius:10px}.qa-examples b,.qa-examples span{display:block}.qa-examples b{font-size:13px}.qa-examples span,.qa-note{font-size:11px;color:var(--muted);line-height:1.55;margin-top:2px}.qa-note{margin-top:9px}`;document.head.appendChild(s)}

style();installMeaningOverride();applyLexicon();cleanAll();
let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;setTimeout(()=>{installMeaningOverride();applyLexicon();cleanAll();busy=false},0)}).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{installMeaningOverride();applyLexicon();cleanAll()},1400);
const tag=document.querySelector('.tag');if(tag)tag.textContent=APP_VERSION;
window.ZBZLexicalQA={ready:true,version:BUILD,audited:Object.keys(QA)};
})();