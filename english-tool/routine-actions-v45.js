(()=>{
'use strict';
const $id=id=>document.getElementById(id);
function toastMsg(t){try{toast(t)}catch(e){}}
function todayDay(){try{return today()}catch(e){return 1}}
function goLearn(){
  try{page('searchPage')}catch(e){}
  try{setStudyDay(todayDay(),{resume:true})}catch(e){}
  setTimeout(()=>{$id('homeStudySection')?.scrollIntoView({behavior:'smooth',block:'start'})},40)
}
function goReview(){
  const row=$id('routineCard')?.querySelectorAll('.routine-task')?.[1];
  if(row?.classList.contains('done')){toastMsg('当前没有到期复习');return}
  try{page('reviewPage')}catch(e){}
  setTimeout(()=>{$id('startReview')?.scrollIntoView({behavior:'smooth',block:'center'})},40)
}
function goSpell(){
  const row=$id('routineCard')?.querySelectorAll('.routine-task')?.[2];
  if(row?.dataset.locked==='1'){toastMsg('先完成今天的新词熟悉度判断，再生成主动拼写');return}
  if(typeof window.startSpellingTest==='function')window.startSpellingTest('today');
  else toastMsg('拼写训练模块还没载入，请刷新页面');
}
function goListen(){
  const row=$id('routineCard')?.querySelectorAll('.routine-task')?.[3];
  if(row?.dataset.locked==='1'){toastMsg('先完成今天的新词熟悉度判断，再生成听力训练');return}
  if(typeof window.startListeningTest==='function')window.startListeningTest('choice','today');
  else toastMsg('听力训练模块还没载入，请刷新页面');
}
function goNext(){
  const rows=[...($id('routineCard')?.querySelectorAll('.routine-task')||[])];
  for(const row of rows){
    if(row.classList.contains('done'))continue;
    const b=row.querySelector('button');
    if(b&&!b.disabled){b.click();return}
  }
  if(rows.some(r=>!r.classList.contains('done')))toastMsg('下一项还没解锁，先完成前面的任务');
  else toastMsg('今天的主线任务已经完成');
}
window.routineGoLearn=goLearn;
window.routineGoReview=goReview;
window.routineGoSpell=goSpell;
window.routineGoListen=goListen;
window.routineGoNext=goNext;
window.runNextRoutineTask=goNext;
let patching=false;
function patchRoutine(){
  if(patching)return;
  const card=$id('routineCard');if(!card)return;
  patching=true;
  try{
    const rows=[...card.querySelectorAll('.routine-task')];
    const actions=['routineGoLearn()','routineGoReview()','routineGoSpell()','routineGoListen()'];
    const labels=['继续学习','去复习','去拼写','去听力'];
    rows.forEach((row,i)=>{
      const b=row.querySelector('button');if(!b||i>3)return;
      const locked=(i===2||i===3)&&/学完今天的新词后生成/.test(row.textContent||'');
      if(b.getAttribute('onclick')!==actions[i])b.setAttribute('onclick',actions[i]);
      if(row.dataset.locked!==(locked?'1':'0'))row.dataset.locked=locked?'1':'0';
      if(b.disabled!==locked)b.disabled=locked;
      const label=locked?'未解锁':labels[i];
      if(b.textContent!==label)b.textContent=label;
    });
    const next=card.querySelector('.routine-next');
    if(next&&next.getAttribute('onclick')!=='routineGoNext()')next.setAttribute('onclick','routineGoNext()');
  }finally{patching=false}
}
const style=document.createElement('style');style.id='routineActions45Style';style.textContent=`#routineCard .routine-task button:disabled{opacity:.45;cursor:not-allowed;background:var(--card);color:var(--muted)}#routineCard .routine-task[data-locked="1"]{opacity:.78}`;document.head.appendChild(style);
const boot=setInterval(()=>{patchRoutine();if($id('routineCard'))clearInterval(boot)},120);setTimeout(()=>clearInterval(boot),12000);
new MutationObserver(()=>patchRoutine()).observe(document.body,{childList:true,subtree:true});
patchRoutine();
window.ZBZRoutineActions={ready:true,version:'45'};
})();