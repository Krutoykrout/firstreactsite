# Сайт с Supabase-ready админкой

Админка: `#/admin`.

Без Supabase сайт работает локально: логин `1`, пароль `2`.
С Supabase вход идёт через email/password пользователя из Supabase Auth.

Файлы для подключения:

- `supabase_schema.sql` — вставить в Supabase SQL Editor и выполнить.
- `assets/supabase-config.js` — вставить Project URL и public/anon key.

Нельзя вставлять secret/service_role key в код сайта.
