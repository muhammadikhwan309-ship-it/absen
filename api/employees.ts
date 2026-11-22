import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, fail, json, method, requireUser } from './_lib/server';

const writeRoles = ['super_admin', 'factory_admin', 'hrd'];
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['GET', 'POST'])) return;
  try {
    const session = await requireUser(req);
    if (!session) return json(res, 401, { error: 'Silakan masuk kembali.' });
    const db = adminClient();
    if (req.method === 'GET') {
      if (!['super_admin','factory_admin','hrd','supervisor','security'].includes(session.profile.role)) return json(res, 403, { error: 'Role tidak memiliki izin melihat direktori karyawan.' });
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
      let query = db.from('employees').select('id,employee_code,full_name,job_title,employment_status,department_id,shift_id,factory_id,created_at', { count: 'exact' })
        .eq('company_id', session.profile.company_id).order('full_name').range((page - 1) * limit, page * limit - 1);
      if (session.profile.role !== 'super_admin') query = query.eq('factory_id', session.profile.factory_id);
      if (req.query.search) query = query.ilike('full_name', `%${String(req.query.search).slice(0,80)}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      return json(res, 200, { data, page, limit, total: count || 0 });
    }
    if (!writeRoles.includes(session.profile.role)) return json(res, 403, { error: 'Role tidak memiliki izin mengelola karyawan.' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const full_name = String(body?.full_name || '').trim();
    const employee_code = String(body?.employee_code || '').trim();
    if (!full_name || !employee_code || !session.profile.factory_id) return json(res, 400, { error: 'Nama, kode karyawan, dan pabrik wajib diisi.' });
    if (full_name.length > 120 || employee_code.length > 40) return json(res, 400, { error: 'Panjang data melebihi batas.' });
    const { data, error } = await db.from('employees').insert({
      company_id: session.profile.company_id, factory_id: session.profile.factory_id,
      full_name, employee_code, job_title: String(body.job_title || '').slice(0,120),
      department_id: body.department_id || null, shift_id: body.shift_id || null
    }).select().single();
    if (error) throw error;
    await db.from('audit_logs').insert({ company_id: session.profile.company_id, actor_id: session.user.id, action: 'employee.created', target_type: 'employee', target_id: data.id, after_value: { employee_code, full_name } });
    return json(res, 201, { data });
  } catch (error) { return fail(res, error); }
}
