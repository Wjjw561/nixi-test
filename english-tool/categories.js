(()=>{
const TOPICS={
  articles:{title:'冠词',short:'art.',desc:'放在名词前，告诉别人你说的是“一个”还是“那个特定的”。',rule:'a / an 表示一个、不特定；the 表示特定、双方都知道，或前面已经提到。',seed:['a','an','the'],examples:[['a book','一本书，不知道具体哪本'],['the book','那本双方都知道的书']]},
  pronouns:{title:'代词',short:'pron.',desc:'代替人或事物，避免重复名字。',rule:'先分清主格 I / he / they 和宾格 me / him / them。',seed:['i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','our','their'],examples:[['She likes me.','她喜欢我。'],['They are students.','他们是学生。']]},
  be:{title:'be 动词',short:'be',desc:'连接“谁/什么”和身份、状态、地点。',rule:'现在时先记：I am，he/she/it is，you/we/they are。',seed:['am','is','are','was','were','be','been','being'],examples:[['I am a student.','我是一名学生。'],['They are busy.','他们很忙。']]},
  lexical:{title:'实义动词',short:'v.',desc:'真正表达动作、行为或状态。',rule:'先记最常用的原形和核心搭配，再补变化形式。',seed:['go','come','have','like','want','know','make','get','take','give','study','learn','work'],examples:[['I like English.','我喜欢英语。'],['We study every day.','我们每天学习。']]},
  auxiliaries:{title:'助动词',short:'aux.',desc:'主要帮助句子构成疑问、否定或时态。',rule:'do / does / did 常用于一般时态；have / has / had 还能帮助构成完成时。',seed:['do','does','did','have','has','had'],examples:[['Do you know him?','你认识他吗？'],['I do not know.','我不知道。']]},
  modals:{title:'情态动词',short:'modal',desc:'表达能、应该、必须、可能、愿意。',rule:'情态动词后面通常直接接动词原形。',seed:['can','could','may','might','must','should','will','would','shall'],examples:[['I can swim.','我会游泳。'],['You should study.','你应该学习。']]},
  prepositions:{title:'介词',short:'prep.',desc:'表达时间、位置、方向和关系。',rule:'先重点吃透 in / on / at，再扩展其他介词。',seed:['in','on','at','to','from','for','with','of','by','about','under','over','between'],examples:[['in China','在中国'],['at school','在学校'],['on the table','在桌子上']]},
  conjunctions:{title:'连词',short:'conj.',desc:'把词、短语和句子连接起来。',rule:'and 表并列，but 表转折，because 表原因，if 表条件。',seed:['and','but','or','because','if','so','although','while','when'],examples:[['I am tired, but I will study.','我很累，但我会学习。']]},
  questions:{title:'疑问词',short:'wh-',desc:'决定你在问什么信息。',rule:'what 问什么，who 问谁，where 问哪里，when 问时间，why 问原因，how 问方式。',seed:['what','who','where','when','why','how','which','whose'],examples:[['What is this?','这是什么？'],['Where are you?','你在哪里？']]},
  nouns:{title:'名词',short:'n.',desc:'表示人、事、物、地点或概念。',rule:'先注意能不能数，再决定前面能不能直接加 a / an。',seed:['book','student','school','time','day','problem','thing','person','class','teacher','water'],examples:[['a student','一名学生'],['some water','一些水']]},
  adjectives:{title:'形容词',short:'adj.',desc:'描述名词是什么样的。',rule:'最基础结构：形容词 + 名词，或 be + 形容词。',seed:['good','bad','big','small','new','old','important','different','happy','easy'],examples:[['a good book','一本好书'],['The book is good.','这本书很好。']]},
  adverbs:{title:'副词',short:'adv.',desc:'描述动作怎么发生，也能加强形容词。',rule:'very 常修饰形容词；quickly 这类副词常修饰动作。',seed:['very','always','often','never','really','quickly','slowly','usually'],examples:[['very good','非常好'],['He runs quickly.','他跑得很快。']]},
  numerals:{title:'数词',short:'num.',desc:'表示数量或顺序。',rule:'one / two / three 表数量；first / second / third 表顺序。',seed:['one','two','three','first','second','third','hundred','thousand'],examples:[['two books','两本书'],['the first day','第一天']]}
};

const STRUCTURES={
  the:{role:'特指已经知道的人或事物',pattern:'the + 名词',examples:[['the book','这本 / 那本特定的书'],['the teacher','那位双方都知道的老师']],compare:[['a book','一本书，不知道具体哪本'],['the book','那本双方都知道的书']],note:'第一次提到一个普通可数名词，常用 a/an；后面再次提到它，常会变成 the。'},
  a:{role:'表示“一个”，但没有指定具体是哪一个',pattern:'a + 辅音音素开头的可数名词单数',examples:[['a book','一本书'],['a student','一名学生']],compare:[['a book','一本书，不知道具体哪本'],['the book','那本双方都知道的书']],note:'a 不能直接放在复数名词或不可数名词前。'},
  an:{role:'和 a 一样表示“一个”，但用于元音音素开头',pattern:'an + 元音音素开头的可数名词单数',examples:[['an apple','一个苹果'],['an hour','一个小时']],compare:[['a university','一个大学，u 开头读 /j/，所以用 a'],['an hour','一个小时，h 不发音，所以用 an']],note:'判断 a/an 看的是发音，不是只看首字母。'},
  am:{role:'be 动词现在时形式，和 I 搭配',pattern:'I + am + 名词 / 形容词 / 地点',examples:[['I am a student.','我是一名学生。'],['I am tired.','我累了。']],compare:[['I am','I 搭配 am'],['He is','he/she/it 搭配 is'],['They are','you/we/they 搭配 are']]},
  is:{role:'be 动词现在时形式，常和 he / she / it / 单数名词搭配',pattern:'单数主语 + is + 名词 / 形容词 / 地点',examples:[['She is happy.','她很开心。'],['The book is here.','书在这里。']],compare:[['I am','I 用 am'],['He is','单数第三人称用 is'],['They are','复数或 you 用 are']]},
  are:{role:'be 动词现在时形式，常和 you / we / they / 复数名词搭配',pattern:'复数主语 / you + are + 名词 / 形容词 / 地点',examples:[['You are right.','你是对的。'],['They are students.','他们是学生。']],compare:[['I am','I 用 am'],['He is','he/she/it 用 is'],['They are','you/we/they 用 are']]},
  do:{role:'帮助一般现在时构成疑问和否定；也可以表示“做”',pattern:'Do + I/you/we/they + 动词原形？',examples:[['Do you like English?','你喜欢英语吗？'],['I do not know.','我不知道。']],compare:[['Are you happy?','你开心吗？be 动词句'],['Do you like it?','你喜欢它吗？实义动词句']],note:'句子里已经有 am/is/are 时，通常不要再用 do 来提问。'},
  does:{role:'帮助 he / she / it 的一般现在时构成疑问和否定',pattern:'Does + he/she/it + 动词原形？',examples:[['Does she like English?','她喜欢英语吗？'],['He does not know.','他不知道。']],compare:[['Do you like it?','you 用 do'],['Does he like it?','he 用 does']],note:'用了 does 后，后面的动词回到原形：Does he like，不是 Does he likes。'},
  did:{role:'帮助一般过去时构成疑问和否定',pattern:'Did + 主语 + 动词原形？',examples:[['Did you go yesterday?','你昨天去了吗？'],['I did not go.','我没去。']],compare:[['I went.','肯定句动词用过去式'],['Did you go?','有 did 后动词回原形 go']]},
  can:{role:'表示“能、会、可以”',pattern:'主语 + can + 动词原形',examples:[['I can swim.','我会游泳。'],['Can you help me?','你能帮我吗？']],compare:[['I can swim.','can 后接原形 swim'],['I am able to swim.','be able to 也可表示能够']]},
  should:{role:'表示“应该”，给建议或表达较弱义务',pattern:'主语 + should + 动词原形',examples:[['You should study.','你应该学习。'],['We should go now.','我们现在应该走了。']],compare:[['should','应该，建议感较强'],['must','必须，语气更强']]},
  must:{role:'表示“必须”，语气较强',pattern:'主语 + must + 动词原形',examples:[['You must stop.','你必须停下。'],['We must study.','我们必须学习。']],compare:[['must','必须'],['should','应该']]},
  in:{role:'表示“在……里面 / 较大的时间或地点范围内”',pattern:'in + 地点 / 月份 / 年份 / 一段较长时间',examples:[['in China','在中国'],['in October','在十月'],['in 2026','在 2026 年']],compare:[['in the room','在房间里面'],['on the table','在桌子表面'],['at school','在学校这个地点']]},
  on:{role:'表示“在……表面上 / 某一天”',pattern:'on + 表面 / 具体某天',examples:[['on the table','在桌子上'],['on Monday','在星期一']],compare:[['in the box','在盒子里面'],['on the box','在盒子表面上'],['at the door','在门口这个点']]},
  at:{role:'表示“在某个点 / 具体时刻”',pattern:'at + 地点点位 / 具体钟点',examples:[['at school','在学校'],['at 8:00','在八点']],compare:[['in China','较大范围'],['on the table','表面'],['at school','具体地点点位']]},
  this:{role:'指离说话者较近的一个人或物',pattern:'this + 单数名词',examples:[['this book','这本书'],['This is my book.','这是我的书。']],compare:[['this book','这本，近、单数'],['that book','那本，远、单数'],['these books','这些，近、复数'],['those books','那些，远、复数']]},
  that:{role:'指离说话者较远的一个人或物，也可引导从句',pattern:'that + 单数名词',examples:[['that book','那本书'],['That is my teacher.','那是我的老师。']],compare:[['this','近、单数'],['that','远、单数']]},
  these:{role:'this 的复数，表示“这些”',pattern:'these + 复数名词',examples:[['these books','这些书']],compare:[['this book','这本书'],['these books','这些书']]},
  those:{role:'that 的复数，表示“那些”',pattern:'those + 复数名词',examples:[['those students','那些学生']],compare:[['that student','那个学生'],['those students','那些学生']]},
  i:{role:'第一人称单数主格，表示“我”，在句子里常做主语',pattern:'I + 谓语',examples:[['I am a student.','我是一名学生。'],['I like English.','我喜欢英语。']],compare:[['I','我，主格'],['me','我，宾格'],['my','我的']]},
  he:{role:'第三人称单数主格，表示“他”',pattern:'He + is / does / 动词第三人称单数',examples:[['He is busy.','他很忙。'],['He likes English.','他喜欢英语。']],compare:[['he','他，主格'],['him','他，宾格'],['his','他的']]},
  she:{role:'第三人称单数主格，表示“她”',pattern:'She + is / does / 动词第三人称单数',examples:[['She is happy.','她很开心。'],['She studies English.','她学习英语。']],compare:[['she','她，主格'],['her','她 / 她的，取决于位置']]},
  it:{role:'第三人称单数代词，常代替事物、动物、天气、时间等',pattern:'It + is / does / 动词第三人称单数',examples:[['It is cold.','天气很冷。'],['It is my phone.','它是我的手机。']],compare:[['it','它 / 这件事'],['its','它的']]}
};

const CORE={};
function addCore(key,words,short,zh,kind){for(const w of words)CORE[w]=[...(CORE[w]||[]),{key,short,zh,kind}]}
addCore('articles',['a','an'],'art.','不定冠词','function');addCore('articles',['the'],'art.','定冠词','function');
addCore('pronouns',TOPICS.pronouns.seed,'pron.','代词','function');
addCore('be',TOPICS.be.seed,'be','be 动词','function');
addCore('auxiliaries',TOPICS.auxiliaries.seed,'aux.','助动词','function');
addCore('modals',TOPICS.modals.seed,'modal','情态动词','function');
addCore('prepositions',TOPICS.prepositions.seed,'prep.','介词','function');
addCore('conjunctions',TOPICS.conjunctions.seed,'conj.','连词','function');
addCore('questions',TOPICS.questions.seed,'wh-','疑问词','function');

const POS_RULES=[
  [/\b(?:vt\.|vi\.|v\.)/i,{key:'verb',short:'v.',zh:'动词',kind:'verb'}],
  [/(^|\s)n\./i,{key:'noun',short:'n.',zh:'名词',kind:'noun'}],
  [/(^|\s)(?:adj\.|a\.)/i,{key:'adj',short:'adj.',zh:'形容词',kind:'adj'}],
  [/(^|\s)(?:adv\.|ad\.)/i,{key:'adv',short:'adv.',zh:'副词',kind:'adv'}],
  [/(^|\s)prep\./i,{key:'prep',short:'prep.',zh:'介词',kind:'function'}],
  [/(^|\s)conj\./i,{key:'conj',short:'conj.',zh:'连词',kind:'function'}],
  [/(^|\s)pron\./i,{key:'pron',short:'pron.',zh:'代词',kind:'function'}],
  [/(^|\s)art\./i,{key:'art',short:'art.',zh:'冠词',kind:'function'}],
  [/(^|\s)num\./i,{key:'num',short:'num.',zh:'数词',kind:'function'}]
];
function uniqPos(a){const seen=new Set;return a.filter(x=>{const k=x.short+'|'+x.zh;if(seen.has(k))return false;seen.add(k);return true})}
function wordPos(w){
  w=String(w||'').toLowerCase();const out=[...(CORE[w]||[])];let z='';try{z=L?.map?.[w]?.z||''}catch(e){}
  for(const [re,obj] of POS_RULES)if(re.test(z))out.push(obj);
  if(!out.length){
    if(TOPICS.lexical.seed.includes(w))out.push({key:'verb',short:'v.',zh:'动词',kind:'verb'});
    if(TOPICS.nouns.seed.includes(w))out.push({key:'noun',short:'n.',zh:'名词',kind:'noun'});
    if(TOPICS.adjectives.seed.includes(w))out.push({key:'adj',short:'adj.',zh:'形容词',kind:'adj'});
    if(TOPICS.adverbs.seed.includes(w))out.push({key:'adv',short:'adv.',zh:'副词',kind:'adv'});
    if(TOPICS.numerals.seed.includes(w))out.push({key:'num',short:'num.',zh:'数词',kind:'function'});
  }
  return uniqPos(out).slice(0,4);
}
function posTags(w){const p=wordPos(w);return p.length?`<span class="word-pos-tags">${p.map(x=>`<span class="word-pos-tag">${esc(x.short)} ${esc(x.zh)}</span>`).join('')}</span>`:''}
function freqSort(words){return [...new Set(words)].sort((a,b)=>((L?.freq?.[a]||999999)-(L?.freq?.[b]||999999))||a.localeCompare(b))}
function allLexiconWords(){try{return Object.keys(L?.map||{})}catch(e){return[]}}
function wordsForCategory(k){
  const seed=TOPICS[k]?.seed||[],all=allLexiconWords(),picked=[];
  const special=new Set([...TOPICS.be.seed,...TOPICS.auxiliaries.seed,...TOPICS.modals.seed]);
  for(const w of all){const p=wordPos(w);
    if(k==='articles'&&p.some(x=>x.key==='art'))picked.push(w);
    else if(k==='pronouns'&&p.some(x=>x.key==='pron'))picked.push(w);
    else if(k==='prepositions'&&p.some(x=>x.key==='prep'))picked.push(w);
    else if(k==='conjunctions'&&p.some(x=>x.key==='conj'))picked.push(w);
    else if(k==='nouns'&&p.some(x=>x.kind==='noun'))picked.push(w);
    else if(k==='adjectives'&&p.some(x=>x.kind==='adj'))picked.push(w);
    else if(k==='adverbs'&&p.some(x=>x.kind==='adv'))picked.push(w);
    else if(k==='numerals'&&p.some(x=>x.key==='num'))picked.push(w);
    else if(k==='lexical'&&p.some(x=>x.kind==='verb')&&!special.has(w))picked.push(w);
  }
  if(['be','auxiliaries','modals','questions'].includes(k))return freqSort(seed.filter(w=>all.includes(w)||seed.includes(w)));
  return freqSort([...seed,...picked]);
}
function meaningOf(w){try{return mainMeaning(w)||cleanMeaning(L?.map?.[w]?.z||'')||''}catch(e){return''}}
function phonOf(w){try{return L?.map?.[w]?.p||''}catch(e){return''}}

function structureData(w){
  w=String(w||'').toLowerCase();if(STRUCTURES[w])return STRUCTURES[w];
  const core=CORE[w]?.[0];if(core&&TOPICS[core.key]){const t=TOPICS[core.key];return{role:t.desc,pattern:t.rule,examples:t.examples||[],compare:[]}}
  const p=wordPos(w)[0];if(!p)return null;
  if(p.kind==='noun')return{role:'名词用来表示人、事、物、地点或概念',pattern:'限定词 + 形容词 + 名词',examples:[['a good book','一本好书'],['the problem','那个问题']],compare:[['a/an + 可数名词单数','表示一个、不特定'],['the + 名词','表示特定的人或事物']]};
  if(p.kind==='verb')return{role:'动词告诉你“做什么、发生什么、是什么状态”',pattern:'主语 + 动词 + 其他成分',examples:[['I study English.','我学习英语。']],compare:[['I study.','一般现在时'],['I studied.','一般过去时']]};
  if(p.kind==='adj')return{role:'形容词描述名词的性质或状态',pattern:'形容词 + 名词 / be + 形容词',examples:[['a good book','一本好书'],['The book is good.','这本书很好。']],compare:[]};
  if(p.kind==='adv')return{role:'副词常用来描述动作怎么发生，或加强形容词',pattern:'动词 + 副词 / 副词 + 形容词',examples:[['run quickly','跑得快'],['very good','非常好']],compare:[]};
  return null;
}
function structureHTML(w,compact=false){
  const d=structureData(w);if(!d)return'';
  const ex=(d.examples||[]).slice(0,compact?2:4);
  const cp=(d.compare||[]).slice(0,compact?2:4);
  return `<div class="structure-card ${compact?'compact':''}"><div class="structure-title">🧩 核心作用</div><div class="structure-role">${esc(d.role)}</div>${d.pattern?`<div class="structure-pattern"><b>结构</b><span>${esc(d.pattern)}</span></div>`:''}${ex.length?`<div class="structure-examples">${ex.map(x=>`<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}${cp.length?`<div class="structure-compare"><b>对比一下</b>${cp.map(x=>`<div><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}${d.note&&!compact?`<div class="structure-note">💡 ${esc(d.note)}</div>`:''}</div>`;
}

function injectStyle(){if(document.getElementById('catStyle'))return;const s=document.createElement('style');s.id='catStyle';s.textContent=`
.word-pos-tags{display:inline-flex;gap:5px;flex-wrap:wrap;margin-left:6px;vertical-align:middle}.word-pos-tag{display:inline-flex;padding:3px 7px;border-radius:999px;background:var(--soft);color:var(--blue);font-size:10px;font-weight:850;line-height:1.2}
.vocab-library{margin-top:14px}.library-tabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.library-tabs button{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px;color:var(--muted);font-weight:850}.library-tabs button.active{background:var(--soft);color:var(--blue);border-color:transparent}.category-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:13px}.category-card{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:12px;text-align:left;color:var(--text)}.category-card b{display:block;font-size:14px}.category-card small{display:block;color:var(--muted);margin-top:4px;line-height:1.45}.category-card em{font-style:normal;color:var(--blue);font-size:10px;font-weight:850}.category-card .count{float:right;color:var(--muted);font-size:10px}
.category-browser{margin-top:14px;border-top:1px solid var(--line);padding-top:14px}.category-browser-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.category-browser-title{font-size:21px;font-weight:900}.category-rule{margin-top:8px;padding:10px 12px;border-radius:13px;background:var(--soft);font-size:12px;line-height:1.65}.category-search{margin-top:10px}.category-search input{width:100%;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px 12px;color:var(--text)}.category-words{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.category-word{border:1px solid var(--line);background:var(--card);border-radius:13px;padding:10px;text-align:left;min-width:0}.category-word b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.category-word span{display:block;color:var(--muted);font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.category-word.active{border-color:var(--blue);background:var(--soft)}.category-more{width:100%;margin-top:10px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px;color:var(--blue);font-weight:850}.category-word-detail{margin-top:12px}.category-detail-card{border:1px solid var(--line);border-radius:18px;padding:15px;background:var(--card)}.category-detail-top{display:flex;justify-content:space-between;gap:10px}.category-detail-word{font-size:30px;font-weight:950}.category-detail-meaning{font-size:18px;font-weight:850;margin-top:10px;line-height:1.5}.category-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.category-actions button{border:1px solid var(--line);background:var(--card);border-radius:10px;padding:8px 10px}.category-note{margin-top:10px;font-size:11px;color:var(--muted);line-height:1.6}
.structure-card{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,var(--card),var(--soft))}.structure-card.compact{padding:12px;margin-top:10px}.structure-title{font-size:12px;color:var(--blue);font-weight:900}.structure-role{font-size:16px;font-weight:900;line-height:1.5;margin-top:5px}.structure-pattern{display:flex;gap:8px;align-items:flex-start;margin-top:9px;font-size:12px}.structure-pattern b{flex:0 0 auto}.structure-pattern span{color:var(--muted)}.structure-examples{display:grid;gap:6px;margin-top:10px}.structure-examples>div,.structure-compare>div{padding:8px 9px;background:var(--card);border-radius:10px;border:1px solid var(--line)}.structure-examples b,.structure-compare strong{display:block;font-size:13px}.structure-examples span,.structure-compare span{display:block;color:var(--muted);font-size:11px;margin-top:2px;line-height:1.5}.structure-compare{margin-top:10px}.structure-compare>b{display:block;font-size:12px;margin-bottom:6px}.structure-compare>div{margin-top:5px}.structure-note{margin-top:9px;font-size:11px;color:var(--muted);line-height:1.6}.phon .word-pos-tags,.study-word-zone .word-pos-tags{margin-left:8px}.study-word-zone .structure-card{max-width:560px}.plan-inline-detail .structure-card{margin-top:9px}.pos-filter{display:flex;gap:6px;overflow:auto;margin:10px 0 4px;padding-bottom:2px}.pos-filter button{white-space:nowrap;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 10px;color:var(--muted);font-size:11px}.pos-filter button.active{background:var(--soft);color:var(--blue);border-color:transparent;font-weight:850}.plan-word-card.pos-hidden{display:none}
@media(max-width:620px){.category-grid{grid-template-columns:repeat(2,1fr)}.category-words{grid-template-columns:1fr}.category-browser-head{display:block}.word-pos-tags{margin-left:3px}.study-word-zone .word-pos-tags{display:flex;margin:7px 0 0}}
`;document.head.appendChild(s)}

let activeCategory='articles',catQuery='',catLimit=120,selectedCatWord='',planFilter='all';
function mountLibrary(){
  if(document.getElementById('vocabLibrary'))return;const page=document.getElementById('bookPage');if(!page)return;
  const box=document.createElement('div');box.id='vocabLibrary';box.className='card vocab-library';
  box.innerHTML=`<div class="head wrap"><div><div class="section-head">词类大全</div><div class="small">在这里按词类查看整个词库。一个词可以同时属于多个词类。</div></div><span class="badge">全部词库</span></div><div id="categoryGrid" class="category-grid"></div><div id="categoryBrowser" class="category-browser"></div><div class="category-note">词类是“这个词在句子里负责什么”，不是让你把几千个名词一次背完。真正学习仍然走每日计划和复习。</div>`;
  page.appendChild(box);renderCategoryGrid();renderCategoryBrowser();
}
function renderCategoryGrid(){
  const el=document.getElementById('categoryGrid');if(!el)return;
  el.innerHTML=Object.entries(TOPICS).map(([k,v])=>{const n=wordsForCategory(k).length;return`<button class="category-card ${k===activeCategory?'active':''}" data-cat="${k}"><span class="count">${n||'…'}</span><em>${esc(v.short)}</em><b>${esc(v.title)}</b><small>${esc(v.desc)}</small></button>`}).join('');
  el.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;catQuery='';catLimit=120;selectedCatWord='';renderCategoryGrid();renderCategoryBrowser()});
}
function renderCategoryBrowser(){
  const el=document.getElementById('categoryBrowser');if(!el)return;const t=TOPICS[activeCategory]||TOPICS.articles;
  const all=wordsForCategory(activeCategory),q=catQuery.trim().toLowerCase(),filtered=q?all.filter(w=>w.includes(q)||(meaningOf(w)||'').includes(q)):all,shown=filtered.slice(0,catLimit);
  el.innerHTML=`<div class="category-browser-head"><div><div class="category-browser-title">${esc(t.title)} <span class="word-pos-tag">${esc(t.short)}</span></div><div class="small space-top">共 ${all.length} 个词${q?` · 筛出 ${filtered.length} 个`:''}</div></div></div><div class="category-rule">${esc(t.rule)}</div><div class="category-search"><input id="categorySearch" value="${esc(catQuery)}" placeholder="在这个词类里搜索单词或中文意思"></div><div class="category-words">${shown.map(w=>`<button class="category-word ${selectedCatWord===w?'active':''}" data-word="${esc(w)}"><b>${esc(w)} ${posTags(w)}</b><span>${esc(meaningOf(w)||phonOf(w)||'')}</span></button>`).join('')}</div>${shown.length<filtered.length?`<button class="category-more" id="categoryMore">继续加载（${shown.length}/${filtered.length}）</button>`:''}<div id="catWordDetail" class="category-word-detail"></div>`;
  const inp=document.getElementById('categorySearch');if(inp)inp.oninput=e=>{catQuery=e.target.value;catLimit=120;renderCategoryBrowser();const x=document.getElementById('categorySearch');if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}};
  el.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{selectedCatWord=b.dataset.word;renderCategoryBrowser();renderCategoryDetail(selectedCatWord)});
  const more=document.getElementById('categoryMore');if(more)more.onclick=()=>{catLimit+=200;renderCategoryBrowser()};
  if(selectedCatWord)renderCategoryDetail(selectedCatWord);
}
function renderCategoryDetail(w){
  const el=document.getElementById('catWordDetail');if(!el)return;const m=meaningOf(w)||'暂无中文释义',booked=!!S.book[w];
  el.innerHTML=`<div class="category-detail-card"><div class="category-detail-top"><div><div class="category-detail-word">${esc(w)}</div><div class="phon">${esc(phonOf(w))} ${posTags(w)}</div></div><div><button class="voice" onclick="speak('${esc(w)}','en-US')">🇺🇸</button></div></div><div class="category-detail-meaning">${esc(m)}</div>${structureHTML(w)}<div class="category-actions"><button onclick="categoryBook('${esc(w)}')">${booked?'★ 已在生词本':'☆ 加入生词本'}</button><button onclick="categoryRate('${esc(w)}',0)">不会</button><button onclick="categoryRate('${esc(w)}',1)">模糊</button><button onclick="categoryRate('${esc(w)}',2)">认识</button><button onclick="categoryRate('${esc(w)}',3)">很熟</button></div></div>`;
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'nearest'}),20);
}
window.categoryBook=function(w){if(S.book[w])delete S.book[w];else S.book[w]=Date.now();save();renderCategoryDetail(w);renderCategoryGrid()}
window.categoryRate=function(w,g){recordSubjective(w,g);save();renderCategoryDetail(w);toast('已记录，并同步到复习系统')}

