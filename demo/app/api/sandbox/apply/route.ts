import { env } from 'cloudflare:workers';
import {ANSWERS,RESUME,sha256,validateIdentity} from '@/lib/sandbox.mjs';
export async function POST(request:Request){
 try{
  if(!env.DB)return Response.json({error:'Sandbox storage is unavailable.'},{status:503});
  const form=await request.formData();const jobId=String(form.get('job_id')||''),runId=String(form.get('run_id')||'');
  validateIdentity(jobId,runId);
  for(const [key,value]of Object.entries(ANSWERS))if(form.get(key)!==value)return Response.json({error:'Only the synthetic demo profile is accepted.'},{status:422});
  const upload=form.get('resume');
  if(!(upload instanceof File)||upload.size>50000)return Response.json({error:'A synthetic resume file is required.'},{status:422});
  const bytes=await upload.arrayBuffer(),resumeHash=await sha256(bytes),expected=await sha256(RESUME);
  if(resumeHash!==expected)return Response.json({error:'Synthetic resume bytes did not match.'},{status:422});
  const owner=request.headers.get('oai-authenticated-user-id')||'local-demo';
  const key=await sha256(owner+':'+runId+':'+jobId),payloadHash=await sha256(JSON.stringify(ANSWERS)+resumeHash+jobId);
  const receipt={receipt_id:key.slice(0,24),job_id:jobId,run_id:runId,state:'confirmed_sandbox',received_at:Date.now(),resume_sha256:resumeHash,resume_bytes:bytes.byteLength,fields_verified:6,destination:'ApplyBurst sandbox only'};
  await env.DB.prepare('INSERT OR IGNORE INTO sandbox_receipts (key,owner,run_id,job_id,payload_hash,receipt,created_at) VALUES (?,?,?,?,?,?,?)').bind(key,owner,runId,jobId,payloadHash,JSON.stringify(receipt),Date.now()).run();
  const stored=await env.DB.prepare('SELECT payload_hash,receipt FROM sandbox_receipts WHERE key=?').bind(key).first<{payload_hash:string,receipt:string}>();
  if(!stored||stored.payload_hash!==payloadHash)return Response.json({error:'Idempotency payload conflict.'},{status:409});
  return Response.json(JSON.parse(stored.receipt),{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'Invalid request.'},{status:400});}
}
