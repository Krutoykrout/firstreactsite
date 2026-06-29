import { json, text, supabaseFetch } from '../_shared/supabase.js';

export async function onRequestGet({ env }) {
  try {
    const rows = await supabaseFetch(env, '/rest/v1/settings?site_key=eq.main&select=content', { method: 'GET' });
    const content = Array.isArray(rows) && rows[0] ? rows[0].content : null;
    return json({ ok: true, content: content || null });
  } catch (error) {
    return text(error.message || 'Не удалось загрузить данные', error.status || 500);
  }
}

export async function onRequest() {
  return text('Method not allowed', 405);
}
