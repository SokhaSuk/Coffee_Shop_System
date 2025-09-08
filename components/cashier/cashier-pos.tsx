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
import { Coffee, Plus, Minus, Trash2, CreditCard, DollarSign, Receipt, ShoppingCart, Printer } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReceiptCard, type ReceiptData } from "./receipt-card"
import { AspectRatio } from "@/components/ui/aspect-ratio"

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
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

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

    // Prepare receipt data before clearing cart
    setReceiptData({
      title: "Merchant Copy",
      orderId,
      customer: orderData.customer,
      cashierName: orderData.cashierName,
      items: orderData.items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      createdAt: new Date().toISOString(),
    })
    setIsReceiptOpen(true)

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const discountedPrice = getDiscountedPrice(product)
            const hasDiscount = discountedPrice < product.price && isDiscountActive(product)
            const lowStock = product.available && product.stock <= 5

            return (
              <Card
                key={product.id}
                className={`group relative cursor-pointer overflow-hidden transition-all border border-coffee-200 hover:shadow-md sm:hover:shadow-lg hover:-translate-y-0.5 focus-within:ring-1 focus-within:ring-ring/30 ${
                  !product.available ? "opacity-60" : "hover:border-coffee-400"
                }`}
                onClick={() => product.available && addToCart(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    if (product.available) addToCart(product)
                  }
                }}
                aria-label={`Add ${product.name} to cart`}
                aria-disabled={!product.available}
              >
                <div className="p-0">
                  <div className="relative">
                    <AspectRatio ratio={4 / 3}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        placeholder={product.image ? undefined : "empty"}
                      />
                    </AspectRatio>

                    {/* Overlays */}
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                        -{product.discount}%
                      </div>
                    )}
                    {lowStock && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                        Low stock
                      </div>
                    )}
                    {!product.available && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] grid place-items-center text-white text-xs">
                        Out of stock
                      </div>
                    )}
                  </div>

                  <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-coffee-600/10 rounded-full p-0.5 sm:p-1">
                        <Coffee className="h-3 w-3 sm:h-4 sm:w-4 text-coffee-600" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs bg-coffee-100 text-coffee-800">
                        {categories.find((c) => c.id === product.category)?.name || product.category}
                      </Badge>
                      {hasDiscount && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-green-100 text-green-700">
                          Save {product.discount}%
                        </Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-sm sm:text-base font-semibold text-coffee-900 truncate">{product.name}</p>
                      <p className="text-xs sm:text-sm text-coffee-600 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-end justify-between pt-0.5 sm:pt-1">
                      <div className="flex flex-col leading-tight">
                        {hasDiscount ? (
                          <>
                            <span className="text-lg sm:text-xl font-bold text-coffee-900">${discountedPrice.toFixed(2)}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg sm:text-xl font-bold text-coffee-900">${product.price.toFixed(2)}</span>
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
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1 hidden sm:inline">Add</span>
                        </Button>
                      ) : (
                        <Badge variant="destructive">Unavailable</Badge>
                      )}
                    </div>
                  </div>
                </div>
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

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>Merchant and Customer copies</DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="print-area grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ReceiptCard data={{ ...receiptData, title: "Merchant Copy" }} />
              </div>
              <div>
                <ReceiptCard data={{ ...receiptData, title: "Customer Copy" }} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsReceiptOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
