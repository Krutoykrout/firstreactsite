(function () {
  'use strict';

  var h = React.createElement;
  var STORAGE_KEY = 'avto-capital-site-data-v5';
  var AUTH_KEY = 'avto-capital-admin-auth-v5';
  var ADMIN_LOGIN = '1';
  var ADMIN_PASSWORD = '2';
  var SUPABASE_CONFIG_KEY = 'avto-capital-supabase-config-v1';
  var SUPABASE_SESSION_KEY = 'avto-capital-supabase-session-v1';

  var navItems = [
    { to: '/', label: 'Главная' },
    { to: '/catalog', label: 'Каталог' },
    { to: '/buyout', label: 'Выкуп' },
    { to: '/order', label: 'Авто под заказ' },
    { to: '/about', label: 'О компании' },
    { to: '/reviews', label: 'Отзывы' },
    { to: '/contacts', label: 'Контакты' }
  ];

  var defaultData = {
    brand: 'AVTO CAPITAL',
    tagline: 'Автомобили под выкуп и заказ',
    heroTitle: 'Автомобили под выкуп и под заказ — спокойно, прозрачно, по делу',
    heroText: 'Подбираем автомобиль под задачу клиента, помогаем разобраться в условиях и сопровождаем оформление без лишней суеты.',
    heroBadge: 'Премиальный автомобильный сервис',
    primaryButton: 'Оставить заявку',
    secondaryButton: 'Смотреть каталог',
    phone: '+7 (999) 000-00-00',
    whatsapp: '+7 (999) 000-00-00',
    telegram: '@avtocapital',
    city: 'Ваш город',
    address: 'Адрес будет добавлен позже',
    email: 'info@example.ru',
    worktime: 'Ежедневно с 10:00 до 20:00',
    aboutTitle: 'О компании',
    aboutText: '',
    reviewsTitle: 'Отзывы',
    reviewsIntro: '',
    benefits: [
      { id: 'b1', title: 'Подбор под бюджет', text: 'Сначала фиксируем задачу и диапазон бюджета, потом предлагаем подходящие варианты.' },
      { id: 'b2', title: 'Проверка автомобиля', text: 'Смотрим историю, состояние и документы до финального решения.' },
      { id: 'b3', title: 'Оформление без хаоса', text: 'Помогаем пройти этапы сделки понятным маршрутом.' }
    ],
    steps: [
      { id: 's1', num: '01', title: 'Заявка', text: 'Вы оставляете контакты и пожелания по автомобилю.' },
      { id: 's2', num: '02', title: 'Подбор', text: 'Мы подбираем варианты и объясняем условия простым языком.' },
      { id: 's3', num: '03', title: 'Оформление', text: 'Финально согласуем детали и готовим сделку.' }
    ],
    cars: [
      { id: 'car-1', name: 'Kia K5', className: 'Бизнес-класс', year: '2021', mileage: '78 000 км', gearbox: 'Автомат', engine: '2.0 бензин', price: 'от 2 250 000 ₽', status: 'В наличии', available: true, image: '' },
      { id: 'car-2', name: 'Hyundai Sonata', className: 'Комфорт+', year: '2020', mileage: '92 000 км', gearbox: 'Автомат', engine: '2.5 бензин', price: 'от 2 100 000 ₽', status: 'Под заказ', available: true, image: '' },
      { id: 'car-3', name: 'Toyota Camry', className: 'Премиум', year: '2019', mileage: '105 000 км', gearbox: 'Автомат', engine: '2.5 бензин', price: 'по запросу', status: 'Индивидуально', available: false, image: '' }
    ],
    reviews: []
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function newId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function safeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { window.localStorage.setItem(key, value); } catch (e) {} }
  function safeRemove(key) { try { window.localStorage.removeItem(key); } catch (e) {} }
  function getRoute() { return (window.location.hash || '#/').replace(/^#/, '') || '/'; }
  function go(path) { window.location.hash = path; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function mailTo(email) { return 'mailto:' + String(email || '').trim(); }
  function phoneHref(phone) { return 'tel:' + String(phone || '').replace(/[^0-9+]/g, ''); }

  function loadData() {
    var raw = safeGet(STORAGE_KEY);
    if (!raw) return clone(defaultData);
    try {
      var parsed = JSON.parse(raw);
      var merged = clone(defaultData);
      Object.keys(parsed).forEach(function (key) { merged[key] = parsed[key]; });
      return merged;
    } catch (e) {
      return clone(defaultData);
    }
  }

  function saveData(data) { safeSet(STORAGE_KEY, JSON.stringify(data)); }

  function imageFileToDataUrl(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var raw = reader.result;
      try {
        var img = new Image();
        img.onload = function () {
          var maxSide = 1200;
          var scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
          canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          done(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = function () { done(raw); };
        img.src = raw;
      } catch (e) { done(raw); }
    };
    reader.readAsDataURL(file);
  }

  function tryParseJson(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function getSupabaseConfig() {
    var fileConfig = window.SITE_SUPABASE || {};
    if (fileConfig.proxy) return { ready: true, proxy: true, url: '', key: '' };
    var localConfig = tryParseJson(safeGet(SUPABASE_CONFIG_KEY)) || {};
    var url = String(localConfig.url || fileConfig.url || '').trim().replace(/\/$/, '');
    var key = String(localConfig.key || fileConfig.key || '').trim();
    var looksBlank = !url || !key || url.indexOf('PROJECT_URL') >= 0 || key.indexOf('PUBLIC') >= 0 || key.indexOf('ANON') >= 0;
    return { url: url, key: key, ready: !looksBlank, proxy: false };
  }

  function saveSupabaseConfig(cfg) {
    safeSet(SUPABASE_CONFIG_KEY, JSON.stringify({ url: String(cfg.url || '').trim().replace(/\/$/, ''), key: String(cfg.key || '').trim() }));
  }

  function getSession() { return tryParseJson(safeGet(SUPABASE_SESSION_KEY)); }
  function saveSession(session) { safeSet(SUPABASE_SESSION_KEY, JSON.stringify(session || {})); }
  function clearSession() { safeRemove(SUPABASE_SESSION_KEY); safeRemove(AUTH_KEY); }

  function mergeRemoteData(content) {
    var merged = clone(defaultData);
    if (content && typeof content === 'object') {
      Object.keys(content).forEach(function (key) { merged[key] = content[key]; });
    }
    return merged;
  }

  function supabaseHeaders(auth, extra) {
    var cfg = getSupabaseConfig();
    var session = getSession();
    var headers = Object.assign({ apikey: cfg.key }, extra || {});
    if (auth && session && session.access_token) {
      headers.Authorization = 'Bearer ' + session.access_token;
    }
    return headers;
  }

  function supabaseRequest(method, path, body, auth, extraHeaders) {
    var cfg = getSupabaseConfig();
    if (!cfg.ready) return Promise.reject(new Error('Supabase не подключён'));
    var headers = supabaseHeaders(auth, Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {}));
    var options = { method: method, headers: headers, cache: 'no-store' };
    if (body !== undefined && body !== null) options.body = JSON.stringify(body);
    return fetch(cfg.url + path, options).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) { throw new Error(text || ('Supabase error ' + res.status)); });
      }
      if (res.status === 204) return null;
      return res.text().then(function (text) { return text ? JSON.parse(text) : null; });
    });
  }

  function loadRemoteData() {
    if (!getSupabaseConfig().ready) return Promise.resolve(null);
    return fetch('/api/site?ts=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (text) { throw new Error(text || ('API error ' + res.status)); });
        return res.json();
      })
      .then(function (payload) {
        if (payload && payload.content) return mergeRemoteData(payload.content);
        return null;
      });
  }

  function saveRemoteData(data) {
    if (!getSupabaseConfig().ready) return Promise.resolve(false);
    return fetch('/api/save', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data })
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (text) { throw new Error(text || ('API error ' + res.status)); });
      return res.json().catch(function () { return { ok: true }; });
    }).then(function () { return true; });
  }

  function signInSupabase(login, password) {
    return fetch('/api/login', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login, password: password })
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (text) { throw new Error(text || 'Ошибка входа'); });
      return res.json();
    }).then(function (session) {
      saveSession({ proxy: true, logged: true });
      safeSet(AUTH_KEY, 'yes');
      return session;
    });
  }

  function submitRequestToSupabase(payload) {
    if (!getSupabaseConfig().ready) return Promise.resolve(false);
    return fetch('/api/request', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (text) { throw new Error(text || ('API error ' + res.status)); });
      return true;
    });
  }

  function uploadMediaToSupabase(file) {
    return Promise.resolve(null);
  }

  function Header(props) {
    var data = props.data;
    var route = props.route;
    return h('header', { className: 'site-header' },
      h('div', { className: 'container header-inner' },
        h('button', { className: 'brand', onClick: function () { go('/'); }, 'aria-label': 'На главную' },
          h('span', { className: 'brand-mark' }, 'A'),
          h('span', null, h('strong', null, data.brand || 'AVTO CAPITAL'), h('em', null, data.tagline || ''))
        ),
        h('input', { id: 'menu-toggle', className: 'menu-toggle', type: 'checkbox', 'aria-hidden': 'true' }),
        h('label', { className: 'burger', htmlFor: 'menu-toggle' }, h('span'), h('span'), h('span')),
        h('nav', { className: 'nav' },
          navItems.map(function (item) {
            return h('button', { key: item.to, className: route === item.to ? 'active' : '', onClick: function () { go(item.to); } }, item.label);
          })
        ),
        h('button', { className: 'btn small header-cta', onClick: function () { go('/request'); } }, 'Заявка')
      )
    );
  }

  function Footer(props) {
    var data = props.data;
    return h('footer', { className: 'footer' },
      h('div', { className: 'container footer-grid' },
        h('div', null,
          h('div', { className: 'footer-brand' }, data.brand || 'AVTO CAPITAL'),
          h('p', null, data.tagline || 'Автомобили под выкуп и заказ')
        ),
        h('div', null, h('span', null, 'Телефон'), h('a', { href: phoneHref(data.phone) }, data.phone)),
        h('div', null, h('span', null, 'Адрес'), h('p', null, data.city, ', ', data.address)),
        h('div', null, h('span', null, 'График'), h('p', null, data.worktime || ''), h('button', { className: 'footer-admin', onClick: function () { go('/admin'); } }, 'Панель управления'))
      )
    );
  }

  function CarSvg() {
    return h('svg', { className: 'car-svg', viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Автомобиль' },
      h('defs', null,
        h('linearGradient', { id: 'bodyGradient', x1: '0%', x2: '100%', y1: '0%', y2: '100%' },
          h('stop', { offset: '0%', stopColor: '#ffffff' }),
          h('stop', { offset: '45%', stopColor: '#d8c098' }),
          h('stop', { offset: '100%', stopColor: '#293241' })
        )
      ),
      h('path', { d: 'M118 183c23-43 61-68 116-74h166c52 0 89 25 116 74l45 8c22 4 37 21 37 43v19H45v-20c0-22 16-40 38-43l35-7z', fill: 'url(#bodyGradient)' }),
      h('path', { d: 'M231 124h166c37 0 65 20 85 57H158c19-35 43-54 73-57z', fill: '#f8f4ec', opacity: '.95' }),
      h('path', { d: 'M251 137h72v43H188c16-26 35-40 63-43zM341 137h57c27 0 48 14 65 43H341z', fill: '#dfe8ee' }),
      h('circle', { cx: '185', cy: '246', r: '43', fill: '#20242c' }),
      h('circle', { cx: '185', cy: '246', r: '18', fill: '#d8c098' }),
      h('circle', { cx: '462', cy: '246', r: '43', fill: '#20242c' }),
      h('circle', { cx: '462', cy: '246', r: '18', fill: '#d8c098' }),
      h('path', { d: 'M89 201h59M498 201h51', stroke: '#fff', strokeWidth: '10', strokeLinecap: 'round', opacity: '.72' })
    );
  }

  function CarVisual(props) {
    var car = props.car || {};
    if (car.image) {
      return h('div', { className: 'car-image-wrap' }, h('img', { className: 'car-photo', src: car.image, alt: car.name || 'Автомобиль' }));
    }
    return h('div', { className: 'car-image-wrap placeholder' }, h(CarSvg));
  }

  function Hero(props) {
    var data = props.data;
    var featured = (data.cars && data.cars[0]) || {};
    return h('section', { className: 'hero' },
      h('div', { className: 'container hero-grid' },
        h('div', { className: 'hero-copy' },
          h('div', { className: 'eyebrow' }, data.heroBadge),
          h('h1', null, data.heroTitle),
          h('p', null, data.heroText),
          h('div', { className: 'hero-actions' },
            h('button', { className: 'btn primary', onClick: function () { go('/request'); } }, data.primaryButton || 'Оставить заявку'),
            h('button', { className: 'btn ghost', onClick: function () { go('/catalog'); } }, data.secondaryButton || 'Смотреть каталог')
          ),
          h('div', { className: 'hero-stats' },
            h('div', null, h('strong', null, (data.cars || []).length), h('span', null, 'авто в каталоге')),
            h('div', null, h('strong', null, '3'), h('span', null, 'ключевых направления')),
            h('div', null, h('strong', null, '1'), h('span', null, 'понятный маршрут сделки'))
          )
        ),
        h('div', { className: 'hero-card' },
          h('div', { className: 'hero-card-top' }, h('span', null, featured.status || 'В наличии'), h('b', null, featured.price || 'по запросу')),
          h(CarVisual, { car: featured }),
          h('div', { className: 'hero-car-meta' },
            h('h3', null, featured.name || 'Автомобиль'),
            h('p', null, [featured.year, featured.mileage, featured.gearbox].filter(Boolean).join(' • '))
          )
        )
      )
    );
  }

  function SectionHead(props) {
    return h('div', { className: 'section-head' },
      props.eyebrow && h('div', { className: 'eyebrow' }, props.eyebrow),
      h('h2', null, props.title),
      props.text && h('p', null, props.text)
    );
  }

  function Benefits(props) {
    var benefits = props.items || [];
    return h('section', { className: 'section' },
      h('div', { className: 'container' },
        h(SectionHead, { eyebrow: 'Подход', title: 'Спокойный подбор без лишней суеты', text: 'Аккуратно собираем пожелания, показываем подходящие варианты и помогаем разобраться в деталях.' }),
        h('div', { className: 'benefit-grid' }, benefits.map(function (item, index) {
          return h('article', { className: 'benefit-card', key: item.id || index },
            h('span', null, '0' + (index + 1)),
            h('h3', null, item.title),
            h('p', null, item.text)
          );
        }))
      )
    );
  }

  function Steps(props) {
    var steps = props.items || [];
    return h('section', { className: 'section soft-section' },
      h('div', { className: 'container' },
        h(SectionHead, { eyebrow: 'Процесс', title: 'Понятный маршрут для клиента', text: 'Блок можно полностью переписать под реальные условия компании.' }),
        h('div', { className: 'steps-grid' }, steps.map(function (step) {
          return h('article', { className: 'step-card', key: step.id || step.num },
            h('b', null, step.num),
            h('h3', null, step.title),
            h('p', null, step.text)
          );
        }))
      )
    );
  }

  function CarCard(props) {
    var car = props.car || {};
    return h('article', { className: 'catalog-card' },
      h(CarVisual, { car: car }),
      h('div', { className: 'car-card-body' },
        h('div', { className: 'car-title-row' },
          h('div', null, h('h3', null, car.name || 'Автомобиль'), h('p', null, car.className || 'Класс не указан')),
          h('span', { className: car.available ? 'pill available' : 'pill muted-pill' }, car.status || (car.available ? 'В наличии' : 'Нет в наличии'))
        ),
        h('div', { className: 'specs' },
          h('span', null, car.year || '—'),
          h('span', null, car.mileage || '—'),
          h('span', null, car.gearbox || '—'),
          h('span', null, car.engine || '—')
        ),
        h('div', { className: 'price-row' }, h('strong', null, car.price || 'по запросу'), h('button', { className: 'btn small ghost', onClick: function () { go('/request'); } }, 'Узнать условия'))
      )
    );
  }

  function CatalogPreview(props) {
    var cars = (props.data.cars || []).slice(0, 3);
    return h('section', { className: 'section catalog-preview' },
      h('div', { className: 'container' },
        h('div', { className: 'split-head' },
          h(SectionHead, { eyebrow: 'Каталог', title: 'Автомобили в аккуратных карточках', text: 'Краткие характеристики, статус, цена и понятная заявка по каждому автомобилю.' }),
          h('button', { className: 'btn ghost', onClick: function () { go('/catalog'); } }, 'Весь каталог')
        ),
        h('div', { className: 'catalog-grid' }, cars.map(function (car) { return h(CarCard, { key: car.id, car: car }); }))
      )
    );
  }

  function ContactStrip(props) {
    var data = props.data;
    return h('section', { className: 'section' },
      h('div', { className: 'container contact-strip' },
        h('div', null, h('span', null, 'Связаться'), h('h2', null, 'Оставьте заявку — и мы подготовим варианты')), 
        h('div', { className: 'contact-actions' },
          h('a', { className: 'btn primary', href: phoneHref(data.phone) }, data.phone),
          h('button', { className: 'btn ghost', onClick: function () { go('/request'); } }, 'Форма заявки')
        )
      )
    );
  }

  function Home(props) {
    var data = props.data;
    return h('main', null, h(Hero, { data: data }), h(Benefits, { items: data.benefits }), h(CatalogPreview, { data: data }), h(Steps, { items: data.steps }), h(ContactStrip, { data: data }));
  }

  function PageHero(props) {
    return h('section', { className: 'page-hero' }, h('div', { className: 'container' }, h('div', { className: 'eyebrow' }, props.eyebrow), h('h1', null, props.title), props.text && h('p', null, props.text)));
  }

  function Catalog(props) {
    var cars = props.data.cars || [];
    return h('main', null,
      h(PageHero, { eyebrow: 'Каталог', title: 'Каталог автомобилей', text: 'Подборка автомобилей с характеристиками, статусом и условиями.' }),
      h('section', { className: 'section' }, h('div', { className: 'container catalog-grid' }, cars.map(function (car) { return h(CarCard, { key: car.id, car: car }); }))),
      cars.length === 0 && h(EmptyPublic, { title: 'Каталог пока пустой', text: 'Автомобили появятся здесь позже.' })
    );
  }

  function Buyout(props) {
    return h('main', null,
      h(PageHero, { eyebrow: 'Выкуп', title: 'Выкуп автомобиля', text: 'Раздел для направления выкупа: понятные условия, оценка и аккуратное оформление.' }),
      h('section', { className: 'section' }, h('div', { className: 'container service-grid' },
        h('article', null, h('h3', null, 'Проверяем задачу'), h('p', null, 'Уточняем бюджет, требования и документы.' )),
        h('article', null, h('h3', null, 'Подбираем вариант'), h('p', null, 'Показываем подходящие автомобили и условия.' )),
        h('article', null, h('h3', null, 'Сопровождаем оформление'), h('p', null, 'Помогаем пройти сделку без лишнего хаоса.' ))
      )),
      h(ContactStrip, { data: props.data })
    );
  }

  function Order(props) {
    return h('main', null,
      h(PageHero, { eyebrow: 'Авто под заказ', title: 'Автомобиль под заказ', text: 'Раздел для индивидуального подбора автомобиля под параметры клиента.' }),
      h('section', { className: 'section' }, h('div', { className: 'container order-panel' },
        h('div', null, h('h2', null, 'Подбор под параметры'), h('p', null, 'Можно указать бюджет, марку, год, состояние, цвет и любые требования. Всё это потом легко переписать.' )),
        h('button', { className: 'btn primary', onClick: function () { go('/request'); } }, 'Оставить заявку')
      ))
    );
  }

  function EmptyPublic(props) {
    return h('section', { className: 'section' }, h('div', { className: 'container' }, h('div', { className: 'empty-public' }, h('h2', null, props.title), h('p', null, props.text))));
  }

  function About(props) {
    var data = props.data;
    return h('main', null,
      h(PageHero, { eyebrow: 'О компании', title: data.aboutTitle || 'О компании', text: data.aboutText || '' }),
      h(EmptyPublic, { title: 'Раздел подготовлен', text: 'Информация появится здесь позже.' })
    );
  }

  function Reviews(props) {
    var data = props.data;
    var reviews = data.reviews || [];
    return h('main', null,
      h(PageHero, { eyebrow: 'Отзывы', title: data.reviewsTitle || 'Отзывы', text: data.reviewsIntro || '' }),
      reviews.length === 0 ? h(EmptyPublic, { title: 'Отзывы пока пустые', text: 'Отзывы появятся здесь позже.' }) :
        h('section', { className: 'section' }, h('div', { className: 'container review-grid' }, reviews.map(function (review) {
          return h('article', { className: 'review-card', key: review.id }, h('p', null, '“', review.text, '”'), h('strong', null, review.name), h('span', null, review.role));
        })))
    );
  }

  function Contacts(props) {
    var data = props.data;
    return h('main', null,
      h(PageHero, { eyebrow: 'Контакты', title: 'Связаться с компанией', text: 'Контакты, адрес и удобные способы связи.' }),
      h('section', { className: 'section' }, h('div', { className: 'container contacts-grid' },
        h('article', null, h('span', null, 'Телефон'), h('a', { href: phoneHref(data.phone) }, data.phone)),
        h('article', null, h('span', null, 'WhatsApp'), h('p', null, data.whatsapp)),
        h('article', null, h('span', null, 'Telegram'), h('p', null, data.telegram)),
        h('article', null, h('span', null, 'Адрес'), h('p', null, data.city, ', ', data.address)),
        h('article', null, h('span', null, 'Почта'), h('a', { href: mailTo(data.email) }, data.email)),
        h('article', null, h('span', null, 'График'), h('p', null, data.worktime))
      ))
    );
  }

  function RequestPage(props) {
    function onSubmit(e) {
      e.preventDefault();
      var form = e.currentTarget;
      var payload = {
        name: form.elements.name.value || '',
        phone: form.elements.phone.value || '',
        message: form.elements.message.value || ''
      };
      var done = function () { alert('Спасибо! Заявка принята.'); form.reset(); };
      if (props && props.onSubmitRequest) {
        props.onSubmitRequest(payload).then(done).catch(function () { done(); });
      } else {
        done();
      }
    }
    return h('main', null,
      h(PageHero, { eyebrow: 'Заявка', title: 'Оставить заявку', text: 'Оставьте контакты — специалист свяжется и уточнит детали.' }),
      h('section', { className: 'section' }, h('div', { className: 'container form-shell' }, h('form', { onSubmit: onSubmit },
        h('label', null, 'Имя', h('input', { name: 'name', placeholder: 'Как к вам обращаться' })),
        h('label', null, 'Телефон', h('input', { name: 'phone', placeholder: '+7 ___ ___-__-__' })),
        h('label', null, 'Что нужно', h('textarea', { name: 'message', placeholder: 'Например: интересует автомобиль под заказ' })),
        h('button', { className: 'btn primary', type: 'submit' }, 'Отправить')
      )))
    );
  }

  function Field(props) {
    return h('label', { className: props.className || '' },
      h('span', null, props.label),
      h('input', { value: props.value || '', placeholder: props.placeholder || '', onChange: function (e) { props.onChange(e.target.value); } })
    );
  }

  function TextField(props) {
    return h('label', { className: props.className || '' },
      h('span', null, props.label),
      h('textarea', { value: props.value || '', placeholder: props.placeholder || '', onChange: function (e) { props.onChange(e.target.value); } })
    );
  }

  function CheckField(props) {
    return h('label', { className: 'check-field' },
      h('input', { type: 'checkbox', checked: !!props.checked, onChange: function (e) { props.onChange(e.target.checked); } }),
      h('span', null, props.label)
    );
  }

  function EmptyAdmin(props) {
    return h('div', { className: 'empty-admin' }, h('h3', null, props.title), h('p', null, props.text));
  }

  function AdminLogin(props) {
    var isRemote = getSupabaseConfig().ready;
    return h('main', { className: 'admin-login-page' },
      h('div', { className: 'admin-login-card' },
        h('span', { className: 'brand-mark big' }, 'A'),
        h('h1', null, 'Вход в админку'),
        h('form', { onSubmit: function (e) {
          e.preventDefault();
          var login = String(e.currentTarget.elements.login.value || '').trim();
          var password = e.currentTarget.elements.password.value;
          if (isRemote) {
            var authLogin = login.indexOf('@') >= 0 ? login : ((login === '1' || login.toLowerCase() === 'admin') ? 'admin@example.com' : login);
            signInSupabase(authLogin, password).then(function () { props.onLogin(); }).catch(function (err) { alert('Не удалось войти. Проверь логин и пароль. Ошибка: ' + (err && err.message ? err.message.slice(0, 120) : '')); });
            return;
          }
          if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
            safeSet(AUTH_KEY, 'yes');
            props.onLogin();
          } else {
            alert('Неверный логин или пароль');
          }
        } },
          h('label', null, isRemote ? 'Логин или email' : 'Логин', h('input', { name: 'login', autoComplete: 'username' })),
          h('label', null, 'Пароль', h('input', { name: 'password', type: 'password', autoComplete: 'current-password' })),
          h('button', { className: 'btn primary', type: 'submit' }, 'Войти')
        ),
        h('button', { className: 'btn ghost wide', onClick: function () { go('/'); } }, 'Вернуться на сайт')
      )
    );
  }

  function AdminPanel(props) {
    var data = props.data;
    var setData = props.setData;
    var state = props.state || {};
    var active = state.active || 'main';

    function update(next) { setData(next); saveData(next); }
    function patch(key, value) { var next = clone(data); next[key] = value; update(next); }
    function addCar() {
      var next = clone(data);
      next.cars = next.cars || [];
      next.cars.unshift({ id: newId('car'), name: 'Новый автомобиль', className: '', year: '', mileage: '', gearbox: '', engine: '', price: '', status: 'В наличии', available: true, image: '' });
      update(next);
    }
    function removeItem(arrayKey, id) {
      var next = clone(data);
      next[arrayKey] = (next[arrayKey] || []).filter(function (item) { return item.id !== id; });
      update(next);
    }
    function addGeneric(arrayKey, template) {
      var next = clone(data);
      next[arrayKey] = next[arrayKey] || [];
      var item = clone(template);
      item.id = newId(arrayKey);
      next[arrayKey].push(item);
      update(next);
    }
    function updateArrayItem(arrayKey, id, key, value) {
      var next = clone(data);
      next[arrayKey] = (next[arrayKey] || []).map(function (item) {
        if (item.id !== id) return item;
        var copy = clone(item);
        copy[key] = value;
        return copy;
      });
      update(next);
    }
    function importJson(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          update(parsed);
          alert('Данные загружены');
        } catch (err) {
          alert('Не удалось прочитать JSON');
        }
      };
      reader.readAsText(file);
    }
    function exportJson() {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'site-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    function reset() {
      if (!confirm('Сбросить изменения?')) return;
      update(clone(defaultData));
    }

    var tabs = [
      ['main', 'Главная'], ['cars', 'Машины'], ['contacts', 'Контакты'], ['about', 'О компании'], ['reviews', 'Отзывы'], ['blocks', 'Блоки'], ['data', 'Данные']
    ];

    var content = null;
    if (active === 'main') content = h(AdminMainTab, { data: data, patch: patch });
    if (active === 'cars') content = h(AdminCarsTab, { data: data, addCar: addCar, updateArrayItem: updateArrayItem, removeItem: removeItem, uploadMedia: uploadMediaToSupabase });
    if (active === 'contacts') content = h(AdminContactsTab, { data: data, patch: patch });
    if (active === 'about') content = h(AdminAboutTab, { data: data, patch: patch });
    if (active === 'reviews') content = h(AdminReviewsTab, { data: data, addGeneric: addGeneric, updateArrayItem: updateArrayItem, removeItem: removeItem });
    if (active === 'blocks') content = h(AdminBlocksTab, { data: data, addGeneric: addGeneric, updateArrayItem: updateArrayItem, removeItem: removeItem });
    if (active === 'sync') content = h(AdminSyncTab, { data: data, status: props.remoteStatus, onRemoteSave: props.onRemoteSave, onRemoteLoad: props.onRemoteLoad });
    if (active === 'data') content = h(AdminDataTab, { exportJson: exportJson, importJson: importJson, reset: reset });

    return h('main', { className: 'admin-layout' },
      h('aside', { className: 'admin-sidebar' },
        h('div', { className: 'admin-logo' }, h('span', { className: 'brand-mark' }, 'A'), h('div', null, h('strong', null, 'Панель управления'), h('em', null, 'Контент сайта'))) ,
        h('div', { className: 'admin-tabs' }, tabs.map(function (tab) {
          return h('button', { key: tab[0], className: active === tab[0] ? 'active' : '', onClick: function () { props.setAdminState({ active: tab[0] }); } }, tab[1]);
        })),
        h('button', { className: 'btn ghost wide', onClick: function () { go('/'); } }, 'Смотреть сайт'),
        h('button', { className: 'btn soft wide', onClick: props.onLogout }, 'Выйти')
      ),
      h('section', { className: 'admin-content' },
        h('div', { className: 'admin-savebar' },
          h('div', null,
            h('strong', null, 'Управление сайтом'),
            h('span', null, props.remoteStatus || (getSupabaseConfig().ready ? 'Изменения сохраняются после кнопки «Сохранить на сайте».' : 'Сайт работает локально.'))
          ),
          h('button', { className: 'btn primary', onClick: function () { props.onRemoteSave && props.onRemoteSave(data); } }, 'Сохранить на сайте')
        ),
        content
      )
    );
  }

  function AdminMainTab(props) {
    var data = props.data, patch = props.patch;
    return h('div', null,
      h('h1', null, 'Главная страница'),
      h('div', { className: 'admin-grid' },
        h(Field, { label: 'Название компании', value: data.brand, onChange: function (v) { patch('brand', v); } }),
        h(Field, { label: 'Подпись под логотипом', value: data.tagline, onChange: function (v) { patch('tagline', v); } }),
        h(Field, { label: 'Плашка над заголовком', value: data.heroBadge, onChange: function (v) { patch('heroBadge', v); } }),
        h(Field, { label: 'Кнопка 1', value: data.primaryButton, onChange: function (v) { patch('primaryButton', v); } }),
        h(Field, { label: 'Кнопка 2', value: data.secondaryButton, onChange: function (v) { patch('secondaryButton', v); } }),
        h(TextField, { className: 'span-2', label: 'Главный заголовок', value: data.heroTitle, onChange: function (v) { patch('heroTitle', v); } }),
        h(TextField, { className: 'span-2', label: 'Главный текст', value: data.heroText, onChange: function (v) { patch('heroText', v); } })
      )
    );
  }

  function AdminCarsTab(props) {
    var cars = props.data.cars || [];
    return h('div', null,
      h('div', { className: 'admin-section-head' }, h('h1', null, 'Каталог машин'), h('button', { className: 'btn primary', onClick: props.addCar }, 'Добавить машину')),
      cars.length === 0 && h(EmptyAdmin, { title: 'Машин пока нет', text: 'Нажмите кнопку выше, чтобы добавить первую карточку.' }),
      h('div', { className: 'admin-list' }, cars.map(function (car) {
        return h('article', { className: 'admin-item', key: car.id },
          h('div', { className: 'admin-item-head' }, h('strong', null, car.name || 'Автомобиль'), h('button', { className: 'danger-link', onClick: function () { props.removeItem('cars', car.id); } }, 'Удалить')),
          h('div', { className: 'admin-grid small' },
            h(Field, { label: 'Название', value: car.name, onChange: function (v) { props.updateArrayItem('cars', car.id, 'name', v); } }),
            h(Field, { label: 'Класс / описание', value: car.className, onChange: function (v) { props.updateArrayItem('cars', car.id, 'className', v); } }),
            h(Field, { label: 'Год', value: car.year, onChange: function (v) { props.updateArrayItem('cars', car.id, 'year', v); } }),
            h(Field, { label: 'Пробег', value: car.mileage, onChange: function (v) { props.updateArrayItem('cars', car.id, 'mileage', v); } }),
            h(Field, { label: 'КПП', value: car.gearbox, onChange: function (v) { props.updateArrayItem('cars', car.id, 'gearbox', v); } }),
            h(Field, { label: 'Двигатель', value: car.engine, onChange: function (v) { props.updateArrayItem('cars', car.id, 'engine', v); } }),
            h(Field, { label: 'Цена / условия', value: car.price, onChange: function (v) { props.updateArrayItem('cars', car.id, 'price', v); } }),
            h(Field, { label: 'Статус', value: car.status, onChange: function (v) { props.updateArrayItem('cars', car.id, 'status', v); } }),
            h(CheckField, { label: 'Показывать как “в наличии”', checked: car.available, onChange: function (v) { props.updateArrayItem('cars', car.id, 'available', v); } }),
            h(ImageField, { car: car, onChange: function (value) { props.updateArrayItem('cars', car.id, 'image', value); } })
          )
        );
      }))
    );
  }

  function ImageField(props) {
    var car = props.car;
    function localFile(file) {
      imageFileToDataUrl(file, function (dataUrl) { props.onChange(dataUrl); });
    }
    function onFile(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 1024 * 1024 * 3) alert('Фото большое — лучше сжать перед загрузкой.');
      if (props.uploadMedia && getSupabaseConfig().ready && getSession()) {
        props.uploadMedia(file).then(function (url) {
          if (url) props.onChange(url);
          else localFile(file);
        }).catch(function () {
          alert('Фото не загрузилось в базу. Сохраню локально для предпросмотра.');
          localFile(file);
        });
        return;
      }
      localFile(file);
    }
    return h('div', { className: 'image-admin' },
      h('span', null, 'Фото машины'),
      h('div', { className: 'image-admin-row' },
        car.image ? h('img', { src: car.image, alt: car.name || 'Фото' }) : h('div', { className: 'mini-placeholder' }, 'нет фото'),
        h('label', { className: 'btn soft file-btn' }, 'Загрузить', h('input', { type: 'file', accept: 'image/*', onChange: onFile })),
        car.image && h('button', { className: 'danger-link', onClick: function () { props.onChange(''); } }, 'Убрать')
      )
    );
  }

  function AdminContactsTab(props) {
    var data = props.data, patch = props.patch;
    return h('div', null,
      h('h1', null, 'Контакты'),
      h('div', { className: 'admin-grid' },
        h(Field, { label: 'Телефон', value: data.phone, onChange: function (v) { patch('phone', v); } }),
        h(Field, { label: 'WhatsApp', value: data.whatsapp, onChange: function (v) { patch('whatsapp', v); } }),
        h(Field, { label: 'Telegram', value: data.telegram, onChange: function (v) { patch('telegram', v); } }),
        h(Field, { label: 'Город', value: data.city, onChange: function (v) { patch('city', v); } }),
        h(Field, { label: 'Email', value: data.email, onChange: function (v) { patch('email', v); } }),
        h(Field, { label: 'График', value: data.worktime, onChange: function (v) { patch('worktime', v); } }),
        h(TextField, { className: 'span-2', label: 'Адрес', value: data.address, onChange: function (v) { patch('address', v); } })
      )
    );
  }

  function AdminAboutTab(props) {
    return h('div', null,
      h('h1', null, 'О компании'),
      h('div', { className: 'admin-grid' },
        h(Field, { label: 'Заголовок', value: props.data.aboutTitle, onChange: function (v) { props.patch('aboutTitle', v); } }),
        h(TextField, { className: 'span-2', label: 'Текст', placeholder: 'Можно оставить пустым', value: props.data.aboutText, onChange: function (v) { props.patch('aboutText', v); } })
      )
    );
  }

  function AdminReviewsTab(props) {
    var reviews = props.data.reviews || [];
    return h('div', null,
      h('div', { className: 'admin-section-head' }, h('h1', null, 'Отзывы'), h('button', { className: 'btn primary', onClick: function () { props.addGeneric('reviews', { name: 'Имя клиента', role: 'Подпись', text: 'Текст отзыва' }); } }, 'Добавить отзыв')),
      reviews.length === 0 && h(EmptyAdmin, { title: 'Отзывы пустые', text: 'Можно оставить пустыми для презентации.' }),
      h('div', { className: 'admin-list' }, reviews.map(function (review) {
        return h('article', { className: 'admin-item', key: review.id },
          h('div', { className: 'admin-item-head' }, h('strong', null, review.name || 'Отзыв'), h('button', { className: 'danger-link', onClick: function () { props.removeItem('reviews', review.id); } }, 'Удалить')),
          h('div', { className: 'admin-grid small' },
            h(Field, { label: 'Имя', value: review.name, onChange: function (v) { props.updateArrayItem('reviews', review.id, 'name', v); } }),
            h(Field, { label: 'Подпись', value: review.role, onChange: function (v) { props.updateArrayItem('reviews', review.id, 'role', v); } }),
            h(TextField, { className: 'span-2', label: 'Текст', value: review.text, onChange: function (v) { props.updateArrayItem('reviews', review.id, 'text', v); } })
          )
        );
      }))
    );
  }

  function AdminBlocksTab(props) {
    var benefits = props.data.benefits || [];
    var steps = props.data.steps || [];
    return h('div', null,
      h('h1', null, 'Блоки на главной'),
      h('div', { className: 'admin-section-head sub' }, h('h2', null, 'Преимущества'), h('button', { className: 'btn soft', onClick: function () { props.addGeneric('benefits', { title: 'Новое преимущество', text: 'Описание' }); } }, 'Добавить')),
      h('div', { className: 'admin-list compact' }, benefits.map(function (item) {
        return h('article', { className: 'admin-item', key: item.id },
          h('div', { className: 'admin-item-head' }, h('strong', null, item.title), h('button', { className: 'danger-link', onClick: function () { props.removeItem('benefits', item.id); } }, 'Удалить')),
          h('div', { className: 'admin-grid small' },
            h(Field, { label: 'Заголовок', value: item.title, onChange: function (v) { props.updateArrayItem('benefits', item.id, 'title', v); } }),
            h(TextField, { label: 'Текст', value: item.text, onChange: function (v) { props.updateArrayItem('benefits', item.id, 'text', v); } })
          )
        );
      })),
      h('div', { className: 'admin-section-head sub' }, h('h2', null, 'Этапы'), h('button', { className: 'btn soft', onClick: function () { props.addGeneric('steps', { num: '04', title: 'Новый этап', text: 'Описание' }); } }, 'Добавить')),
      h('div', { className: 'admin-list compact' }, steps.map(function (item) {
        return h('article', { className: 'admin-item', key: item.id },
          h('div', { className: 'admin-item-head' }, h('strong', null, item.title), h('button', { className: 'danger-link', onClick: function () { props.removeItem('steps', item.id); } }, 'Удалить')),
          h('div', { className: 'admin-grid small' },
            h(Field, { label: 'Номер', value: item.num, onChange: function (v) { props.updateArrayItem('steps', item.id, 'num', v); } }),
            h(Field, { label: 'Заголовок', value: item.title, onChange: function (v) { props.updateArrayItem('steps', item.id, 'title', v); } }),
            h(TextField, { className: 'span-2', label: 'Текст', value: item.text, onChange: function (v) { props.updateArrayItem('steps', item.id, 'text', v); } })
          )
        );
      }))
    );
  }

  function AdminSyncTab(props) {
    var cfg = getSupabaseConfig();
    return h('div', null,
      h('h1', null, 'Подключение базы'),
      h('p', { className: 'admin-muted' }, cfg.ready ? 'База подключена. Изменения из админки сохраняются в Supabase после входа.' : 'База пока не подключена. Сайт работает локально.'),
      props.status && h('p', { className: 'admin-status' }, props.status),
      h('form', { className: 'admin-grid', onSubmit: function (e) {
        e.preventDefault();
        saveSupabaseConfig({ url: e.currentTarget.elements.url.value, key: e.currentTarget.elements.key.value });
        alert('Подключение сохранено в этом браузере. Для публичного сайта эти же значения нужно прописать в assets/supabase-config.js.');
      } },
        h('label', null, h('span', null, 'Project URL'), h('input', { name: 'url', defaultValue: cfg.url })),
        h('label', null, h('span', null, 'Public key / anon key'), h('input', { name: 'key', defaultValue: cfg.key })),
        h('div', { className: 'span-2 data-actions' },
          h('button', { className: 'btn primary', type: 'submit' }, 'Сохранить подключение'),
          h('button', { className: 'btn soft', type: 'button', onClick: function () { props.onRemoteLoad && props.onRemoteLoad(); } }, 'Загрузить из базы'),
          h('button', { className: 'btn ghost', type: 'button', onClick: function () { props.onRemoteSave && props.onRemoteSave(props.data); } }, 'Сохранить в базу')
        )
      )
    );
  }

  function AdminDataTab(props) {
    return h('div', null,
      h('h1', null, 'Данные сайта'),
      h('p', { className: 'admin-muted' }, 'Экспорт и импорт текущих данных сайта.'),
      h('div', { className: 'data-actions' },
        h('button', { className: 'btn primary', onClick: props.exportJson }, 'Скачать JSON'),
        h('label', { className: 'btn soft file-btn' }, 'Загрузить JSON', h('input', { type: 'file', accept: 'application/json', onChange: props.importJson })),
        h('button', { className: 'btn ghost danger', onClick: props.reset }, 'Сбросить изменения')
      )
    );
  }

  function LoadingScreen() {
    return h('main', { className: 'site-loader' },
      h('div', { className: 'site-loader-card' },
        h('div', { className: 'brand-mark loader-mark' }, 'AC'),
        h('h1', null, 'Загружаем сайт'),
        h('p', null, 'Подтягиваем актуальные данные каталога и контактов.'),
        h('div', { className: 'loader-line' }, h('span', null))
      )
    );
  }

  function NotFound() { return h('main', null, h(PageHero, { eyebrow: '404', title: 'Страница не найдена', text: 'Такой страницы нет.' })); }

  function App() {
    React.Component.call(this);
    var cfgReady = getSupabaseConfig().ready;
    this.state = { route: getRoute(), data: cfgReady ? null : loadData(), authed: safeGet(AUTH_KEY) === 'yes', adminState: { active: 'main' }, remoteStatus: '', bootLoading: cfgReady, bootError: '' };
    this.onHash = this.onHash.bind(this);
    this.setData = this.setData.bind(this);
    this.setAdminState = this.setAdminState.bind(this);
    this.loadRemoteNow = this.loadRemoteNow.bind(this);
    this.saveRemoteNow = this.saveRemoteNow.bind(this);
  }
  App.prototype = Object.create(React.Component.prototype);
  App.prototype.constructor = App;
  App.prototype.componentDidMount = function () {
    window.addEventListener('hashchange', this.onHash);
    if (!window.location.hash) window.location.hash = '/';
    this.loadRemoteNow();
  };
  App.prototype.componentWillUnmount = function () { window.removeEventListener('hashchange', this.onHash); };
  App.prototype.onHash = function () { this.setState({ route: getRoute() }); };
  App.prototype.setData = function (data) { this.setState({ data: data }); };
  App.prototype.setAdminState = function (patch) { this.setState({ adminState: Object.assign({}, this.state.adminState, patch) }); };
  App.prototype.loadRemoteNow = function () {
    var self = this;
    if (!getSupabaseConfig().ready) { self.setState({ bootLoading: false }); return Promise.resolve(false); }
    self.setState({ remoteStatus: 'Загружаю данные из базы...' });
    return loadRemoteData().then(function (remoteData) {
      if (remoteData) {
        saveData(remoteData);
        self.setState({ data: remoteData, bootLoading: false, bootError: '', remoteStatus: 'Данные загружены из базы.' });
      } else {
        var fallback = loadData();
        self.setState({ data: fallback, bootLoading: false, bootError: '', remoteStatus: 'В базе пока нет данных сайта.' });
      }
      return true;
    }).catch(function (err) {
      var message = err && err.message ? err.message.slice(0, 180) : 'ошибка';
      var fallback = loadData();
      self.setState({ data: fallback, bootLoading: false, bootError: message, remoteStatus: 'Нет соединения с базой. Показана последняя сохранённая версия.' });
      return false;
    });
  };
  App.prototype.saveRemoteNow = function (data) {
    var self = this;
    if (!getSupabaseConfig().ready) { self.setState({ remoteStatus: 'Supabase не подключён.' }); return Promise.resolve(false); }
    self.setState({ remoteStatus: 'Сохраняю в базу...' });
    return saveRemoteData(data || self.state.data).then(function () {
      var saved = data || self.state.data;
      saveData(saved);
      self.setState({ data: saved, remoteStatus: 'Сохранено на сайте. Обновите страницу на другом устройстве.' });
      return true;
    }).catch(function (err) { self.setState({ remoteStatus: 'Не удалось сохранить на сайте: ' + (err && err.message ? err.message.slice(0, 160) : 'ошибка') }); return false; });
  };
  App.prototype.render = function () {
    var route = this.state.route;
    if (this.state.bootLoading) return h(LoadingScreen);
    var data = this.state.data || clone(defaultData);
    var isAdmin = route === '/admin';
    var page;
    if (route === '/') page = h(Home, { data: data });
    else if (route === '/catalog') page = h(Catalog, { data: data });
    else if (route === '/buyout') page = h(Buyout, { data: data });
    else if (route === '/order') page = h(Order, { data: data });
    else if (route === '/about') page = h(About, { data: data });
    else if (route === '/reviews') page = h(Reviews, { data: data });
    else if (route === '/contacts') page = h(Contacts, { data: data });
    else if (route === '/request') page = h(RequestPage, { data: data, onSubmitRequest: submitRequestToSupabase });
    else if (route === '/admin') {
      page = this.state.authed ? h(AdminPanel, { data: data, state: this.state.adminState, setAdminState: this.setAdminState, setData: this.setData, remoteStatus: this.state.remoteStatus, onRemoteLoad: this.loadRemoteNow, onRemoteSave: this.saveRemoteNow, onLogout: function () { fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(function () {}); clearSession(); this.setState({ authed: false }); }.bind(this) }) : h(AdminLogin, { onLogin: function () { this.setState({ authed: true }); this.loadRemoteNow(); }.bind(this) });
    } else page = h(NotFound);
    return h('div', null, !isAdmin && h(Header, { data: data, route: route }), page, !isAdmin && h(Footer, { data: data }));
  };

  function mount() {
    var root = document.getElementById('root');
    if (!root) return;
    if (!window.React || !window.ReactDOM || !ReactDOM.render) {
      root.innerHTML = '<div style="padding:40px;font-family:Arial">Не загрузились локальные файлы React. Проверьте папку assets/vendor.</div>';
      return;
    }
    ReactDOM.render(h(App), root);
  }

  mount();
})();
