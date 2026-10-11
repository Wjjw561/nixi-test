(()=>{
const CONTEXT={
  the:[
    {s:'I bought a book yesterday. ___ book is very useful.',a:'the',o:['the','a','an','some'],e:'前面已经提到 a book，第二次说同一本书时用 the。'},
    {s:'Please close ___ door. We both know which door I mean.',a:'the',o:['the','a','an','any'],e:'双方都知道具体是哪扇门，所以用 the。'}
  ],
  a:[
    {s:'I need ___ pen. Any pen is fine.',a:'a',o:['a','an','the','some'],e:'pen 是可数名词单数，这里没有指定哪一支，所以用 a。'},
    {s:'He is ___ student.',a:'a',o:['a','an','the','some'],e:'student 是辅音音素开头的可数名词单数，表示“一名学生”用 a。'}
  ],
  an:[
    {s:'She ate ___ apple after lunch.',a:'an',o:['an','a','the','some'],e:'apple 以元音音素开头，所以用 an。'},
    {s:'It took me ___ hour to finish it.',a:'an',o:['an','a','the','one of'],e:'hour 的 h 不发音，开头是元音音素，所以用 an。'}
  ],
  am:[{s:'I ___ a student.',a:'am',o:['am','is','are','do'],e:'I 在现在时里和 am 搭配：I am。'}],
  is:[{s:'She ___ happy today.',a:'is',o:['is','am','are','do'],e:'she 是第三人称单数，现在时用 is。'}],
  are:[{s:'They ___ students.',a:'are',o:['are','am','is','does'],e:'they 是复数主语，现在时用 are。'}],
  do:[
    {s:'___ you like English?',a:'Do',o:['Do','Are','Does','Is'],e:'like 是实义动词，一般现在时里 you 的疑问句用 Do。'},
    {s:'I ___ not know the answer.',a:'do',o:['do','am','are','is'],e:'know 是实义动词，一般现在时否定用 do not。'}
  ],
  does:[{s:'___ she like English?',a:'Does',o:['Does','Do','Is','Are'],e:'she 是第三人称单数，实义动词疑问句用 Does；后面的 like 回到原形。'}],
  did:[{s:'___ you go there yesterday?',a:'Did',o:['Did','Do','Are','Were'],e:'yesterday 提示一般过去时；有 Did 后，go 用原形。'}],
  can:[{s:'I ___ swim. （我会游泳）',a:'can',o:['can','am','do','are'],e:'can 表示“能、会”，后面直接接动词原形 swim。'}],
  should:[{s:'You are tired. You ___ rest. （应该）',a:'should',o:['should','must','are','do'],e:'should 表示“应该”，常用于建议，后面接动词原形。'}],
  must:[{s:'You ___ show your ID to enter. （必须）',a:'must',o:['must','should','can','are'],e:'must 表示“必须”，语气比 should 更强。'}],
  in:[
    {s:'I live ___ China.',a:'in',o:['in','on','at','to'],e:'国家属于较大的地点范围，通常用 in。'},
    {s:'My birthday is ___ October.',a:'in',o:['in','on','at','from'],e:'月份通常用 in。'}
  ],
  on:[
    {s:'The book is ___ the table.',a:'on',o:['on','in','at','to'],e:'在物体表面上用 on。'},
    {s:'We have class ___ Monday.',a:'on',o:['on','in','at','for'],e:'具体某一天通常用 on。'}
  ],
  at:[
    {s:'Meet me ___ 8:00.',a:'at',o:['at','in','on','from'],e:'具体钟点通常用 at。'},
    {s:'She is ___ school now.',a:'at',o:['at','in','on','to'],e:'把 school 当作一个地点点位时常用 at。'}
  ],
  this:[{s:'The book is here in my hand. ___ book is mine.',a:'This',o:['This','That','These','Those'],e:'离说话者近，而且是单数，所以用 this。'}],
  that:[{s:'The book over there is yours. ___ book is yours.',a:'That',o:['That','This','These','Those'],e:'离说话者较远，而且是单数，所以用 that。'}],
  these:[{s:'The books here are new. ___ books are mine.',a:'These',o:['These','This','That','Those'],e:'近处 + 复数，用 these。'}],
  those:[{s:'The students over there are my classmates. ___ students are my classmates.',a:'Those',o:['Those','That','This','These'],e:'远处 + 复数，用 those。'}],
  i:[{s:'___ am a student.',a:'I',o:['I','Me','My','Mine'],e:'句子缺主语，要用主格 I。'}],
  me:[{s:'She likes ___.',a:'me',o:['me','I','my','mine'],e:'like 后面需要宾语，所以用宾格 me。'}],
  my:[{s:'This is ___ book.',a:'my',o:['my','me','I','mine'],e:'book 前表示“我的”要用形容词性物主代词 my。'}],
  he:[{s:'___ is my friend.',a:'He',o:['He','Him','His','Her'],e:'句子缺主语，表示“他”用主格 he。'}],
  him:[{s:'I know ___.',a:'him',o:['him','he','his','her'],e:'know 后面需要宾语，所以“他”要用 him。'}],
  his:[{s:'This is ___ phone.',a:'his',o:['his','he','him','her'],e:'phone 前表示“他的”用 his。'}],
  she:[{s:'___ is happy today.',a:'She',o:['She','Her','Hers','He'],e:'句子缺主语，表示“她”用 she。'}],
  her:[{s:'I saw ___ yesterday.',a:'her',o:['her','she','hers','his'],e:'saw 后面需要宾语，所以“她”用 her。'}],
  we:[{s:'___ are classmates.',a:'We',o:['We','Us','Our','They'],e:'句子缺主语，“我们”用主格 we。'}],
  us:[{s:'The teacher helped ___.',a:'us',o:['us','we','our','ours'],e:'helped 后面需要宾语，所以“我们”用 us。'}],
  our:[{s:'This is ___ classroom.',a:'our',o:['our','us','we','ours'],e:'classroom 前表示“我们的”用 our。'}],
  they:[{s:'___ are my friends.',a:'They',o:['They','Them','Their','We'],e:'句子缺主语，“他们/她们/它们”用 they。'}],
  them:[{s:'I know ___.',a:'them',o:['them','they','their','we'],e:'know 后面需要宾语，所以用 them。'}],
  their:[{s:'That is ___ classroom.',a:'their',o:['their','them','they','ours'],e:'classroom 前表示“他们的”用 their。'}],
  what:[{s:'___ is this?',a:'What',o:['What','Where','When','Why'],e:'询问“这是什么”要用 what。'}],
  where:[{s:'___ are you from?',a:'Where',o:['Where','What','When','Why'],e:'询问地点用 where。'}],
  when:[{s:'___ is your class?',a:'When',o:['When','Where','Why','How'],e:'询问时间用 when。'}],
  why:[{s:'___ are you late?',a:'Why',o:['Why','When','Where','What'],e:'询问原因用 why。'}],
  how:[{s:'___ are you?',a:'How',o:['How','What','Where','Why'],e:'询问状态“你怎么样”常用 How are you?'}],
  and:[{s:'I have a pen ___ a book.',a:'and',o:['and','but','because','if'],e:'连接并列的两个东西，用 and。'}],
  but:[{s:'I am tired, ___ I will study.',a:'but',o:['but','and','because','if'],e:'前后意思有转折，用 but。'}],
  because:[{s:'I stayed home ___ it was raining.',a:'because',o:['because','but','and','if'],e:'后半句说明原因，用 because。'}],
  if:[{s:'___ it rains tomorrow, I will stay home.',a:'If',o:['If','Because','But','And'],e:'表示“如果……”，引导条件，用 if。'}]
};

const CONTEXT_WORDS=Object.keys(CONTEXT);
const escQuiz=s=>typeof esc==='function'?esc(s):String(s??'');
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function contextQuestion(w){
  const list=CONTEXT[String(w||'').toLowerCase()];if(!list?.length)return null;
  const q=pick(list);return{w:String(w).toLowerCase(),mode:'context',prompt:'在句子里选出最合适的词',sentence:q.s,answer:q.a,opts:typeof shuffle==='function'?shuffle(q.o):q.o,e:q.e};
}
function quizEligible(words){return [...new Set(words.map(x=>String(x||'').toLowerCase()))].filter(w=>CONTEXT[w]||(typeof mainMeaning==='function'&&mainMeaning(w)))}

function injectQuizStyle(){
  if(document.getElementById('quizV27Style'))return;
  const s=document.createElement('style');s.id='quizV27Style';s.textContent=`
  .quiz-mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.quiz-mode{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:13px;text-align:left;color:var(--text)}.quiz-mode b{display:block;font-size:14px}.quiz-mode span{display:block;font-size:10px;color:var(--muted);line-height:1.5;margin-top:4px}.quiz-mode.primary-mode{border-color:var(--blue);background:var(--soft)}
  .quiz-kind{display:inline-flex;padding:4px 8px;border-radius:999px;background:var(--soft);color:var(--blue);font-size:10px;font-weight:900;margin-bottom:10px}.quiz-sentence{font-size:23px;line-height:1.55;font-weight:900;letter-spacing:-.2px;margin:12px 0 6px}.quiz-sentence .blank{color:var(--blue)}.quiz-explain{margin-top:10px;padding:11px 12px;border-radius:12px;background:var(--soft);font-size:12px;line-height:1.65}.quiz-next{width:100%;margin-top:10px}.quiz-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.quiz-summary-grid>div{padding:11px;border-radius:13px;background:var(--soft);text-align:center}.quiz-summary-grid b{display:block;font-size:20px}.quiz-summary-grid span{display:block;font-size:10px;color:var(--muted);margin-top:3px}
  @media(max-width:620px){.quiz-mode-grid{grid-template-columns:1fr}.quiz-sentence{font-size:20px}}
  `;document.head.appendChild(s);
}

const baseMakeQuestion=typeof makeQuestion==='function'?makeQuestion:null;

startQuiz=function(words,title='快速测验'){
  const eligible=quizEligible(words||[]);if(!eligible.length)return toast('这些词暂时没有可测试的内容');
  const count=Math.min(10,eligible.length);quizSession={words:shuffle(eligible).slice(0,count),i:0,score:0,title,contextRight:0,contextTotal:0,lexicalRight:0,lexicalTotal:0};page('testPage');nextQuestion();
};

window.contextTest=function(){
  const pool=CONTEXT_WORDS.filter(w=>!S.words?.[w]||statusOf(w)!=='mastered');
  const src=pool.length>=10?pool:CONTEXT_WORDS;
  quizSession={words:shuffle(src).slice(0,10),i:0,score:0,title:'结构专项',forceContext:true,contextRight:0,contextTotal:0,lexicalRight:0,lexicalTotal:0};page('testPage');nextQuestion();
};

renderTestHome=function(){
  $('testCard').innerHTML=`<div class="section-head">快速测验</div><div class="small">不只考“这个词是什么意思”，还会考你能不能把它放进正确的句子里。</div><div class="quiz-mode-grid"><button class="quiz-mode primary-mode" onclick="mixedTest()"><b>综合 10 题</b><span>词义识别 + 句子应用混合</span></button><button class="quiz-mode" onclick="contextTest()"><b>结构专项</b><span>重点练 the / do / are / in / on / at 等基础词</span></button><button class="quiz-mode" onclick="weakTest()"><b>薄弱词</b><span>优先测还没有真正掌握的词</span></button></div><div class="tip space-top">基础功能词会优先出句子题。答对不是因为“眼熟”，而是因为你知道它为什么应该放在这里。</div>`;
};

nextQuestion=function(){
  const q=quizSession;if(!q)return;
  if(q.i>=q.words.length){
    const total=q.words.length,score=q.score,ctx=q.contextTotal||0,ctxRight=q.contextRight||0,lex=q.lexicalTotal||0,lexRight=q.lexicalRight||0;quizSession=null;
    $('testCard').innerHTML=`<div class="section-head">测试完成</div><div class="quiz-word">${score} / ${total}</div><div class="quiz-summary-grid"><div><b>${total?Math.round(score/total*100):0}%</b><span>总正确率</span></div><div><b>${ctx?ctxRight+'/'+ctx:'-'}</b><span>句子应用</span></div><div><b>${lex?lexRight+'/'+lex:'-'}</b><span>词义识别</span></div></div><div class="small">句子题答对，才说明你开始知道这个词在句子里负责什么。掌握度仍然需要跨天复习验证。</div><div class="button-group space-top"><button class="primary" onclick="contextTest()">再练结构</button><button class="secondary" onclick="renderTestHome()">换一种测试</button><button class="secondary" onclick="page('reviewPage')">查看复习</button></div>`;stats();return;
  }
  const w=q.words[q.i];let x=null;
  if(q.forceContext||CONTEXT[w]&&Math.random()<0.7)x=contextQuestion(w);
  if(!x&&baseMakeQuestion){const mode=Math.random()<.5?'en-zh':'zh-en';x=baseMakeQuestion(w,mode)}
  if(!x){q.i++;return nextQuestion()}
  q.current=x;
  if(x.mode==='context')q.contextTotal=(q.contextTotal||0)+1;else q.lexicalTotal=(q.lexicalTotal||0)+1;
  const isCtx=x.mode==='context';
  $('testCard').innerHTML=`<div class="quiz-head"><div><div class="small">${escQuiz(q.title)} · 第 ${q.i+1}/${q.words.length} 题</div><span class="quiz-kind">${isCtx?'句子应用':'词义识别'}</span>${isCtx?`<div class="quiz-sentence">${escQuiz(x.sentence).replace('___','<span class="blank">___</span>')}</div><div class="quiz-prompt">${escQuiz(x.prompt)}</div>`:`<div class="quiz-word">${escQuiz(x.prompt)}</div><div class="quiz-prompt">${x.mode==='en-zh'?'选出最合适的中文核心意思':'根据中文核心意思选英文单词'}</div>`}</div><button class="voice" onclick="speak('${escQuiz(w)}','en-US')">🔊</button></div><div class="quiz-options">${x.opts.map(o=>`<button class="quiz-option" data-answer="${escQuiz(o)}">${escQuiz(o)}</button>`).join('')}</div><div id="quizFeedback" class="quiz-feedback"></div>`;
  document.querySelectorAll('.quiz-option').forEach(btn=>btn.onclick=()=>answerQuestion(btn,x));
};

answerQuestion=function(btn,x){
  if(btn.disabled)return;const ok=btn.dataset.answer===x.answer;
  document.querySelectorAll('.quiz-option').forEach(b=>{b.disabled=true;if(b.dataset.answer===x.answer)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');
  quizResult(x.w,ok);if(ok)quizSession.score++;
  if(x.mode==='context'){if(ok)quizSession.contextRight=(quizSession.contextRight||0)+1}else if(ok)quizSession.lexicalRight=(quizSession.lexicalRight||0)+1;
  const explanation=x.mode==='context'?`<div class="quiz-explain"><b>${ok?'为什么对':'为什么应该选 '+escQuiz(x.answer)}</b><div>${escQuiz(x.e||'')}</div></div>`:(ok?`<div class="quiz-explain">这个词的核心意思已经认出来了。下一步是在句子里继续认。</div>`:`<div class="quiz-explain">正确答案：<b>${escQuiz(x.answer)}</b>。这道题会进入更早的复习队列。</div>`);
  $('quizFeedback').innerHTML=`${ok?'✅ 正确':'❌ 这题没选对'}${explanation}<button class="primary quiz-next" id="quizNextBtn">下一题</button>`;
  const n=$('quizNextBtn');if(n)n.onclick=()=>{quizSession.i++;nextQuestion()};
};

injectQuizStyle();
const oldPage=typeof page==='function'?page:null;
if(oldPage){page=function(id,...rest){const r=oldPage(id,...rest);if(id==='testPage'&&!quizSession)renderTestHome();return r}}
window.__ZBZ_READY__=typeof startQuiz==='function'&&typeof studyRender==='function'&&typeof renderWord==='function';
const fail=document.getElementById('bootFail');if(fail&&window.__ZBZ_READY__)fail.classList.add('hidden');
const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.6';
})();