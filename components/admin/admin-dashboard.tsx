"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { DashboardOverview } from "./dashboard-overview"
import { ProductManagement } from "./product-management"
import { OrderManagement } from "./order-management"
import { UserManagement } from "./user-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />

      case "orders":
        return <OrderManagement />

      case "products":
        return <ProductManagement />

      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Sales chart would go here
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Order Time</span>
                      <span className="font-medium">4.2 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Revenue</span>
                      <span className="font-medium">$847</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return <UserManagement />

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Store Name</span>
                    <span className="font-medium">DARK COFFEE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax Rate</span>
                    <span className="font-medium">8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Currency</span>
                    <span className="font-medium">USD</span>
                  </div>
                  <Button className="w-full">Update Settings</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="font-medium">Today, 2:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4 md:py-6 md:ml-0">{renderContent()}</div>
      </main>
    </div>
  )
}
