const { ADMIN_EMAIL, sendJson, sendText, readBody, setSessionCookie, signInWithPassword, normalizeLogin } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendText(res, 405, 'Method not allowed');
  try {
    const body = await readBody(req);
    const email = normalizeLogin(body.login || body.email);
    const password = String(body.password || '');

    if (!email || !password) return sendText(res, 400, 'Введите логин и пароль');
    if (email !== ADMIN_EMAIL.toLowerCase()) return sendText(res, 401, 'Неверный логин или пароль');

    const session = await signInWithPassword(ADMIN_EMAIL, password);
    setSessionCookie(res, session);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendText(res, error.status || 401, 'Неверный логин или пароль');
  }
};
