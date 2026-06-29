const { sendJson, sendText, supabaseFetch } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return sendText(res, 405, 'Method not allowed');
  try {
    const rows = await supabaseFetch('/rest/v1/settings?site_key=eq.main&select=content', { method: 'GET' });
    const content = Array.isArray(rows) && rows[0] ? rows[0].content : null;
    return sendJson(res, 200, { ok: true, content: content || null });
  } catch (error) {
    return sendText(res, error.status || 500, error.message || 'Не удалось загрузить данные');
  }
};
