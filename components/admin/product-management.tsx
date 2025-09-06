"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { useProducts, type Product } from "@/lib/product-context"
// ... existing imports ...

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
  } = useProducts()

  // ... existing state ...

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    available: true,
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => product.stock <= 10)
  }, [products])

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
      }

      if (editingProduct) {
        updateProduct(editingProduct.id, productData)
        setEditingProduct(null)
      } else {
        addProduct(productData)
      }

      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        available: true,
      })
      setIsProductDialogOpen(false)
    },
    [productForm, editingProduct, updateProduct, addProduct],
  )

  const handleStockUpdate = useCallback(
    (productId: string, change: number) => {
      updateStock(productId, change)
    },
    [updateStock],
  )

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      available: product.available,
    })
    setIsProductDialogOpen(true)
  }, [])

  // ... existing code with optimized handlers ...

  return <div className="space-y-6">{/* ... existing JSX with optimized event handlers ... */}</div>
}
