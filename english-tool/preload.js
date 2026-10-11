(()=>{
  const nativeFetch=window.fetch.bind(window);
  const localMap={
    '小学英语大纲词汇.txt':'./data/primary.txt?v=40',
    '中考英语词汇表.txt':'./data/middle.txt?v=40',
    'CET4_edited.txt':'./data/cet4.txt?v=40',
    'COCA_20000.txt':'./data/frequency.txt?v=40'
  };
  const jsdMap={
    '小学英语大纲词汇.txt':'https://cdn.jsdelivr.net/gh/mahavivo/english-wordlists@master/%E5%B0%8F%E5%AD%A6%E8%8B%B1%E8%AF%AD%E5%A4%A7%E7%BA%B2%E8%AF%8D%E6%B1%87.txt',
    '中考英语词汇表.txt':'https://cdn.jsdelivr.net/gh/mahavivo/english-wordlists@master/%E4%B8%AD%E8%80%83%E8%8B%B1%E8%AF%AD%E8%AF%8D%E6%B1%87%E8%A1%A8.txt',
    'CET4_edited.txt':'https://cdn.jsdelivr.net/gh/mahavivo/english-wordlists@master/CET4_edited.txt',
    'COCA_20000.txt':'https://cdn.jsdelivr.net/gh/mahavivo/english-wordlists@master/COCA_20000.txt'
  };
  function sourceKey(url){
    const s=String(url||'');
    if(s.includes('%E5%B0%8F%E5%AD%A6')||s.includes('小学英语大纲词汇'))return'小学英语大纲词汇.txt';
    if(s.includes('%E4%B8%AD%E8%80%83')||s.includes('中考英语词汇表'))return'中考英语词汇表.txt';
    if(s.includes('CET4_edited.txt'))return'CET4_edited.txt';
    if(s.includes('COCA_20000.txt'))return'COCA_20000.txt';
    return'';
  }
  async function tryFetch(url,init){
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),7000);
    try{return await nativeFetch(url,{...(init||{}),signal:ctl.signal,cache:'no-store'})}finally{clearTimeout(timer)}
  }
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const key=sourceKey(url);
    if(!key)return nativeFetch(input,init);
    try{
      const local=await tryFetch(localMap[key],init);
      if(local.ok){window.__ZBZ_WORD_SOURCE__='local';return local}
    }catch(e){}
    try{
      const cdn=await tryFetch(jsdMap[key],init);
      if(cdn.ok){window.__ZBZ_WORD_SOURCE__='cdn-fallback';return cdn}
    }catch(e){}
    try{
      const original=await tryFetch(url,init);
      if(original.ok){window.__ZBZ_WORD_SOURCE__='raw-fallback';return original}
      return original
    }catch(e){throw e}
  };
  window.__ZBZ_LOCAL_WORDLISTS__=true;
})();