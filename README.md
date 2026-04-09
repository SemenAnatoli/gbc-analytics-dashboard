# GBC Analytics Dashboard

Дашборд для мониторинга заказов: RetailCRM → Supabase → Next.js (Vercel) + Telegram-бот.

**[🔗 Дашборд (Vercel) →](https://gbc-analytics-dashboard-semen.vercel.app)**
**[📁 Репозиторий →](https://github.com/SemenAnatoli/gbc-analytics-dashboard)**

---

## Стек

| | |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts |
| База данных | Supabase (PostgreSQL) |
| CRM | RetailCRM API v5 |
| Деплой | Vercel |
| Уведомления | Telegram Bot API |

---

## Как я делал — по шагам

Начал с настройки инфраструктуры: зарегистрировал демо-аккаунт в RetailCRM, создал проект в Supabase, через BotFather поднял Telegram-бота. Параллельно набросал структуру Next.js проекта с нужными зависимостями.

**Где застрял 1 — RetailCRM API возвращал 500 на каждый запрос.**
Долго не мог понять в чём дело — ключ верный, endpoint правильный, но сервер молчит. В итоге оказалось, что Node.js отправлял запросы через системный прокси (`127.0.0.1:1371`), который и резал соединение. Решил явным удалением прокси-переменных перед HTTP-вызовами.

**Где застрял 2 — тип заказа не существует.**
После фикса прокси API стал отвечать, но с ошибкой: `"eshop-individual" does not exist`. Оказалось, в демо-аккаунте только один тип заказа — `main`. Подтянул справочник через `/api/v5/reference/order-types`, убедился и поправил скрипт.

**Дашборд** строил на Next.js 14 с App Router. Данные из Supabase тянутся server-side — это быстрее и безопаснее, чем клиентские запросы. Графики через Recharts на клиенте: area chart с двойной осью, горизонтальные бары, donut-диаграмма. Добавил отдельный блок топ-товаров — агрегация по JSONB-полю `items` прямо в JS.

**Telegram-бот** запускается отдельно, проверяет новые заказы каждую минуту, шлёт уведомление если сумма > 50 000 ₸. Чтобы не слать дубли при перезапуске — помечает отправленные заказы в Supabase флагом `telegram_notified`.

**Claude Code** использовал как инструмент: помогал с конфигами, дебагом ошибок API, генерацией boilerplate. Каждый блок разбирал и при необходимости правил руками.

---

## Структура проекта

```
app/                        — Next.js App Router
  layout.tsx
  page.tsx                  — главная страница дашборда
  globals.css
components/
  DashboardCharts.tsx       — все графики (client component)
lib/
  data.ts                   — запросы + агрегации
  supabase.ts               — клиент Supabase
  types.ts                  — TypeScript типы
scripts/
  upload-to-retailcrm.js   — загрузка 50 заказов в CRM
  sync-to-supabase.js      — синхронизация CRM → Supabase
  telegram-bot.js          — бот с уведомлениями
supabase/
  schema.sql               — SQL-схема таблицы
mock_orders.json           — 50 тестовых заказов
```

---

## Запуск локально

```bash
# 1. Установить зависимости
npm install

# 2. Заполнить переменные окружения
cp .env.example .env

# 3. Создать таблицу в Supabase
# Открыть supabase.com → SQL Editor → выполнить supabase/schema.sql

# 4. Загрузить заказы в RetailCRM
cd scripts && npm install
node upload-to-retailcrm.js

# 5. Синхронизировать в Supabase
node sync-to-supabase.js

# 6. Запустить дашборд
cd .. && npm run dev

# 7. Запустить Telegram-бот
cd scripts && node telegram-bot.js
```

---

## Переменные окружения

```env
RETAILCRM_URL=https://yourdomain.retailcrm.ru
RETAILCRM_API_KEY=...

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```
