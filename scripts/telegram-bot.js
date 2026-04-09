/**
 * Шаг 5: Telegram-бот — уведомления о крупных заказах (>50 000 ₸)
 *
 * Каждую минуту проверяет новые заказы в RetailCRM.
 * Если заказ > 50 000 ₸ и ещё не отправлен — шлёт уведомление в Telegram.
 *
 * Запуск:
 *   cd scripts && node telegram-bot.js
 *
 * Требуется .env в корне:
 *   RETAILCRM_URL, RETAILCRM_API_KEY,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * TELEGRAM_CHAT_ID — ваш личный chat_id.
 * Узнать: напишите боту @userinfobot
 */

import 'dotenv/config'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import TelegramBot from 'node-telegram-bot-api'

const RETAILCRM_URL = process.env.RETAILCRM_URL
const API_KEY = process.env.RETAILCRM_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
const HIGH_VALUE_THRESHOLD = 50_000

for (const [key, val] of Object.entries({ RETAILCRM_URL, API_KEY, SUPABASE_URL, SUPABASE_KEY, BOT_TOKEN, CHAT_ID })) {
  if (!val) {
    console.error(`❌ Не задана переменная окружения: ${key}`)
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const bot = new TelegramBot(BOT_TOKEN)

function calcTotal(items = []) {
  return items.reduce((sum, item) => sum + (item.initialPrice ?? 0) * (item.quantity ?? 1), 0)
}

function formatMoney(n) {
  return n.toLocaleString('ru') + ' ₸'
}

async function getRecentOrders() {
  // Заказы за последние 5 минут
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const resp = await axios.get(`${RETAILCRM_URL}/api/v5/orders`, {
    params: {
      apiKey: API_KEY,
      limit: 50,
      'filter[createdAtFrom]': since.replace('T', ' ').substring(0, 19),
    },
  })

  if (!resp.data.success) return []
  return resp.data.orders ?? []
}

async function sendAlert(order, total) {
  const name = `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim()
  const city = order.delivery?.address?.city ?? 'Неизвестно'
  const items = (order.items ?? [])
    .map((i) => `• ${i.offer?.name ?? i.productName ?? 'Товар'} × ${i.quantity}`)
    .join('\n')
  const utm = order.customFields?.utm_source ?? 'organic'

  const text = [
    '🔔 *Крупный заказ!*',
    '',
    `💰 *Сумма: ${formatMoney(total)}*`,
    `👤 Клиент: ${name || 'Аноним'}`,
    `📍 Город: ${city}`,
    `📣 Источник: ${utm}`,
    `🆔 ID в RetailCRM: #${order.id}`,
    '',
    '*Товары:*',
    items || '—',
  ].join('\n')

  await bot.sendMessage(CHAT_ID, text, { parse_mode: 'Markdown' })
  console.log(`📨 Уведомление отправлено: #${order.id} — ${formatMoney(total)}`)
}

async function markNotified(retailcrmId) {
  await supabase
    .from('orders')
    .update({ telegram_notified: true })
    .eq('retailcrm_id', retailcrmId)
}

async function getNotifiedIds() {
  const { data } = await supabase
    .from('orders')
    .select('retailcrm_id')
    .eq('telegram_notified', true)
  return new Set((data ?? []).map((r) => r.retailcrm_id))
}

async function check() {
  try {
    const orders = await getRecentOrders()
    if (orders.length === 0) return

    const notifiedIds = await getNotifiedIds()

    for (const order of orders) {
      if (notifiedIds.has(order.id)) continue

      const items = (order.items ?? []).map((i) => ({
        initialPrice: i.initialPrice ?? 0,
        quantity: i.quantity ?? 1,
      }))
      const total = calcTotal(items)

      if (total > HIGH_VALUE_THRESHOLD) {
        await sendAlert(order, total)
        await markNotified(order.id)
      }
    }
  } catch (err) {
    console.error('❌ Ошибка проверки:', err.message)
  }
}

const INTERVAL_MS = 60_000 // каждую минуту

console.log('🤖 Telegram-бот запущен')
console.log(`📡 RetailCRM: ${RETAILCRM_URL}`)
console.log(`⚡ Проверка каждые ${INTERVAL_MS / 1000} сек`)
console.log(`💰 Порог уведомления: ${formatMoney(HIGH_VALUE_THRESHOLD)}\n`)

// Первая проверка сразу
check()
setInterval(check, INTERVAL_MS)
