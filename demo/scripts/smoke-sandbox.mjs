import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {ANSWERS,RESUME,sha256} from '../lib/sandbox.mjs';

const base=new URL(process.argv[2]||'http://127.0.0.1:5175');
if(!['127.0.0.1','localhost','applyburst.decentbard5.chatgpt.site'].includes(base.hostname))throw new Error('Only the ApplyBurst sandbox is allowed.');
const runId=crypto.randomUUID(),job=JSON.parse(readFileSync('public/jobs.json','utf8')).jobs[0];
const checks=[];const started=performance.now();
async function submit({resume=RESUME,missing=false,id=job.id}={}){
 const data=new FormData();data.set('job_id',id);data.set('run_id',runId);
 for(const [key,value]of Object.entries(ANSWERS))if(!missing||key!=='email')data.set(key,value);
 data.set('resume',new Blob([resume]),'synthetic-resume.txt');
 const response=await fetch(new URL('/api/sandbox/apply',base),{method:'POST',body:data,signal:AbortSignal.timeout(20000)});
 return {status:response.status,body:await response.json()};
}
const first=await submit();assert.equal(first.status,200);assert.equal(first.body.state,'confirmed_sandbox');assert.equal(first.body.resume_sha256,await sha256(RESUME));checks.push('Valid synthetic multipart submission and SHA-256 receipt');
const again=await submit();assert.equal(again.body.receipt_id,first.body.receipt_id);assert.equal(again.body.received_at,first.body.received_at);checks.push('Same job/run replay returns the original persisted receipt');
assert.equal((await submit({resume:'corrupt bytes'})).status,422);checks.push('Corrupt resume rejected');
assert.equal((await submit({missing:true})).status,422);checks.push('Missing candidate answer rejected');
assert.equal((await submit({id:'unknown:employer:123'})).status,400);checks.push('Unregistered board rejected');
const response=await fetch(new URL('/api/sandbox/receipts?run_id='+runId,base));assert.equal(response.status,200);const stored=await response.json();assert.equal(stored.count,1);assert.equal(stored.receipts[0].receipt_id,first.body.receipt_id);checks.push('Independent read confirms exactly one durable receipt');
const report={utc:new Date().toISOString(),scope:'Synthetic data; ApplyBurst sandbox only; no employer or mail writes',origin:base.origin,run_id:runId,elapsed_ms:performance.now()-started,checks,passed:checks.length};
if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
