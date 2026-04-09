/**
 * Шаг 2: Загружаем mock_orders.json в RetailCRM через API
 *
 * Запуск:
 *   cd scripts && npm install && node upload-to-retailcrm.js
 *
 * Требуется .env в корне проекта:
 *   RETAILCRM_URL=https://yourdomain.retailcrm.ru
 *   RETAILCRM_API_KEY=your_api_key
 */

import 'dotenv/config'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RETAILCRM_URL = process.env.RETAILCRM_URL
const API_KEY = process.env.RETAILCRM_API_KEY

if (!RETAILCRM_URL || !API_KEY) {
  console.error('❌ Укажите RETAILCRM_URL и RETAILCRM_API_KEY в файле .env')
  process.exit(1)
}

const ordersPath = path.join(__dirname, '..', 'mock_orders.json')
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'))

async function uploadOrder(order, index) {
  const url = `${RETAILCRM_URL}/api/v5/orders/create`

  const params = new URLSearchParams()
  params.append('apiKey', API_KEY)
  params.append('site', 'default') // замените на ваш site code из RetailCRM
  params.append('order', JSON.stringify(order))

  try {
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (response.data.success) {
      console.log(`✅ [${index + 1}/50] ${order.firstName} ${order.lastName} → ID: ${response.data.id}`)
    } else {
      console.warn(`⚠️  [${index + 1}/50] Ошибка:`, JSON.stringify(response.data.errors))
    }
  } catch (err) {
    const msg = err.response?.data?.errors ?? err.message
    console.error(`❌ [${index + 1}/50] Ошибка запроса:`, msg)
  }

  // Задержка 300мс чтобы не нарваться на rate limit
  await new Promise((r) => setTimeout(r, 300))
}

async function main() {
  console.log(`\n🚀 Загружаем ${orders.length} заказов в RetailCRM...`)
  console.log(`📡 URL: ${RETAILCRM_URL}\n`)

  for (let i = 0; i < orders.length; i++) {
    await uploadOrder(orders[i], i)
  }

  console.log('\n✨ Загрузка завершена!')
}

main()
