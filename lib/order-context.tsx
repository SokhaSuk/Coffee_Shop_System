"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

export interface Order {
  id: string
  customer: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: "cash" | "card"
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  completedAt?: string
  cashierId: string
  cashierName: string
}

export type DateFilterType = "day" | "week" | "month" | "all"

interface OrderContextType {
  orders: Order[]
  createOrder: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => string
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  cancelOrder: (orderId: string) => void
  getOrderById: (orderId: string) => Order | undefined
  createAdjustment: (orderId: string, amount: number) => string
  getOrdersByStatus: (status: Order["status"]) => Order[]
  getOrdersByDate: (date: string) => Order[]
  getTodaysOrders: () => Order[]
  getTodaysRevenue: () => number
  getOrderStats: () => {
    total: number
    pending: number
    preparing: number
    ready: number
    completed: number
    cancelled: number
  }
  getOrdersByDateFilter: (filter: DateFilterType, customDate?: string) => Order[]
  getRevenueByDateFilter: (filter: DateFilterType, customDate?: string) => number
  getOrderStatsByDateFilter: (
    filter: DateFilterType,
    customDate?: string,
  ) => {
    total: number
    pending: number
    preparing: number
    ready: number
    completed: number
    cancelled: number
    revenue: number
  }
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Mock initial orders for demonstration with varied dates
const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "John Doe",
    items: [
      { id: "1", name: "Latte", price: 4.5, quantity: 2, category: "coffee" },
      { id: "4", name: "Croissant", price: 3.25, quantity: 1, category: "pastry" },
    ],
    subtotal: 12.25,
    tax: 1.04,
    total: 13.29,
    paymentMethod: "card",
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:45:00Z",
    completedAt: "2024-01-15T10:45:00Z",
    cashierId: "2",
    cashierName: "Cashier User",
  },
  {
    id: "ORD-002",
    customer: "Walk-in Customer",
    items: [
      { id: "1", name: "Espresso", price: 3.5, quantity: 1, category: "coffee" },
      { id: "9", name: "Cookie", price: 2.25, quantity: 2, category: "pastry" },
    ],
    subtotal: 8.0,
    tax: 0.68,
    total: 8.68,
    paymentMethod: "cash",
    status: "preparing",
    createdAt: "2024-01-14T11:15:00Z",
    updatedAt: "2024-01-14T11:20:00Z",
    cashierId: "2",
    cashierName: "Cashier User",
  },
  {
    id: "ORD-003",
    customer: "Sarah Wilson",
    items: [
      { id: "4", name: "Cappuccino", price: 4.25, quantity: 1, category: "coffee" },
      { id: "8", name: "Muffin", price: 2.75, quantity: 1, category: "pastry" },
    ],
    subtotal: 7.0,
    tax: 0.6,
    total: 7.6,
    paymentMethod: "card",
    status: "ready",
    createdAt: "2024-01-10T12:00:00Z",
    updatedAt: "2024-01-10T12:10:00Z",
    cashierId: "2",
    cashierName: "Cashier User",
  },
  {
    id: "ORD-004",
    customer: "Mike Johnson",
    items: [{ id: "2", name: "Americano", price: 4.0, quantity: 1, category: "coffee" }],
    subtotal: 4.0,
    tax: 0.34,
    total: 4.34,
    paymentMethod: "cash",
    status: "completed",
    createdAt: "2023-12-28T09:30:00Z",
    updatedAt: "2023-12-28T09:35:00Z",
    completedAt: "2023-12-28T09:35:00Z",
    cashierId: "2",
    cashierName: "Cashier User",
  },
  {
    id: "ORD-005",
    customer: "Emma Davis",
    items: [
      { id: "3", name: "Latte", price: 4.5, quantity: 1, category: "coffee" },
      { id: "5", name: "Muffin", price: 2.75, quantity: 2, category: "pastry" },
    ],
    subtotal: 10.0,
    tax: 0.85,
    total: 10.85,
    paymentMethod: "card",
    status: "completed",
    createdAt: "2024-01-08T14:20:00Z",
    updatedAt: "2024-01-08T14:25:00Z",
    completedAt: "2024-01-08T14:25:00Z",
    cashierId: "2",
    cashierName: "Cashier User",
  },
]

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const createOrder = (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): string => {
    const orderId = `ORD-${String(orders.length + 1).padStart(3, "0")}`
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setOrders((prev) => [newOrder, ...prev])
    return orderId
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === "completed" ? new Date().toISOString() : order.completedAt,
            }
          : order,
      ),
    )
  }

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled")
  }

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId)

  // Creates a negative adjustment order to represent partial refunds/corrections.
  const createAdjustment = (orderId: string, amount: number): string => {
    const original = getOrderById(orderId)
    const adjId = `ADJ-${String(orders.length + 1).padStart(3, "0")}`
    const newOrder: Order = {
      id: adjId,
      customer: original?.customer || "Adjustment",
      items: [
        { id: "adj", name: `Adjustment for ${orderId}`, price: -Math.abs(amount), quantity: 1, category: "adjustment" },
      ],
      subtotal: -Math.abs(amount),
      tax: 0,
      total: -Math.abs(amount),
      paymentMethod: original?.paymentMethod || "card",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      cashierId: original?.cashierId || "unknown",
      cashierName: original?.cashierName || "Unknown Cashier",
    }
    setOrders((prev) => [newOrder, ...prev])
    return adjId
  }

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  const getOrdersByDate = (date: string) => {
    return orders.filter((order) => order.createdAt.startsWith(date))
  }

  const getTodaysOrders = () => {
    const today = new Date().toISOString().split("T")[0]
    return getOrdersByDate(today)
  }

  const getTodaysRevenue = () => {
    const todaysOrders = getTodaysOrders()
    return todaysOrders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.total, 0)
  }

  const getOrderStats = () => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === "pending").length
    const preparing = orders.filter((o) => o.status === "preparing").length
    const ready = orders.filter((o) => o.status === "ready").length
    const completed = orders.filter((o) => o.status === "completed").length
    const cancelled = orders.filter((o) => o.status === "cancelled").length

    return { total, pending, preparing, ready, completed, cancelled }
  }

  const getOrdersByDateFilter = (filter: DateFilterType, customDate?: string): Order[] => {
    const now = new Date()
    const referenceDate = customDate ? new Date(customDate) : now

    switch (filter) {
      case "day":
        const dayStart = new Date(referenceDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(referenceDate)
        dayEnd.setHours(23, 59, 59, 999)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= dayStart && orderDate <= dayEnd
        })

      case "week":
        const weekStart = new Date(referenceDate)
        weekStart.setDate(referenceDate.getDate() - referenceDate.getDay())
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekStart && orderDate <= weekEnd
        })

      case "month":
        const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
        const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= monthStart && orderDate <= monthEnd
        })

      case "all":
      default:
        return orders
    }
  }

  const getRevenueByDateFilter = (filter: DateFilterType, customDate?: string): number => {
    const filteredOrders = getOrdersByDateFilter(filter, customDate)
    return filteredOrders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.total, 0)
  }

  const getOrderStatsByDateFilter = (filter: DateFilterType, customDate?: string) => {
    const filteredOrders = getOrdersByDateFilter(filter, customDate)
    const total = filteredOrders.length
    const pending = filteredOrders.filter((o) => o.status === "pending").length
    const preparing = filteredOrders.filter((o) => o.status === "preparing").length
    const ready = filteredOrders.filter((o) => o.status === "ready").length
    const completed = filteredOrders.filter((o) => o.status === "completed").length
    const cancelled = filteredOrders.filter((o) => o.status === "cancelled").length
    const revenue = getRevenueByDateFilter(filter, customDate)

    return { total, pending, preparing, ready, completed, cancelled, revenue }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        getOrdersByStatus,
        getOrdersByDate,
        getTodaysOrders,
        getTodaysRevenue,
        getOrderStats,
        getOrdersByDateFilter,
        getRevenueByDateFilter,
        getOrderStatsByDateFilter,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
