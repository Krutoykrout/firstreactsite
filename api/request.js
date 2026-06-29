const { sendJson, sendText, readBody, supabaseFetch } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendText(res, 405, 'Method not allowed');
  try {
    const body = await readBody(req);
    const payload = {
      name: String(body.name || '').slice(0, 120),
      phone: String(body.phone || '').slice(0, 80),
      message: String(body.message || '').slice(0, 1000),
    };
    await supabaseFetch('/rest/v1/requests', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendText(res, error.status || 500, error.message || 'Не удалось отправить заявку');
  }
};
