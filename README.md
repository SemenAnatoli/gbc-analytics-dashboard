# GBC Analytics Dashboard

Тестовое задание — мини-дашборд заказов с интеграцией RetailCRM, Supabase, Vercel и Telegram.

**[🔗 Live Demo →](https://gbc-analytics-dashboard.vercel.app)** _(заменить после деплоя)_

---

## Архитектура

```
mock_orders.json
      │
      ▼
 RetailCRM API          ← скрипт: scripts/upload-to-retailcrm.js
      │
      ▼
  Supabase DB           ← скрипт: scripts/sync-to-supabase.js
      │
      ├──► Next.js Dashboard (Vercel)
      │
      └──► Telegram Bot (уведомления >50 000 ₸)
```

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts |
| База данных | Supabase (PostgreSQL) |
| CRM | RetailCRM |
| Деплой | Vercel |
| Бот | node-telegram-bot-api |

---

## Быстрый старт

### 1. Клонируй репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/gbc-analytics-dashboard.git
cd gbc-analytics-dashboard
```

### 2. Создай `.env` файл

```bash
cp .env.example .env
# Заполни все значения
```

### 3. Создай таблицу в Supabase

Открой [Supabase Dashboard](https://supabase.com) → SQL Editor → выполни содержимое файла `supabase/schema.sql`.

### 4. Загрузи заказы в RetailCRM

```bash
cd scripts
npm install
node upload-to-retailcrm.js
```

### 5. Синхронизируй RetailCRM → Supabase

```bash
node sync-to-supabase.js
```

### 6. Запусти дашборд локально

```bash
cd ..
npm install
npm run dev
# Открой http://localhost:3000
```

### 7. Запусти Telegram-бот

```bash
cd scripts
node telegram-bot.js
```

### 8. Задеплой на Vercel

```bash
npm install -g vercel
vercel
# Укажи переменные окружения из .env в Vercel Dashboard
```

---

## Настройка аккаунтов

### RetailCRM
1. Зарегистрируйся на [retailcrm.ru](https://retailcrm.ru) (демо-аккаунт)
2. Настройки → Интеграции → API → Создай ключ с правами на заказы
3. Запиши URL и API key в `.env`

### Supabase
1. Создай проект на [supabase.com](https://supabase.com)
2. Project Settings → API → скопируй `URL`, `anon key`, `service_role key`
3. SQL Editor → выполни `supabase/schema.sql`

### Telegram Bot
1. Напиши [@BotFather](https://t.me/BotFather) → `/newbot`
2. Получи токен → запиши в `TELEGRAM_BOT_TOKEN`
3. Напиши [@userinfobot](https://t.me/userinfobot) → получи свой `chat_id` → запиши в `TELEGRAM_CHAT_ID`

### Vercel
1. Зарегистрируйся на [vercel.com](https://vercel.com)
2. Подключи GitHub репозиторий или используй `vercel` CLI
3. Добавь переменные окружения в Vercel Dashboard

---

## Что делал Claude Code — промпты и решения

### Промпт 1 — Генерация структуры проекта
```
Задача в том что бы сделать на отлично тестовое задание что бы поразить работодателя...
[полное описание задания]
```
**Что сделал Claude:** создал полную структуру Next.js 14 проекта с TypeScript, Tailwind, Recharts; написал все скрипты и SQL схему за один раз.

### Промпт 2 — Дашборд с графиками
```
Сделай красивый аналитический дашборд с KPI карточками, графиком по дням (AreaChart),
распределением по городам (BarChart), статусам (PieChart) и UTM источникам
```
**Результат:** 4 KPI карточки + 4 типа графиков + таблица последних заказов. Данные агрегируются server-side в Next.js.

### Промпт 3 — RetailCRM скрипт
```
Напиши скрипт который загружает mock_orders.json в RetailCRM через API с задержкой между запросами
```
**Где застрял:** RetailCRM требует `site` parameter — нужно знать ваш site code из настроек RetailCRM (Настройки → Магазины).

**Решение:** добавил комментарий в код с объяснением, где найти site code.

### Промпт 4 — Telegram бот
```
Telegram бот который мониторит новые заказы в RetailCRM и шлёт уведомление если сумма > 50000 ₸
```
**Решение:** бот проверяет заказы каждые 60 секунд, использует Supabase для хранения состояния (уже отправленные уведомления), чтобы не дублировать сообщения при перезапуске.

---

## Структура проекта

```
gbc-analytics-dashboard/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          ← Главная страница дашборда (Server Component)
├── components/
│   └── DashboardCharts.tsx  ← Все графики (Client Component)
├── lib/
│   ├── data.ts           ← Запросы к Supabase + агрегации
│   ├── supabase.ts       ← Supabase клиент
│   └── types.ts          ← TypeScript типы
├── scripts/
│   ├── package.json
│   ├── upload-to-retailcrm.js  ← Шаг 2
│   ├── sync-to-supabase.js     ← Шаг 3
│   └── telegram-bot.js         ← Шаг 5
├── supabase/
│   └── schema.sql        ← SQL для создания таблицы
├── mock_orders.json       ← 50 тестовых заказов
├── .env.example
└── package.json
```
