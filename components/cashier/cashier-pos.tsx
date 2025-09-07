"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useProducts } from "@/lib/product-context"
import type { Product as ProductType } from "@/lib/product-context"
import { useOrders } from "@/lib/order-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Coffee, Plus, Minus, Trash2, CreditCard, DollarSign, Receipt, ShoppingCart } from "lucide-react"
import Image from "next/image"

type CartItem = ProductType & { quantity: number }

export function CashierPOS() {
  const { products, categories, getDiscountedPrice, isDiscountActive } = useProducts()
  const { createOrder } = useOrders()
  const { user } = useAuth()
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card")

  // Suggest other discounted products when user adds to cart
  useEffect(() => {
    if (cart.length === 0) return
    const discounted = products.filter((p) => isDiscountActive(p))
    if (discounted.length === 0) return
    const lastAdded = cart[cart.length - 1]
    const suggestions = discounted.filter((p) => p.id !== lastAdded.id).slice(0, 3)
    if (suggestions.length > 0) {
      const names = suggestions.map((s) => s.name).join(", ")
      toast({
        title: "Hot deals available",
        description: `Discounts on: ${names}`,
      })
    }
  }, [cart, products, isDiscountActive, toast])

  const categoryOptions = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories])

  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products.filter((p) => p.available)
      : products.filter((p) => p.available && categories.find((c) => c.name === selectedCategory)?.id === p.category)
  }, [selectedCategory, products, categories])

  const addToCart = useCallback(
    (product: ProductType) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        }
        return [...prev, { ...product, quantity: 1 }]
      })

      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
      })
    },
    [toast],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setCustomerName("")
  }, [])

  const { subtotal, discountAmount, tax, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const discountedPrice = getDiscountedPrice(item)
      return sum + discountedPrice * item.quantity
    }, 0)

    const originalSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = originalSubtotal - subtotal
    const tax = subtotal * 0.085 // 8.5% tax
    const total = subtotal + tax

    return { subtotal, discountAmount, tax, total }
  }, [cart, getDiscountedPrice])

  const processOrder = useCallback(() => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing order.",
        variant: "destructive",
      })
      return
    }

    const orderData = {
      customer: customerName || "Walk-in Customer",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: getDiscountedPrice(item),
        quantity: item.quantity,
        category: item.category,
      })),
      subtotal,
      tax,
      total,
      paymentMethod,
      status: "pending" as const,
      cashierId: user?.id || "unknown",
      cashierName: user?.name || "Unknown Cashier",
    }

    const orderId = createOrder(orderData)
    clearCart()

    toast({
      title: "Order Created Successfully",
      description: `Order ${orderId} has been created and sent to kitchen!`,
    })
  }, [
    cart,
    customerName,
    subtotal,
    discountAmount,
    tax,
    total,
    paymentMethod,
    user,
    createOrder,
    clearCart,
    toast,
    getDiscountedPrice,
  ])

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const handlePaymentMethodChange = useCallback((method: "cash" | "card") => {
    setPaymentMethod(method)
  }, [])

  const handleCustomerNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-coffee-900">Products</h2>
          {/* Mobile category dropdown */}
          <div className="sm:hidden w-full">
            <Select value={selectedCategory} onValueChange={handleCategorySelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop/tablet pill filters with horizontal scroll */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {categoryOptions.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category)}
                className={
                  selectedCategory === category
                    ? "rounded-full bg-coffee-700 hover:bg-coffee-800 text-white"
                    : "rounded-full border-coffee-300 text-coffee-700 hover:bg-coffee-50"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const discountedPrice = getDiscountedPrice(product)
            const hasDiscount = discountedPrice < product.price && isDiscountActive(product)

            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all border border-coffee-200 hover:shadow-lg hover:-translate-y-0.5 ${
                  !product.available ? "opacity-50" : "hover:border-coffee-400"
                }`}
                onClick={() => product.available && addToCart(product)}
              >
                <CardHeader className="pb-2">
                  {hasDiscount && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Save {product.discount}% today
                      </Badge>
                    </div>
                  )}
                  {product.image && (
                    <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-coffee-50">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-coffee-600/10 rounded-full p-1">
                      <Coffee className="h-4 w-4 text-coffee-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-coffee-100 text-coffee-800">
                      {categories.find((c) => c.id === product.category)?.name || product.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-coffee-900">{product.name}</CardTitle>
                  <CardDescription className="text-sm text-coffee-600">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {hasDiscount ? (
                        <>
                          <span className="text-xl font-bold text-coffee-900">${discountedPrice.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-coffee-900">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    {product.available ? (
                      <Button
                        size="sm"
                        className="bg-coffee-600 hover:bg-coffee-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product)
                        }}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card className="h-fit border-coffee-200">
          <CardHeader className="bg-coffee-50">
            <CardTitle className="flex items-center gap-2 text-coffee-900">
              <ShoppingCart className="h-5 w-5" />
              Current Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-coffee-800">
                Customer Name (Optional)
              </Label>
              <Input
                id="customer"
                value={customerName}
                onChange={handleCustomerNameChange}
                placeholder="Enter customer name"
                className="border-coffee-200 focus:border-coffee-500"
              />
            </div>

            <Separator className="bg-coffee-200" />

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-coffee-300 mx-auto mb-2" />
                  <p className="text-coffee-500">No items in cart</p>
                </div>
              ) : (
                cart.map((item) => {
                  const discountedPrice = getDiscountedPrice(item)
                  const hasDiscount = discountedPrice < item.price

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-coffee-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {item.image && (
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-coffee-50 flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm text-coffee-900">{item.name}</p>
                          <div className="flex items-center gap-2">
                            {hasDiscount ? (
                              <>
                                <p className="text-xs text-coffee-600">${discountedPrice.toFixed(2)} each</p>
                                <p className="text-xs text-gray-500 line-through">${item.price.toFixed(2)}</p>
                              </>
                            ) : (
                              <p className="text-xs text-coffee-600">${item.price.toFixed(2)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, item.quantity - 1)
                          }}
                          className="h-8 w-8 p-0 border-coffee-300"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-coffee-900">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, item.quantity + 1)
                          }}
                          className="h-8 w-8 p-0 border-coffee-300"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromCart(item.id)
                          }}
                          className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {cart.length > 0 && (
              <>
                <Separator className="bg-coffee-200" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-coffee-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-coffee-700">
                    <span>Tax (8.5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-coffee-200" />
                  <div className="flex justify-between font-bold text-coffee-900">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="bg-coffee-200" />

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-coffee-800">Payment Method</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePaymentMethodChange("card")}
                      className={`flex-1 ${paymentMethod === "card" ? "bg-coffee-600 hover:bg-coffee-700" : "border-coffee-300 text-coffee-700 hover:bg-coffee-100"}`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePaymentMethodChange("cash")}
                      className={`flex-1 ${paymentMethod === "cash" ? "bg-coffee-600 hover:bg-coffee-700" : "border-coffee-300 text-coffee-700 hover:bg-coffee-100"}`}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-coffee-600 hover:bg-coffee-700 text-white"
                    onClick={processOrder}
                    disabled={cart.length === 0}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Process Order (${total.toFixed(2)})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-coffee-300 text-coffee-700 hover:bg-coffee-100 bg-transparent"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
