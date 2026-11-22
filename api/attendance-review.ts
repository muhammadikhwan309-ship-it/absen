import type { VercelRequest,VercelResponse } from '@vercel/node';
import {adminClient,json,method,requireUser} from './_lib/server';

export default async function handler(req:VercelRequest,res:VercelResponse){
 if(!method(req,res,['POST'])) return;
 try{
  const session=await requireUser(req); if(!session) return json(res,401,{error:'Silakan masuk kembali.'});
  if(!['super_admin','factory_admin','hrd','supervisor','security'].includes(session.profile.role)) return json(res,403,{error:'Role tidak memiliki izin meninjau absensi.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  const eventId=String(body?.event_id||'');
  const decision=String(body?.decision||'');
  const reason=String(body?.reason||'').trim();
  if(!eventId||!['approved','rejected','escalated'].includes(decision)||reason.length<3||reason.length>1000) return json(res,400,{error:'ID kejadian, keputusan, dan alasan minimal 3 karakter wajib diisi.'});
  const db=adminClient();
  const {data,error}=await db.rpc('review_attendance_event',{p_event_id:eventId,p_reviewer_id:session.user.id,p_decision:decision,p_reason:reason});
  if(error){
   if(error.message.includes('EVENT_NOT_FOUND')) return json(res,404,{error:'Kejadian tidak ditemukan.'});
   if(error.message.includes('REVIEW_FORBIDDEN')) return json(res,403,{error:'Tidak diizinkan meninjau kejadian ini.'});
   return json(res,400,{error:'Tinjauan tidak dapat disimpan.'});
  }
  return json(res,200,{data});
 }catch{return json(res,500,{error:'Terjadi gangguan saat menyimpan tinjauan.'});}
}
