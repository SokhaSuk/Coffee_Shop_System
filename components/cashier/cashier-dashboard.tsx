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
  const { user, logout } = useAuth()

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {["Espresso", "Latte", "Cappuccino", "Americano", "Mocha", "Macchiato"].map((product) => (
                <Card key={product}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      {product}
                    </CardTitle>
                    <CardDescription>Premium coffee blend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">$4.50</span>
                      <span className="text-sm text-green-600">In Stock</span>
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
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Coffee className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DARK COFFEE</h1>
                <p className="text-sm text-muted-foreground">Cashier System</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeSection === "pos" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("pos")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                POS
              </Button>
              <Button
                variant={activeSection === "history" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("history")}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant={activeSection === "products" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("products")}
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  )
}
