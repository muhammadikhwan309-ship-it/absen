import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type User } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(body);
}
export function method(req: VercelRequest, res: VercelResponse, allowed: string[]) {
  if (!allowed.includes(req.method || '')) {
    res.setHeader('Allow', allowed.join(', '));
    json(res, 405, { error: 'Metode tidak diizinkan.' });
    return false;
  }
  return true;
}
export function adminClient() {
  if (!url || !serviceKey) throw new Error('SUPABASE_ENV_MISSING');
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function requireUser(req: VercelRequest): Promise<{ user: User; profile: any } | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const supabase = adminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile, error: profileError } = await supabase.from('profiles')
    .select('id,company_id,factory_id,full_name,role,is_active')
    .eq('id', data.user.id).single();
  if (profileError || !profile?.is_active) return null;
  return { user: data.user, profile };
}
export function fail(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (message === 'SUPABASE_ENV_MISSING') return json(res, 503, { error: 'Database belum dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_SECRET_KEY.' });
  return json(res, 500, { error: 'Terjadi kesalahan server.' });
}
