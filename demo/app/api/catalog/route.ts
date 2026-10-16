import {env} from 'cloudflare:workers';
import {refreshCatalog} from '@/lib/feeds.mjs';
let refreshPromise:Promise<unknown>|null=null;
export async function GET(request:Request){
 const cached=env.BUCKET?await env.BUCKET.get('catalog-v2.json'):null;
 if(cached)return new Response(cached.body,{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, max-age=60','X-Catalog-Cache':'shared'}});
 return Response.redirect(new URL('/jobs.json',request.url),307);
}
export async function POST(request:Request){
 try{
  if(!env.BUCKET)return Response.json({error:'Catalog storage unavailable.'},{status:503});
  if(!refreshPromise)refreshPromise=(async()=>{const old=await env.BUCKET!.get('catalog-v2.json');let previous=old?await old.json():null;if(!previous&&env.ASSETS){const seed=await env.ASSETS.fetch(new Request(new URL('/jobs.json',request.url)));if(seed.ok)previous=await seed.json();}const catalog=await refreshCatalog(previous);await env.BUCKET!.put('catalog-v2.json',JSON.stringify(catalog),{httpMetadata:{contentType:'application/json'}});return catalog;})().finally(()=>{refreshPromise=null;});
  return Response.json(await refreshPromise,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'Refresh failed.'},{status:502});}
}
