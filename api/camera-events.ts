import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { adminClient, json, method } from './_lib/server';

function rawBody(req: VercelRequest): string {
  if (typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body ?? {});
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['POST'])) return;
  const secret = process.env.CAMERA_INGEST_SECRET;
  if (!secret) return json(res, 503, { error: 'Layanan penerimaan kamera belum dikonfigurasi.' });
  const bodyText = rawBody(req);
  const signature = String(req.headers['x-planttrack-signature'] || '').replace(/^sha256=/, '');
  const expected = createHmac('sha256', secret).update(bodyText).digest('hex');
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json(res, 401, { error: 'Tanda tangan perangkat tidak valid.' });
  try {
    const body = JSON.parse(bodyText);
    const required = ['camera_id','external_event_id','occurred_at','direction'];
    if (required.some(k => !body[k])) return json(res, 400, { error: 'Data event kamera belum lengkap.' });
    const confidence = body.confidence == null ? null : Number(body.confidence);
    if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) return json(res, 400, { error: 'Nilai confidence tidak valid.' });
    const db = adminClient();
    const { data, error } = await db.rpc('ingest_camera_event', {
      p_camera_id: body.camera_id, p_external_event_id: String(body.external_event_id).slice(0,160),
      p_employee_id: body.employee_id || null, p_occurred_at: body.occurred_at,
      p_direction: body.direction, p_confidence: confidence,
      p_metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
    });
    if (error) throw error;
    return json(res, 202, { accepted: true, event: data });
  } catch {
    return json(res, 400, { error: 'Event kamera tidak dapat diproses. Periksa ID kamera, karyawan, dan waktu.' });
  }
}
