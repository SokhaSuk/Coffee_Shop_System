import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, TrendingUp, Coffee, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$2,847",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Orders Today",
      value: "47",
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+3.1%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Avg Order Value",
      value: "$18.50",
      change: "-2.4%",
      icon: TrendingUp,
      trend: "down",
    },
  ]

  const recentOrders = [
    { id: "#001", customer: "John Doe", items: "2x Espresso, 1x Croissant", total: "$12.50", status: "completed" },
    { id: "#002", customer: "Jane Smith", items: "1x Latte, 1x Muffin", total: "$8.75", status: "preparing" },
    { id: "#003", customer: "Mike Johnson", items: "3x Americano", total: "$15.00", status: "pending" },
    { id: "#004", customer: "Sarah Wilson", items: "1x Cappuccino, 2x Cookie", total: "$11.25", status: "completed" },
  ]

  const topProducts = [
    { name: "Espresso", sales: 156, revenue: "$468" },
    { name: "Latte", sales: 134, revenue: "$536" },
    { name: "Cappuccino", sales: 98, revenue: "$392" },
    { name: "Americano", sales: 87, revenue: "$348" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{order.id}</span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "preparing"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {order.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status === "preparing" && <Clock className="h-3 w-3 mr-1" />}
                        {order.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Top Products
            </CardTitle>
            <CardDescription>Best selling items this month</CardDescription>
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
                      <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
