const U={
  p:'https://raw.githubusercontent.com/mahavivo/english-wordlists/master/%E5%B0%8F%E5%AD%A6%E8%8B%B1%E8%AF%AD%E5%A4%A7%E7%BA%B2%E8%AF%8D%E6%B1%87.txt',
  m:'https://raw.githubusercontent.com/mahavivo/english-wordlists/master/%E4%B8%AD%E8%80%83%E8%8B%B1%E8%AF%AD%E8%AF%8D%E6%B1%87%E8%A1%A8.txt',
  c:'https://raw.githubusercontent.com/mahavivo/english-wordlists/master/CET4_edited.txt',
  f:'https://raw.githubusercontent.com/mahavivo/english-wordlists/master/COCA_20000.txt'
};
const KEY='zbz-unified-v2', OLD_KEY='zbz-unified-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const todayKey=()=>new Date().toLocaleDateString('en-CA');
const DAY=86400000;

const CURATED={
  pitch:{must:[['投、扔','pitch the ball','The player pitched the ball to me.','球员把球投给了我。'],['球场','football pitch','They are playing on the football pitch.','他们正在足球场上踢球。'],['音高','high pitch','Her voice has a high pitch.','她的声音音调很高。']],rec:[['推销；提案','sales pitch','He gave a short sales pitch.','他做了一段简短的推销介绍。'],['搭帐篷','pitch a tent','We pitched a tent near the lake.','我们在湖边搭了帐篷。']],skip:['沥青、柏油等材料义','少见的“程度、强度”类义项'],tip:'先把 pitch 和“投球 / 球场 / 音高”绑定。'},
  issue:{must:[['问题；议题','an important issue','This is an important issue.','这是一个重要的问题。'],['发布；发行','issue a statement','The company issued a statement.','公司发布了一份声明。']],rec:[['（杂志的）一期','an issue of a magazine','I bought the latest issue.','我买了最新一期。']],skip:['血统、流出等少见义项'],tip:'四级里最先记“问题/议题”。'},
  charge:{must:[['收费；费用','free of charge','The service is free of charge.','这项服务是免费的。'],['给……充电','charge the phone','I need to charge my phone.','我需要给手机充电。'],['负责','be in charge of','She is in charge of the project.','她负责这个项目。']],rec:[['指控','charge sb. with','He was charged with theft.','他被指控盗窃。']],skip:['冲锋等较少见义项'],tip:'至少熟悉“收费、充电、负责”三个场景。'},
  present:{must:[['目前的；现在的','at present','I am busy at present.','我目前很忙。'],['礼物','birthday present','This is a birthday present for you.','这是给你的生日礼物。'],['展示；提出','present an idea','She presented her idea to the class.','她向全班展示了自己的想法。']],rec:[['出席的；在场的','be present','All the students were present.','所有学生都到场了。']],skip:['较正式、较少见的细分义项'],tip:'词性不同，读音和意思都可能变化。'},
  figure:{must:[['数字','sales figures','The sales figures are rising.','销售数字正在上升。'],['人物','a famous figure','He is a famous figure in history.','他是历史上的著名人物。'],['认为；估计','I figure that...','I figure that we need more time.','我觉得我们还需要更多时间。']],rec:[['图；图表','Figure 1','See Figure 1 for details.','详情见图1。']],skip:['身材等语境义项先认识即可'],tip:'阅读里 figure 经常不是“身材”。'},
  account:{must:[['账户','bank account','I opened a bank account.','我开了一个银行账户。'],['解释；说明','account for','How do you account for this change?','你如何解释这个变化？']],rec:[['描述；叙述','an account of','He gave an account of the accident.','他讲述了事故经过。'],['考虑到','take...into account','We must take cost into account.','我们必须把成本考虑进去。']],skip:['少见会计细分义项'],tip:'account for 和 take into account 值得整体记。'},
  cover:{must:[['覆盖；盖住','cover the table','Snow covered the ground.','雪覆盖了地面。'],['包含；涉及','cover a topic','This course covers basic grammar.','这门课涵盖基础语法。'],['封面','book cover','I like the cover of this book.','我喜欢这本书的封面。']],rec:[['支付；足以支付','cover the cost','This money will cover the cost.','这笔钱足以支付费用。']],skip:['新闻报道等细分义项后补'],tip:'阅读里 cover 经常表示“涉及、包括”。'},
  address:{must:[['地址','email address','Please write down your email address.','请写下你的邮箱地址。'],['处理；应对','address a problem','We must address this problem.','我们必须处理这个问题。']],rec:[['演讲；致辞','give an address','The president gave a short address.','校长做了简短致辞。']],skip:['称呼等细分义项'],tip:'address + problem / issue 往往是“处理”。'},
  apply:{must:[['申请','apply for','I applied for the job.','我申请了这份工作。'],['应用；使用','apply a method','We can apply this method.','我们可以应用这种方法。'],['适用','apply to','This rule applies to everyone.','这条规则适用于所有人。']],rec:[['涂；敷','apply cream','Apply the cream twice a day.','每天涂两次药膏。']],skip:[],tip:'apply for + 申请对象；apply to + 适用于。'},
  run:{must:[['跑','run fast','He runs every morning.','他每天早上跑步。'],['运行；运转','run a program','The program is running.','这个程序正在运行。'],['经营；管理','run a business','She runs a small business.','她经营一家小公司。']],rec:[['持续','run for','The meeting ran for two hours.','会议持续了两个小时。']],skip:['大量特殊搭配里的细分义项'],tip:'看到 program / business / time，要切换意思。'},
  take:{must:[['拿；带','take the book','Please take this book with you.','请把这本书带上。'],['花费（时间）','It takes...','It takes me an hour to get there.','我到那里要花一个小时。'],['乘坐；参加','take a bus / take an exam','I take the bus to school.','我坐公交去学校。']],rec:[['采取','take action','We need to take action now.','我们现在需要采取行动。']],skip:['大量短语动词细分义项'],tip:'take 最适合按搭配记。'},
  set:{must:[['放置','set the cup','She set the cup on the table.','她把杯子放在桌上。'],['设定；设置','set a goal','Set a clear goal for yourself.','给自己设定一个明确目标。'],['一套；一组','a set of','I bought a set of tools.','我买了一套工具。']],rec:[['（太阳）落下','the sun sets','The sun sets in the west.','太阳从西边落下。']],skip:['数学集合等专业义项'],tip:'先抓“放置 / 设置 / 一套”。'},
  point:{must:[['点；要点','main point','What is the main point of the passage?','这篇文章的主旨是什么？'],['指出；指向','point to','He pointed to the door.','他指向门口。'],['意义；目的','the point of','What is the point of doing that?','做那件事有什么意义？']],rec:[['分数；百分点','score points','The team scored three points.','这个队得了三分。']],skip:[],tip:'阅读题里的 main point 非常常见。'},
  state:{must:[['状态','in a good state','The building is in a good state.','这栋建筑状况良好。'],['陈述；说明','state that','The report states that costs are rising.','报告指出成本正在上升。'],['州；国家','the state','The law differs from state to state.','法律因州而异。']],rec:[],skip:[],tip:'阅读文章里 state 经常是动词“指出、说明”。'},
  term:{must:[['术语；词语','technical term','This is a common technical term.','这是一个常见的专业术语。'],['学期','this term','We have five courses this term.','这学期我们有五门课。'],['期限；时期','long term','We need a long-term plan.','我们需要一个长期计划。']],rec:[['条件','terms and conditions','Please read the terms and conditions.','请阅读条款和条件。']],skip:[],tip:'long-term / short-term 在四级阅读里很常见。'},
  matter:{must:[['事情；问题','What is the matter?','What is the matter with you?','你怎么了？'],['要紧；有关系','It does not matter.','It does not matter to me.','这对我来说没关系。'],['物质','matter and energy','Matter exists in different forms.','物质以不同形式存在。']],rec:[],skip:[],tip:'It does not matter. 直接整句记。'},
  mean:{must:[['意思是；意味着','What does ... mean?','What does this word mean?','这个单词是什么意思？'],['打算','mean to do','I did not mean to hurt you.','我不是故意伤害你的。']],rec:[['刻薄的；吝啬的','be mean to','Do not be mean to him.','别对他那么刻薄。']],skip:[],tip:'mean to do = 打算做；mean doing = 意味着做。'},
  range:{must:[['范围','a wide range of','The shop sells a wide range of products.','这家商店销售种类繁多的产品。'],['在……范围内变化','range from A to B','Prices range from $10 to $50.','价格从10美元到50美元不等。']],rec:[['山脉','mountain range','They crossed a mountain range.','他们穿过了一座山脉。']],skip:[],tip:'a wide range of 和 range from...to... 都很常见。'},
  course:{must:[['课程','take a course','I am taking an English course.','我正在上一门英语课程。'],['过程；进程','in the course of','Things changed in the course of the year.','事情在这一年中发生了变化。'],['当然','of course','Of course I remember you.','我当然记得你。']],rec:[['路线；航向','change course','The ship changed course.','船改变了航向。']],skip:[],tip:'of course 当整体记。'},
  deal:{must:[['处理','deal with','We need to deal with this problem.','我们需要处理这个问题。'],['交易；协议','make a deal','They made a deal yesterday.','他们昨天达成了协议。'],['大量','a great deal of','She has a great deal of experience.','她有丰富的经验。']],rec:[],skip:[],tip:'deal with 和 a great deal of 建议整体记。'}
};

