import { json, clearCookie } from '../_shared/supabase.js';

export async function onRequestPost() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}

export async function onRequest() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}
