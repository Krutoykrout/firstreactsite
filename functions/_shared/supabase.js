const COOKIE_NAME = 'site_admin_session';

function envValue(env, name, fallback = '') {
  return String((env && env[name]) || fallback || '').trim();
}

function getConfig(env) {
  return {
    supabaseUrl: envValue(env, 'SUPABASE_URL', 'https://tyyyinyqadqjxkzmekox.supabase.co').replace(/\/$/, ''),
    supabaseKey: envValue(env, 'SUPABASE_KEY', envValue(env, 'SUPABASE_ANON_KEY', envValue(env, 'SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_1rJwL8mb-o38QWjmKNYO2Q_SrwFwT_U'))),
    adminEmail: envValue(env, 'ADMIN_EMAIL', 'admin@example.com').toLowerCase(),
  };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      ...headers,
    },
  });
}

function text(message, status = 200, headers = {}) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      ...headers,
    },
  });
}

async function readBody(request) {
  const bodyText = await request.text();
  if (!bodyText) return {};
  try { return JSON.parse(bodyText); } catch (e) { throw Object.assign(new Error('Некорректный JSON'), { status: 400 }); }
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  var bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(str) {
  try {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch (e) { return ''; }
}

function encodeSession(session) {
  return base64UrlEncode(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    token_type: session.token_type || 'bearer',
  }));
}

function decodeSession(value) {
  if (!value) return null;
  try { return JSON.parse(base64UrlDecode(value)); } catch (e) { return null; }
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const parts = header.split(';').map((p) => p.trim());
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx > -1 && part.slice(0, idx) === name) return decodeURIComponent(part.slice(idx + 1));
  }
  return '';
}

function sessionCookie(session, maxAge = 60 * 60 * 24 * 7) {
  return `${COOKIE_NAME}=${encodeURIComponent(encodeSession(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function getSessionFromRequest(request) {
  return decodeSession(getCookie(request, COOKIE_NAME));
}

async function supabaseFetch(env, path, options = {}) {
  const config = getConfig(env);
  const headers = {
    apikey: config.supabaseKey,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const response = await fetch(`${config.supabaseUrl}${path}`, { ...options, headers });
  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch (e) { data = raw; }
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

async function signInWithPassword(env, email, password) {
  return supabaseFetch(env, '/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function refreshSession(env, refreshToken) {
  return supabaseFetch(env, '/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

async function withAuth(request, env) {
  let session = getSessionFromRequest(request);
  if (!session || !session.access_token) {
    throw Object.assign(new Error('Нужно войти в админку'), { status: 401 });
  }

  let cookie = null;
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.refresh_token && session.expires_at < now + 60) {
    session = await refreshSession(env, session.refresh_token);
    cookie = sessionCookie(session);
  }
  return { session, cookie };
}

function normalizeLogin(login, adminEmail) {
  const value = String(login || '').trim().toLowerCase();
  if (value === '1' || value === 'admin') return adminEmail;
  return value;
}

export {
  getConfig,
  json,
  text,
  readBody,
  sessionCookie,
  clearCookie,
  supabaseFetch,
  signInWithPassword,
  withAuth,
  normalizeLogin,
};
