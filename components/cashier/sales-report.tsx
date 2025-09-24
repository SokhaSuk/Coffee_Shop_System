"use client"

import { useMemo } from "react"
import { useOrders, type DateFilterType } from "@/lib/order-context"
import { TrendingUp, DollarSign, ShoppingCart, Users, Coffee, PieChart, Calendar, Clock, Building, MapPin } from "lucide-react"

export function DailySalesReport({ dateFilter = "day" as DateFilterType }: { dateFilter?: DateFilterType }) {
  const { getOrdersByDateFilter } = useOrders()
  const orders = getOrdersByDateFilter(dateFilter)
  
  const getFilterLabel = () => {
    switch (dateFilter) {
      case "day": return "Daily"
      case "week": return "Weekly"
      case "month": return "Monthly"
      default: return "All Time"
    }
  }

  const summary = useMemo(() => {
    const totalTransactions = orders.length
    const completedOrders = orders.filter(o => o.status === "completed")
    const subtotalSum = orders.reduce((sum, o) => sum + o.subtotal, 0)
    const taxSum = orders.reduce((sum, o) => sum + (o.total - o.subtotal), 0)
    const revenue = orders.reduce((sum, o) => sum + o.total, 0)
    const cash = orders
      .filter((o) => o.paymentMethod === "cash")
      .reduce((sum, o) => sum + (typeof o.paidAmount === "number" ? Math.min(o.paidAmount, o.total) : o.total), 0)
    const card = orders.filter((o) => o.paymentMethod === "card").reduce((sum, o) => sum + o.total, 0)
    const mobile = 0
    
    // Calculate average transaction value
    const avgTransaction = totalTransactions > 0 ? revenue / totalTransactions : 0
    
    // Calculate items statistics
    const itemCount: Record<string, number> = {}
    const itemRevenue: Record<string, number> = {}
    const categoryStats: Record<string, { count: number; revenue: number }> = {}
    
    orders.forEach((o) => {
      o.items.forEach((i) => {
        const lineTotal = i.quantity * i.price
        itemCount[i.name] = (itemCount[i.name] || 0) + i.quantity
        itemRevenue[i.name] = (itemRevenue[i.name] || 0) + lineTotal
        
        if (!categoryStats[i.category]) {
          categoryStats[i.category] = { count: 0, revenue: 0 }
        }
        categoryStats[i.category].count += i.quantity
        categoryStats[i.category].revenue += lineTotal
      })
    })
    
    // Top selling item by quantity
    let topName = "-"
    let topQty = 0
    Object.entries(itemCount).forEach(([name, qty]) => {
      if (qty > topQty) {
        topQty = qty
        topName = name
      }
    })
    
    // Top revenue generating item
    let topRevenueName = "-"
    let topRevenueAmount = 0
    Object.entries(itemRevenue).forEach(([name, amount]) => {
      if (amount > topRevenueAmount) {
        topRevenueAmount = amount
        topRevenueName = name
      }
    })
    
    // Payment method percentages
    const cashPercentage = revenue > 0 ? (cash / revenue) * 100 : 0
    const cardPercentage = revenue > 0 ? (card / revenue) * 100 : 0
    
    // Hourly breakdown for day filter
    const hourlyStats: Record<string, { transactions: number; revenue: number }> = {}
    if (dateFilter === "day") {
      orders.forEach(order => {
        const hour = new Date(order.createdAt).getHours()
        const hourKey = `${hour.toString().padStart(2, "0")}:00`
        if (!hourlyStats[hourKey]) {
          hourlyStats[hourKey] = { transactions: 0, revenue: 0 }
        }
        hourlyStats[hourKey].transactions += 1
        hourlyStats[hourKey].revenue += order.total
      })
    }

    return { 
      totalTransactions, 
      completedOrders: completedOrders.length,
      subtotalSum, 
      taxSum, 
      revenue, 
      cash, 
      card, 
      mobile, 
      avgTransaction,
      topName, 
      topQty,
      topRevenueName,
      topRevenueAmount,
      categoryStats,
      cashPercentage,
      cardPercentage,
      hourlyStats
    }
  }, [orders, dateFilter])

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const reportPeriod = getFilterLabel()

  return (
    <div className="sales-report bg-white text-black font-sans text-sm print:shadow-none">
      {/* Report Header */}
      <div className="report-header text-center mb-8 print:mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dark Coffee Shop</h1>
            <p className="text-sm text-gray-600">Business Intelligence Report</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{reportPeriod} Sales Report</h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Report Date: {dateStr}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Generated: {timeStr}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>#12 Street 123, Phnom Penh, Cambodia</span>
          </div>
          <p>Tax Registration: 123456789 | Business License: BL-2024-001</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="executive-summary mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Executive Summary
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${summary.revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalTransactions}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Avg Transaction</p>
                  <p className="text-2xl font-bold text-purple-600">${summary.avgTransaction.toFixed(2)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Tax Collected</p>
                  <p className="text-2xl font-bold text-orange-600">${summary.taxSum.toFixed(2)}</p>
                </div>
                <PieChart className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="detailed-metrics mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium">Cash</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">${summary.cash.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-2">({summary.cashPercentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">Card</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">${summary.card.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-2">({summary.cardPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Performers */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-brown-500" />
                  <span className="font-medium">Most Sold Item</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{summary.topName}</div>
                  <div className="text-sm text-gray-500">{summary.topQty} units</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Highest Revenue Item</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{summary.topRevenueName}</div>
                  <div className="text-sm text-gray-500">${summary.topRevenueAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Analysis */}
      <div className="category-analysis mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Category Performance</h4>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summary.categoryStats).map(([category, stats]) => (
              <div key={category} className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-800 capitalize mb-2">{category}</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Sold:</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-green-600">${stats.revenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hourly Breakdown for Daily Reports */}
      {dateFilter === "day" && Object.keys(summary.hourlyStats).length > 0 && (
        <div className="hourly-breakdown mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Hourly Breakdown</h4>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-2">
              {Object.entries(summary.hourlyStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([hour, stats]) => (
                <div key={hour} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{hour}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span>{stats.transactions} orders</span>
                    <span className="font-medium text-green-600">${stats.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction Details */}
      <div className="transaction-details mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Transaction Details</h4>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{order.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <span>Customer: {order.customer}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Items: {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                </div>
              </div>
            ))}
            {orders.length > 10 && (
              <div className="text-center text-sm text-gray-500 mt-4">
                ... and {orders.length - 10} more transactions
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Report Footer */}
      <div className="report-footer border-t border-gray-300 pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p className="font-medium">DaCoffee Shop - {reportPeriod} Report</p>
            <p>Generated on {dateStr} at {timeStr}</p>
          </div>
          <div className="text-right">
            <p>Total Orders: {summary.totalTransactions}</p>
            <p>Completed: {summary.completedOrders}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>This report is generated automatically by the DaCoffee POS System.</p>
          <p>For questions about this report, contact support@dacoffee.com</p>
        </div>
      </div>
    </div>
  )
}


