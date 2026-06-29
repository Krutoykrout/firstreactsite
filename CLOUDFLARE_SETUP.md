# Cloudflare Pages setup

Загружайте содержимое папки в GitHub, потом импортируйте репозиторий в Cloudflare Pages.

В корне репозитория должны быть:

- index.html
- assets/
- functions/
- package.json
- _headers

Настройки Cloudflare Pages:

- Framework preset: None / No framework
- Build command: npm run build
- Build output directory: /

Environment variables:

SUPABASE_URL=https://tyyyinyqadqjxkzmekox.supabase.co
SUPABASE_KEY=sb_publishable_1rJwL8mb-o38QWjmKNYO2Q_SrwFwT_U
ADMIN_EMAIL=admin@example.com

Админка:
https://ваш-сайт.pages.dev/#/admin

Логин:
admin@example.com или admin или 1

Пароль:
тот пароль, который задан у пользователя admin@example.com в Supabase.
