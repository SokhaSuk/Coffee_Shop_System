import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, TrendingUp, Coffee, Clock, CheckCircle, AlertCircle, Package, AlertTriangle } from "lucide-react"
import { useProducts } from "@/lib/product-context"
import { useOrders } from "@/lib/order-context"
import { useAuth } from "@/lib/auth-context"
import { useMemo } from "react"
import dynamic from "next/dynamic"

// Dynamic import of ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export function DashboardOverview() {
  const { products, categories } = useProducts()
  const { orders, getRevenueByDateFilter, getOrderStatsByDateFilter } = useOrders()
  const { users } = useAuth()

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const lowStockCount = products.filter(p => p.stock <= 10).length
    const outOfStockCount = products.filter(p => p.stock === 0).length
    const availableProducts = products.filter(p => p.isAvailable).length
    const totalRevenue = getRevenueByDateFilter("all")
    const totalOrders = getOrderStatsByDateFilter("all").total

    return [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toFixed(2)}`,
        change: "+12.5%",
        icon: DollarSign,
        trend: "up",
        description: "All time revenue",
      },
      {
        title: "Total Orders",
        value: totalOrders.toString(),
        change: "+8.2%",
        icon: ShoppingCart,
        trend: "up",
        description: "All time orders",
      },
      {
        title: "Inventory Value",
        value: `$${totalValue.toFixed(2)}`,
        change: "+5.2%",
        icon: Package,
        trend: "up",
        description: "Total stock value",
      },
      {
        title: "Low Stock Alert",
        value: lowStockCount.toString(),
        change: `${lowStockCount} items`,
        icon: AlertTriangle,
        trend: lowStockCount > 0 ? "warning" : "good",
        description: "Items ≤ 10 units",
      },
    ]
  }, [products, categories, getRevenueByDateFilter, getOrderStatsByDateFilter])

  const topProducts = useMemo(() => {
    return products
      .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
      .slice(0, 4)
      .map((product, index) => ({
        name: product.name,
        sales: product.stock,
        revenue: `$${(product.price * product.stock).toFixed(2)}`,
        rank: index + 1,
      }))
  }, [products])

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.stock <= 10 && p.stock > 0)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4)
      .map(product => ({
        id: `#${product.id}`,
        name: product.name,
        stock: product.stock,
        status: product.isAvailable ? "available" : "unavailable",
      }))
  }, [products])

  // Chart configurations
  const revenueChartData = {
    options: {
      chart: {
        type: "line" as const,
        height: 300,
        toolbar: { show: false },
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
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        labels: { style: { colors: "#6b7280" } }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `$${value.toFixed(0)}`,
          style: { colors: "#6b7280" }
        }
      },
      tooltip: {
        y: { formatter: (value: number) => `$${value.toFixed(2)}` }
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 3
      }
    },
    series: [{
      name: "Revenue",
      data: [1200, 1800, 2200, 2800, 3200, 2900, 2100]
    }]
  }

  const orderStatusChartData = {
    options: {
      chart: {
        type: "donut" as const,
        height: 300,
        background: "transparent"
      },
      labels: ["Completed", "Preparing", "Pending", "Ready"],
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`
      },
      legend: { position: "bottom" as const },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Orders",
                formatter: () => getOrderStatsByDateFilter("all").total.toString()
              }
            }
          }
        }
      }
    },
    series: [
      getOrderStatsByDateFilter("all").completed,
      getOrderStatsByDateFilter("all").preparing,
      getOrderStatsByDateFilter("all").pending,
      getOrderStatsByDateFilter("all").ready
    ].filter(val => val > 0)
  }

  const topProductsChartData = {
    options: {
      chart: {
        type: "bar" as const,
        height: 300,
        toolbar: { show: false },
        background: "transparent"
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: true,
          distributed: true
        }
      },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      dataLabels: { enabled: false },
      xaxis: {
        categories: products.slice(0, 4).map(p => p.name),
        labels: { style: { colors: "#6b7280" } }
      },
      yaxis: {
        labels: { style: { colors: "#374151" } }
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 3
      },
      tooltip: {
        y: { formatter: (value: number) => `${value} units` }
      }
    },
    series: [{
      name: "Stock",
      data: products.slice(0, 4).map(p => p.stock)
    }]
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${
                stat.trend === "warning" ? "text-yellow-600" :
                stat.trend === "good" ? "text-green-600" :
                "text-muted-foreground"
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === "warning" ? "text-yellow-600" :
                stat.trend === "good" ? "text-green-600" :
                stat.trend === "up" ? "text-green-600" : "text-muted-foreground"
              }`}>
                {stat.change} {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Weekly revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={revenueChartData.options}
              series={revenueChartData.series}
              type="line"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Status
            </CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={orderStatusChartData.options}
              series={orderStatusChartData.series}
              type="donut"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Top Products Stock
            </CardTitle>
            <CardDescription>Products with highest inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={topProductsChartData.options}
              series={topProductsChartData.series}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Top Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Top Products by Value
            </CardTitle>
            <CardDescription>Highest inventory value products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Coffee className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} units in stock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-xs text-muted-foreground">#{product.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.stock <= 3 ? "destructive" : "secondary"}>
                          {product.stock} units
                        </Badge>
                        <Badge variant={product.status === "available" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-muted-foreground">All products are well stocked!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
