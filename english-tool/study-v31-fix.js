(()=>{
ensureStudyState=function({resume=true}={}){
  const sig=daySignature();let st=resume?savedStudy():null;
  if(!st||st.sig!==sig||!Array.isArray(st.queue)||!st.groups||(st.phase==='cards'&&!st.queue.length)){
    st=blankStudyState(1);makeGroup(st,1)
  }else st.sig=sig;
  return st
};
setStudyDay=function(day,{resume=true}={}){
  homeStudyDay=Math.max(1,Math.min(180,Number(day)||today()));studyReveal=false;studyMoreOpen=false;
  if(!resume)delete S.studyV3[homeStudyDay];
  const st=ensureStudyState({resume});
  if(st.phase==='cards'&&st.cursor>=st.queue.length)finishGroup(st);
  studyRender();if(S.studySettings.autoSpeak&&st.phase==='cards')studySpeakCurrent()
};
studyToggleSkipMastered=function(){S.studySettings.skipMastered=!S.studySettings.skipMastered;save();delete S.studyV3[homeStudyDay];setStudyDay(homeStudyDay,{resume:false})};
studyRestart=function(){delete S.studyV3[homeStudyDay];setStudyDay(homeStudyDay,{resume:false})};
window.__ZBZ_READY__=true;
})();