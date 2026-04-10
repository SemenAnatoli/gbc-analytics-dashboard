'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { ChartDataPoint, CityData, StatusData, TopProduct } from '@/lib/types'

const PIE_COLORS = ['#3ecf8e', '#0ea5e9', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b']

function fmtK(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

// ─── Dark tooltip ─────────────────────────────────────────────────────────────
const DarkTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-white/10 min-w-[120px]">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="font-semibold">
            {p.name === 'Выручка' ? `${Number(p.value).toLocaleString('ru')} ₸` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Area chart ───────────────────────────────────────────────────────────────
export function OrdersByDayChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3ecf8e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3ecf8e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<DarkTip />} />
        <Area type="monotone" dataKey="orders" name="Заказы" stroke="#3ecf8e" strokeWidth={2.5} fill="url(#gGreen)" dot={false} activeDot={{ r: 4, fill: '#3ecf8e', stroke: '#fff', strokeWidth: 2 }} />
        <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#0ea5e9" strokeWidth={2} fill="url(#gBlue)" dot={false} activeDot={{ r: 4, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} yAxisId={0} hide />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Revenue area ─────────────────────────────────────────────────────────────
export function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip content={<DarkTip />} />
        <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#f97316" strokeWidth={2} fill="url(#gOrange)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Mini bar (orders per day) ────────────────────────────────────────────────
export function MiniBarChart({ data }: { data: ChartDataPoint[] }) {
  const last7 = data.slice(-7)
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={last7} margin={{ top: 4, right: 4, left: -30, bottom: 0 }} barSize={10}>
        <Tooltip content={<DarkTip />} />
        <Bar dataKey="orders" name="Заказы" radius={[4, 4, 0, 0]}>
          {last7.map((_, i) => (
            <Cell key={i} fill={i === last7.length - 1 ? '#f97316' : '#3ecf8e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Donut ────────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180
const renderPct = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function DonutChart({ data, total }: { data: StatusData[]; total: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%"
            innerRadius={52} outerRadius={82} paddingAngle={2}
            labelLine={false} label={renderPct}
          >
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number, n: string) => [v, n]}
            contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <span className="text-[11px] text-slate-400 font-medium">заказов</span>
      </div>
    </div>
  )
}

// ─── Horizontal city bars ────────────────────────────────────────────────────
export function CityBars({ data }: { data: CityData[] }) {
  const max = Math.max(...data.map((d) => d.orders), 1)
  const colors = ['#3ecf8e', '#1aab74', '#0d9488', '#0e7490', '#0369a1']
  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((item, i) => (
        <div key={item.city}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700">{item.city}</span>
            <span className="text-slate-500 font-semibold">{item.orders}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.orders / max) * 100}%`, background: colors[i] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Top products ─────────────────────────────────────────────────────────────
export function TopProductBars({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={110}
          tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 16) + '…' : v}
          tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
        <Tooltip content={<DarkTip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="revenue" name="Выручка" radius={[0, 6, 6, 0]} barSize={12}>
          {data.map((_, i) => (
            <Cell key={i} fill={['#3ecf8e', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'][i] ?? '#3ecf8e'} />
          ))}
          <LabelList dataKey="revenue" position="right"
            formatter={(v: number) => `${fmtK(v)}`}
            style={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
