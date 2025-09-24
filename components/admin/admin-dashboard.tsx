"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { DashboardOverview } from "./dashboard-overview"
import { ProductManagement } from "./product-management"
import { OrderManagement } from "./order-management"
import { UserManagement } from "./user-management"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, BarChart3, TrendingUp, DollarSign, Users, Package, ShoppingCart, Activity, Download, RefreshCw } from "lucide-react"
import { TableColumn, Order, Product, User } from "@/lib/types"
import { useAsync } from "@/hooks/use-async"
import { usePagination } from "@/hooks/use-pagination"
import { ErrorBoundary } from "@/components/error-boundary"
import { withErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/lib/product-context"
import { useOrders } from "@/lib/order-context"
import { useAuth } from "@/lib/auth-context"

function AdminDashboardContent() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const { products } = useProducts()
  const { orders, getOrderStatsByDateFilter, getRevenueByDateFilter } = useOrders()
  const { users } = useAuth()

  // Export report functionality
  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      // Get real data from contexts
      const stats = getOrderStatsByDateFilter("all")
      const revenue = getRevenueByDateFilter("all")

      // Generate comprehensive report data
      const reportData = {
        dateGenerated: new Date().toISOString(),
        totalOrders: stats.total,
        totalRevenue: revenue,
        totalProducts: products.length,
        totalUsers: users.length,
        orders: orders,
        products: products,
        users: users
      }

      // Create PDF report
      const pdf = new (await import('jspdf')).default()
      pdf.setFont('helvetica', 'normal')

      // Header
      pdf.setFontSize(20)
      pdf.text('DARK COFFEE SHOP - ANALYTICS REPORT', 20, 30)

      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date(reportData.dateGenerated).toLocaleString()}`, 20, 45)

      let yPosition = 70

      // Summary section
      pdf.setFontSize(16)
      pdf.text('SUMMARY', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      pdf.text(`Total Orders: ${reportData.totalOrders}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Total Revenue: $${reportData.totalRevenue.toFixed(2)}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Total Products: ${reportData.totalProducts}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Total Users: ${reportData.totalUsers}`, 20, yPosition)
      yPosition += 20

      // Top products section
      pdf.setFontSize(14)
      pdf.text('TOP PRODUCTS', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      mockProducts.slice(0, 5).forEach((product, index) => {
        pdf.text(`${index + 1}. ${product.name} - $${product.price.toFixed(2)} (Stock: ${product.stock})`, 20, yPosition)
        yPosition += 8
      })

      // Recent orders section
      yPosition += 10
      pdf.setFontSize(14)
      pdf.text('RECENT ORDERS', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      mockOrders.slice(0, 10).forEach((order) => {
        pdf.text(`${order.id} - ${order.customer} - $${order.total.toFixed(2)}`, 20, yPosition)
        yPosition += 8
      })

      // Save the PDF
      pdf.save(`dark-coffee-report-${new Date().toISOString().split('T')[0]}.pdf`)

      toast({
        title: "Success",
        description: "Analytics report exported successfully!"
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Refresh analytics data
  const handleRefreshAnalytics = () => {
    toast({
      title: "Refreshing",
      description: "Analytics data refreshed successfully!"
    })
  }

  // Use real data from contexts
  const orderColumns: TableColumn<Order>[] = [
    { key: "id", label: "Order ID", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    {
      key: "total",
      label: "Total",
      render: (value) => `$${Number(value).toFixed(2)}`
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "completed" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  const productColumns: TableColumn<Product>[] = [
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "price",
      label: "Price",
      render: (value) => `$${Number(value).toFixed(2)}`
    },
    {
      key: "stock",
      label: "Stock",
      render: (value) => (
        <Badge variant={Number(value) > 10 ? "default" : "destructive"}>
          {value} units
        </Badge>
      )
    }
  ]

  const userColumns: TableColumn<User>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />

      case "orders":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
            <DataTable
              data={orders.slice(0, 10)} // Show last 10 orders
              columns={orderColumns}
              title="Recent Orders"
              searchPlaceholder="Search orders..."
              actions={(order) => (
                <>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "products":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <DataTable
              data={products.slice(0, 10)} // Show first 10 products
              columns={productColumns}
              title="Product Catalog"
              searchPlaceholder="Search products..."
              actions={(product) => (
                <>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Stock
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics & Reports</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportReport} disabled={isExporting}>
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isExporting ? "Exporting..." : "Export Report"}
                </Button>
                <Button variant="outline" onClick={handleRefreshAnalytics}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Revenue"
                value={`$${getRevenueByDateFilter("all").toFixed(2)}`}
                icon={DollarSign}
                trend={{ value: 12, label: "vs last month", isPositive: true }}
              />
              <DashboardCard
                title="Total Orders"
                value={getOrderStatsByDateFilter("all").total.toString()}
                icon={ShoppingCart}
                trend={{ value: 8, label: "vs last month", isPositive: true }}
              />
              <DashboardCard
                title="Active Products"
                value={products.filter(p => p.isAvailable).length.toString()}
                icon={Package}
                trend={{ value: 3, label: "available", isPositive: true }}
              />
              <DashboardCard
                title="Active Users"
                value={users.filter(u => u.isActive).length.toString()}
                icon={Users}
                trend={{ value: 2, label: "active users", isPositive: true }}
              />
            </div>

            {/* Charts and Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p>Interactive sales chart</p>
                      <p className="text-sm">Chart implementation coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Average Order Time</span>
                      <span className="font-bold text-green-600">3.8 min</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Customer Satisfaction</span>
                      <span className="font-bold text-green-600">96%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Daily Revenue Goal</span>
                      <span className="font-bold text-blue-600">${getRevenueByDateFilter("day").toFixed(0)} / $1000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Low Stock Alerts</span>
                      <Badge variant={products.filter(p => p.stock <= 10).length > 0 ? "destructive" : "default"}>
                        {products.filter(p => p.stock <= 10).length} items
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <DataTable
              data={users.slice(0, 10)} // Show first 10 users
              columns={userColumns}
              title="System Users"
              searchPlaceholder="Search users..."
              actions={(user) => (
                <>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Reset Password
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
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
                      <span>Currency</span>
                      <span className="font-medium">USD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Timezone</span>
                      <span className="font-medium">UTC-5 (EST)</span>
                    </div>
                    <Button className="w-full">Update Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Two-Factor Authentication</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Session Timeout</span>
                      <span className="font-medium">30 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Password Policy</span>
                      <span className="font-medium">Strong</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Configure Security
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Email Notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Low Stock Alerts</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Order Notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Configure Notifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
                  <span>Database Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex justify-between">
                  <span>System Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                </div>
              </CardContent>
            </Card>
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
        <div className="container mx-auto px-4 py-4 md:py-6 md:ml-0">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export function AdminDashboard() {
  return (
    <ErrorBoundary>
      <AdminDashboardContent />
    </ErrorBoundary>
  )
}
