"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  available: boolean
  image?: string
  discount?: number // Discount percentage (0-100)
  discountStartDate?: string
  discountEndDate?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
}

interface ProductContextType {
  products: Product[]
  categories: Category[]
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getProductsByCategory: (categoryId: string) => Product[]
  updateStock: (id: string, quantity: number) => void
  applyDiscount: (id: string, discount: number, startDate?: string, endDate?: string) => void
  removeDiscount: (id: string) => void
  getDiscountedPrice: (product: Product) => number
  isDiscountActive: (product: Product) => boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Espresso",
    description: "Rich and bold single shot",
    price: 3.5,
    category: "coffee",
    stock: 50,
    available: true,
    image: "/espresso-coffee-cup-dark-roast.jpg",
    discount: 10,
    discountStartDate: "2024-01-01T00:00:00Z",
    discountEndDate: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Americano",
    description: "Smooth and strong coffee",
    price: 4.0,
    category: "coffee",
    stock: 45,
    available: true,
    image: "/americano-coffee-black-coffee-cup.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Latte",
    description: "Creamy and mild coffee with steamed milk",
    price: 4.5,
    category: "coffee",
    stock: 40,
    available: true,
    image: "/latte-coffee-milk-foam-art-heart.jpg",
    discount: 15,
    discountStartDate: "2024-01-01T00:00:00Z",
    discountEndDate: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Croissant",
    description: "Buttery and flaky pastry",
    price: 3.25,
    category: "pastry",
    stock: 20,
    available: true,
    image: "/golden-buttery-croissant-pastry.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Muffin",
    description: "Fresh baked blueberry muffin",
    price: 2.75,
    category: "pastry",
    stock: 15,
    available: true,
    image: "/blueberry-muffin-fresh-baked.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

const initialCategories: Category[] = [
  { id: "coffee", name: "Coffee", description: "Hot and cold coffee beverages" },
  { id: "pastry", name: "Pastry", description: "Fresh baked goods and pastries" },
  { id: "sandwich", name: "Sandwich", description: "Sandwiches and wraps" },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...productData, updatedAt: new Date().toISOString() } : product,
      ),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const addCategory = (categoryData: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...categoryData } : category)))
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id))
  }

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((product) => product.category === categoryId)
  }

  const updateStock = (id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              stock: Math.max(0, product.stock + quantity),
              available: product.stock + quantity > 0,
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    )
  }

  const applyDiscount = (id: string, discount: number, startDate?: string, endDate?: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              discount: Math.max(0, Math.min(100, discount)), // Ensure discount is between 0-100
              discountStartDate: startDate,
              discountEndDate: endDate,
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    )
  }

  const removeDiscount = (id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              discount: undefined,
              discountStartDate: undefined,
              discountEndDate: undefined,
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    )
  }

  const getDiscountedPrice = (product: Product) => {
    if (!isDiscountActive(product)) {
      return product.price
    }
    const discountAmount = (product.price * (product.discount || 0)) / 100
    return product.price - discountAmount
  }

  const isDiscountActive = (product: Product) => {
    if (!product.discount || product.discount <= 0) return false

    const now = new Date()
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null

    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false

    return true
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        getProductsByCategory,
        updateStock,
        applyDiscount,
        removeDiscount,
        getDiscountedPrice,
        isDiscountActive,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
