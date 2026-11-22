import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, fail, json, method, requireUser } from './_lib/server';

export default async function handler(req: VercelRequest,res: VercelResponse){
 if(!method(req,res,['GET'])) return;
 try{
  const session=await requireUser(req); if(!session) return json(res,401,{error:'Silakan masuk kembali.'});
  const db=adminClient();
  let query=db.from('shifts').select('id,factory_id,name,start_time,end_time,tolerance_minutes,crosses_midnight,work_days').order('start_time');
  if(session.profile.role==='super_admin'){
   const {data:factories,error}=await db.from('factories').select('id').eq('company_id',session.profile.company_id); if(error) throw error;
   query=query.in('factory_id',(factories||[]).map(x=>x.id));
  }else query=query.eq('factory_id',session.profile.factory_id);
  const {data,error}=await query; if(error) throw error;
  return json(res,200,{data:data||[]});
 }catch(error){return fail(res,error);}
}
