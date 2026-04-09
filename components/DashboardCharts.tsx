'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { ChartDataPoint, CityData, StatusData, TopProduct } from '@/lib/types'

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function fmtMoney(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10">
      <p className="font-medium text-slate-300 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-semibold">
            {p.name === 'Выручка' ? `${Number(p.value).toLocaleString('ru')} ₸` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function OrdersByDayChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={fmtMoney} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          iconType="circle"
          iconSize={8}
        />
        <Area yAxisId="l" type="monotone" dataKey="orders" name="Заказы" stroke="#4f46e5" strokeWidth={2.5} fill="url(#gOrders)" dot={false} activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
        <Area yAxisId="r" type="monotone" dataKey="revenue" name="Выручка" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gRevenue)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const CityTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10">
      <p className="font-semibold mb-1">{payload[0]?.payload?.city}</p>
      <p className="text-slate-400">Заказов: <span className="text-white font-medium">{payload[0]?.value}</span></p>
    </div>
  )
}

export function CityChart({ data }: { data: CityData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="city" width={80} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CityTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="orders" name="Заказов" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#4f46e5' : i === 1 ? '#6366f1' : '#818cf8'} />
          ))}
          <LabelList dataKey="orders" position="right" style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function StatusChart({ data, total }: { data: StatusData[]; total: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: number, name: string) => [val, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-xs text-slate-500">всего</span>
      </div>
    </div>
  )
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const chartData = data.map((d) => ({
    name: d.name.length > 22 ? d.name.slice(0, 22) + '…' : d.name,
    revenue: d.revenue,
    count: d.count,
  }))

  const ProductTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10">
        <p className="font-semibold mb-1">{payload[0]?.payload?.name}</p>
        <p className="text-slate-400">Выручка: <span className="text-emerald-400 font-medium">{Number(payload[0]?.value).toLocaleString('ru')} ₸</span></p>
        <p className="text-slate-400">Кол-во: <span className="text-white font-medium">{payload[0]?.payload?.count}</span></p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 50, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtMoney} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ProductTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="revenue" name="Выручка" radius={[0, 6, 6, 0]} barSize={14}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'][i] ?? '#10b981'} />
          ))}
          <LabelList dataKey="revenue" position="right" formatter={(v: number) => `${fmtMoney(v)} ₸`} style={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
