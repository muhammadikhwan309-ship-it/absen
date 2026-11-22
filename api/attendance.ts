import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, fail, json, method, requireUser } from './_lib/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['GET'])) return;
  try {
    const session = await requireUser(req);
    if (!session) return json(res, 401, { error: 'Silakan masuk kembali.' });
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
    const db = adminClient();
    let query = db.from('attendance_events')
      .select('id,employee_id,camera_id,gate_id,event_type,occurred_at,direction,confidence,status,review_status,review_reason,source', { count: 'exact' })
      .eq('company_id', session.profile.company_id).order('occurred_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (session.profile.role !== 'super_admin') query = query.eq('factory_id', session.profile.factory_id);
    if (req.query.factory_id && session.profile.role === 'super_admin') query = query.eq('factory_id', String(req.query.factory_id));
    if (req.query.status) query = query.eq('status', String(req.query.status));
    const { data, error, count } = await query;
    if (error) throw error;
    return json(res, 200, { data, page, limit, total: count || 0 });
  } catch (error) { return fail(res, error); }
}
