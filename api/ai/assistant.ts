import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminClient, json, method, requireUser } from '../_lib/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!method(req, res, ['POST'])) return;
  const session = await requireUser(req).catch(() => null);
  if (!session) return json(res, 401, { error: 'Silakan masuk untuk menggunakan AI Assistant.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json(res, 503, { error: 'AI belum aktif. Tambahkan OPENAI_API_KEY pada Environment Variables Vercel.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const question = String(body?.question || '').trim();
    if (!question || question.length > 1000) return json(res, 400, { error: 'Pertanyaan wajib diisi dan maksimal 1.000 karakter.' });
    const db = adminClient();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [{ count: total }, { count: needsReview }, { count: late }] = await Promise.all([
      db.from('attendance_events').select('id', { count: 'exact', head: true }).eq('company_id', session.profile.company_id).gte('occurred_at', since),
      db.from('attendance_events').select('id', { count: 'exact', head: true }).eq('company_id', session.profile.company_id).eq('status', 'needs_review').gte('occurred_at', since),
      db.from('attendance_events').select('id', { count: 'exact', head: true }).eq('company_id', session.profile.company_id).eq('status', 'verified').eq('event_type', 'check_in').gte('occurred_at', since)
    ]);
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0.2, messages: [
        { role: 'system', content: 'Anda adalah asisten analisis kehadiran PlantTrack AI. Jawab hanya berdasarkan ringkasan data yang diberikan. Jika data tidak cukup, katakan dengan jelas. Jangan menyimpulkan pelanggaran atau merekomendasikan sanksi. Jangan meminta atau mengungkap data biometrik. Jawab Bahasa Indonesia dengan ringkas.' },
        { role: 'user', content: `Ringkasan agregat 30 hari perusahaan pengguna: total event=${total || 0}, perlu tinjauan=${needsReview || 0}, check-in terverifikasi=${late || 0}. Pertanyaan: ${question}` }
      ] })
    });
    if (!response.ok) return json(res, 502, { error: 'Penyedia AI gagal merespons. Coba lagi nanti.' });
    const result: any = await response.json();
    return json(res, 200, { answer: result.choices?.[0]?.message?.content || 'Belum ada jawaban.', data_window_days: 30, generated_at: new Date().toISOString() });
  } catch { return json(res, 500, { error: 'AI Assistant mengalami gangguan.' }); }
}
