import { json, text, readBody, supabaseFetch } from '../_shared/supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const payload = {
      name: String(body.name || '').slice(0, 120),
      phone: String(body.phone || '').slice(0, 80),
      message: String(body.message || '').slice(0, 1000),
    };
    await supabaseFetch(env, '/rest/v1/requests', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
    return json({ ok: true });
  } catch (error) {
    return text(error.message || 'Не удалось отправить заявку', error.status || 500);
  }
}

export async function onRequest() {
  return text('Method not allowed', 405);
}