function blankState(){
  return {version:2,words:{},book:{},planDone:{},days:[],start:todayKey(),quiz:{correct:0,total:0}};
}
function migrate(){
  let s=null;
  try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(s) return Object.assign(blankState(),s);
  let old=null;
  try{old=JSON.parse(localStorage.getItem(OLD_KEY)||'null')}catch(e){}
  if(!old) return blankState();
  const n=blankState();
  n.book=old.book||{};
  n.planDone=old.done||{};
  n.days=old.days||[];
  n.start=old.start||todayKey();
  for(const [w,r] of Object.entries(old.review||{})){
    const t=r.last||Date.now();
    n.words[w]={seen:1,self:r.g??1,correct:0,wrong:0,streak:0,correctDays:[],firstSeen:t,lastSeen:t,due:r.due||t,interval:1,lastQuiz:0};
  }
  return n;
}
let S=migrate();
S.words=S.words||{};S.book=S.book||{};S.planDone=S.planDone||{};S.days=S.days||[];S.quiz=S.quiz||{correct:0,total:0};S.start=S.start||todayKey();

let L={p:[],m:[],c:[],map:{},day:{},counts:{},freq:{}},curDay=1,currentWord='',quizSession=null,dictCache={};
try{dictCache=JSON.parse(localStorage.getItem('zbz-dict-cache-v2')||'{}')}catch(e){}