function annotateSearch(w){
  const card=document.querySelector('#result .card');if(!card)return;const word=(w||currentWord||$('q')?.value||'').toLowerCase();
  const phon=card.querySelector('.phon');if(phon&&!phon.querySelector('.word-pos-tags'))phon.insertAdjacentHTML('beforeend',posTags(word));
  if(!card.querySelector('.structure-card')){const top=card.querySelector('.wordtop');const html=structureHTML(word);if(top&&html)top.insertAdjacentHTML('afterend',html)}
}
function annotateStudy(){
  const x=typeof studyCurrent==='function'?studyCurrent():null;if(!x)return;const zone=document.querySelector('#homeStudyCardWrap .study-word-zone');if(zone&&!zone.querySelector('.word-pos-tags'))zone.insertAdjacentHTML('beforeend',posTags(x.w));
  const ans=document.querySelector('#homeStudyCardWrap .study-answer');if(ans&&!ans.querySelector('.structure-card')){const html=structureHTML(x.w,true);if(html)ans.insertAdjacentHTML('beforeend',html)}
}
function ensurePlanFilter(){const panel=document.getElementById('planListPanel');if(!panel||document.getElementById('posFilter'))return;const legend=panel.querySelector('.legend');const box=document.createElement('div');box.id='posFilter';box.className='pos-filter';box.innerHTML=`<button data-pos="all" class="active">全部</button><button data-pos="noun">名词</button><button data-pos="verb">动词</button><button data-pos="adj">形容词</button><button data-pos="adv">副词</button><button data-pos="function">功能词</button>`;legend?.insertAdjacentElement('afterend',box);box.querySelectorAll('button').forEach(b=>b.onclick=()=>{planFilter=b.dataset.pos;box.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));annotatePlan()})}
function wordHasFilter(w,f){if(f==='all')return true;const p=wordPos(w);if(f==='function')return p.some(x=>x.kind==='function');return p.some(x=>x.kind===f)}
function annotatePlan(){
  ensurePlanFilter();let words=[];try{words=plan(curDay)||[]}catch(e){};const rows=[...document.querySelectorAll('#dayWords .plan-word-card')];
  rows.forEach((node,i)=>{const w=words[i]?.w;if(!w)return;const title=node.querySelector('.rowword');if(title&&!title.querySelector('.word-pos-tags'))title.insertAdjacentHTML('beforeend',posTags(w));node.classList.toggle('pos-hidden',!wordHasFilter(w,planFilter));const detail=node.querySelector('.plan-inline-detail');if(detail&&!detail.querySelector('.structure-card')){const html=structureHTML(w,true);if(html)detail.insertAdjacentHTML('afterbegin',html)}})
}

try{const rw=renderWord;renderWord=async function(...a){const r=await rw(...a);annotateSearch(a[0]);return r}}catch(e){}
try{const sr=studyRender;studyRender=function(...a){const r=sr(...a);annotateStudy();return r}}catch(e){}
try{const rd=renderDay;renderDay=function(...a){const r=rd(...a);annotatePlan();return r}}catch(e){}
try{const rb=renderBook;renderBook=function(...a){const r=rb(...a);mountLibrary();return r}}catch(e){}
try{const pg=page;page=function(id,...rest){const r=pg(id,...rest);if(id==='bookPage'){mountLibrary();renderCategoryGrid();renderCategoryBrowser()}return r}}catch(e){}

injectStyle();mountLibrary();ensurePlanFilter();annotateSearch();annotateStudy();annotatePlan();const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.4';
const boot=setInterval(()=>{if(typeof L!=='undefined'&&L.p?.length){clearInterval(boot);renderCategoryGrid();renderCategoryBrowser();annotateSearch();annotateStudy();annotatePlan()}},200);setTimeout(()=>clearInterval(boot),15000);
})();