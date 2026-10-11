(()=>{
const TOPICS={
  articles:{title:'冠词',short:'art.',desc:'告诉你名词前面为什么要不要加 a / an / the。',rule:'a / an 表示“一个、不特定”；the 表示“特定的、双方都知道的”。',words:['a','an','the'],examples:[['a book','一本书（不特定）'],['the book','那本双方都知道的书']]},
  pronouns:{title:'代词',short:'pron.',desc:'代替人或事物，避免一句话把名字念八遍。',rule:'先分清主格 I / he / they，再慢慢认识宾格 me / him / them。',words:['i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','our','their'],examples:[['She likes me.','她喜欢我。'],['They are students.','他们是学生。']]},
  be:{title:'be 动词',short:'be',desc:'am / is / are / was / were 是最基础的句子骨架。',rule:'现在时先记：I am，he/she/it is，you/we/they are。',words:['am','is','are','was','were','be','been','being'],examples:[['I am a student.','我是一名学生。'],['They are busy.','他们很忙。']]},
  lexical:{title:'实义动词',short:'v.',desc:'真正表达动作、行为或状态的动词。',rule:'先会最常用的原形，再逐步补第三人称、过去式和过去分词。',words:['go','come','have','like','want','know','make','get','take','give','study','learn','work'],examples:[['I like English.','我喜欢英语。'],['We study every day.','我们每天学习。']]},
  auxiliaries:{title:'助动词',short:'aux.',desc:'自己意思很弱，主要帮句子变否定、疑问或构成时态。',rule:'do / does / did 常用于一般时态的疑问和否定；have / has / had 还能帮助构成完成时。',words:['do','does','did','have','has','had'],examples:[['Do you know him?','你认识他吗？'],['I do not know.','我不知道。']]},
  modals:{title:'情态动词',short:'modal',desc:'表达“能、应该、必须、可能、愿意”等态度。',rule:'情态动词后面通常直接接动词原形。',words:['can','could','may','might','must','should','will','would','shall'],examples:[['I can swim.','我会游泳。'],['You should study.','你应该学习。']]},
  prepositions:{title:'介词',short:'prep.',desc:'表达时间、位置、方向和关系。',rule:'先重点吃透 in / on / at，它们是初学者最容易互相打架的一组。',words:['in','on','at','to','from','for','with','of','by','about','under','over','between'],examples:[['in China','在中国'],['at school','在学校'],['on the table','在桌子上']]},
  conjunctions:{title:'连词',short:'conj.',desc:'把词、短语和句子连接起来。',rule:'and 表并列，but 表转折，because 表原因，if 表条件。',words:['and','but','or','because','if','so','although','while','when'],examples:[['I am tired, but I will study.','我很累，但我会学习。']]},
  questions:{title:'疑问词',short:'wh-',desc:'决定你在问“什么、谁、哪里、什么时候、为什么、怎么”。',rule:'看到疑问词先判断它到底在问什么信息。',words:['what','who','where','when','why','how','which','whose'],examples:[['What is this?','这是什么？'],['Where are you?','你在哪里？']]},
  nouns:{title:'名词',short:'n.',desc:'表示人、事、物、地点或概念。',rule:'名词先留意能不能数，再决定前面能不能直接加 a / an。',words:['book','student','school','time','day','problem','thing','person','class','teacher','water'],examples:[['a student','一名学生'],['some water','一些水']]},
  adjectives:{title:'形容词',short:'adj.',desc:'描述名词是什么样的。',rule:'最基础用法：形容词 + 名词，或 be + 形容词。',words:['good','bad','big','small','new','old','important','different','happy','easy'],examples:[['a good book','一本好书'],['The book is good.','这本书很好。']]},
  adverbs:{title:'副词',short:'adv.',desc:'描述动作怎么发生，也能加强形容词。',rule:'very 常修饰形容词；quickly 这类副词常修饰动作。',words:['very','always','often','never','really','quickly','slowly','usually'],examples:[['very good','非常好'],['He runs quickly.','他跑得很快。']]}
};

const CORE={};
function addCore(key,words,short,zh,kind){for(const w of words)CORE[w]=[...(CORE[w]||[]),{key,short,zh,kind}]}
addCore('articles',['a','an'],'art.','不定冠词','function');addCore('articles',['the'],'art.','定冠词','function');
addCore('pronouns',TOPICS.pronouns.words,'pron.','代词','function');
addCore('be',TOPICS.be.words,'be','be 动词','function');
addCore('auxiliaries',TOPICS.auxiliaries.words,'aux.','助动词','function');
addCore('modals',TOPICS.modals.words,'modal','情态动词','function');
addCore('prepositions',TOPICS.prepositions.words,'prep.','介词','function');
addCore('conjunctions',TOPICS.conjunctions.words,'conj.','连词','function');
addCore('questions',TOPICS.questions.words,'wh-','疑问词','function');

const POS_RULES=[
  [/\b(?:vt\.|vi\.|v\.)/i,{key:'verb',short:'v.',zh:'动词',kind:'verb'}],
  [/(^|\s)(?:n\.)/i,{key:'noun',short:'n.',zh:'名词',kind:'noun'}],
  [/(^|\s)(?:adj\.|a\.)/i,{key:'adj',short:'adj.',zh:'形容词',kind:'adj'}],
  [/(^|\s)(?:adv\.|ad\.)/i,{key:'adv',short:'adv.',zh:'副词',kind:'adv'}],
  [/(^|\s)prep\./i,{key:'prep',short:'prep.',zh:'介词',kind:'function'}],
  [/(^|\s)conj\./i,{key:'conj',short:'conj.',zh:'连词',kind:'function'}],
  [/(^|\s)pron\./i,{key:'pron',short:'pron.',zh:'代词',kind:'function'}],
  [/(^|\s)art\./i,{key:'art',short:'art.',zh:'冠词',kind:'function'}],
  [/(^|\s)num\./i,{key:'num',short:'num.',zh:'数词',kind:'function'}]
];
function uniqPos(a){const seen=new Set;return a.filter(x=>{const k=x.short+'|'+x.zh;if(seen.has(k))return false;seen.add(k);return true})}
function wordPos(w){w=String(w||'').toLowerCase();const out=[...(CORE[w]||[])];let z='';try{z=L?.map?.[w]?.z||''}catch(e){}
  for(const [re,obj] of POS_RULES)if(re.test(z))out.push(obj);
  if(!out.length){if(TOPICS.lexical.words.includes(w))out.push({key:'verb',short:'v.',zh:'动词',kind:'verb'});if(TOPICS.nouns.words.includes(w))out.push({key:'noun',short:'n.',zh:'名词',kind:'noun'});if(TOPICS.adjectives.words.includes(w))out.push({key:'adj',short:'adj.',zh:'形容词',kind:'adj'});if(TOPICS.adverbs.words.includes(w))out.push({key:'adv',short:'adv.',zh:'副词',kind:'adv'})}
  return uniqPos(out).slice(0,3);
}
function posTags(w){const p=wordPos(w);return p.length?`<span class="word-pos-tags">${p.map(x=>`<span class="word-pos-tag">${esc(x.short)} ${esc(x.zh)}</span>`).join('')}</span>`:''}
function wordHasFilter(w,f){if(f==='all')return true;const p=wordPos(w);if(f==='function')return p.some(x=>x.kind==='function');return p.some(x=>x.kind===f)}

function injectStyle(){if(document.getElementById('catStyle'))return;const s=document.createElement('style');s.id='catStyle';s.textContent=`
.word-pos-tags{display:inline-flex;gap:5px;flex-wrap:wrap;margin-left:6px;vertical-align:middle}.word-pos-tag{display:inline-flex;padding:3px 7px;border-radius:999px;background:var(--soft);color:var(--blue);font-size:10px;font-weight:850;line-height:1.2}.cat-hub{margin-top:14px}.cat-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.cat-card{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:12px;text-align:left;color:var(--text)}.cat-card b{display:block;font-size:14px}.cat-card span{display:block;color:var(--muted);font-size:10px;margin-top:4px;line-height:1.45}.cat-card em{font-style:normal;color:var(--blue);font-size:10px;font-weight:850}.cat-route{display:flex;gap:7px;overflow:auto;margin-top:12px;padding-bottom:2px}.cat-route button,.pos-filter button{white-space:nowrap;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 10px;color:var(--muted);font-size:11px}.cat-route button.active,.pos-filter button.active{background:var(--soft);color:var(--blue);border-color:transparent;font-weight:850}.cat-detail{margin-top:12px;border-top:1px solid var(--line);padding-top:12px}.cat-detail.hidden{display:none}.cat-detail-title{font-size:20px;font-weight:900}.cat-detail-rule{margin-top:8px;padding:10px 12px;border-radius:13px;background:var(--soft);font-size:12px;line-height:1.65}.cat-word-list{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.cat-word{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 10px;font-weight:800}.cat-examples{margin-top:12px;display:grid;gap:7px}.cat-example{padding:9px 10px;border-left:3px solid var(--blue);background:var(--bg);border-radius:0 10px 10px 0}.cat-example b{font-size:13px}.cat-example span{display:block;font-size:11px;color:var(--muted);margin-top:2px}.pos-filter{display:flex;gap:6px;overflow:auto;margin:10px 0 4px;padding-bottom:2px}.plan-word-card.pos-hidden{display:none}.study-phon .word-pos-tags,.phon .word-pos-tags{margin-left:8px}.study-word-zone .word-pos-tags{margin:8px 0 0}.category-note{margin-top:10px;font-size:11px;color:var(--muted);line-height:1.6}
@media(max-width:620px){.cat-grid{grid-template-columns:repeat(2,1fr)}.cat-head{display:block}.word-pos-tags{margin-left:3px}.study-word-zone .word-pos-tags{display:flex}}
`;document.head.appendChild(s)}

let activeTopic='articles',planFilter='all';
function mountHub(){if(document.getElementById('catHub'))return;const home=document.getElementById('homeStudySection');if(!home)return;const box=document.createElement('div');box.id='catHub';box.className='card cat-hub';box.innerHTML=`<div class="cat-head"><div><div class="section-head">基础词类</div><div class="small">先知道这个词在句子里干什么，再背它是什么意思。尤其适合基础阶段。</div></div><span class="badge">基础框架</span></div><div class="cat-route"><button data-route="articles">1 冠词</button><button data-route="pronouns">2 代词</button><button data-route="be">3 be动词</button><button data-route="lexical">4 实义动词</button><button data-route="auxiliaries">5 助动词</button><button data-route="modals">6 情态动词</button><button data-route="prepositions">7 介词</button></div><div class="cat-grid">${Object.entries(TOPICS).map(([k,v])=>`<button class="cat-card" data-cat="${k}"><em>${esc(v.short)}</em><b>${esc(v.title)}</b><span>${esc(v.desc)}</span></button>`).join('')}</div><div id="catDetail" class="cat-detail"></div><div class="category-note">分类不是让你“今天只背名词、明天只背动词”，而是给每个词加一张身份证。真正学习仍然混合进行。</div>`;home.insertAdjacentElement('afterend',box);box.querySelectorAll('[data-cat],[data-route]').forEach(b=>b.onclick=()=>showTopic(b.dataset.cat||b.dataset.route));showTopic(activeTopic)}
function showTopic(k){activeTopic=TOPICS[k]?k:'articles';const v=TOPICS[activeTopic],p=document.getElementById('catDetail');if(!p)return;document.querySelectorAll('#catHub [data-route]').forEach(b=>b.classList.toggle('active',(b.dataset.route===activeTopic)));p.innerHTML=`<div class="cat-detail-title">${esc(v.title)} <span class="word-pos-tag">${esc(v.short)}</span></div><div class="small space-top">${esc(v.desc)}</div><div class="cat-detail-rule">${esc(v.rule)}</div><div class="cat-word-list">${v.words.map(w=>`<button class="cat-word" onclick="catOpenWord('${esc(w)}')">${esc(w)}</button>`).join('')}</div><div class="cat-examples">${(v.examples||[]).map(e=>`<div class="cat-example"><b>${esc(e[0])}</b><span>${esc(e[1])}</span></div>`).join('')}</div>`}
window.catOpenWord=function(w){try{$('q').value=w;renderWord(w);setTimeout(()=>$('result')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}catch(e){}}

function annotateSearch(w){const card=document.querySelector('#result .card');if(!card)return;const word=(w||currentWord||$('q')?.value||'').toLowerCase();const phon=card.querySelector('.phon');if(phon&&!phon.querySelector('.word-pos-tags'))phon.insertAdjacentHTML('beforeend',posTags(word))}
function annotateStudy(){const x=typeof studyCurrent==='function'?studyCurrent():null;if(!x)return;const zone=document.querySelector('#homeStudyCardWrap .study-word-zone');if(zone&&!zone.querySelector('.word-pos-tags'))zone.insertAdjacentHTML('beforeend',posTags(x.w))}
function ensurePlanFilter(){const panel=document.getElementById('planListPanel');if(!panel||document.getElementById('posFilter'))return;const legend=panel.querySelector('.legend');const box=document.createElement('div');box.id='posFilter';box.className='pos-filter';box.innerHTML=`<button data-pos="all" class="active">全部</button><button data-pos="noun">名词</button><button data-pos="verb">动词</button><button data-pos="adj">形容词</button><button data-pos="adv">副词</button><button data-pos="function">功能词</button>`;legend?.insertAdjacentElement('afterend',box);box.querySelectorAll('button').forEach(b=>b.onclick=()=>{planFilter=b.dataset.pos;box.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));annotatePlan()})}
function annotatePlan(){ensurePlanFilter();let words=[];try{words=plan(curDay)||[]}catch(e){};const rows=[...document.querySelectorAll('#dayWords .plan-word-card')];rows.forEach((node,i)=>{const w=words[i]?.w;if(!w)return;const title=node.querySelector('.rowword');if(title&&!title.querySelector('.word-pos-tags'))title.insertAdjacentHTML('beforeend',posTags(w));node.classList.toggle('pos-hidden',!wordHasFilter(w,planFilter))})}

try{const rw=renderWord;renderWord=async function(...a){const r=await rw(...a);annotateSearch(a[0]);return r}}catch(e){}
try{const sr=studyRender;studyRender=function(...a){const r=sr(...a);annotateStudy();return r}}catch(e){}
try{const rd=renderDay;renderDay=function(...a){const r=rd(...a);annotatePlan();return r}}catch(e){}

injectStyle();mountHub();ensurePlanFilter();annotateSearch();annotateStudy();annotatePlan();const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.3';
const boot=setInterval(()=>{if(typeof L!=='undefined'&&L.p?.length){clearInterval(boot);annotateSearch();annotateStudy();annotatePlan()}},200);setTimeout(()=>clearInterval(boot),12000);
})();