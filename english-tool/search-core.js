(()=>{
'use strict';
const MAX_HISTORY=12;
const KEEP_STRUCTURE=new Set(['a','an','the','am','is','are','do','does','did','can','should','must','in','on','at','this','that','these','those','i','he','she','it']);
const byId=id=>document.getElementById(id);
const normalize=v=>String(v||'').trim().toLowerCase().replace(/[^a-z.'-]/g,'');
function history(){
  if(typeof S==='undefined')return[];
  if(!Array.isArray(S.searchHistory))S.searchHistory=[];
  S.searchHistory=S.searchHistory.map(normalize).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,MAX_HISTORY);
  return S.searchHistory;
}
function persistHistory(){
  try{if(typeof KEY!=='undefined')localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
}
function remember(w){
  w=normalize(w);if(!w)return;
  const arr=[w,...history().filter(x=>x!==w)].slice(0,MAX_HISTORY);
  S.searchHistory=arr;persistHistory();renderRecent();
}
let renderingRecent=false;
function renderRecent(){
  const q=byId('quick');if(!q)return;
  renderingRecent=true;
  const arr=history();
  q.innerHTML=arr.map(w=>`<button class="chip" data-recent-query="1" onclick="openWord('${esc(w)}')">${esc(w)}</button>`).join('');
  q.setAttribute('aria-label',arr.length?'最近查过的单词':'');
  renderingRecent=false;
}
const baseSearch=typeof search==='function'?search:null;
async function searchWithHistory(force){
  const w=normalize(force||byId('q')?.value||'');
  if(!w)return;
  remember(w);
  if(baseSearch)return baseSearch(force);
}
try{search=searchWithHistory}catch(e){}window.search=searchWithHistory;
try{renderQuick=renderRecent}catch(e){}window.renderQuick=renderRecent;
function currentSearchWord(){return normalize(byId('q')?.value||'')}
function shouldKeepStructure(w){
  if(KEEP_STRUCTURE.has(w))return true;
  const lex=window.ZBZLexicon;
  if(!lex||typeof lex.wordPos!=='function')return null;
  try{return (lex.wordPos(w)||[]).some(x=>x&&x.kind==='function')}catch(e){return false}
}
let cleanupTimer=0;
function cleanupSearchStructure(){
  clearTimeout(cleanupTimer);
  cleanupTimer=setTimeout(()=>{
    const result=byId('result'),w=currentSearchWord();if(!result||!w)return;
    const nodes=[...result.querySelectorAll('.structure-card')];if(!nodes.length)return;
    const keep=shouldKeepStructure(w);
    if(keep===null){setTimeout(cleanupSearchStructure,80);return}
    if(!keep)nodes.forEach(n=>n.remove());
  },0);
}
function clearDefaultPitch(){
  const q=byId('q'),result=byId('result');
  if(q&&normalize(q.value)==='pitch')q.value='';
  if(result&&(!q||!normalize(q.value)))result.innerHTML='';
}
const quick=byId('quick');
if(quick)new MutationObserver(()=>{
  if(renderingRecent)return;
  const foreign=[...quick.querySelectorAll('button')].some(b=>!b.hasAttribute('data-recent-query'));
  if(foreign)renderRecent();
}).observe(quick,{childList:true,subtree:true});
const result=byId('result');
if(result)new MutationObserver(cleanupSearchStructure).observe(result,{childList:true,subtree:true});
clearDefaultPitch();renderRecent();cleanupSearchStructure();
setTimeout(renderRecent,500);setTimeout(renderRecent,2500);
window.ZBZSearch={ready:true,version:'44',remember,history:()=>[...history()]};
})();