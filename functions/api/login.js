import { getConfig, json, text, readBody, sessionCookie, signInWithPassword, normalizeLogin } from '../_shared/supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const config = getConfig(env);
    const body = await readBody(request);
    const email = normalizeLogin(body.login || body.email, config.adminEmail);
    const password = String(body.password || '');

    if (!email || !password) return text('Введите логин и пароль', 400);
    if (email !== config.adminEmail) return text('Неверный логин или пароль', 401);

    const session = await signInWithPassword(env, config.adminEmail, password);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(session) });
  } catch (error) {
    return text('Неверный логин или пароль', error.status || 401);
  }
}

export async function onRequest() {
  return text('Method not allowed', 405);
}
