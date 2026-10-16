import {readFileSync,writeFileSync} from 'node:fs';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {SearchEngine} from '../public/search-engine.mjs';
const catalog=JSON.parse(readFileSync('public/jobs.json','utf8'));catalog.search_revision=createHash('sha256').update(JSON.stringify(catalog.jobs)).digest('hex');writeFileSync('public/jobs.json',JSON.stringify(catalog));const engine=new SearchEngine(catalog);
const index={version:1,search_revision:catalog.search_revision,generated_at:catalog.generated_at,ids:engine.jobs.map(j=>j.id),lengths:engine.docs.map(d=>d.length),terms:[],values:[]};
for(const [term,postings]of engine.postings){index.terms.push(term);index.values.push([...postings].flat());}
const raw=JSON.stringify(index);writeFileSync('public/search-index.json',raw);
const start=performance.now(),loaded=new SearchEngine(catalog,JSON.parse(raw));
for(const q of ['python','description:"distributed systems" NOT title:senior','workplace:remote AND kubernetes','location:turkey','skill:"C++"','golang']){
 const expected=engine.search(q),actual=loaded.search(q);if(JSON.stringify(expected.results.map(j=>j.id))!==JSON.stringify(actual.results.map(j=>j.id))||expected.total!==actual.total)throw new Error('Prebuilt parity failed: '+q);
}
const report={utc:new Date().toISOString(),full_build_ms:engine.initMs,prebuilt_init_ms:loaded.initMs,index_bytes:Buffer.byteLength(raw),index_gzip_bytes:gzipSync(raw).length,verified_queries:6,prebuilt:loaded.prebuilt};if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
