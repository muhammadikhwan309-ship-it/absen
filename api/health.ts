import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, json, method } from './_lib/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['GET'])) return;
  try {
    const supabase = adminClient();
    const { error } = await supabase.from('companies').select('id', { head: true, count: 'exact' });
    if (error) throw error;
    return json(res, 200, { status: 'ok', api: 'online', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    const missing = error instanceof Error && error.message === 'SUPABASE_ENV_MISSING';
    return json(res, missing ? 503 : 503, { status: 'not_ready', api: 'online', database: 'not_configured_or_unreachable' });
  }
}
