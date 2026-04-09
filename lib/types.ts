export interface OrderItem {
  productName: string
  quantity: number
  initialPrice: number
}

export interface Order {
  id: number
  retailcrm_id: number | null
  first_name: string
  last_name: string
  phone: string
  email: string
  status: string
  total_amount: number
  city: string
  utm_source: string
  items: OrderItem[]
  created_at: string
  retailcrm_created_at: string | null
  telegram_notified: boolean
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  highValueOrders: number
}

export interface ChartDataPoint {
  date: string
  orders: number
  revenue: number
}

export interface CityData {
  city: string
  orders: number
  revenue: number
}

export interface StatusData {
  status: string
  count: number
}

export interface UtmData {
  source: string
  count: number
}
