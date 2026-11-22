import type {VercelRequest,VercelResponse} from '@vercel/node';
import {adminClient,fail,json,method,requireUser} from './_lib/server';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(!method(req,res,['GET','PATCH'])) return;
 try{
  const session=await requireUser(req); if(!session) return json(res,401,{error:'Silakan masuk kembali.'});
  const db=adminClient();
  if(req.method==='PATCH'){
   const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
   const id=String(body?.id||''); if(!id) return json(res,400,{error:'ID notifikasi wajib diisi.'});
   const {data,error}=await db.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('company_id',session.profile.company_id).or(`recipient_id.eq.${session.user.id},recipient_id.is.null`).select('id,read_at').single();
   if(error) return json(res,404,{error:'Notifikasi tidak ditemukan.'});
   return json(res,200,{data});
  }
  let query=db.from('notifications').select('id,category,title,body,read_at,created_at,factory_id').eq('company_id',session.profile.company_id).order('created_at',{ascending:false}).limit(100);
  if(session.profile.role!=='super_admin') query=query.or(`factory_id.eq.${session.profile.factory_id},factory_id.is.null`);
  const {data,error}=await query; if(error) throw error;
  return json(res,200,{data:data||[]});
 }catch(error){return fail(res,error);}
}
