const { sendJson, clearSessionCookie } = require('./_supabase');

module.exports = async function handler(req, res) {
  clearSessionCookie(res);
  return sendJson(res, 200, { ok: true });
};
