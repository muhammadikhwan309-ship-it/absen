import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, fail, json, method, requireUser } from './_lib/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['GET'])) return;
  try {
    const session = await requireUser(req);
    if (!session) return json(res, 401, { error: 'Silakan masuk kembali.' });
    const db = adminClient();
    const start = new Date(); start.setHours(0,0,0,0);
    const base = () => db.from('attendance_events').select('id', { count: 'exact', head: true })
      .eq('company_id', session.profile.company_id).gte('occurred_at', start.toISOString());
    const employees = db.from('employees').select('id', { count: 'exact', head: true }).eq('company_id', session.profile.company_id).eq('employment_status','active');
    const events = base();
    const review = base().eq('status','needs_review');
    const checkins = base().eq('event_type','check_in').eq('status','verified');
    const offline = db.from('cameras').select('id', { count: 'exact', head: true }).eq('status','offline');
    const [a,b,c,d,e] = await Promise.all([employees,events,review,checkins,offline]);
    if ([a,b,c,d,e].some(x=>x.error)) throw [a,b,c,d,e].find(x=>x.error)?.error;
    return json(res,200,{ data:{ active_employees:a.count||0, attendance_events_today:b.count||0, events_needing_review:c.count||0, verified_check_ins_today:d.count||0, offline_cameras:e.count||0, as_of:new Date().toISOString(), scope:session.profile.role==='super_admin'?'company':'assigned_factory' } });
  } catch(error) { return fail(res,error); }
}
