"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Coffee
} from "lucide-react"
import { useOrders } from "@/lib/order-context"
import { useProducts } from "@/lib/product-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

// Dynamic import of ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface DateFilterType {
  label: string
  value: "day" | "week" | "month" | "all"
}

const dateFilters: DateFilterType[] = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" }
]

export function ModernDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilterType["value"]>("day")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  
  const { orders, getRevenueByDateFilter, getOrderStatsByDateFilter, getOrdersByDateFilter } = useOrders()
  const { products } = useProducts()
  const { users } = useAuth()

  // Calculate metrics based on date filter
  const totalRevenue = getRevenueByDateFilter(dateFilter)
  const orderStats = getOrderStatsByDateFilter(dateFilter)
  const filteredOrders = getOrdersByDateFilter(dateFilter)

  // Prepare data for charts
  const revenueChartData = {
    options: {
      chart: {
        type: "line" as const,
        height: 350,
        toolbar: {
          show: false
        },
        background: "transparent"
      },
      stroke: {
        curve: "smooth" as const,
        width: 3
      },
      fill: {
        type: "gradient" as const,
        gradient: {
          shade: "light" as const,
          type: "vertical" as const,
          shadeIntensity: 0.5,
          gradientToColors: ["#8b5cf6"],
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.3
        }
      },
      colors: ["#3b82f6"],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: dateFilter === "day" 
          ? ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"]
          : dateFilter === "week"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : dateFilter === "month"
          ? ["Week 1", "Week 2", "Week 3", "Week 4"]
          : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        labels: {
          style: {
            colors: "#6b7280"
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `$${value.toFixed(0)}`,
          style: {
            colors: "#6b7280"
          }
        }
      },
      tooltip: {
        y: {
          formatter: (value: number) => `$${value.toFixed(2)}`
        }
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 3
      }
    },
    series: [{
      name: "Revenue",
      data: dateFilter === "day" 
        ? [120, 280, 350, 420, 380, 290]
        : dateFilter === "week"
        ? [1200, 1800, 2200, 2800, 3200, 2900, 2100]
        : dateFilter === "month"
        ? [8500, 9200, 10800, 11500]
        : [28000, 32000, 35000, 38000, 42000, 45000]
    }]
  }

  const orderStatusChartData = {
    options: {
      chart: {
        type: "donut" as const,
        height: 350,
        background: "transparent"
      },
      labels: ["Completed", "Preparing", "Pending", "Ready", "Cancelled"],
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`
      },
      legend: {
        position: "bottom" as const
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Orders",
                formatter: () => orderStats.total.toString()
              }
            }
          }
        }
      }
    },
    series: [
      orderStats.completed,
      orderStats.preparing,
      orderStats.pending,
      orderStats.ready,
      orderStats.cancelled
    ].filter(val => val > 0)
  }

  const topProductsChartData = {
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: {
          show: false
        },
        background: "transparent"
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: true,
          distributed: true
        }
      },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: products.slice(0, 5).map(p => p.name),
        labels: {
          style: {
            colors: "#6b7280"
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: "#374151"
          }
        }
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 3
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value} units`
        }
      }
    },
    series: [{
      name: "Stock",
      data: products.slice(0, 5).map(p => p.stock)
    }]
  }

  const paymentMethodsChartData = {
    options: {
      chart: {
        type: "pie" as const,
        height: 350,
        background: "transparent"
      },
      labels: ["Cash", "Card", "Digital"],
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      dataLabels: {
        enabled: true
      },
      legend: {
        position: "bottom" as const
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}%`
        }
      }
    },
    series: [35, 50, 15]
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Success",
        description: "Dashboard report exported successfully!"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshed",
      description: "Dashboard data refreshed successfully!"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your coffee shop performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={dateFilter} onValueChange={(value: DateFilterType["value"]) => setDateFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {dateFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport} disabled={isExporting} className="w-full sm:w-auto">
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-blue-700">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{orderStats.total}</div>
            <p className="text-xs text-green-700">+8.2% from last period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Active Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{products.filter(p => p.isAvailable).length}</div>
            <p className="text-xs text-purple-700">{products.length} total products</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Team Members</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{users.length}</div>
            <p className="text-xs text-orange-700">{users.filter(u => u.isActive).length} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>
                    Revenue over {dateFilters.find(f => f.value === dateFilter)?.label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    options={revenueChartData.options}
                    series={revenueChartData.series}
                    type="line"
                    height={350}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Avg Order Value</span>
                    <span className="font-bold text-green-600">
                      ${orderStats.total > 0 ? (totalRevenue / orderStats.total).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="font-bold text-blue-600">
                      {orderStats.total > 0 ? ((orderStats.completed / orderStats.total) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Low Stock Items</span>
                    <Badge variant={products.filter(p => p.stock <= 10).length > 0 ? "destructive" : "default"}>
                      {products.filter(p => p.stock <= 10).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
                <CardDescription>Breakdown of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={orderStatusChartData.options}
                  series={orderStatusChartData.series}
                  type="donut"
                  height={350}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Top Products by Stock
                </CardTitle>
                <CardDescription>Products with highest inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={topProductsChartData.options}
                  series={topProductsChartData.series}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products
                    .filter(p => p.stock <= 10)
                    .sort((a, b) => a.stock - b.stock)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <Badge variant={product.stock <= 3 ? "destructive" : "secondary"}>
                          {product.stock} units
                        </Badge>
                      </div>
                    ))}
                  {products.filter(p => p.stock <= 10).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <p>All products are well stocked!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Distribution of payment types</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={paymentMethodsChartData.options}
                  series={paymentMethodsChartData.series}
                  type="pie"
                  height={350}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Payment method statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Cash Payments</span>
                  <span className="font-bold text-green-600">35%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Card Payments</span>
                  <span className="font-bold text-blue-600">50%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Digital Payments</span>
                  <span className="font-bold text-purple-600">15%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Transactions</span>
                  <span className="font-bold text-gray-900">{filteredOrders.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