function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  stats();
}
function touch(){
  const d=todayKey();
  if(!S.days.includes(d))S.days.push(d);
  save();
}
function toast(t){
  const x=$('toast');x.textContent=t;x.classList.add('show');
  clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove('show'),1700);
}
function dateDiffDays(a,b){return Math.floor((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/DAY)}
function uniqueDays(a){return [...new Set(a||[])].sort()}
function rec(w){
  if(!S.words[w]) S.words[w]={seen:0,self:null,correct:0,wrong:0,streak:0,correctDays:[],firstSeen:0,lastSeen:0,due:0,interval:0,lastQuiz:0};
  return S.words[w];
}
function statusOf(w){
  const r=S.words[w];
  if(!r||!r.seen) return 'unseen';
  const cd=uniqueDays(r.correctDays), total=(r.correct||0)+(r.wrong||0),acc=total?(r.correct||0)/total:0;
  const span=cd.length>1?dateDiffDays(cd[0],cd[cd.length-1]):0;
  if((r.correct||0)>=4 && (r.streak||0)>=3 && cd.length>=3 && span>=6 && acc>=.8) return 'mastered';
  if((r.correct||0)>=2 && (r.streak||0)>=2 && cd.length>=2 && acc>=.65) return 'familiar';
  return 'learning';
}
const statusLabel=s=>({unseen:'未学习',learning:'学习中',familiar:'基本认识',mastered:'已掌握'}[s]);
function statusPill(w){const s=statusOf(w);return `<span class="state-pill ${s}">${statusLabel(s)}</span>`}
function mainMeaning(w){
  if(CURATED[w]?.must?.[0]?.[0]) return CURATED[w].must[0][0];
  return cleanMeaning(L.map[w]?.z||'');
}
function cleanMeaning(z){
  return String(z||'').replace(/\s+/g,' ').replace(/^\[[^\]]+\]\s*/,'').trim();
}
function markSeen(w,subjective=null){
  const r=rec(w),now=Date.now();
  if(!r.seen){r.seen=1;r.firstSeen=now}
  r.lastSeen=now;
  if(subjective!==null)r.self=subjective;
  return r;
}
function subjective(w,g){
  const r=markSeen(w,g),now=Date.now();
  const delay=[0,1,2,2][g];
  r.due=now+delay*DAY;
  if(g===0)r.due=now;
  const d=L.day[w];if(d){S.planDone[d]=S.planDone[d]||{};S.planDone[d][w]=1}
  save(); if(d===curDay)renderDay();
  renderWord(w);
  toast(g===3?'已记录“很熟”，但要通过测试才算掌握':g===0?'已记录不会，稍后优先复习':`${delay} 天后复习`);
}
function quizResult(w,correct){
  const r=markSeen(w,rSafeSelf(w)),now=Date.now(),d=todayKey();
  r.lastQuiz=now;
  if(correct){
    r.correct=(r.correct||0)+1;
    r.streak=(r.streak||0)+1;
    r.correctDays=uniqueDays([...(r.correctDays||[]),d]);
    const intervals=[1,3,7,14,30,60];
    r.interval=intervals[Math.min(r.streak-1,intervals.length-1)];
    r.due=now+r.interval*DAY;
    S.quiz.correct=(S.quiz.correct||0)+1;
  }else{
    r.wrong=(r.wrong||0)+1;r.streak=0;r.interval=0;r.due=now+10*60*1000;
  }
  S.quiz.total=(S.quiz.total||0)+1;
  const pd=L.day[w];if(pd){S.planDone[pd]=S.planDone[pd]||{};S.planDone[pd][w]=1}
  save();
}
function rSafeSelf(w){return S.words[w]?.self??1}

