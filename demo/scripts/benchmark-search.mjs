import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {SearchEngine} from '../public/search-engine.mjs';
const raw=readFileSync('public/jobs.json'),start=performance.now(),catalog=JSON.parse(raw);
const parseMs=performance.now()-start;global.gc?.();const before=process.memoryUsage().heapUsed;
const packedRaw=readFileSync('public/search-index.json'),packedStart=performance.now(),packed=JSON.parse(packedRaw),packedParseMs=performance.now()-packedStart;
const engine=new SearchEngine(catalog,packed);global.gc?.();const heap=process.memoryUsage().heapUsed-before;
const queries=['description:postgresql','description:"distributed systems" NOT title:senior','location:turkey AND (skill:python OR skill:java OR skill:sql)','workplace:remote AND (kubernetes OR terraform)','(level:junior OR type:intern) AND (engineer OR developer)','title:engineer AND skill:python NOT level:lead','company:stripe AND (java OR ruby)','skill:"C++" AND (game OR runtime)','(node.js OR react) NOT company:palantir','description:"work authorization"'];
const reports=[];
for(const query of queries){const times=[];let response;for(let i=0;i<30;i++){response=engine.search(query,{},50);times.push(response.query_ms);}times.sort((a,b)=>a-b);reports.push({query,matches:response.total,median_ms:times[15],p95_ms:times[28],samples_ms:times,examples:response.results.slice(0,3).map(j=>({id:j.id,title:j.title,company:j.company,evidence:j.evidence}))});}
const report={utc:new Date().toISOString(),node:process.version,scope:'Full-description CPU search with prebuilt index; Node process on desktop, not laptop or browser evidence',postings:catalog.jobs.length,opportunities:new Set(catalog.jobs.map(j=>j.canonical_id||j.id)).size,decoded_bytes:raw.length,gzip_bytes:gzipSync(raw).length,index_bytes:packedRaw.length,index_gzip_bytes:gzipSync(packedRaw).length,json_parse_ms:parseMs,index_parse_ms:packedParseMs,index_init_ms:engine.initMs,prebuilt:engine.prebuilt,additional_index_heap_bytes:heap,process_heap_bytes:process.memoryUsage().heapUsed,queries:reports};
const target=process.argv[2]||'search-benchmark.json';writeFileSync(target,JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,queries:reports.map(({query,matches,median_ms,p95_ms})=>({query,matches,median_ms,p95_ms}))},null,2));
