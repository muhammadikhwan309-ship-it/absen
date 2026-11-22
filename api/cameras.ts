import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, fail, json, method, requireUser } from './_lib/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req,res,['GET'])) return;
  try {
    const session=await requireUser(req);
    if(!session) return json(res,401,{error:'Silakan masuk kembali.'});
    if(!['super_admin','factory_admin','security'].includes(session.profile.role)) return json(res,403,{error:'Role tidak memiliki izin melihat kamera.'});
    const db=adminClient();
    let query=db.from('cameras').select('id,factory_id,area_id,gate_id,name,external_ref,status,last_seen_at,created_at').order('name');
    if(session.profile.role==='super_admin') query=query.in('factory_id',(await db.from('factories').select('id').eq('company_id',session.profile.company_id)).data?.map(x=>x.id)||[]);
    else query=query.eq('factory_id',session.profile.factory_id);
    const {data,error}=await query;
    if(error) throw error;
    return json(res,200,{data:data||[]});
  } catch(error){return fail(res,error);}
}
