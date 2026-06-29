const { sendJson, sendText, readBody, supabaseFetch, withAuth } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendText(res, 405, 'Method not allowed');
  try {
    const session = await withAuth(req, res);
    const body = await readBody(req);
    const content = body && typeof body.content === 'object' ? body.content : {};

    await supabaseFetch('/rest/v1/settings?on_conflict=site_key', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ site_key: 'main', content }),
    });

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendText(res, error.status || 500, error.message || 'Не удалось сохранить');
  }
};
