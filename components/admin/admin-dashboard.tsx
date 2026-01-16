"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { DashboardOverview } from "./dashboard-overview"
import { ModernDashboard } from "./modern-dashboard"
import { ProductManagement } from "./product-management"
import { OrderManagement } from "./order-management"
import { UserManagement } from "./user-management"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PasswordInput } from "@/components/ui/password-input"
import { Settings, BarChart3, TrendingUp, DollarSign, Users, Package, ShoppingCart, Activity, Download, RefreshCw, Plus } from "lucide-react"
import { TableColumn, Order, Product, User } from "@/lib/types"
import { useAsync } from "@/hooks/use-async"
import { usePagination } from "@/hooks/use-pagination"
import { ErrorBoundary } from "@/components/error-boundary"
import { withErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/lib/product-context"
import { useOrders } from "@/lib/order-context"
import { useAuth } from "@/lib/auth-context"
import { UserProfile } from "@/components/ui/user-profile"

function AdminDashboardContent() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  // Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    description: "",
    stock: "",
    isAvailable: true,
    imageUrl: "",
    sku: ""
  })
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "cashier" as "admin" | "cashier" | "manager",
    password: "",
    confirmPassword: "",
    changePassword: false
  })

  const { products, addProduct } = useProducts()
  const { orders, getOrderStatsByDateFilter, getRevenueByDateFilter } = useOrders()
  const { users, addUser } = useAuth()

  // Dialog reset functions
  const handleProductDialogClose = (open: boolean) => {
    setIsAddProductOpen(open)
    if (!open) {
      setEditingProduct(null)
      setTimeout(() => {
        setProductForm({
          name: "",
          category: "",
          price: "",
          cost: "",
          description: "",
          stock: "",
          isAvailable: true,
          imageUrl: "",
          sku: ""
        })
      }, 150)
    }
  }

  const handleUserDialogClose = (open: boolean) => {
    setIsAddUserOpen(open)
    if (!open) {
      setEditingUser(null)
      setTimeout(() => {
        setUserForm({
          name: "",
          email: "",
          role: "cashier",
          password: "",
          confirmPassword: "",
          changePassword: false
        })
      }, 150)
    }
  }

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
      products.slice(0, 5).forEach((product, index) => {
        pdf.text(`${index + 1}. ${product.name} - $${product.price.toFixed(2)} (Stock: ${product.stock})`, 20, yPosition)
        yPosition += 8
      })

      // Recent orders section
      yPosition += 10
      pdf.setFontSize(14)
      pdf.text('RECENT ORDERS', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      orders.slice(0, 10).forEach((order) => {
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
    },
    {
      key: "isAvailable",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Available" : "Unavailable"}
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
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />

      case "orders":
        const handleNewOrder = () => {
          toast({
            title: "New Order",
            description: "Redirecting to POS for order creation...",
          })
          // Redirect to cashier POS for order creation
          window.location.href = "/cashier"
        }

        const handleEditOrder = (order: Order) => {
          toast({
            title: "Edit Order",
            description: `Editing order ${order.id}...`,
          })
        }

        const handleViewOrder = (order: Order) => {
          toast({
            title: "View Order",
            description: `Viewing order ${order.id} details...`,
          })
        }

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold">Order Management</h2>
              <Button onClick={handleNewOrder} className="w-full sm:w-auto">
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
                  <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                    View
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "products":
        const handleAddProduct = () => {
          setEditingProduct(null)
          setProductForm({
            name: "",
            category: "",
            price: "",
            cost: "",
            description: "",
            stock: "",
            isAvailable: true,
            imageUrl: "",
            sku: ""
          })
          setIsAddProductOpen(true)
        }

        const handleProductSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (!productForm.name || !productForm.category || !productForm.price || !productForm.stock) {
            toast({
              title: "Error",
              description: "Please fill in all required fields",
              variant: "destructive"
            })
            return
          }

          const productData = {
            name: productForm.name,
            category: productForm.category,
            price: parseFloat(productForm.price),
            cost: parseFloat(productForm.cost || "0"),
            description: productForm.description,
            stock: parseInt(productForm.stock),
            isAvailable: productForm.isAvailable,
            imageUrl: productForm.imageUrl || undefined,
            sku: productForm.sku,
            type: "Hot" as const
          }

          if (editingProduct) {
            // Update existing product
            // For now, just show success message - in a real app you'd call updateProduct
            toast({
              title: "Success",
              description: `Product "${productData.name}" updated successfully!`
            })
          } else {
            // Add new product
            addProduct(productData)
            toast({
              title: "Success",
              description: `Product "${productData.name}" added successfully!`
            })
          }

          setIsAddProductOpen(false)
          setEditingProduct(null)
          // Reset form after a short delay to avoid visual flicker
          setTimeout(() => {
            setProductForm({
              name: "",
              category: "",
              price: "",
              cost: "",
              description: "",
              stock: "",
              isAvailable: true,
              imageUrl: "",
              sku: ""
            })
          }, 150)
        }

        const handleEditProduct = (product: Product) => {
          setProductForm({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            cost: product.cost.toString(),
            description: product.description || "",
            stock: product.stock.toString(),
            isAvailable: product.isAvailable,
            imageUrl: product.imageUrl || "",
            sku: product.sku
          })
          setIsAddProductOpen(true)
        }

        const handleManageStock = (product: Product) => {
          toast({
            title: "Manage Stock",
            description: `Managing stock for ${product.name}...`,
          })
        }

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold">Product Management</h2>
              <Dialog open={isAddProductOpen} onOpenChange={handleProductDialogClose}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Package className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Update the product information.' : 'Create a new product for your coffee shop catalog.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name *</Label>
                        <Input
                          id="product-name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-category">Category *</Label>
                        <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coffee">Coffee</SelectItem>
                            <SelectItem value="tea">Tea</SelectItem>
                            <SelectItem value="pastry">Pastry</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                            <SelectItem value="beverage">Beverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Price *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-cost">Cost *</Label>
                        <Input
                          id="product-cost"
                          type="number"
                          step="0.01"
                          value={productForm.cost}
                          onChange={(e) => setProductForm(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-stock">Stock *</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-sku">SKU *</Label>
                        <Input
                          id="product-sku"
                          value={productForm.sku}
                          onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                          placeholder="PROD001"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-image">Image URL (optional)</Label>
                      <Input
                        id="product-image"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <DataTable
              data={products.slice(0, 10)} // Show first 10 products
              columns={productColumns}
              title="Product Catalog"
              searchPlaceholder="Search products..."
              actions={(product) => (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleManageStock(product)}>
                    Stock
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "analytics":
        return <ModernDashboard />

      case "users":
        const handleAddUser = () => {
          setEditingUser(null)
          setUserForm({
            name: "",
            email: "",
            role: "cashier",
            password: "",
            confirmPassword: "",
            changePassword: false
          })
          setIsAddUserOpen(true)
        }

        const handleUserSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (!userForm.name || !userForm.email) {
            toast({
              title: "Error",
              description: "Please fill in all required fields",
              variant: "destructive"
            })
            return
          }

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(userForm.email)) {
            toast({
              title: "Error",
              description: "Please enter a valid email address",
              variant: "destructive"
            })
            return
          }

          // Password validation for new users or when changing password
          if (!editingUser || userForm.changePassword) {
            if (!userForm.password) {
              toast({
                title: "Error",
                description: "Password is required",
                variant: "destructive"
              })
              return
            }

            // Password strength validation
            if (userForm.password.length < 6) {
              toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive"
              })
              return
            }

            if (userForm.password !== userForm.confirmPassword) {
              toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive"
              })
              return
            }
          }

          const userData = {
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          if (editingUser) {
            // Update existing user
            if (userForm.changePassword) {
              toast({
                title: "Success",
                description: `Password for "${userData.name}" updated successfully!`
              })
            } else {
              toast({
                title: "Success",
                description: `User "${userData.name}" updated successfully!`
              })
            }
          } else {
            // Add new user
            addUser(userData)
            toast({
              title: "Success",
              description: `User "${userData.name}" added successfully!`
            })
          }

          setIsAddUserOpen(false)
          setEditingUser(null)
          // Reset form after a short delay to avoid visual flicker
          setTimeout(() => {
            setUserForm({
              name: "",
              email: "",
              role: "cashier",
              password: "",
              confirmPassword: "",
              changePassword: false
            })
          }, 150)
        }

        const handleEditUser = (user: User) => {
          setUserForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
            confirmPassword: "",
            changePassword: false
          })
          setEditingUser(user)
          setIsAddUserOpen(true)
        }

        const handleResetPassword = (user: User) => {
          toast({
            title: "Reset Password",
            description: `Resetting password for ${user.name}...`,
          })
        }

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
              <Dialog open={isAddUserOpen} onOpenChange={handleUserDialogClose}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser
                        ? (userForm.changePassword ? 'Update Password' : 'Edit User')
                        : 'Add New User'
                      }
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser
                        ? (userForm.changePassword ? 'Update the user password.' : 'Update the user account information.')
                        : 'Create a new user account for the system.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name *</Label>
                      <Input
                        id="user-name"
                        value={userForm.name}
                        onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address *</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role *</Label>
                      <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value as "admin" | "cashier" }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Password Section */}
                    {editingUser && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="change-password"
                            checked={userForm.changePassword}
                            onChange={(e) => setUserForm(prev => ({ ...prev, changePassword: e.target.checked }))}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="change-password" className="text-sm font-medium">
                            Change Password
                          </Label>
                        </div>
                      </div>
                    )}

                    {(!editingUser || userForm.changePassword) && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="user-password">Password *</Label>
                          <PasswordInput
                            id="user-password"
                            value={userForm.password}
                            onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password (min 6 characters)"
                            disabled={false}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-confirm-password">Confirm Password *</Label>
                          <PasswordInput
                            id="user-confirm-password"
                            value={userForm.confirmPassword}
                            onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm password"
                            disabled={false}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingUser
                          ? (userForm.changePassword ? 'Update Password' : 'Update User')
                          : 'Add User'
                        }
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <DataTable
              data={users.slice(0, 10)} // Show first 10 users
              columns={userColumns}
              title="System Users"
              searchPlaceholder="Search users..."
              actions={(user) => (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)}>
                    Reset Password
                  </Button>
                </>
              )}
            />
          </div>
        )

      case "settings":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">System Settings</h2>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1">
                <TabsTrigger value="general" className="w-full py-2 text-sm sm:text-base">General</TabsTrigger>
                <TabsTrigger value="security" className="w-full py-2 text-sm sm:text-base">Security</TabsTrigger>
                <TabsTrigger value="notifications" className="w-full py-2 text-sm sm:text-base">Notifications</TabsTrigger>
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
        {/* Header */}
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold capitalize">
                {activeSection === "dashboard" && "Dashboard Overview"}
                {activeSection === "orders" && "Order Management"}
                {activeSection === "products" && "Product Management"}
                {activeSection === "analytics" && "Analytics & Reports"}
                {activeSection === "users" && "User Management"}
                {activeSection === "settings" && "Settings"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 md:ml-0 min-h-screen">
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
