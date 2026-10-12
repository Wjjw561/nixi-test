(()=>{
'use strict';
const KEEP=new Set(['a','an','the','am','is','are','do','does','did','can','should','must','in','on','at','this','that','these','those','i','he','she','it']);
const w=x=>String(x||'').trim().toLowerCase();
function apply(root,word){if(!root||!word)return;for(const card of root.querySelectorAll('.structure-card')){if(!KEEP.has(word))card.remove();else{const t=card.querySelector('.structure-title');if(t)t.textContent='🧩 句子里的作用'}}}
function clean(){
  try{apply(document.getElementById('homeStudyCardWrap'),w(typeof studyCurrent==='function'?studyCurrent()?.w:''))}catch(e){}
  try{apply(document.getElementById('result'),w(document.getElementById('q')?.value||window.currentWord||''))}catch(e){}
  try{const c=document.querySelector('.category-detail-card');apply(c,w(c?.querySelector('.category-detail-word')?.textContent||''))}catch(e){}
}
let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;setTimeout(()=>{clean();busy=false},0)}).observe(document.body,{childList:true,subtree:true});
clean();setInterval(clean,1200);window.ZBZStructureFix={ready:true,version:'46'};
})();