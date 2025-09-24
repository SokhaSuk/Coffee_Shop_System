import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, TrendingUp, Coffee, Clock, CheckCircle, AlertCircle, Package, AlertTriangle } from "lucide-react"
import { useProducts } from "@/lib/product-context"
import { useMemo } from "react"

export function DashboardOverview() {
  const { products, categories } = useProducts()

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const lowStockCount = products.filter(p => p.stock <= 10).length
    const outOfStockCount = products.filter(p => p.stock === 0).length
    const availableProducts = products.filter(p => p.available).length

    return [
      {
        title: "Total Products",
        value: totalProducts.toString(),
        change: `+${totalProducts}`,
        icon: Package,
        trend: "up",
        description: `${availableProducts} available`,
      },
      {
        title: "Inventory Value",
        value: `$${totalValue.toFixed(2)}`,
        change: "+5.2%",
        icon: DollarSign,
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
      {
        title: "Categories",
        value: categories.length.toString(),
        change: `${categories.length}`,
        icon: Coffee,
        trend: "up",
        description: "Product categories",
      },
    ]
  }, [products, categories])

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
        status: product.available ? "available" : "unavailable",
      }))
  }, [products])

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
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
    </div>
  )
}
