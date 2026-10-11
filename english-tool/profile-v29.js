(()=>{
const DAY_MS=86400000;
const TYPES={
  article_ref:{label:'冠词：特指 / 泛指',group:'冠词',tip:'先判断你说的是“随便一个”还是“双方都知道的那个”。',words:['a','the'],bank:[
    {s:'I bought a book yesterday. ___ book is very useful.',a:'the',o:['the','a','an','some'],e:'前面已经提到这本书，第二次提到同一本书用 the。'},
    {s:'I need ___ pen. Any pen is fine.',a:'a',o:['a','the','an','some'],e:'这里只要任意一支笔，不特指，所以用 a。'},
    {s:'Please close ___ door. We both know which door.',a:'the',o:['the','a','an','any'],e:'双方都知道具体是哪扇门，用 the。'},
    {s:'He wants to buy ___ new phone, but he has not chosen one yet.',a:'a',o:['a','the','an','some'],e:'还没确定具体哪一部，只表示“一个”，用 a。'}]},
  article_sound:{label:'冠词：a / an 发音判断',group:'冠词',tip:'看开头的“声音”，不是只看首字母。',words:['a','an'],bank:[
    {s:'She ate ___ apple.',a:'an',o:['an','a','the','some'],e:'apple 以元音音素开头，用 an。'},
    {s:'It took me ___ hour.',a:'an',o:['an','a','the','one'],e:'hour 的 h 不发音，开头是元音音素，用 an。'},
    {s:'He studies at ___ university.',a:'a',o:['a','an','the','some'],e:'university 开头读 /j/，是辅音音素，所以用 a。'},
    {s:'She is ___ honest person.',a:'an',o:['an','a','the','some'],e:'honest 的 h 不发音，开头是元音音素，用 an。'}]},
  be_agreement:{label:'be 动词：am / is / are',group:'be 动词',tip:'先看主语：I am；he/she/it is；you/we/they are。',words:['am','is','are'],bank:[
    {s:'I ___ a student.',a:'am',o:['am','is','are','do'],e:'I 在现在时里和 am 搭配。'},
    {s:'She ___ happy today.',a:'is',o:['is','am','are','does'],e:'she 是第三人称单数，用 is。'},
    {s:'They ___ my classmates.',a:'are',o:['are','is','am','do'],e:'they 是复数主语，用 are。'},
    {s:'You ___ right.',a:'are',o:['are','is','am','does'],e:'you 无论单复数都用 are。'}]},
  be_vs_do:{label:'句型：be / do 不混用',group:'句型',tip:'有 am/is/are 的句子直接用 be；普通实义动词的疑问和否定常需要 do。',words:['do','does','am','is','are'],bank:[
    {s:'___ you happy?',a:'Are',o:['Are','Do','Does','Is'],e:'happy 是形容词，句子用 be 动词：Are you happy?'},
    {s:'___ you like English?',a:'Do',o:['Do','Are','Does','Is'],e:'like 是实义动词，一般现在时疑问句用 Do。'},
    {s:'___ she busy?',a:'Is',o:['Is','Does','Do','Are'],e:'busy 是形容词，she 搭配 is。'},
    {s:'___ she like English?',a:'Does',o:['Does','Is','Do','Are'],e:'like 是实义动词，she 的一般现在时疑问句用 Does。'}]},
  do_form:{label:'助动词：do / does / did',group:'助动词',tip:'看主语和时间：I/you/we/they 用 do；he/she/it 用 does；过去时用 did。',words:['do','does','did'],bank:[
    {s:'___ you know him?',a:'Do',o:['Do','Does','Did','Are'],e:'一般现在时，主语 you，用 Do。'},
    {s:'___ he know the answer?',a:'Does',o:['Does','Do','Did','Is'],e:'一般现在时，he 是第三人称单数，用 Does。'},
    {s:'___ you go there yesterday?',a:'Did',o:['Did','Do','Does','Were'],e:'yesterday 提示过去时，用 Did。'},
    {s:'She ___ not like coffee.',a:'does',o:['does','do','did','is'],e:'一般现在时，she 的否定用 does not，后面 like 用原形。'}]},
  prep_time:{label:'时间介词：in / on / at',group:'介词',tip:'月份/年份等较大范围用 in；具体某天用 on；具体钟点用 at。',words:['in','on','at'],bank:[
    {s:'My birthday is ___ October.',a:'in',o:['in','on','at','from'],e:'月份用 in。'},
    {s:'We have class ___ Monday.',a:'on',o:['on','in','at','for'],e:'具体某一天用 on。'},
    {s:'Meet me ___ 8:00.',a:'at',o:['at','in','on','from'],e:'具体钟点用 at。'},
    {s:'He was born ___ 2007.',a:'in',o:['in','on','at','by'],e:'年份属于较大的时间范围，用 in。'}]},
  prep_place:{label:'地点介词：in / on / at',group:'介词',tip:'里面/范围用 in；表面用 on；具体点位常用 at。',words:['in','on','at'],bank:[
    {s:'I live ___ China.',a:'in',o:['in','on','at','to'],e:'国家是较大的地点范围，用 in。'},
    {s:'The book is ___ the table.',a:'on',o:['on','in','at','to'],e:'在表面上用 on。'},
    {s:'She is ___ school now.',a:'at',o:['at','in','on','to'],e:'把 school 当作一个地点点位时常用 at。'},
    {s:'The keys are ___ the bag.',a:'in',o:['in','on','at','to'],e:'钥匙在包里面，用 in。'}]},
  pronoun_case:{label:'代词：主格 / 宾格 / 所有格',group:'代词',tip:'做主语用 I/he/we/they；动词后做宾语用 me/him/us/them；名词前表示“谁的”用 my/his/our/their。',words:['i','me','my','he','him','his','she','her','we','us','our','they','them','their'],bank:[
    {s:'___ am a student.',a:'I',o:['I','Me','My','Mine'],e:'这里缺主语，所以用主格 I。'},
    {s:'She likes ___.',a:'me',o:['me','I','my','mine'],e:'like 后面需要宾语，所以用 me。'},
    {s:'This is ___ book.',a:'my',o:['my','me','I','mine'],e:'book 前表示“我的”，用 my。'},
    {s:'The teacher helped ___.',a:'us',o:['us','we','our','ours'],e:'helped 后面需要宾语，用 us。'},
    {s:'That is ___ classroom.',a:'their',o:['their','them','they','ours'],e:'classroom 前表示“他们的”，用 their。'}]},
  demonstrative:{label:'指示词：远近 + 单复数',group:'指示词',tip:'近处 this/these，远处 that/those；再判断单数还是复数。',words:['this','that','these','those'],bank:[
    {s:'The book is here in my hand. ___ book is mine.',a:'This',o:['This','That','These','Those'],e:'近处 + 单数，用 this。'},
    {s:'The book over there is yours. ___ book is yours.',a:'That',o:['That','This','These','Those'],e:'远处 + 单数，用 that。'},
    {s:'The books here are new. ___ books are mine.',a:'These',o:['These','This','That','Those'],e:'近处 + 复数，用 these。'},
    {s:'The students over there are my classmates. ___ students are my classmates.',a:'Those',o:['Those','That','This','These'],e:'远处 + 复数，用 those。'}]},
  modal_meaning:{label:'情态动词：can / should / must',group:'情态动词',tip:'can 偏“能/会”，should 偏“应该”，must 偏“必须”。后面都接动词原形。',words:['can','should','must'],bank:[
    {s:'I ___ swim. （我会游泳）',a:'can',o:['can','should','must','am'],e:'表达能力“会”，用 can。'},
    {s:'You are tired. You ___ rest. （应该）',a:'should',o:['should','must','can','are'],e:'给建议“应该休息”，用 should。'},
    {s:'You ___ show your ID to enter. （必须）',a:'must',o:['must','should','can','are'],e:'表达强制要求“必须”，用 must。'}]},
  wh_choice:{label:'疑问词：问什么信息',group:'疑问词',tip:'what 问事物，where 问地点，when 问时间，why 问原因，how 问方式或状态。',words:['what','where','when','why','how'],bank:[
    {s:'___ are you from?',a:'Where',o:['Where','What','When','Why'],e:'询问地点用 where。'},
    {s:'___ are you late?',a:'Why',o:['Why','When','Where','What'],e:'询问原因用 why。'},
    {s:'___ is your class?',a:'When',o:['When','Where','Why','How'],e:'询问时间用 when。'},
    {s:'___ is this?',a:'What',o:['What','Where','When','Why'],e:'询问“是什么”用 what。'}]},
  conjunction_logic:{label:'连词：并列 / 转折 / 原因 / 条件',group:'连词',tip:'and 并列，but 转折，because 原因，if 条件。',words:['and','but','because','if'],bank:[
    {s:'I have a pen ___ a book.',a:'and',o:['and','but','because','if'],e:'连接并列的两个东西，用 and。'},
    {s:'I am tired, ___ I will study.',a:'but',o:['but','and','because','if'],e:'前后意思转折，用 but。'},
    {s:'I stayed home ___ it was raining.',a:'because',o:['because','but','and','if'],e:'后半句说明原因，用 because。'},
    {s:'___ it rains tomorrow, I will stay home.',a:'If',o:['If','Because','But','And'],e:'表达“如果……”，用 if。'}]}
};

S.errorTypes=S.errorTypes||{};
function recType(k){if(!S.errorTypes[k])S.errorTypes[k]={attempts:0,correct:0,wrong:0,streak:0,last:0,lastWrong:0,due:0,confusions:{}};const r=S.errorTypes[k];r.confusions=r.confusions||{};return r}
function acc(r){return r.attempts?Math.round((r.correct||0)/r.attempts*100):0}
function score(r){const a=r.attempts?(r.correct||0)/r.attempts:1;return (r.wrong||0)*2.5+(1-a)*5-(r.streak||0)*.6+(r.lastWrong&&Date.now()-r.lastWrong<DAY_MS?1.5:0)}
function typeStatus(r){if(!r?.attempts)return'未测试';if((r.wrong||0)===0&&r.attempts>=3)return'稳定';if((r.streak||0)>=3&&acc(r)>=80)return'正在稳定';if((r.wrong||0)>0)return'需要加强';return'观察中'}
function activeTypes(){return Object.entries(S.errorTypes).filter(([k,r])=>TYPES[k]&&(r.wrong||0)>0&&((r.streak||0)<3||acc(r)<80)).sort((a,b)=>score(b[1])-score(a[1])||(b[1].lastWrong||0)-(a[1].lastWrong||0))}
function dueTypes(){const now=Date.now();return activeTypes().filter(([,r])=>(r.due||0)<=now)}
function topConfusion(r){const x=Object.entries(r.confusions||{}).sort((a,b)=>b[1]-a[1])[0];return x?x[0]:''}
function saveType(){try{save()}catch(e){}}
function recordType(k,ok,selected,answer){if(!TYPES[k])return;const r=recType(k),now=Date.now();r.attempts++;r.last=now;if(ok){r.correct++;r.streak=(r.streak||0)+1;const d=[1,3,7,14][Math.min(r.streak-1,3)];r.due=now+d*DAY_MS}else{r.wrong++;r.streak=0;r.lastWrong=now;r.due=now+10*60*1000;const pair=`该用 ${String(answer)} 时选了 ${String(selected)}`;r.confusions[pair]=(r.confusions[pair]||0)+1}saveType()}
function classify(x,selected){if(!x||x.mode!=='context')return'';const w=String(x.w||'').toLowerCase(),s=String(x.sentence||'').toLowerCase(),sel=String(selected||'').toLowerCase();
  if(w==='the')return'article_ref';
  if(w==='an')return'article_sound';
  if(w==='a')return /apple|hour|honest|university/.test(s)?'article_sound':'article_ref';
  if(['am','is','are'].includes(w)){if(['do','does'].includes(sel))return'be_vs_do';return'be_agreement'}
  if(['do','does','did'].includes(w)){if(['am','is','are'].includes(sel))return'be_vs_do';return'do_form'}
  if(['in','on','at'].includes(w))return /october|monday|8:00|2007|year|month|day|clock/.test(s)?'prep_time':'prep_place';
  if(['i','me','my','he','him','his','she','her','we','us','our','they','them','their'].includes(w))return'pronoun_case';
  if(['this','that','these','those'].includes(w))return'demonstrative';
  if(['can','should','must'].includes(w))return'modal_meaning';
  if(['what','where','when','why','how'].includes(w))return'wh_choice';
  if(['and','but','because','if'].includes(w))return'conjunction_logic';
  return''
}

const prevAnswer=typeof answerQuestion==='function'?answerQuestion:null;
if(prevAnswer){answerQuestion=function(btn,x){const selected=btn?.dataset?.answer||'',ok=selected===x.answer,key=classify(x,selected);const out=prevAnswer(btn,x);if(key)recordType(key,ok,selected,x.answer);return out}}

let drill=null;
function shuf(a){return typeof shuffle==='function'?shuffle(a):[...a].sort(()=>Math.random()-.5)}
function renderDrill(){if(!drill)return;const card=$('testCard');if(drill.i>=drill.questions.length){const total=drill.questions.length,scoreN=drill.score,key=drill.key,d=TYPES[key];quizSession=null;card.innerHTML=`<div class="section-head">${esc(d.label)} · 专项完成</div><div class="quiz-word">${scoreN} / ${total}</div><div class="small">${scoreN===total?'这一轮很稳，但系统仍会隔天再验证。':scoreN>=Math.ceil(total*.7)?'有进步，错的题会更早回来。':'这个点还不稳，先别急着给自己颁毕业证。'}</div><div class="button-group space-top"><button class="primary" onclick="startErrorDrill('${key}')">再练一组</button><button class="secondary" onclick="page('reviewPage')">回到复习</button><button class="secondary" onclick="page('myPage')">看错误画像</button></div>`;renderErrorProfile();renderTypeReview();return}
  const q=drill.questions[drill.i];card.innerHTML=`<div class="quiz-head"><div><div class="small">${esc(TYPES[drill.key].label)} · 第 ${drill.i+1}/${drill.questions.length} 题</div><span class="quiz-kind">错因专项</span><div class="quiz-sentence">${esc(q.s).replace('___','<span class="blank">___</span>')}</div><div class="quiz-prompt">在句子里选出最合适的词</div></div></div><div class="quiz-options">${shuf(q.o).map(o=>`<button class="quiz-option profile-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="quizFeedback" class="quiz-feedback"></div>`;
  card.querySelectorAll('.profile-option').forEach(btn=>btn.onclick=()=>answerDrill(btn,q));
}
function answerDrill(btn,q){const selected=btn.dataset.answer,ok=selected===q.a;document.querySelectorAll('.profile-option').forEach(b=>{b.disabled=true;if(b.dataset.answer===q.a)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');
  drill.score+=ok?1:0;recordType(drill.key,ok,selected,q.a);try{quizResult(String(q.a).toLowerCase(),ok)}catch(e){}
  $('quizFeedback').innerHTML=`${ok?'✅ 正确':'❌ 这题没选对'}<div class="quiz-explain"><b>${ok?'为什么对':'为什么应该选 '+esc(q.a)}</b><div>${esc(q.e)}</div></div><button class="primary quiz-next" id="profileNext">下一题</button>`;$('profileNext').onclick=()=>{drill.i++;renderDrill()};
}
window.startErrorDrill=function(key){const d=TYPES[key];if(!d)return;let qs=[];while(qs.length<6)qs.push(...shuf(d.bank));qs=qs.slice(0,6);drill={key,questions:qs,i:0,score:0};quizSession={profileDrill:true};page('testPage');renderDrill()}

function injectStyle(){if(document.getElementById('profileV29Style'))return;const s=document.createElement('style');s.id='profileV29Style';s.textContent=`
.error-profile{margin-top:14px}.error-profile-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.error-profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.error-card{border:1px solid var(--line);border-radius:15px;padding:12px;background:var(--card)}.error-card.hot{box-shadow:inset 3px 0 0 #d86b57}.error-card.stable{box-shadow:inset 3px 0 0 #54a66a}.error-card b{display:block;font-size:13px}.error-card .meta{font-size:10px;color:var(--muted);line-height:1.5;margin-top:4px}.error-card .bar{height:6px;border-radius:999px;background:var(--line);overflow:hidden;margin:8px 0}.error-card .bar span{display:block;height:100%;background:var(--blue);border-radius:inherit}.error-card button{width:100%;border:1px solid var(--line);background:var(--soft);color:var(--blue);font-weight:850;border-radius:10px;padding:8px;margin-top:8px}.error-empty{font-size:11px;color:var(--muted);line-height:1.7;margin-top:10px}.type-review{margin:0 0 12px;padding:12px;border:1px solid var(--line);border-radius:15px;background:var(--card)}.type-review-list{display:grid;gap:7px;margin-top:8px}.type-review-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:9px 10px;border-radius:11px;background:var(--soft)}.type-review-row strong{display:block;font-size:12px}.type-review-row span{display:block;font-size:10px;color:var(--muted);margin-top:2px}.type-review-row button{border:0;border-radius:9px;padding:8px 9px;background:var(--blue);color:white;font-weight:850}
@media(max-width:620px){.error-profile-grid{grid-template-columns:1fr}.type-review-row{grid-template-columns:1fr}.type-review-row button{width:100%}}
`;document.head.appendChild(s)}
function ensureProfileBox(){let box=$('errorProfile');if(box)return box;const pageEl=$('myPage');if(!pageEl)return null;box=document.createElement('div');box.id='errorProfile';box.className='card error-profile';const data=pageEl.querySelector('.card:last-child');pageEl.insertBefore(box,data);return box}
function renderErrorProfile(){const box=ensureProfileBox();if(!box)return;const entries=Object.entries(S.errorTypes||{}).filter(([k,r])=>TYPES[k]&&r.attempts).sort((a,b)=>score(b[1])-score(a[1]));
  if(!entries.length){box.innerHTML=`<div class="error-profile-head"><div><div class="section-head">错误类型画像</div><div class="small">做过句子题以后，这里会告诉你到底是哪种英语结构在拖后腿。</div></div><span class="badge">等待数据</span></div><div class="error-empty">现在还没有足够的句子题记录。系统不会为了显得聪明就凭空编一个“弱项”给你。</div>`;return}
  const weak=entries.filter(([,r])=>(r.wrong||0)>0&&typeStatus(r)!=='正在稳定').slice(0,6);const view=(weak.length?weak:entries.slice(0,6));
  box.innerHTML=`<div class="error-profile-head"><div><div class="section-head">错误类型画像</div><div class="small">把“介词差”继续拆成时间介词、地点介词；把“语法差”拆成真正能练的错误。</div></div><span class="badge">${weak.length?weak.length+' 个重点':'状态稳定'}</span></div><div class="error-profile-grid">${view.map(([k,r])=>{const d=TYPES[k],a=acc(r),conf=topConfusion(r);return`<div class="error-card ${(r.wrong||0)>0?'hot':'stable'}"><b>${esc(d.label)}</b><div class="meta">${typeStatus(r)} · 正确率 ${a}% · 错 ${r.wrong||0} 次</div><div class="bar"><span style="width:${a}%"></span></div>${conf?`<div class="meta">最常见：${esc(conf)}</div>`:''}<div class="meta">${esc(d.tip)}</div><button onclick="startErrorDrill('${k}')">专项练 6 题</button></div>`}).join('')}</div>`
}
function renderTypeReview(){const list=$('reviewList');if(!list)return;let box=$('typeReviewPanel');if(!box){box=document.createElement('div');box.id='typeReviewPanel';box.className='type-review';const concept=$('conceptReviewPanel');if(concept)concept.insertAdjacentElement('afterend',box);else list.parentNode.insertBefore(box,list)}const a=activeTypes().slice(0,4),due=dueTypes();
  if(!a.length){box.innerHTML=`<b>细分错因</b><div class="error-empty">还没有需要单独修的细分错误。继续做句子题，系统会区分“时间介词错”还是“地点介词错”。</div>`;return}
  box.innerHTML=`<b>细分错因</b><div class="small">${due.length?due.length+' 个已经到复习时间':'按严重程度排序'}</div><div class="type-review-list">${a.map(([k,r])=>`<div class="type-review-row"><div><strong>${esc(TYPES[k].label)}</strong><span>正确率 ${acc(r)}% · ${esc(topConfusion(r)||TYPES[k].tip)}</span></div><button onclick="startErrorDrill('${k}')">专项练</button></div>`).join('')}</div>`
}
const prevRenderReview=typeof renderReview==='function'?renderReview:null;if(prevRenderReview){renderReview=function(...a){const r=prevRenderReview(...a);renderTypeReview();return r}}
const prevPage=typeof page==='function'?page:null;if(prevPage){page=function(id,...rest){const r=prevPage(id,...rest);if(id==='myPage')renderErrorProfile();if(id==='reviewPage')renderTypeReview();return r}}
const startBtn=$('startReview');if(startBtn){const old=startBtn.onclick;startBtn.onclick=()=>{const d=dueTypes();if(d.length)return startErrorDrill(d[0][0]);const a=activeTypes();if(a.length)return startErrorDrill(a[0][0]);if(old)return old()}}

injectStyle();renderErrorProfile();renderTypeReview();const tag=document.querySelector('.tag');if(tag)tag.textContent='v2.8';window.__ZBZ_READY__=true;
})();