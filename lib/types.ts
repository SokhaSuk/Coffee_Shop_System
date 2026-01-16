// Shared TypeScript types and interfaces for the Coffee Shop System

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface User extends BaseEntity {
  name: string
  email: string
  role: 'admin' | 'cashier' | 'manager'
  isActive: boolean
  lastLogin?: string
  avatar?: string
}

export interface Product extends BaseEntity {
  name: string
  category: string
  price: number
  description?: string
  imageUrl?: string
  isAvailable: boolean
  stock: number
  cost: number // Cost to business
  sku: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  sugarLevel?: string
}

export interface Order extends BaseEntity {
  customer: string
  items: OrderItem[]
  subtotal: number
  total: number
  paymentMethod: "cash" | "card" | "digital"
  paidAmount?: number
  changeAmount?: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  completedAt?: string
  cashierId: string
  cashierName: string
  discountAmount?: number
  discountLabel?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  topProducts: Array<{ name: string; count: number; revenue: number }>
  recentOrders: Order[]
  todaysOrders: number
  pendingOrders: number
  completedOrders: number
}

export interface NavigationItem {
  id: string
  label: string
  icon: any
  badge?: number
  children?: NavigationItem[]
}

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
  className?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// Form types
export interface ProductFormData {
  name: string
  category: string
  price: number
  cost: number
  description?: string
  imageUrl?: string
  sku: string
  stock: number
}

export interface UserFormData {
  name: string
  email: string
  role: User['role']
  password?: string
}

// Component props types
export interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  navigation: NavigationItem[]
  user?: User
}

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
  search?: {
    placeholder: string
    value: string
    onChange: (value: string) => void
  }
  actions?: (record: T) => React.ReactNode
}

// Theme and styling types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
}

export interface Breakpoints {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// Hook return types
export interface UseAsyncReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UsePaginationReturn {
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
}
