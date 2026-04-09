/**
 * Загружает mock_orders.json напрямую в Supabase
 * (обходной путь пока RetailCRM недоступен)
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const mockOrders = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'mock_orders.json'), 'utf-8')
)

function calcTotal(items = []) {
  return items.reduce((sum, item) => sum + (item.initialPrice ?? 0) * (item.quantity ?? 1), 0)
}

// Генерируем даты за последние 30 дней для красивого графика
function randomDate() {
  const now = Date.now()
  const daysAgo = Math.floor(Math.random() * 30)
  const hoursAgo = Math.floor(Math.random() * 24)
  return new Date(now - daysAgo * 86400000 - hoursAgo * 3600000).toISOString()
}

const rows = mockOrders.map((order, i) => {
  const items = (order.items ?? []).map(item => ({
    productName: item.productName,
    quantity: item.quantity ?? 1,
    initialPrice: item.initialPrice ?? 0,
  }))

  return {
    retailcrm_id: i + 1,
    first_name: order.firstName ?? '',
    last_name: order.lastName ?? '',
    phone: order.phone ?? '',
    email: order.email ?? '',
    status: order.status ?? 'new',
    total_amount: calcTotal(items),
    city: order.delivery?.address?.city ?? 'Неизвестно',
    utm_source: order.customFields?.utm_source ?? 'organic',
    items,
    created_at: randomDate(),
    retailcrm_created_at: null,
    telegram_notified: false,
  }
})

console.log(`\n📦 Загружаем ${rows.length} заказов в Supabase...`)
console.log(`💰 Общая сумма: ${rows.reduce((s, r) => s + r.total_amount, 0).toLocaleString('ru')} ₸\n`)

const { data, error } = await supabase
  .from('orders')
  .upsert(rows, { onConflict: 'retailcrm_id' })
  .select('id')

if (error) {
  console.error('❌ Ошибка:', error.message)
  process.exit(1)
}

console.log(`✅ Загружено: ${rows.length} заказов`)
console.log(`⭐ Крупных (>50,000 ₸): ${rows.filter(r => r.total_amount > 50000).length}`)
console.log('\n✨ Готово! Можно открывать дашборд.')
