import { createAdminClient } from './supabase'
import type {
  Order,
  DashboardStats,
  ChartDataPoint,
  CityData,
  StatusData,
  UtmData,
} from './types'

export async function getOrders(): Promise<Order[]> {
  const supabase = createAdminClient()
  if (!supabase) {
    console.warn('Supabase не настроен — проверьте переменные окружения')
    return []
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return data ?? []
}

export function computeStats(orders: Order[]): DashboardStats {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
  return {
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    highValueOrders: orders.filter((o) => o.total_amount > 50000).length,
  }
}

export function computeOrdersByDay(orders: Order[]): ChartDataPoint[] {
  const map: Record<string, { orders: number; revenue: number }> = {}

  for (const order of orders) {
    const date = order.created_at
      ? new Date(order.created_at).toLocaleDateString('ru-KZ', {
          day: '2-digit',
          month: '2-digit',
        })
      : 'Неизв.'
    if (!map[date]) map[date] = { orders: 0, revenue: 0 }
    map[date].orders += 1
    map[date].revenue += order.total_amount ?? 0
  }

  return Object.entries(map)
    .map(([date, v]) => ({ date, ...v }))
    .reverse()
}

export function computeByCity(orders: Order[]): CityData[] {
  const map: Record<string, { orders: number; revenue: number }> = {}
  for (const order of orders) {
    const city = order.city || 'Неизвестно'
    if (!map[city]) map[city] = { orders: 0, revenue: 0 }
    map[city].orders += 1
    map[city].revenue += order.total_amount ?? 0
  }
  return Object.entries(map)
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.orders - a.orders)
}

export function computeByStatus(orders: Order[]): StatusData[] {
  const labels: Record<string, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    complete: 'Выполнен',
    cancel: 'Отменён',
    assembling: 'Сборка',
    assembled: 'Собран',
    delivery: 'Доставка',
  }
  const map: Record<string, number> = {}
  for (const order of orders) {
    const s = labels[order.status] ?? order.status
    map[s] = (map[s] ?? 0) + 1
  }
  return Object.entries(map)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
}

export function computeByUtm(orders: Order[]): UtmData[] {
  const map: Record<string, number> = {}
  for (const order of orders) {
    const src = order.utm_source || 'organic'
    map[src] = (map[src] ?? 0) + 1
  }
  return Object.entries(map)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}
