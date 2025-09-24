"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CashierPOS } from "./cashier-pos"
import { OrderHistory } from "./order-history"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Coffee, LogOut, ShoppingCart, History, Package, TrendingUp, DollarSign, Clock, Users } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"

function CashierDashboardContent() {
  const [activeSection, setActiveSection] = useState("pos")
  const { user, logoutWithConfirmation } = useAuth()

  const renderContent = () => {
    switch (activeSection) {
      case "pos":
        return <CashierPOS />
      case "history":
        return <OrderHistory />
      case "products":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <Badge variant="secondary" className="text-sm">
                6 Available Products
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                { name: "Espresso", price: 3.50, description: "Rich and bold espresso", icon: "☕" },
                { name: "Latte", price: 4.75, description: "Smooth espresso with milk", icon: "🥛" },
                { name: "Cappuccino", price: 4.25, description: "Equal parts espresso, milk, foam", icon: "🫧" },
                { name: "Americano", price: 3.25, description: "Espresso with hot water", icon: "💧" },
                { name: "Mocha", price: 5.00, description: "Chocolate and espresso blend", icon: "🍫" },
                { name: "Macchiato", price: 4.00, description: "Espresso marked with milk", icon: "🎯" }
              ].map((product) => (
                <Card key={product.name} className="surface-elevated hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="text-2xl group-hover:scale-110 transition-transform">
                        {product.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        In Stock
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      default:
        return <CashierPOS />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-[var(--surface-elevation-1)]">
        <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
          {/* Top row: Title and Logout */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="coffee-gradient rounded-full p-3 shadow-[var(--surface-elevation-1)] interactive-scale">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">DARK COFFEE</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Cashier System</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-card-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logoutWithConfirmation()
                }}
                className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Second row: Navigation tabs */}
          <div className="mt-3">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pos" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">POS</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Dashboard Overview - Only show when on POS tab */}
      {activeSection === "pos" && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-3 sm:px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Today's Orders"
                value="47"
                icon={ShoppingCart}
                trend={{ value: 12, label: "vs yesterday", isPositive: true }}
              />
              <DashboardCard
                title="Revenue Today"
                value="$1,234"
                icon={DollarSign}
                trend={{ value: 8, label: "vs yesterday", isPositive: true }}
              />
              <DashboardCard
                title="Avg Order Time"
                value="3.2 min"
                icon={Clock}
                trend={{ value: 15, label: "improvement", isPositive: true }}
              />
              <DashboardCard
                title="Active Customers"
                value="23"
                icon={Users}
                trend={{ value: 5, label: "in store", isPositive: true }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {renderContent()}
      </main>
    </div>
  )
}

export function CashierDashboard() {
  return (
    <ErrorBoundary>
      <CashierDashboardContent />
    </ErrorBoundary>
  )
}