import {env} from 'cloudflare:workers';
export async function GET(request:Request){
 if(!env.DB)return Response.json({error:'Sandbox storage unavailable.'},{status:503});
 const runId=new URL(request.url).searchParams.get('run_id')||'';
 if(!/^[-a-zA-Z0-9]{8,80}$/.test(runId))return Response.json({error:'Invalid run.'},{status:400});
 const owner=request.headers.get('oai-authenticated-user-id')||'local-demo';
 const result=await env.DB.prepare('SELECT receipt FROM sandbox_receipts WHERE owner=? AND run_id=? ORDER BY created_at LIMIT 100').bind(owner,runId).all<{receipt:string}>();
 return Response.json({run_id:runId,count:result.results.length,receipts:result.results.map(row=>JSON.parse(row.receipt))},{headers:{'Cache-Control':'no-store'}});
}
