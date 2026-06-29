# Что должен сделать владелец аккаунта Supabase

1. Создать проект в Supabase.
2. Открыть SQL Editor.
3. Вставить и выполнить `supabase_schema.sql`.
4. Открыть Authentication → Users → Add user.
5. Создать админа через email/password.
6. Открыть Project Settings → API Keys.
7. Скопировать Project URL и public/anon key.
8. Вставить их в `assets/supabase-config.js`.

После этого сайт можно заливать на GitHub Pages/Vercel/Netlify. Админка будет сохранять данные в Supabase, а не только в браузере.
