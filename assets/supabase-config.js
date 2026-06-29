// Режим Vercel Proxy: браузер НЕ обращается к Supabase напрямую.
// Все запросы идут на /api/... внутри этого же сайта.
window.SITE_SUPABASE = { proxy: true };
