export const dynamic = 'force-dynamic'

import {
  getOrders,
  computeStats,
  computeOrdersByDay,
  computeByCity,
  computeByStatus,
  computeByUtm,
  computeTopProducts,
  computeTopOrders,
  computeWeeklyTrend,
} from '@/lib/data'
import {
  OrdersByDayChart,
  CityChart,
  StatusChart,
  TopProductsChart,
} from '@/components/DashboardCharts'
import type { Order, DashboardStats, UtmData, WeeklyTrend } from '@/lib/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('ru')
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Новый', in_progress: 'В работе', complete: 'Выполнен',
  cancel: 'Отменён', assembling: 'Сборка', assembled: 'Собран',
  delivery: 'Доставка', delivering: 'Доставляется',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-emerald-100 text-emerald-700',
  cancel: 'bg-red-100 text-red-700',
  assembling: 'bg-purple-100 text-purple-700',
  delivery: 'bg-cyan-100 text-cyan-700',
  delivering: 'bg-sky-100 text-sky-700',
}

const UTM_COLOR = [
  'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-purple-500', 'bg-rose-500',
]

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ stats }: { stats: DashboardStats }) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/10 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-none">GBC Analytics</h1>
            <p className="text-slate-500 text-[11px] mt-0.5">Orders Dashboard</p>
          </div>
        </div>

        {/* Inline stats */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { label: 'заказов', value: String(stats.totalOrders), color: 'text-indigo-300' },
            { label: 'выручка', value: `${fmt(Math.round(stats.totalRevenue / 1000))}K ₸`, color: 'text-emerald-300' },
            { label: '> 50K ₸', value: String(stats.highValueOrders), color: 'text-amber-300' },
          ].map((s) => (
            <div key={s.label} className="stat-chip">
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
              <span className="text-slate-500 text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-emerald-400 text-xs flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
          <span className="hidden sm:block font-medium">Live</span>
        </div>
      </div>
    </header>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title, value, sub, icon, accent, trend,
}: {
  title: string; value: string; sub?: string
  icon: string; accent: string; trend?: WeeklyTrend
}) {
  return (
    <div className={`card kpi-hover overflow-hidden relative`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 animate-in">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={`text-xs font-semibold ${trend.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.pct)}%
            </span>
            <span className="text-xs text-slate-400">vs прошлая неделя</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Top Orders Spotlight ────────────────────────────────────────────────────

function TopOrdersSpotlight({ orders }: { orders: Order[] }) {
  if (!orders.length) return null
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="card-padded bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏆</span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Топ заказы</h2>
          <p className="text-xs text-slate-400">Самые крупные покупки</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {orders.map((order, i) => (
          <div key={order.id} className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{medals[i] ?? '🏅'}</span>
              <span className="text-xs text-slate-400">#{order.retailcrm_id ?? order.id}</span>
            </div>
            <p className="font-bold text-xl text-amber-700">{fmt(order.total_amount)} ₸</p>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {order.first_name} {order.last_name}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">📍 {order.city || '—'}</span>
              <span className="text-xs text-slate-400">
                📦 {(order.items ?? []).length} поз.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── UTM Progress Bars ───────────────────────────────────────────────────────

function UtmBars({ data }: { data: UtmData[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.source}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-700 capitalize">{item.source}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{Math.round((item.count / total) * 100)}%</span>
              <span className="text-sm font-semibold text-slate-900">{item.count}</span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${UTM_COLOR[i % UTM_COLOR.length]}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Orders Table ────────────────────────────────────────────────────────────

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="border-b border-slate-100">
            {['#', 'Клиент', 'Город', 'Сумма', 'UTM', 'Статус', 'Дата'].map((h) => (
              <th key={h} className="pb-3 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide pr-4 first:pl-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 12).map((order, idx) => (
            <tr
              key={order.id}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors group ${
                order.total_amount > 50000 ? 'bg-amber-50/30' : ''
              }`}
            >
              <td className="py-3 pr-4 pl-1 text-slate-400 text-xs">{idx + 1}</td>
              <td className="py-3 pr-4 font-medium text-slate-800">
                {order.first_name} {order.last_name}
              </td>
              <td className="py-3 pr-4 text-slate-500 text-xs">{order.city || '—'}</td>
              <td className="py-3 pr-4">
                <span className="font-bold text-slate-900">{fmt(order.total_amount)} ₸</span>
                {order.total_amount > 50000 && (
                  <span className="ml-1 text-amber-500 text-xs" title="Высокий чек">★</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {order.utm_source || 'organic'}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`badge ${STATUS_COLOR[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </td>
              <td className="py-3 text-slate-400 text-xs">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('ru', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
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

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const orders = await getOrders()
  const stats = computeStats(orders)
  const byDay = computeOrdersByDay(orders)
  const byCity = computeByCity(orders)
  const byStatus = computeByStatus(orders)
  const byUtm = computeByUtm(orders)
  const topProducts = computeTopProducts(orders)
  const topOrders = computeTopOrders(orders, 3)
  const trend = computeWeeklyTrend(orders)

  const syncedAt = new Date().toLocaleString('ru', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Всего заказов"
            value={String(stats.totalOrders)}
            sub={`${trend.current} за 7 дней`}
            icon="📦"
            accent="bg-gradient-to-r from-indigo-500 to-indigo-400"
            trend={trend}
          />
          <KPICard
            title="Общая выручка"
            value={`${fmt(stats.totalRevenue)} ₸`}
            sub="сумма всех заказов"
            icon="💰"
            accent="bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
          <KPICard
            title="Средний чек"
            value={`${fmt(stats.avgOrderValue)} ₸`}
            sub="на один заказ"
            icon="📊"
            accent="bg-gradient-to-r from-sky-500 to-sky-400"
          />
          <KPICard
            title="Крупных заказов"
            value={String(stats.highValueOrders)}
            sub="на сумму > 50 000 ₸"
            icon="⭐"
            accent="bg-gradient-to-r from-amber-500 to-amber-400"
          />
        </div>

        {/* Top 3 orders spotlight */}
        {topOrders.length > 0 && <TopOrdersSpotlight orders={topOrders} />}

        {/* Main chart */}
        <div className="card-padded">
          <SectionTitle title="Заказы и выручка по дням" sub="динамика за всё время" />
          {orders.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Нет данных</div>
          ) : (
            <OrdersByDayChart data={byDay} />
          )}
        </div>

        {/* City | Top Products | Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card-padded">
            <SectionTitle title="Города" sub="количество заказов" />
            <CityChart data={byCity} />
          </div>
          <div className="card-padded">
            <SectionTitle title="Топ товаров" sub="выручка по позициям" />
            <TopProductsChart data={topProducts} />
          </div>
          <div className="card-padded">
            <SectionTitle title="Статусы" sub="распределение заказов" />
            <StatusChart data={byStatus} total={stats.totalOrders} />
          </div>
        </div>

        {/* UTM Sources */}
        <div className="card-padded">
          <SectionTitle title="Источники трафика" sub="откуда приходят заказы" />
          <div className="max-w-lg">
            <UtmBars data={byUtm} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-padded">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              title="Последние заказы"
              sub={`${orders.length} заказов · ★ высокий чек (> 50 000 ₸)`}
            />
            <span className="text-xs text-slate-400 flex-shrink-0">обновлено {syncedAt}</span>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-5xl mb-3">📭</p>
              <p className="font-medium text-slate-600">Нет данных</p>
              <p className="text-sm mt-1">Запустите скрипт синхронизации</p>
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>

      </main>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-100 mt-4">
        <span className="font-medium text-slate-500">GBC Analytics Dashboard</span>
        {' · '}Next.js 14 · Supabase · Recharts · Vercel
      </footer>
    </div>
  )
}
