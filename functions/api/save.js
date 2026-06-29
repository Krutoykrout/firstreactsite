import { json, text, readBody, supabaseFetch, withAuth } from '../_shared/supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const auth = await withAuth(request, env);
    const body = await readBody(request);
    const content = body && typeof body.content === 'object' ? body.content : {};

    await supabaseFetch(env, '/rest/v1/settings?on_conflict=site_key', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.session.access_token}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ site_key: 'main', content }),
    });

    const headers = auth.cookie ? { 'Set-Cookie': auth.cookie } : {};
    return json({ ok: true }, 200, headers);
  } catch (error) {
    return text(error.message || 'Не удалось сохранить', error.status || 500);
  }
}

export async function onRequest() {
  return text('Method not allowed', 405);
}
