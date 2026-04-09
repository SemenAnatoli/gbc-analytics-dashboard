/**
 * Шаг 3: Синхронизация RetailCRM → Supabase
 *
 * Забирает заказы из RetailCRM и кладёт в таблицу orders в Supabase.
 * Умеет делать upsert — повторный запуск не дублирует данные.
 *
 * Запуск:
 *   cd scripts && node sync-to-supabase.js
 *
 * Требуется .env в корне:
 *   RETAILCRM_URL, RETAILCRM_API_KEY,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const RETAILCRM_URL = process.env.RETAILCRM_URL
const API_KEY = process.env.RETAILCRM_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!RETAILCRM_URL || !API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Проверьте переменные окружения в .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Вычисляем сумму заказа из items */
function calcTotal(items = []) {
  return items.reduce((sum, item) => sum + (item.initialPrice ?? 0) * (item.quantity ?? 1), 0)
}

/** Получаем все заказы из RetailCRM (постранично) */
async function fetchAllOrders() {
  const allOrders = []
  let page = 1
  const limit = 100

  while (true) {
    const url = `${RETAILCRM_URL}/api/v5/orders`
    const resp = await axios.get(url, {
      params: { apiKey: API_KEY, limit, page },
    })

    if (!resp.data.success) {
      console.error('RetailCRM API error:', resp.data)
      break
    }

    const { orders, pagination } = resp.data
    allOrders.push(...orders)
    console.log(`  📄 Страница ${page}/${pagination.totalPageCount} — получено ${orders.length} заказов`)

    if (page >= pagination.totalPageCount) break
    page++
    await new Promise((r) => setTimeout(r, 300))
  }

  return allOrders
}

/** Преобразуем заказ RetailCRM в строку для Supabase */
function transformOrder(o) {
  const items = (o.items ?? []).map((item) => ({
    productName: item.offer?.name ?? item.productName ?? 'Товар',
    quantity: item.quantity ?? 1,
    initialPrice: item.initialPrice ?? 0,
  }))

  const address = o.delivery?.address ?? {}
  const city =
    address.city ||
    address.text?.split(',')[0] ||
    'Неизвестно'

  return {
    retailcrm_id: o.id,
    first_name: o.firstName ?? '',
    last_name: o.lastName ?? '',
    phone: o.phone ?? o.customer?.phone ?? '',
    email: o.email ?? o.customer?.email ?? '',
    status: o.status ?? 'new',
    total_amount: calcTotal(items),
    city,
    utm_source: o.customFields?.utm_source ?? null,
    items,
    retailcrm_created_at: o.createdAt ?? null,
  }
}

async function main() {
  console.log('\n🔄 Синхронизация RetailCRM → Supabase\n')

  console.log('1️⃣  Получаем заказы из RetailCRM...')
  const rawOrders = await fetchAllOrders()
  console.log(`   Итого: ${rawOrders.length} заказов\n`)

  const rows = rawOrders.map(transformOrder)

  console.log('2️⃣  Загружаем в Supabase (upsert)...')
  const { data, error } = await supabase
    .from('orders')
    .upsert(rows, { onConflict: 'retailcrm_id' })
    .select('id')

  if (error) {
    console.error('❌ Ошибка Supabase:', error.message)
    console.error('   Детали:', error)
    process.exit(1)
  }

  console.log(`✅ Синхронизировано: ${rows.length} заказов\n`)
  console.log('✨ Готово!')
}

main()
