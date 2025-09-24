"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { useProducts, type Product } from "@/lib/product-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Package, Search, Filter, AlertTriangle, TrendingUp, Coffee, IceCream, Flame } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTable, TableColumn } from "@/components/ui/data-table"

export function ProductManagement() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateStock,
    getDiscountedPrice,
    isDiscountActive,
  } = useProducts()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showLowStock, setShowLowStock] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; description: string } | null>(null)

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    available: true,
    type: "Hot" as "Hot" | "Ice" | "Frab",
    image: "",
  })

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  })

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesType = selectedType === "all" || product.type === selectedType

      const matchesLowStock = !showLowStock || product.stock <= 10

      return matchesSearch && matchesCategory && matchesType && matchesLowStock
    })
  }, [products, searchTerm, selectedCategory, selectedType, showLowStock])

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const lowStockCount = products.filter(p => p.stock <= 10).length
    const outOfStockCount = products.filter(p => p.stock === 0).length

    return { totalProducts, totalValue, lowStockCount, outOfStockCount }
  }, [products])

  // Table columns
  const productColumns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Product",
      render: (value, product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            {product.type === "Ice" && <IceCream className="h-5 w-5 text-blue-500" />}
            {product.type === "Hot" && <Flame className="h-5 w-5 text-orange-500" />}
            {product.type === "Frab" && <Coffee className="h-5 w-5 text-purple-500" />}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{product.description}</div>
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (value) => {
        const category = categories.find(c => c.id === value)
        return (
          <Badge variant="outline" className="capitalize">
            {category?.name || value}
          </Badge>
        )
      }
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge variant={value === "Hot" ? "default" : "secondary"} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: "price",
      label: "Price",
      render: (value, product) => {
        const originalPrice = value
        const discountedPrice = getDiscountedPrice(product)
        const hasDiscount = isDiscountActive(product)

        return (
          <div className="text-right">
            {hasDiscount ? (
              <div>
                <div className="text-sm text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </div>
                <div className="font-medium text-green-600">
                  ${discountedPrice.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="font-medium">${originalPrice.toFixed(2)}</div>
            )}
          </div>
        )
      }
    },
    {
      key: "stock",
      label: "Stock",
      render: (value) => (
        <Badge variant={value <= 0 ? "destructive" : value <= 10 ? "secondary" : "default"}>
          {value <= 0 ? "Out of Stock" : `${value} units`}
        </Badge>
      )
    },
    {
      key: "available",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Available" : "Unavailable"}
        </Badge>
      )
    }
  ]

  // Handle product form submission
  const handleProductSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price),
        category: productForm.category,
        stock: Number.parseInt(productForm.stock),
        available: productForm.available,
        type: productForm.type,
        image: productForm.image || undefined,
      }

      try {
        if (editingProduct) {
          updateProduct(editingProduct.id, productData)
          toast({
            title: "Success",
            description: "Product updated successfully",
          })
          setEditingProduct(null)
        } else {
          addProduct(productData)
          toast({
            title: "Success",
            description: "Product added successfully",
          })
        }

        setProductForm({
          name: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          available: true,
          type: "Hot",
          image: "",
        })
        setIsProductDialogOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save product. Please try again.",
          variant: "destructive",
        })
      }
    },
    [productForm, editingProduct, updateProduct, addProduct, toast],
  )

  // Handle category form submission
  const handleCategorySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      try {
        if (editingCategory) {
          updateCategory(editingCategory.id, categoryForm)
          toast({
            title: "Success",
            description: "Category updated successfully",
          })
          setEditingCategory(null)
        } else {
          addCategory(categoryForm)
          toast({
            title: "Success",
            description: "Category added successfully",
          })
        }

        setCategoryForm({ name: "", description: "" })
        setIsCategoryDialogOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save category. Please try again.",
          variant: "destructive",
        })
      }
    },
    [categoryForm, editingCategory, updateCategory, addCategory, toast],
  )

  // Handle product deletion
  const handleDeleteProduct = useCallback(
    (productId: string) => {
      if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        try {
          deleteProduct(productId)
          toast({
            title: "Success",
            description: "Product deleted successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete product. Please try again.",
            variant: "destructive",
          })
        }
      }
    },
    [deleteProduct, toast],
  )

  // Handle stock update
  const handleStockUpdate = useCallback(
    (productId: string, change: number) => {
      try {
        updateStock(productId, change)
        toast({
          title: "Success",
          description: `Stock updated by ${change > 0 ? '+' : ''}${change} units`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update stock. Please try again.",
          variant: "destructive",
        })
      }
    },
    [updateStock, toast],
  )

  // Handle edit product
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      available: product.available,
      type: product.type || "Hot",
      image: product.image || "",
    })
    setIsProductDialogOpen(true)
  }, [])

  // Handle edit category
  const handleEditCategory = useCallback((category: { id: string; name: string; description: string }) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
    })
    setIsCategoryDialogOpen(true)
  }, [])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsProductDialogOpen(false)
    setIsCategoryDialogOpen(false)
    setEditingProduct(null)
    setEditingCategory(null)
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      available: true,
      type: "Hot",
      image: "",
    })
    setCategoryForm({ name: "", description: "" })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-coffee-600" />
          <h2 className="text-2xl font-bold text-coffee-900">Product Management</h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update category information" : "Create a new product category"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-coffee-600 hover:bg-coffee-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product information" : "Create a new product"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={productForm.type}
                      onValueChange={(value: "Hot" | "Ice" | "Frab") =>
                        setProductForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hot">Hot</SelectItem>
                        <SelectItem value="Ice">Ice</SelectItem>
                        <SelectItem value="Frab">Frappé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock Quantity *</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-image">Image URL</Label>
                    <Input
                      id="product-image"
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="product-available"
                    checked={productForm.available}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, available: checked }))}
                  />
                  <Label htmlFor="product-available">Available for purchase</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-coffee-600 hover:bg-coffee-700">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Ice">Ice</SelectItem>
                  <SelectItem value="Frab">Frappé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="low-stock"
                  checked={showLowStock}
                  onCheckedChange={setShowLowStock}
                />
                <Label htmlFor="low-stock">Low Stock Only</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <DataTable
        data={filteredProducts}
        columns={productColumns}
        title={`Products (${filteredProducts.length})`}
        searchPlaceholder="Search products..."
        actions={(product) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProduct(product)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteProduct(product.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  )
}
