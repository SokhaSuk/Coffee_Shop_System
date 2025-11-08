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

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                { name: "Espresso", price: 3.50, description: "Rich and bold espresso"},
                { name: "Latte", price: 4.75, description: "Smooth espresso with milk"},
                { name: "Cappuccino", price: 4.25, description: "Equal parts espresso, milk, foam"},
                { name: "Americano", price: 3.25, description: "Espresso with hot water"},
                { name: "Mocha", price: 5.00, description: "Chocolate and espresso blend"},
                { name: "Macchiato", price: 4.00, description: "Espresso marked with milk"}
              ].map((product) => (
                <Card key={product.name} className="hover:shadow-md transition-shadow group p-3 sm:p-4">
                  <CardHeader className="pb-2 sm:pb-3 p-0">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg">
                      <div className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                        {product.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm sm:text-base">{product.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2 sm:pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <Badge variant="secondary" className="text-xs sm:text-sm">
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
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-4">
          {/* Top row: Title and Logout */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="bg-gray-900 rounded-full p-2 sm:p-3 shadow-sm flex-shrink-0">
                <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight truncate">DARK COFFEE</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Cashier System</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="font-semibold text-card-foreground text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logoutWithConfirmation()
                }}
                className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>

          {/* Second row: Navigation tabs */}
          <div className="mt-2 sm:mt-3">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg shadow-inner h-auto">
                <TabsTrigger
                  value="pos"
                  className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-2 transition-all duration-200 ${
                    activeSection === "pos"
                      ? "bg-primary text-primary-foreground shadow-md font-semibold"
                      : "hover:bg-background/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  }`}
                >
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">POS</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-2 transition-all duration-200 ${
                    activeSection === "history"
                      ? "bg-primary text-primary-foreground shadow-md font-semibold"
                      : "hover:bg-background/80"
                  }`}
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">History</span>
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-2 transition-all duration-200 ${
                    activeSection === "products"
                      ? "bg-primary text-primary-foreground shadow-md font-semibold"
                      : "hover:bg-background/80"
                  }`}
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Products</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Dashboard Overview - Only show when on POS tab */}
      {activeSection === "pos" && (
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 min-h-[calc(100vh-200px)]">
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