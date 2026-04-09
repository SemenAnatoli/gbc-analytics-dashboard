export const dynamic = 'force-dynamic'

import { getOrders, computeStats, computeOrdersByDay, computeByCity, computeByStatus, computeByUtm } from '@/lib/data'
import {
  OrdersByDayChart,
  CityChart,
  StatusChart,
  UtmChart,
} from '@/components/DashboardCharts'
import type { Order } from '@/lib/types'


function KPICard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string
  value: string
  sub?: string
  color: string
  icon: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function OrdersTable({ orders }: { orders: Order[] }) {
  const statusLabel: Record<string, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    complete: 'Выполнен',
    cancel: 'Отменён',
    assembling: 'Сборка',
    delivery: 'Доставка',
  }
  const statusColor: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    complete: 'bg-green-100 text-green-700',
    cancel: 'bg-red-100 text-red-700',
    assembling: 'bg-purple-100 text-purple-700',
    delivery: 'bg-cyan-100 text-cyan-700',
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Клиент', 'Город', 'Сумма', 'UTM', 'Статус', 'Дата'].map((h) => (
              <th key={h} className="pb-3 text-left text-gray-500 font-medium pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((order) => (
            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4 font-medium text-gray-800">
                {order.first_name} {order.last_name}
              </td>
              <td className="py-3 pr-4 text-gray-600">{order.city || '—'}</td>
              <td className="py-3 pr-4 font-semibold text-gray-900">
                {order.total_amount?.toLocaleString('ru')} ₸
                {order.total_amount > 50000 && (
                  <span className="ml-1 text-amber-500" title="Высокий чек">★</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {order.utm_source || 'organic'}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[order.status] ?? order.status}
                </span>
              </td>
              <td className="py-3 text-gray-400 text-xs">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('ru', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function DashboardPage() {
  const orders = await getOrders()
  const stats = computeStats(orders)
  const byDay = computeOrdersByDay(orders)
  const byCity = computeByCity(orders)
  const byStatus = computeByStatus(orders)
  const byUtm = computeByUtm(orders)

  const updatedAt = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GBC Analytics</h1>
              <p className="text-xs text-gray-400">Orders Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              Обновлено в {updatedAt}
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Всего заказов"
            value={stats.totalOrders.toString()}
            sub="за всё время"
            icon="📦"
            color="bg-indigo-50"
          />
          <KPICard
            title="Общая выручка"
            value={`${stats.totalRevenue.toLocaleString('ru')} ₸`}
            sub="сумма заказов"
            icon="💰"
            color="bg-emerald-50"
          />
          <KPICard
            title="Средний чек"
            value={`${stats.avgOrderValue.toLocaleString('ru')} ₸`}
            sub="на заказ"
            icon="📊"
            color="bg-cyan-50"
          />
          <KPICard
            title="Крупные заказы"
            value={stats.highValueOrders.toString()}
            sub="более 50 000 ₸"
            icon="⭐"
            color="bg-amber-50"
          />
        </div>

        {/* Orders over time */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800">Заказы по дням</h2>
            <p className="text-xs text-gray-400">Количество заказов и выручка</p>
          </div>
          <OrdersByDayChart data={byDay} />
        </div>

        {/* City + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-800">Города</h2>
              <p className="text-xs text-gray-400">Заказов по городу</p>
            </div>
            <CityChart data={byCity} />
          </div>
          <div className="card">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-800">Статусы заказов</h2>
              <p className="text-xs text-gray-400">Распределение по статусам</p>
            </div>
            <StatusChart data={byStatus} />
          </div>
        </div>

        {/* UTM Sources */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800">Источники трафика (UTM)</h2>
            <p className="text-xs text-gray-400">Откуда пришли заказы</p>
          </div>
          <UtmChart data={byUtm} />
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Последние заказы</h2>
              <p className="text-xs text-gray-400">10 из {stats.totalOrders} — ⭐ высокий чек (&gt;50 000 ₸)</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">Нет данных</p>
              <p className="text-sm mt-1">Запустите скрипт синхронизации RetailCRM → Supabase</p>
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        GBC Analytics Dashboard · Built with Next.js + Supabase + Recharts
      </footer>
    </div>
  )
}