let voices=[];
function refreshVoices(){try{voices=speechSynthesis.getVoices()||[]}catch(e){voices=[]}}
refreshVoices();
try{speechSynthesis.onvoiceschanged=refreshVoices}catch(e){}
function speak(w,lang='en-US'){
  if(!('speechSynthesis'in window))return toast('当前浏览器不支持朗读');
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang=lang;u.rate=.82;
  const exact=voices.find(v=>v.lang?.toLowerCase()===lang.toLowerCase());
  const prefix=voices.find(v=>v.lang?.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
  if(exact||prefix)u.voice=exact||prefix;
  speechSynthesis.speak(u);
}
function parseBasic(t){
  return t.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(x=>/^[a-z][a-z.'-]*$/.test(x)).map(w=>({w,p:'',z:''}));
}
function parseLex(t){
  let a=[];
  for(let l of t.split(/\r?\n/)){
    l=l.replace(/^\uFEFF/,'').trim();
    if(!l||/^[A-Z]$/.test(l))continue;
    let m=l.match(/^([A-Za-z][A-Za-z.'-]*)/);if(!m)continue;
    let w=m[1].toLowerCase(),r=l.slice(m[1].length).trim(),p='';
    let pm=r.match(/^\[([^\]]+)\]/);if(pm){p='['+pm[1]+']';r=r.slice(pm[0].length).trim()}
    a.push({w,p,z:r});
  }
  let seen=new Set;return a.filter(x=>!seen.has(x.w)&&seen.add(x.w));
}
function parseFreq(t){
  const rank={};let n=0;
  for(const raw of t.split(/\r?\n/)){const w=raw.trim().toLowerCase();if(!/^[a-z][a-z.'-]*$/.test(w)||rank[w])continue;rank[w]=++n}
  return rank;
}
function byFreq(a){return [...a].sort((x,y)=>(L.freq[x.w]||999999)-(L.freq[y.w]||999999)||x.w.localeCompare(y.w))}
async function txt(url,k){
  const ck='zbz:source:'+k;
  try{const v=localStorage.getItem(ck);if(v)return v}catch(e){}
  const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(k);
  const t=await r.text();try{localStorage.setItem(ck,t)}catch(e){}return t;
}
function slice(arr,n,N){const a=Math.floor(arr.length*(n-1)/N),b=Math.floor(arr.length*n/N);return arr.slice(a,b)}
function plan(day){if(day<=30)return slice(L.p,day,30);if(day<=90)return slice(L.m,day-30,60);return slice(L.c,day-90,90)}
function stage(day){return day<=30?'零基础补漏':day<=90?'中学桥梁':'CET-4 主体'}
function today(){
  let a=new Date(S.start+'T00:00:00'),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);
  return Math.max(1,Math.min(180,Math.floor((b-a)/DAY)+1));
}
async function load(){
  try{
    let [a,b,c,f]=await Promise.all([txt(U.p,'p'),txt(U.m,'m'),txt(U.c,'c'),txt(U.f,'f')]);
    L.freq=parseFreq(f);
    let p=parseBasic(a),mm=parseLex(b),cc=parseLex(c),ps=new Set(p.map(x=>x.w)),ms=new Set(mm.map(x=>x.w));
    L.p=byFreq(p);L.m=byFreq(mm.filter(x=>!ps.has(x.w)));L.c=byFreq(cc.filter(x=>!ps.has(x.w)&&!ms.has(x.w)));
    for(let x of [...cc,...mm,...p]){
      if(!L.map[x.w])L.map[x.w]={...x};
      else{
        if(!L.map[x.w].p&&x.p)L.map[x.w].p=x.p;
        if(!L.map[x.w].z&&x.z)L.map[x.w].z=x.z;
      }
    }
    for(let d=1;d<=180;d++)for(let x of plan(d))if(!L.day[x.w])L.day[x.w]=d;
    L.counts={p:p.length,m:mm.length,c:cc.length,total:L.p.length+L.m.length+L.c.length};
    $('planMeta').textContent=`按常用度排序：零基础 ${L.p.length} · 中学新增 ${L.m.length} · 四级新增 ${L.c.length} · 共 ${L.counts.total} 个计划词`;
    setDay(today());renderQuick();stats();
    if($('q').value)renderWord($('q').value);
  }catch(e){
    $('planMeta').textContent='词表载入失败。检查网络后刷新；已有学习记录不会丢。';
    $('dayWords').innerHTML='<div class="empty"><strong>计划词表暂时没载入</strong>查词和已缓存数据仍可使用。</div>';
  }
}
function badge(w){
  const d=L.day[w];return d?`<div class="tip">📅 180 天计划：第 ${d} 天 · ${stage(d)}${d===today()?' · 今天':''}</div>`:'';
}
function mblock(m){return `<div class="meaning"><b>${esc(m[0])}</b><div class="phrase">${esc(m[1])}</div><div class="example">${esc(m[2])}</div><div class="translation">${esc(m[3])}</div></div>`}
async function dict(w){
  if(dictCache[w])return dictCache[w];
  try{
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),5000);
    let r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(w),{signal:ctl.signal});clearTimeout(timer);
    if(!r.ok)throw 0;let j=await r.json(),e=j[0],defs=[];
    for(let m of e.meanings||[]){
      for(let d of m.definitions||[]){
        defs.push({p:m.partOfSpeech||'',d:d.definition||'',e:d.example||''});
        if(defs.length>=5)break;
      }
      if(defs.length>=5)break;
    }
    const out={phon:e.phonetic||'',defs};
    dictCache[w]=out;
    const keys=Object.keys(dictCache);if(keys.length>120)delete dictCache[keys[0]];
    try{localStorage.setItem('zbz-dict-cache-v2',JSON.stringify(dictCache))}catch(e){}
    return out;
  }catch(e){return null}
}
function evidenceHTML(w){
  const r=S.words[w],s=statusOf(w);
  if(!r||!r.seen)return `<div class="tip">状态：${statusPill(w)}。第一次学习后，系统才开始记录复习证据。</div>`;
  const total=(r.correct||0)+(r.wrong||0),acc=total?Math.round((r.correct||0)/total*100):0,days=uniqueDays(r.correctDays).length;
  return `<div class="tip"><div class="head"><div>系统判定：${statusPill(w)}</div><div class="small">主观：${r.self==null?'未选择':['不会','有印象','认识','很熟'][r.self]}</div></div>
  <div class="evidence"><div><b>${r.correct||0}</b><span>测试答对</span></div><div><b>${r.streak||0}</b><span>连续答对</span></div><div><b>${days}</b><span>答对日期</span></div><div><b>${acc}%</b><span>测试正确率</span></div></div></div>`;
}
async function renderWord(w){
  w=String(w||'').trim().toLowerCase().replace(/[^a-z.'-]/g,'');if(!w)return;currentWord=w;$('q').value=w;touch();
  const item=L.map[w]||null,cur=CURATED[w],di=await dict(w),book=!!S.book[w],zh=cleanMeaning(item?.z||'');
  let detail='';
  if(cur){
    detail+=`<div class="title">🟢 必须记</div>${cur.must.map(mblock).join('')}`;
    if(cur.rec.length)detail+=`<div class="title">🟡 认识即可</div>${cur.rec.map(mblock).join('')}`;
    detail+=`<div class="warning"><b>🔴 暂时不用背</b><div class="translation">${cur.skip.length?cur.skip.map(x=>'• '+esc(x)).join('<br>'):'暂无需要跳过的义项'}</div></div>`;
    detail+=`<div class="tip">💡 ${esc(cur.tip)}</div>`;
  }else{
    detail+=`<div class="title">计划词表释义</div><div class="meaning">${esc(zh||'这个词不在 180 天计划词表里，下面显示在线词典释义。')}</div>`;
  }
  if(di?.defs?.length){
    detail+=`<div class="title">在线词典补充 <span class="small">英文解释，用来确认语境</span></div>${di.defs.map(x=>`<div class="meaning"><b>${esc(x.p)}</b><div>${esc(x.d)}</div>${x.e?`<div class="example">${esc(x.e)}</div>`:''}</div>`).join('')}`;
  }
  const canTest=!!mainMeaning(w);
  $('result').innerHTML=`<div class="card">
    <div class="wordtop">
      <div><div class="word">${esc(w)}</div><div class="phon">${esc(item?.p||di?.phon||'')}</div><div class="small">${statusPill(w)}</div></div>
      <div class="voices"><button class="voice" onclick="speak('${esc(w)}','en-US')">🇺🇸 美音</button><button class="voice" onclick="speak('${esc(w)}','en-GB')">🇬🇧 英音</button></div>
    </div>
    ${badge(w)}
    ${detail}
    ${evidenceHTML(w)}
    <div class="title">你的感觉 <span class="small">只调整复习，不直接判“掌握”</span></div>
    <div class="actions">
      <button onclick="subjective('${esc(w)}',0)">不会</button>
      <button onclick="subjective('${esc(w)}',1)">有印象</button>
      <button onclick="subjective('${esc(w)}',2)">认识</button>
      <button onclick="subjective('${esc(w)}',3)">很熟</button>
    </div>
    <div class="button-group space-top">
      <button class="primary" ${canTest?'':"disabled"} onclick="startSingleTest('${esc(w)}')">立即测试这个词</button>
      <button class="secondary" onclick="book('${esc(w)}')">${book?'★ 已收藏':'☆ 加入生词本'}</button>
    </div>
  </div>`;
}
async function search(force){
  const w=(force||$('q').value).trim().toLowerCase().replace(/[^a-z.'-]/g,'');if(!w)return;
  $('result').innerHTML='<div class="card empty">正在查词…</div>';
  await renderWord(w);
}
function book(w){S.book[w]?delete S.book[w]:S.book[w]=Date.now();save();renderWord(w)}
function togglePlanDone(day,w){
  S.planDone[day]=S.planDone[day]||{};
  if(S.planDone[day][w])delete S.planDone[day][w];
  else{
    S.planDone[day][w]=1;const r=markSeen(w,1);if(!r.due)r.due=Date.now()+DAY;
  }
  save();renderDay();
}
function setDay(d){curDay=Math.max(1,Math.min(180,Number(d)||1));$('dayInput').value=curDay;renderDay()}
function renderDay(){
  if(!L.p.length)return;
  const a=plan(curDay),done=S.planDone[curDay]||{},n=a.filter(x=>done[x.w]).length;
  $('stage').textContent=stage(curDay);$('daySummary').textContent=`第 ${curDay} 天 · ${a.length} 个新词 · 今日进度只代表“学过”，不代表“掌握”`;
  $('bar').style.width=(a.length?n/a.length*100:0)+'%';$('progressText').textContent=`今日已处理 ${n} / ${a.length}`;
  $('dayWords').innerHTML=a.map((x,i)=>{
    const it=L.map[x.w]||x,ok=!!done[x.w];
    return `<div class="row">
      <div class="row-main" onclick="openWord('${esc(x.w)}')">
        <div class="rowword">${i+1}. ${esc(x.w)} ${statusPill(x.w)}</div>
        <div class="small">${esc(it.p||'')} ${esc(cleanMeaning(it.z||''))}</div>
        <div class="small">点开进入同一个单词学习卡</div>
      </div>
      <div class="row-actions">
        <button onclick="event.stopPropagation();speak('${esc(x.w)}','en-US')">🇺🇸</button>
        <button onclick="event.stopPropagation();togglePlanDone(${curDay},'${esc(x.w)}')">${ok?'撤销今日':'今日已学'}</button>
      </div>
    </div>`;
  }).join('');
}
function openWord(w){page('searchPage');$('q').value=w;renderWord(w)}
function learnNext(){
  const a=plan(curDay),done=S.planDone[curDay]||{};
  const x=a.find(v=>!done[v.w])||a.find(v=>statusOf(v.w)!=='mastered')||a[0];
  if(x)openWord(x.w);else toast('这一天没有可继续学习的词');
}
function dueWords(){
  const now=Date.now();
  return Object.entries(S.words).filter(([w,r])=>r.seen&&r.due<=now).sort((a,b)=>{
    const order={learning:0,familiar:1,mastered:2};
    return (order[statusOf(a[0])]??3)-(order[statusOf(b[0])]??3)||(a[1].due||0)-(b[1].due||0);
  }).map(x=>x[0]);
}
function renderReview(){
  const a=dueWords();
  $('reviewList').innerHTML=a.length?a.map(w=>`<div class="row"><div class="row-main" onclick="openWord('${esc(w)}')"><div class="rowword">${esc(w)} ${statusPill(w)}</div><div class="small">${esc(mainMeaning(w))}</div></div><button onclick="startSingleTest('${esc(w)}')">测试</button></div>`).join(''):'<div class="empty"><strong>今天没有到期复习</strong>去完成今天的新词，别主动给自己制造欠债。</div>';
  $('startReview').disabled=!a.length;
}
function renderBook(){
  const a=Object.keys(S.book);
  $('bookList').innerHTML=a.length?a.map(w=>`<div class="row"><div class="row-main" onclick="openWord('${esc(w)}')"><div class="rowword">${esc(w)} ${statusPill(w)}</div><div class="small">${esc(mainMeaning(w))}</div></div><button onclick="book('${esc(w)}')">移除</button></div>`).join(''):'<div class="empty"><strong>生词本还是空的</strong>查词时收藏那些总在你脑子门口转悠但死活不进来的词。</div>';
}
function stats(){
  const ws=Object.keys(S.words).filter(w=>S.words[w]?.seen),counts={learning:0,familiar:0,mastered:0};
  ws.forEach(w=>counts[statusOf(w)]++);
  $('touched').textContent=ws.length;$('learning').textContent=counts.learning;$('familiar').textContent=counts.familiar;$('mastered').textContent=counts.mastered;$('due').textContent=dueWords().length;
  $('myTouched').textContent=ws.length;$('myQuiz').textContent=S.quiz.total||0;$('myAccuracy').textContent=(S.quiz.total?Math.round(S.quiz.correct/S.quiz.total*100):0)+'%';$('myDays').textContent=S.days.length;
  renderReview();renderBook();
}
function renderQuick(){
  const seed=['pitch','issue','charge','run','take','address','apply','figure'];
  const ranked=Object.keys(S.words).sort((a,b)=>(S.words[b].lastSeen||0)-(S.words[a].lastSeen||0));
  const arr=[...ranked,...seed].filter((x,i,a)=>a.indexOf(x)===i).slice(0,12);
  $('quick').innerHTML=arr.map(w=>`<button class="chip" onclick="openWord('${esc(w)}')">${esc(w)}</button>`).join('');
}
function poolWithMeanings(){
  return Object.keys(L.map).filter(w=>mainMeaning(w)&&mainMeaning(w).length<80);
}
function shuffle(a){
  const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x;
}
function makeQuestion(w,mode){
  const pool=poolWithMeanings().filter(x=>x!==w);
  if(mode==='zh-en'){
    const answer=w,prompt=mainMeaning(w),opts=shuffle([answer,...shuffle(pool).slice(0,3)]);
    return {w,mode,prompt,answer,opts};
  }
  const answer=mainMeaning(w),prompt=w;
  const distract=shuffle(pool).map(mainMeaning).filter((x,i,a)=>x&&x!==answer&&a.indexOf(x)===i).slice(0,3);
  return {w,mode:'en-zh',prompt,answer,opts:shuffle([answer,...distract])};
}
function startQuiz(words,title='快速测验'){
  const eligible=[...new Set(words)].filter(w=>mainMeaning(w));
  if(!eligible.length)return toast('这些词暂时没有可用于中文测试的释义');
  const count=Math.min(10,eligible.length);
  quizSession={words:shuffle(eligible).slice(0,count),i:0,score:0,title};
  page('testPage');nextQuestion();
}
function startSingleTest(w){startQuiz([w],'单词测试')}
function nextQuestion(){
  const q=quizSession;if(!q)return;
  if(q.i>=q.words.length){
    $('testCard').innerHTML=`<div class="section-head">测试完成</div><div class="quiz-word">${q.score} / ${q.words.length}</div><div class="small">答题记录已经写入掌握度系统。真正掌握靠跨天复习，不靠今天一口气把自己感动。</div><div class="button-group space-top"><button class="primary" onclick="page('reviewPage')">查看复习</button><button class="secondary" onclick="page('planPage')">回到计划</button></div>`;
    stats();return;
  }
  const w=q.words[q.i],mode=Math.random()<.5?'en-zh':'zh-en',x=makeQuestion(w,mode);
  $('testCard').innerHTML=`<div class="quiz-head"><div><div class="small">${esc(q.title)} · 第 ${q.i+1}/${q.words.length} 题</div><div class="quiz-word">${esc(x.prompt)}</div><div class="quiz-prompt">${mode==='en-zh'?'选出最合适的中文核心意思':'根据中文核心意思选英文单词'}</div></div><button class="voice" onclick="speak('${esc(w)}','en-US')">🔊</button></div><div class="quiz-options">${x.opts.map(o=>`<button class="quiz-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="quizFeedback" class="quiz-feedback"></div>`;
  document.querySelectorAll('.quiz-option').forEach(btn=>btn.onclick=()=>answerQuestion(btn,x));
}
function answerQuestion(btn,x){
  const ok=btn.dataset.answer===x.answer;
  document.querySelectorAll('.quiz-option').forEach(b=>{b.disabled=true;if(b.dataset.answer===x.answer)b.classList.add('correct')});
  if(!ok)btn.classList.add('wrong');
  quizResult(x.w,ok);if(ok)quizSession.score++;
  $('quizFeedback').innerHTML=ok?`✅ 正确。当前状态：${statusPill(x.w)}`:`❌ 正确答案：<b>${esc(x.answer)}</b>。10 分钟后优先复习。`;
  setTimeout(()=>{quizSession.i++;nextQuestion()},900);
}
function mixedTest(){
  let pool=Object.keys(S.words).filter(w=>S.words[w]?.seen&&mainMeaning(w));
  if(pool.length<4)pool=poolWithMeanings().slice(0,30);
  startQuiz(pool,'综合测试');
}
function weakTest(){
  let pool=Object.keys(S.words).filter(w=>S.words[w]?.seen&&statusOf(w)!=='mastered'&&mainMeaning(w));
  startQuiz(pool,'薄弱词测试');
}
function reviewTest(){startQuiz(dueWords(),'今日复习')}
function dayTest(){startQuiz(plan(curDay).map(x=>x.w),`第 ${curDay} 天小测`)}
function page(id){
  ['searchPage','planPage','reviewPage','testPage','bookPage','myPage'].forEach(x=>$(x).classList.toggle('hidden',x!==id));
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  if(id==='planPage')renderDay();if(id==='reviewPage')renderReview();if(id==='bookPage')renderBook();if(id==='myPage')stats();
}
function exportData(){
  const blob=new Blob([JSON.stringify({app:'只背这个',version:2,exportedAt:new Date().toISOString(),state:S},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='只背这个-学习数据.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importData(file){
  const fr=new FileReader();fr.onload=()=>{try{const j=JSON.parse(fr.result);if(!j.state)throw 0;S=Object.assign(blankState(),j.state);save();setDay(today());toast('学习数据已导入')}catch(e){toast('导入失败：文件格式不对')}};fr.readAsText(file);
}

$('go').onclick=()=>search();
$('q').onkeydown=e=>{if(e.key==='Enter')search()};
$('prevDay').onclick=()=>setDay(curDay-1);$('nextDay').onclick=()=>setDay(curDay+1);$('dayInput').onchange=e=>setDay(e.target.value);$('todayBtn').onclick=()=>setDay(today());
$('learnNext').onclick=learnNext;$('quizDay').onclick=dayTest;$('startReview').onclick=reviewTest;$('startMixedTest').onclick=mixedTest;$('startWeakTest').onclick=weakTest;
$('dueBanner').onclick=()=>page('reviewPage');$('exportBtn').onclick=exportData;$('importFile').onchange=e=>e.target.files?.[0]&&importData(e.target.files[0]);
document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>setDay(b.dataset.jump));
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>page(b.dataset.page));
window.addEventListener('storage',e=>{if(e.key===KEY){try{S=JSON.parse(e.newValue)||S;stats();renderDay()}catch(x){}}});
try{if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}catch(e){}
stats();touch();renderQuick();load();$('q').value='pitch';renderWord('pitch');