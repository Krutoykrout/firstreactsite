const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://tyyyinyqadqjxkzmekox.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1rJwL8mb-o38QWjmKNYO2Q_SrwFwT_U';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const COOKIE_NAME = 'site_admin_session';

function sendJson(res, status, data, extraHeaders = {}) {
  res.statusCode = status;
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    ...extraHeaders,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(data));
}

function sendText(res, status, text, extraHeaders = {}) {
  res.statusCode = status;
  Object.entries({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    ...extraHeaders,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Слишком большой запрос'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('Некорректный JSON')); }
    });
    req.on('error', reject);
  });
}

function cookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function encodeSession(session) {
  return Buffer.from(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    token_type: session.token_type || 'bearer',
  })).toString('base64url');
}

function decodeSession(value) {
  if (!value) return null;
  try { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')); } catch (e) { return null; }
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const parts = header.split(';').map((p) => p.trim());
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx > -1 && part.slice(0, idx) === name) return decodeURIComponent(part.slice(idx + 1));
  }
  return '';
}

function setSessionCookie(res, session) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(encodeSession(session))}; ${cookieOptions()}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieOptions(0)}`);
}

function getSessionFromRequest(req) {
  return decodeSession(getCookie(req, COOKIE_NAME));
}

async function supabaseFetch(path, options = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }
  if (!response.ok) {
    const message = typeof data === 'string' ? data : JSON.stringify(data || {});
    const error = new Error(message || `Supabase error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function signInWithPassword(email, password) {
  return supabaseFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function refreshSession(refreshToken) {
  return supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

async function withAuth(req, res) {
  let session = getSessionFromRequest(req);
  if (!session || !session.access_token) {
    const err = new Error('Нужно войти в админку');
    err.status = 401;
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.refresh_token && session.expires_at < now + 60) {
    session = await refreshSession(session.refresh_token);
    setSessionCookie(res, session);
  }
  return session;
}

function normalizeLogin(login) {
  const value = String(login || '').trim().toLowerCase();
  if (value === '1' || value === 'admin') return ADMIN_EMAIL;
  return value;
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ADMIN_EMAIL,
  COOKIE_NAME,
  sendJson,
  sendText,
  readBody,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromRequest,
  supabaseFetch,
  signInWithPassword,
  withAuth,
  normalizeLogin,
};
