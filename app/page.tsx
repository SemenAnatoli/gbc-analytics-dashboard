export const dynamic = 'force-dynamic'

import {
  getOrders, computeStats, computeOrdersByDay, computeByCity,
  computeByStatus, computeByUtm, computeTopProducts, computeTopOrders,
} from '@/lib/data'
import {
  OrdersByDayChart, RevenueChart, MiniBarChart,
  DonutChart, CityBars, TopProductBars,
} from '@/components/DashboardCharts'
import type { Order, DashboardStats, UtmData, TopProduct, CityData } from '@/lib/types'

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru') }

const STATUS_LABEL: Record<string, string> = {
  new: 'Новый', in_progress: 'В работе', complete: 'Выполнен',
  cancel: 'Отменён', assembling: 'Сборка', delivering: 'Доставляется',
}
const STATUS_DOT: Record<string, string> = {
  new: 'bg-blue-400', in_progress: 'bg-amber-400', complete: 'bg-emerald-400',
  cancel: 'bg-red-400', assembling: 'bg-purple-400', delivering: 'bg-sky-400',
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const icons = [
    { svg: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: false },
    { svg: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', active: true },
    { svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', active: false },
    { svg: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: false },
    { svg: 'M4 6h16M4 10h16M4 14h16M4 18h16', active: false },
    { svg: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', active: false },
  ]
  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-sidebar-gradient flex flex-col items-center py-5 gap-2 z-30 shadow-xl">
      {/* Logo */}
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 shadow-lg">
        <span className="text-white font-black text-lg">G</span>
      </div>
      {/* Nav icons */}
      {icons.map((item, i) => (
        <div key={i} className={item.active ? 'sidebar-icon-active' : 'sidebar-icon'}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            {item.svg.includes('M15 12') ? (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.svg.split(' M15')[0]} />
                <path strokeLinecap="round" strokeLinejoin="round" d={'M15 12a3 3 0 11-6 0 3 3 0 016 0z'} />
              </>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d={item.svg} />
            )}
          </svg>
        </div>
      ))}
      {/* Bottom live dot */}
      <div className="mt-auto">
        <div className="w-2 h-2 rounded-full bg-emerald-300 live" />
      </div>
    </aside>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 ml-16">
      <div className="px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">Аналитика заказов</h1>
          <p className="text-xs text-slate-400">RetailCRM · Supabase · Live</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-orange shadow-orange">+ Экспорт</span>
          {/* Bell */}
          <div className="relative w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 bg-sidebar-gradient rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">С</div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-none">Семён Б.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Аналитик</p>
            </div>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon, accent, pct, up }: {
  title: string; value: string; sub?: string
  icon: string; accent: string; pct?: number; up?: boolean
}) {
  return (
    <div className="card p-5 fade-up hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
          {icon}
        </div>
        {pct !== undefined && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {up ? '↑' : '↓'} {Math.abs(pct)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1.5">{title}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Circular progress ───────────────────────────────────────────────────────
function CircleProgress({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Top Order Card ───────────────────────────────────────────────────────────
function TopOrderCard({ order, rank }: { order: Order; rank: number }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <span className="text-lg flex-shrink-0">{medals[rank] ?? '🏅'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{order.first_name} {order.last_name}</p>
        <p className="text-[11px] text-slate-400">{order.city} · {order.utm_source || 'organic'}</p>
      </div>
      <span className="text-sm font-black text-emerald-600 flex-shrink-0">{fmt(order.total_amount)} ₸</span>
    </div>
  )
}

// ─── Orders Table ─────────────────────────────────────────────────────────────
function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-100">
            {['', 'Клиент', 'Город', 'Товаров', 'Сумма', 'UTM', 'Статус'].map((h) => (
              <th key={h} className="pb-3 text-left text-[11px] text-slate-400 font-semibold uppercase tracking-wider pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((order, i) => (
            <tr key={order.id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${order.total_amount > 50000 ? 'bg-emerald-50/30' : ''}`}>
              <td className="py-3 pr-3 text-slate-400 text-xs font-medium">{i + 1}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {order.first_name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{order.first_name} {order.last_name}</p>
                    <p className="text-[10px] text-slate-400">{order.phone || order.email || '—'}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-xs text-slate-500">{order.city || '—'}</td>
              <td className="py-3 pr-4 text-xs text-slate-500">{(order.items ?? []).length}</td>
              <td className="py-3 pr-4">
                <span className="text-sm font-bold text-slate-800">{fmt(order.total_amount)} ₸</span>
                {order.total_amount > 50000 && <span className="ml-1 text-amber-500 text-xs">★</span>}
              </td>
              <td className="py-3 pr-4">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{order.utm_source || 'organic'}</span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status] ?? 'bg-slate-300'}`} />
                  <span className="text-xs text-slate-600">{STATUS_LABEL[order.status] ?? order.status}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const orders = await getOrders()
  const stats = computeStats(orders)
  const byDay = computeOrdersByDay(orders)
  const byCity = computeByCity(orders)
  const byStatus = computeByStatus(orders)
  const byUtm = computeByUtm(orders)
  const topProducts = computeTopProducts(orders)
  const topOrders = computeTopOrders(orders, 3)

  // Считаем % городов от общего
  const totalOrders = stats.totalOrders || 1
  const almatyPct = Math.round(((byCity.find(c => c.city === 'Алматы')?.orders ?? 0) / totalOrders) * 100)
  const astanaPct = Math.round(((byCity.find(c => c.city === 'Астана')?.orders ?? 0) / totalOrders) * 100)
  const highPct   = Math.round((stats.highValueOrders / totalOrders) * 100)

  return (
    <div className="ml-16 min-h-screen bg-app-bg">
      <Sidebar />
      <Topbar />

      <main className="p-5 space-y-5 max-w-[1400px]">

        {/* ── Row 1: KPI cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Всего заказов" value={String(stats.totalOrders)}
            sub="за всё время" icon="📦" accent="bg-emerald-50"
            pct={12} up={true} />
          <KPICard title="Общая выручка" value={`${fmt(Math.round(stats.totalRevenue / 1000))}K ₸`}
            sub={`${fmt(stats.totalRevenue)} ₸`} icon="💰" accent="bg-orange-50"
            pct={8} up={true} />
          <KPICard title="Средний чек" value={`${fmt(stats.avgOrderValue)} ₸`}
            sub="на один заказ" icon="📊" accent="bg-sky-50"
            pct={3} up={false} />
          <KPICard title="Крупных заказов" value={String(stats.highValueOrders)}
            sub="более 50 000 ₸" icon="⭐" accent="bg-purple-50"
            pct={highPct} up={true} />
        </div>

        {/* ── Row 2: Main area chart + Circle KPIs + City bars ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Заказы по дням</h2>
                <p className="text-xs text-slate-400">
                  Бары — кол-во заказов · Линия — выручка · <span className="text-orange-500 font-semibold">пик выделен</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 mr-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Заказы</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-full bg-orange-400 inline-block" /> Выручка</span>
                </div>
                <div className="flex gap-1.5">
                  {['7д', '30д', 'Всё'].map((t, i) => (
                    <span key={t} className={`text-[11px] px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${i === 2 ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {orders.length ? <OrdersByDayChart data={byDay} /> : (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">Нет данных</div>
            )}
          </div>

          {/* Circle progress stats */}
          <div className="card p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-1">Охват городов</h2>
              <p className="text-xs text-slate-400 mb-5">Доля заказов по регионам</p>
            </div>
            <div className="flex justify-around mb-5">
              <CircleProgress pct={almatyPct} color="#3ecf8e" label="Алматы" />
              <CircleProgress pct={astanaPct} color="#0ea5e9" label="Астана" />
              <CircleProgress pct={highPct} color="#f97316" label="> 50K ₸" />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold text-slate-600 mb-3">Все города</h3>
              <CityBars data={byCity} />
            </div>
          </div>
        </div>

        {/* ── Row 3: Revenue mini + Bar chart + Donut + Top orders ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue mini chart */}
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Выручка</p>
            <p className="text-xl font-black text-slate-800">{fmt(Math.round(stats.totalRevenue / 1000))}K ₸</p>
            <div className="mt-3">
              <RevenueChart data={byDay} />
            </div>
          </div>

          {/* Bar last 7 days */}
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Последние 7 дней</p>
            <p className="text-xl font-black text-slate-800">
              {byDay.slice(-7).reduce((s, d) => s + d.orders, 0)} заказов
            </p>
            <div className="mt-3">
              <MiniBarChart data={byDay} />
            </div>
          </div>

          {/* Donut */}
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Статусы</p>
            <p className="text-xl font-black text-slate-800 mb-2">{stats.totalOrders} всего</p>
            <DonutChart data={byStatus} total={stats.totalOrders} />
          </div>

          {/* Top orders */}
          <div className="card p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm">🏆</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Топ заказы</p>
                <p className="text-[10px] text-slate-400">Крупнейшие покупки</p>
              </div>
            </div>
            <div className="space-y-2">
              {topOrders.map((o, i) => <TopOrderCard key={o.id} order={o} rank={i} />)}
            </div>
          </div>
        </div>

        {/* ── Row 4: UTM sources + Top products ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* UTM */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Источники трафика (UTM)</h2>
                <p className="text-xs text-slate-400">Откуда приходят заказы</p>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-medium">
                {stats.totalOrders} заказов
              </span>
            </div>
            <div className="space-y-3.5">
              {byUtm.map((item, i) => {
                const colors = ['#3ecf8e','#0ea5e9','#f97316','#8b5cf6','#ec4899','#f59e0b']
                const pct = Math.round((item.count / totalOrders) * 100)
                return (
                  <div key={item.source}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                        <span className="text-xs font-semibold text-slate-700 capitalize">{item.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{pct}%</span>
                        <span className="text-xs font-bold text-slate-800 w-5 text-right">{item.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top products */}
          <div className="card p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-800">Топ товаров</h2>
              <p className="text-xs text-slate-400">Выручка по позициям</p>
            </div>
            <TopProductBars data={topProducts} />
          </div>
        </div>

        {/* ── Row 5: Orders table ───────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Последние заказы</h2>
              <p className="text-xs text-slate-400">★ — высокий чек (&gt; 50 000 ₸)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live" />
              <span className="text-xs text-slate-400">
                {new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16 text-slate-300">
              <p className="text-5xl mb-3">📭</p>
              <p className="font-medium text-slate-500">Нет данных</p>
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>

      </main>

      <footer className="ml-16 text-center py-6 text-[11px] text-slate-400 border-t border-slate-100">
        GBC Analytics · Next.js 14 · Supabase · Recharts
      </footer>
    </div>
  )
}
