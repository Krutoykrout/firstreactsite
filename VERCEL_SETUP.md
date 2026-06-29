# Как разместить на Vercel

Эта версия сделана специально для ситуации, когда сайт открывается без VPN, а Supabase напрямую с телефона может не открываться.

Браузер клиента теперь обращается только к этому же сайту:

- `/api/site` — получить данные сайта
- `/api/login` — вход в админку
- `/api/save` — сохранить изменения
- `/api/request` — отправить заявку

А уже сервер Vercel обращается к Supabase. Посетитель Supabase напрямую не трогает.

## Что загрузить

Загрузи в GitHub весь проект целиком:

- `index.html`
- `assets/`
- `api/`
- `package.json`
- `vercel.json`

Потом импортируй этот репозиторий в Vercel.

## Переменные окружения Vercel

В Vercel можно ничего не менять, потому что Project URL и publishable key уже прописаны в API-файлах.

Но правильно добавить переменные:

- `SUPABASE_URL` = `https://tyyyinyqadqjxkzmekox.supabase.co`
- `SUPABASE_ANON_KEY` = твой publishable/anon key
- `ADMIN_EMAIL` = `admin@example.com`

Пароль админа берётся не из Vercel, а из Supabase Authentication → Users.

## Вход в админку

Адрес: `#/admin`

Логин:

- `admin`
- или `1`
- или `admin@example.com`

Пароль: пароль пользователя `admin@example.com` из Supabase Auth.

## Важно

После изменения данных нажимай кнопку `Сохранить на сайте`.
На другом устройстве обнови страницу — данные должны появиться быстро, потому что запрос идёт через API сайта, а не напрямую на `supabase.co`.
