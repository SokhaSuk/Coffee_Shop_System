"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CashierPOS } from "./cashier-pos"
import { OrderHistory } from "./order-history"
import { Coffee, LogOut, ShoppingCart, History, Package } from "lucide-react"

export function CashierDashboard() {
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
            <h2 className="text-2xl font-bold">Product Catalog</h2>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {["Espresso", "Latte", "Cappuccino", "Americano", "Mocha", "Macchiato"].map((product) => (
                <Card key={product} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
                      {product}
                    </CardTitle>
                    <CardDescription>Premium coffee blend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold">$4.50</span>
                      <span className="text-xs sm:text-sm text-green-600">In Stock</span>
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

          {/* Second row: Navbar under the title, full width */}
          <div className="mt-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-full">
              <Button
                variant={activeSection === "pos" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("pos")}
                className="rounded-md flex-1 basis-0 min-w-0"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                POS
              </Button>
              <Button
                variant={activeSection === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("history")}
                className="rounded-md flex-1 basis-0 min-w-0"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant={activeSection === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("products")}
                className="rounded-md flex-1 basis-0 min-w-0"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">{renderContent()}</main>
    </div>
  )
}