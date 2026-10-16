import {SearchEngine} from './search-engine.mjs';
let engine;
self.onmessage=async ({data})=>{
  try{
    if(data.type==='init'||data.type==='refresh'){
      const tick=performance.now();
      const indexPromise=data.type==='init'?fetch('/search-index.json').then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null);
      const response=await fetch('/api/catalog',{method:data.type==='refresh'?'POST':'GET'});
      if(!response.ok)throw new Error(`Catalog request failed (${response.status}).`);
      const catalog=await response.json(),packed=await indexPromise;engine=new SearchEngine(catalog,packed);
      self.postMessage({type:'ready',request_id:data.request_id,total:catalog.jobs.length,sources:catalog.sources,
        generated_at:catalog.generated_at,coverage:catalog.coverage,index_ms:engine.initMs,prebuilt:engine.prebuilt,load_ms:performance.now()-tick});
    }else if(data.type==='resolve'){
      if(engine)self.postMessage({type:'selection',jobs:(data.ids||[]).map(id=>engine.docs[engine.byId.get(id)]?.job).filter(Boolean),requested:(data.ids||[]).length});
    }else if(data.type==='search'){
      if(!engine)throw new Error('The index is still loading.');
      self.postMessage({type:'results',request_id:data.request_id,...engine.search(data.query,data.filters,data.limit)});
    }
  }catch(error){self.postMessage({type:'error',request_id:data.request_id,message:error.message});}
};
