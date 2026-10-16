import {env} from 'cloudflare:workers';
import {BOARDS} from '@/lib/sandbox.mjs';
import {greenhouseSchema} from '@/lib/form-schema.mjs';
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('job_id')||'',parts=id.split(':'),[provider,board,externalId]=parts;
 if(parts.length!==3||!BOARDS.some(([p,b])=>p===provider&&b===board)||!/^[-a-zA-Z0-9]+$/.test(externalId))return Response.json({error:'Unknown job destination.'},{status:400});
 if(provider!=='greenhouse')return Response.json({job_id:id,provider,status:'browser_inspection_required',inspection:'unsupported_public_schema',automatic_submission_verified:false,note:'This provider needs a browser-based form inspection. The posting feed does not expose a complete application schema.'});
 const key='schema/'+id+'.json',cached=env.BUCKET?await env.BUCKET.get(key):null;
 if(cached){const payload=await cached.json() as Record<string,any>;if(Date.now()/1000-payload.inspected_at<3600)return Response.json(payload);}
 const url=`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${externalId}?questions=true`;
 try{const response=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)return Response.json({error:`Source returned HTTP ${response.status}.`,status:'inspection_failed'},{status:502});
  const schema={...greenhouseSchema(id,await response.json()),source_url:url};
  if(env.BUCKET)await env.BUCKET.put(key,JSON.stringify(schema));return Response.json(schema);
 }catch{return Response.json({error:'The source inspection timed out; no application was attempted.',status:'inspection_failed'},{status:502});}
}
