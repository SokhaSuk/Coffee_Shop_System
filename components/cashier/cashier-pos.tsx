"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
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
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Coffee, Plus, Minus, Trash2, CreditCard, DollarSign, Receipt, ShoppingCart, Droplets, Gauge, Smartphone } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReceiptCard, type ReceiptData } from "./receipt-card"
import { WaitingTicket } from "./WaitingTicket"
import { OrderReport } from "./OrderReport"
import { createSimpleReceiptPdf } from "@/lib/pdf"
import { AspectRatio } from "@/components/ui/aspect-ratio"

type CartItem = ProductType & { quantity: number; sugarLevel?: string }

export function CashierPOS() {
  const { products, categories, getDiscountedPrice, isDiscountActive } = useProducts()
  const { createOrder } = useOrders()
  const { user } = useAuth()
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [customerName, setCustomerName] = useState("")
  const [selectedType, setSelectedType] = useState<string>("All Types")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("card")
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent")
  const [discountInput, setDiscountInput] = useState<string>("0")
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("")
  const [isSugarDialogOpen, setIsSugarDialogOpen] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<ProductType | null>(null)
  const [selectedSugar, setSelectedSugar] = useState<string>("50")

  const waitingRef = useRef<HTMLDivElement | null>(null)
  const orderReportRef = useRef<HTMLDivElement | null>(null)
  const customerReceiptRef = useRef<HTMLDivElement | null>(null)
  const merchantReceiptRef = useRef<HTMLDivElement | null>(null)

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

  // Auto-load duplicated draft from Order History
  useEffect(() => {
    try {
      const raw = localStorage.getItem("darkCoffeeDraftOrder")
      if (!raw) return
      const draft = JSON.parse(raw) as { customer?: string; items?: Array<{ id: string; quantity: number }> }
      if (!draft || !Array.isArray(draft.items) || draft.items.length === 0) {
        localStorage.removeItem("darkCoffeeDraftOrder")
        return
      }
      const doApply = window.confirm("A duplicated order draft was found. Apply it to POS?")
      if (!doApply) {
        return
      }
      const builtCart: CartItem[] = []
      draft.items.forEach((it) => {
        const p = products.find((x) => x.id === it.id)
        if (p) {
          builtCart.push({ ...p, quantity: Math.max(1, it.quantity || 1) })
        }
      })
      if (builtCart.length > 0) {
        setCart(builtCart)
        if (draft.customer) setCustomerName(draft.customer)
        toast({ title: "Draft applied", description: "You can now review and process the order." })
      } else {
        toast({ title: "Draft items unavailable", description: "None of the items were found in the catalog.", variant: "destructive" })
      }
      localStorage.removeItem("darkCoffeeDraftOrder")
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categoryOptions = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories])
  const typeOptions = ["All Types", "Ice", "Frab", "Hot"]

  const filteredProducts = useMemo(() => {
    const byCategory = selectedCategory === "All"
      ? products.filter((p) => p.isAvailable)
      : products.filter((p) => p.isAvailable && categories.find((c) => c.name === selectedCategory)?.id === p.category)

    if (selectedType === "All Types") return byCategory
    return byCategory.filter((p) => p.type === selectedType)
  }, [selectedCategory, selectedType, products, categories])

  const addToCart = useCallback(
    (product: ProductType, sugarLevel?: string) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id && item.sugarLevel === sugarLevel)
        if (existing) {
          return prev.map((item) => (item.id === product.id && item.sugarLevel === sugarLevel ? { ...item, quantity: item.quantity + 1 } : item))
        }
        return [...prev, { ...product, quantity: 1, sugarLevel }]
      })

      toast({
        title: "Added to cart",
        description: `${product.name}${sugarLevel ? ` • ${sugarLevel}` : ""} added to cart`,
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

  const updateQuantityWithSugar = useCallback((id: string, sugarLevel: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartWithSugar(id, sugarLevel)
      return
    }
    setCart((prev) => prev.map((item) => (item.id === id && item.sugarLevel === sugarLevel ? { ...item, quantity } : item)))
  }, [])

  const removeFromCartWithSugar = useCallback((id: string, sugarLevel: string | undefined) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.sugarLevel === sugarLevel)))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setCustomerName("")
  }, [])

  const { subtotal, discountAmount, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const discountedPrice = getDiscountedPrice(item)
      return sum + discountedPrice * item.quantity
    }, 0)

    // Manual discount is applied on top of already discounted subtotal and does NOT stack with promo discount.
    const numericInput = isNaN(parseFloat(discountInput)) ? 0 : parseFloat(discountInput)
    const clampedPercent = Math.min(100, Math.max(0, numericInput))
    const clampedAmount = Math.max(0, numericInput)

    const manualDiscount = discountType === "percent" ? subtotal * (clampedPercent / 100) : clampedAmount
    const effectiveDiscount = Math.min(subtotal, manualDiscount)

    const total = Math.max(0, subtotal - effectiveDiscount)

    return { subtotal, discountAmount: effectiveDiscount, total }
  }, [cart, getDiscountedPrice, discountType, discountInput])

  const processOrder = useCallback(() => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing order.",
        variant: "destructive",
      })
      return
    }

    const paidAmount = paymentMethod === "cash" ? Math.max(0, parseFloat(cashReceivedInput || "0")) : undefined
    const changeAmount = paymentMethod === "cash" && typeof paidAmount === "number" ? Math.max(0, paidAmount - total) : undefined

    const orderData = {
      customer: customerName || "Walk-in Customer",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name + (item.sugarLevel ? ` (${item.sugarLevel})` : ""),
        price: getDiscountedPrice(item),
        quantity: item.quantity,
        category: item.category,
      })),
      subtotal,
      total,
      paymentMethod,
      paidAmount,
      changeAmount,
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
      discountAmount: discountAmount,
      discountLabel: discountType === "percent" ? `${Math.min(100, Math.max(0, parseFloat(discountInput || "0"))).toFixed(2)}%` : `$${Math.max(0, parseFloat(discountInput || "0")).toFixed(2)}`,
      total: orderData.total,
      createdAt: new Date().toISOString(),
      paymentMethod,
      paidAmount,
      changeAmount,
      // Customer Copy enhancements
      loyaltyPoints: Math.floor(orderData.total * 2), // 2 points per dollar spent
      loyaltyMessage: "Thank you for being a valued customer!",
      qrCodeUrl: "https://dacoffee.com/feedback",
      // Merchant Copy enhancements
      authorizationCode: paymentMethod === "card" ? "AUTH" + Math.random().toString().substring(2, 8).toUpperCase() : undefined,
      maskedCardNumber: paymentMethod === "card" ? "XXXX-XXXX-XXXX-1234" : undefined,
      cardType: paymentMethod === "card" ? "VISA" : undefined,
      requiresSignature: paymentMethod === "card" && orderData.total > 25,
      internalNotes: `Customer satisfaction rating: Excellent. Order completed successfully.`,
      registerNumber: "REG-001",
      shiftId: "SHIFT-A",
      transactionReference: orderId,
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
    total,
    paymentMethod,
    cashReceivedInput,
    user,
    createOrder,
    clearCart,
    toast,
    getDiscountedPrice,
    discountType,
    discountInput,
  ])

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category)
    // Compute resulting list for feedback
    const categoryId = categories.find((c) => c.name === category)?.id
    const byCategory = category === "All"
      ? products.filter((p) => p.isAvailable)
      : products.filter((p) => p.isAvailable && p.category === categoryId)
    const next = selectedType === "All Types" ? byCategory : byCategory.filter((p) => p.type === selectedType)
    if (next.length === 0) {
      toast({ title: "No items found", description: `No products for ${category} ${selectedType !== "All Types" ? `and ${selectedType}` : ""}.`, variant: "destructive" })
    } else {
      toast({ title: "Filter applied", description: `Showing ${next.length} item(s) for ${category}${selectedType !== "All Types" ? ` • ${selectedType}` : ""}.` })
    }
  }, [categories, products, selectedType, toast])

  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType(type)
    // Compute resulting list for feedback
    const categoryId = categories.find((c) => c.name === selectedCategory)?.id
    const byCategory = selectedCategory === "All"
      ? products.filter((p) => p.isAvailable)
      : products.filter((p) => p.isAvailable && p.category === categoryId)
    const next = type === "All Types" ? byCategory : byCategory.filter((p) => p.type === type)
    if (next.length === 0) {
      toast({ title: "No items found", description: `No products for ${selectedCategory} ${type !== "All Types" ? `and ${type}` : ""}.`, variant: "destructive" })
    } else {
      toast({ title: "Filter applied", description: `Showing ${next.length} item(s) for ${selectedCategory}${type !== "All Types" ? ` • ${type}` : ""}.` })
    }
  }, [categories, products, selectedCategory, toast])

  const handlePaymentMethodChange = useCallback((method: "cash" | "card" | "digital") => {
    setPaymentMethod(method)
  }, [])

  const handleCustomerNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value)
  }, [])

  const printHtml = useCallback((title: string, bodyHtml: string) => {
    try {
      // Create a temporary print container
      const printContainer = document.createElement('div')
      printContainer.id = 'print-container'
      printContainer.style.position = 'fixed'
      printContainer.style.left = '-9999px'
      printContainer.style.top = '0'
      printContainer.style.width = '800px'
      printContainer.style.background = 'white'
      printContainer.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"'
      printContainer.style.color = '#111'
      printContainer.style.padding = '20px'
      printContainer.style.boxSizing = 'border-box'

      printContainer.innerHTML = `
        <style>
          .print-content { max-width: 800px; margin: 0 auto; }
          .print-muted { color: #6b7280; }
          .print-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", Courier, monospace; }
          .print-row { display: flex; justify-content: space-between; align-items: center; }
          .print-divider { border-top: 1px dashed #cbd5e1; margin: 12px 0; }
          .print-title { font-size: 20px; font-weight: 700; }
          .print-subtitle { font-size: 12px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-th, .print-td { padding: 6px 0; text-align: left; }
          .print-th { font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
          .print-total { font-weight: 700; font-size: 16px; }
          @media print {
            body { margin: 0; }
            .print-content { margin: 12mm; }
          }
        </style>
        <div class="print-content">${bodyHtml}</div>
      `

      document.body.appendChild(printContainer)

      // Use browser's native print dialog
      window.focus()
      window.print()

      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(printContainer)
      }, 1000)

    } catch (error) {
      console.error('Print failed:', error)
      alert('Unable to print. Please try again or check your browser settings.')
    }
  }, [])

  const printOrderReport = useCallback(() => {
    if (!receiptData) return
    const itemsRows = receiptData.items
      .map(
        (it) => `<tr><td class="print-td">${it.name}</td><td class="print-mono">${it.quantity}x</td><td class="print-mono" style="text-align:right">$${(it.price * it.quantity).toFixed(2)}</td></tr>`,
      )
      .join("")
    const discountRow = typeof receiptData.discountAmount === "number" && receiptData.discountAmount > 0
      ? `<div class=\"print-row\"><div class=\"print-muted\">Discount${receiptData.discountLabel ? ` (${receiptData.discountLabel})` : ""}</div><div class=\"print-mono\">-$${receiptData.discountAmount.toFixed(2)}</div></div>`
      : ""
    const body = `
      <div class="print-row"><div class="print-title">Order Report</div><div class="print-mono">${receiptData.orderId}</div></div>
      <div class="print-subtitle print-muted">${new Date(receiptData.createdAt).toLocaleString()}</div>
      <div class="print-subtitle">Customer: ${receiptData.customer} • Cashier: ${receiptData.cashierName}</div>
      <div class="print-divider"></div>
      <table class="print-table">
        <thead><tr><th class="print-th">Item</th><th class="print-th">Qty</th><th class="print-th" style="text-align:right">Amount</th></tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div class="print-divider"></div>
      <div class="print-row"><div class="print-muted">Subtotal</div><div class="print-mono">$${receiptData.subtotal.toFixed(2)}</div></div>
      ${discountRow}
      <div class="print-row print-total"><div>Total</div><div class="print-mono">$${receiptData.total.toFixed(2)}</div></div>
      <div class="print-divider"></div>
      <div class="print-subtitle print-muted">Payment: ${receiptData.paymentMethod || "n/a"}</div>
    `
    printHtml("Order Report", body)
  }, [receiptData, printHtml])

  const printWaitingTicket = useCallback(() => {
    if (!receiptData) return
    const id = receiptData.orderId || "ORD-000"
    const match = id.match(/(\d+)/)
    const queue = match ? match[1].padStart(3, "0") : id
    const body = `
      <div style=\"text-align:center\"> 
        <div style=\"font-size:18px;font-weight:700\">DaCoffee Shop</div>
        <div class=\"muted\" style=\"margin-top:2px\">Customer Waiting Ticket</div>
        <div class=\"divider\"></div>
        <div class=\"mono\" style=\"font-size:72px; font-weight:800; letter-spacing:2px\">${queue}</div>
        <div class=\"muted\" style=\"margin-top:6px\">Order ${receiptData.orderId}</div>
        <div class=\"muted\" style=\"margin-top:2px\">${new Date(receiptData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div class=\"divider\"></div>
        <div style=\"font-size:12px\">Please keep this ticket and wait for your number.</div>
      </div>
    `
    printHtml("Waiting Ticket", body)
  }, [receiptData, printHtml])

  const downloadPdfFromRef = useCallback(
    async (
      ref: React.RefObject<HTMLElement>,
      filename: string,
      options: { orientation?: "p" | "portrait" | "l" | "landscape"; format?: "a4" | "a3" | "a5" | "letter" | "legal"; marginMm?: number; scale?: number },
      successMessage: string,
      fallbackSelector?: string,
    ) => {
      try {
        await new Promise((r) => requestAnimationFrame(() => r(null)))
        let node = ref.current as HTMLElement | null
        if (!node && fallbackSelector) node = document.querySelector(fallbackSelector) as HTMLElement | null
        if (!node) throw new Error("Content not ready")

        // Check if receiptData exists
        if (!receiptData) {
          throw new Error("Receipt data not available")
        }

        // Convert ReceiptData to Order format for PDF generation
        const orderData = {
          id: receiptData.orderId,
          customer: receiptData.customer,
          items: receiptData.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: 'coffee' // Default category since ReceiptData doesn't have this
          })),
          subtotal: receiptData.subtotal,
          total: receiptData.total,
          paymentMethod: receiptData.paymentMethod || 'cash',
          status: 'completed' as const,
          createdAt: receiptData.createdAt,
          updatedAt: receiptData.createdAt,
          cashierId: 'current-user',
          cashierName: receiptData.cashierName
        }

        // Use the reliable simple PDF generation method
        await createSimpleReceiptPdf(orderData, filename.replace('receipt-', '').replace('order-', '').replace('waiting-', ''))
        toast({ title: "Downloaded", description: successMessage })
      } catch (err) {
        console.error("PDF download error:", err)
        toast({ title: "Download failed", description: (err as Error).message || "Could not generate PDF.", variant: "destructive" })
      }
    },
    [toast, receiptData],
  )

  const downloadOrderReportPdf = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading("report")
    try {
      await downloadPdfFromRef(
        orderReportRef,
        `order-${receiptData?.orderId || "report"}.pdf`,
        { orientation: "p", format: "a4", marginMm: 10, scale: 2 },
        "Order report PDF saved.",
      )
    } finally {
      setIsDownloading(null)
    }
  }, [downloadPdfFromRef, orderReportRef, receiptData, isDownloading])

  const downloadCustomerReceiptPdf = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading("customer")
    try {
      await downloadPdfFromRef(
        customerReceiptRef,
        `customer-${receiptData?.orderId || "receipt"}.pdf`,
        { orientation: "p", format: "a4", marginMm: 10, scale: 2 },
        "Customer receipt PDF saved.",
      )
    } finally {
      setIsDownloading(null)
    }
  }, [downloadPdfFromRef, customerReceiptRef, receiptData, isDownloading])

  const downloadMerchantReceiptPdf = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading("merchant")
    try {
      await downloadPdfFromRef(
        merchantReceiptRef,
        `merchant-${receiptData?.orderId || "receipt"}.pdf`,
        { orientation: "p", format: "a4", marginMm: 10, scale: 2 },
        "Merchant receipt PDF saved.",
      )
    } finally {
      setIsDownloading(null)
    }
  }, [downloadPdfFromRef, merchantReceiptRef, receiptData, isDownloading])

  const downloadBothReceipts = useCallback(async () => {
    if (isDownloading || !receiptData) return
    setIsDownloading("both")

    try {
      // Download merchant receipt using visual component
      await downloadMerchantReceiptPdf()

      // Download customer receipt using visual component
      await downloadCustomerReceiptPdf()

      toast({
        title: "Downloaded Successfully!",
        description: "Both merchant and customer receipts have been downloaded."
      })
    } catch (err) {
      console.error("Receipt download error:", err)
      toast({
        title: "Download failed",
        description: (err as Error).message || "Could not generate receipts.",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(null)
    }
  }, [receiptData, isDownloading, toast, downloadMerchantReceiptPdf, downloadCustomerReceiptPdf])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
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
          {/* Mobile type dropdown */}
          <div className="sm:hidden w-full">
            <Select value={selectedType} onValueChange={handleTypeSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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
          {/* Type filters */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {typeOptions.map((t) => (
              <Button
                key={t}
                variant={selectedType === t ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeSelect(t)}
                className={
                  selectedType === t
                    ? "rounded-full bg-coffee-700 hover:bg-coffee-800 text-white"
                    : "rounded-full border-coffee-300 text-coffee-700 hover:bg-coffee-50"
                }
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {filteredProducts.map((product) => {
            const discountedPrice = getDiscountedPrice(product)
            const hasDiscount = discountedPrice < product.price && isDiscountActive(product)
            const lowStock = product.isAvailable && product.stock <= 5

            return (
              <Card
                key={product.id}
                className={`group relative cursor-pointer overflow-hidden transition-all border border-coffee-200 hover:shadow-md sm:hover:shadow-lg hover:-translate-y-0.5 focus-within:ring-1 focus-within:ring-ring/30 p-2 sm:p-3 lg:p-4 ${
                  !product.isAvailable ? "opacity-60" : "hover:border-coffee-400"
                }`}
                onClick={() => {
                  if (!product.isAvailable) return
                  if (product.category === "coffee") {
                    setPendingProduct(product)
                    setSelectedSugar("50")
                    setIsSugarDialogOpen(true)
                  } else {
                    addToCart(product)
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    if (product.isAvailable) {
                      if (product.category === "coffee") {
                        setPendingProduct(product)
                        setSelectedSugar("50")
                        setIsSugarDialogOpen(true)
                      } else {
                        addToCart(product)
                      }
                    }
                  }
                }}
                aria-label={`Add ${product.name} to cart`}
                aria-disabled={!product.isAvailable}
              >
                <div className="p-0">
                  <div className="relative">
                    {/* Responsive aspect ratio - smaller on mobile, larger on desktop */}
                    <div className="aspect-square sm:aspect-[4/3] lg:aspect-[4/3]">
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        placeholder={product.imageUrl ? undefined : "empty"}
                      />
                    </div>

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
                    {!product.isAvailable && (
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
                      {product.type && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-blue-100 text-blue-700">
                          {product.type}
                        </Badge>
                      )}
                      {hasDiscount && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-green-100 text-green-700">
                          Save {product.discount}%
                        </Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm lg:text-base font-semibold text-coffee-900 truncate">{product.name}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-coffee-600 leading-tight line-clamp-1">{product.description}</p>
                    </div>

                    <div className="flex items-end justify-between pt-0.5 sm:pt-1">
                      <div className="flex flex-col leading-tight">
                        {hasDiscount ? (
                          <>
                            <span className="text-sm sm:text-lg lg:text-xl font-bold text-coffee-900">${discountedPrice.toFixed(2)}</span>
                            <span className="text-[10px] sm:text-[10px] lg:text-xs text-gray-500 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-lg lg:text-xl font-bold text-coffee-900">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {product.isAvailable ? (
                        <div className="text-xs text-coffee-600">Tap card to add</div>
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
      <div className="space-y-3 sm:space-y-4">
        <Card className="h-fit border-coffee-200">
          <CardHeader className="bg-coffee-50 p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-coffee-900 text-base sm:text-lg">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Current Order</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
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
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-coffee-300 mx-auto mb-2" />
                  <p className="text-coffee-500 text-sm sm:text-base">No items in cart</p>
                </div>
              ) : (
                cart.map((item) => {
                  const discountedPrice = getDiscountedPrice(item)
                  const hasDiscount = discountedPrice < item.price

                  return (
                    <div
                      key={item.id + (item.sugarLevel || "")}
                      className="flex items-center justify-between p-3 border border-coffee-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {item.imageUrl && (
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded overflow-hidden bg-coffee-50 flex-shrink-0">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-xs sm:text-sm text-coffee-900 truncate">{item.name}</p>
                          {item.sugarLevel && (
                            <p className="text-[10px] sm:text-[11px] text-coffee-600 truncate">Sugar: {item.sugarLevel}</p>
                          )}
                          <div className="flex items-center gap-1 sm:gap-2">
                            {hasDiscount ? (
                              <>
                                <p className="text-[10px] sm:text-xs text-coffee-600">${discountedPrice.toFixed(2)} each</p>
                                <p className="text-[10px] sm:text-xs text-gray-500 line-through">${item.price.toFixed(2)}</p>
                              </>
                            ) : (
                              <p className="text-[10px] sm:text-xs text-coffee-600">${item.price.toFixed(2)} each</p>
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
                            updateQuantityWithSugar(item.id, item.sugarLevel, item.quantity - 1)
                          }}
                          className="h-8 w-8 p-0 border-coffee-300"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-coffee-900">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantityWithSugar(item.id, item.sugarLevel, item.quantity + 1)
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
                            removeFromCartWithSugar(item.id, item.sugarLevel)
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
                  <div className="grid grid-cols-3 gap-2">
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
                    <Button
                      variant={paymentMethod === "digital" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePaymentMethodChange("digital")}
                      className={`flex-1 ${paymentMethod === "digital" ? "bg-coffee-600 hover:bg-coffee-700" : "border-coffee-300 text-coffee-700 hover:bg-coffee-100"}`}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Digital
                    </Button>
                  </div>
                  {paymentMethod === "cash" && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Label className="col-span-1 self-center text-xs text-coffee-700">Cash received</Label>
                      <Input
                        className="col-span-2"
                        type="number"
                        inputMode="decimal"
                        value={cashReceivedInput}
                        onChange={(e) => setCashReceivedInput(e.target.value)}
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                      />
                      <div className="col-span-3 flex justify-between text-xs text-muted-foreground">
                        <span>Change:</span>
                        <span>
                          ${(
                            Math.max(0, (isNaN(parseFloat(cashReceivedInput)) ? 0 : parseFloat(cashReceivedInput)) - total)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Controls */}
                <div className="space-y-2">
                  <Label className="text-coffee-800">Discount</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "amount")}>
                      <SelectTrigger className="col-span-1">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% Percent</SelectItem>
                        <SelectItem value="amount">$ Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      className="col-span-2"
                      min={discountType === "percent" ? 0 : 0}
                      max={discountType === "percent" ? 100 : undefined}
                      step="0.01"
                      placeholder={discountType === "percent" ? "0-100" : "0.00"}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">Current discount applied: ${discountAmount.toFixed(2)}</div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-coffee-600 hover:bg-coffee-700 text-white"
                    onClick={processOrder}
                    disabled={
                      cart.length === 0 ||
                      (paymentMethod === "cash" && (isNaN(parseFloat(cashReceivedInput)) || parseFloat(cashReceivedInput) < total))
                    }
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
                  
                  {/* Print functionality has been removed */}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="w-[95vw] max-w-3xl md:w-auto md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>Merchant and Customer copies</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReceiptOpen(false)}
            >
              Close
            </Button>
            <Button variant="outline" onClick={printOrderReport}>Print Report</Button>
            <Button onClick={printWaitingTicket} className="bg-coffee-600 hover:bg-coffee-700 text-white">Print Waiting Ticket</Button>
            <Button
              variant="outline"
              onClick={downloadBothReceipts}
              disabled={isDownloading !== null}
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
            >
              {isDownloading === "both" ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Download Receipt
                </>
              )}
            </Button>
          </div>
          {receiptData && (
            <div className="space-y-4">
              <ReceiptCard data={{ ...receiptData, title: "Merchant Copy" }} variant="merchant" />
              <ReceiptCard data={{ ...receiptData, title: "Customer Copy" }} variant="customer" />

              {/* Off-screen areas for PDF export (must be rendered for html2canvas) */}
              <div style={{ position: "absolute", left: -99999, top: 0 }} aria-hidden>
                <div ref={orderReportRef}>
                  <OrderReport
                    orderId={receiptData.orderId || ""}
                    customer={receiptData.customer}
                    cashierName={receiptData.cashierName}
                    items={receiptData.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))}
                    subtotal={receiptData.subtotal}
                    discountLabel={receiptData.discountLabel}
                    discountAmount={receiptData.discountAmount}
                    total={receiptData.total}
                    createdAt={receiptData.createdAt}
                    paymentMethod={receiptData.paymentMethod}
                  />
                </div>
                 <div ref={waitingRef}>
                   <WaitingTicket orderId={receiptData.orderId || ""} createdAt={receiptData.createdAt} />
                 </div>
                 <div ref={customerReceiptRef}>
                   <ReceiptCard
                     data={{
                       title: "Customer Receipt",
                       orderId: receiptData.orderId || "",
                       customer: receiptData.customer,
                       cashierName: receiptData.cashierName,
                       items: receiptData.items,
                       subtotal: receiptData.subtotal,
                       discountLabel: receiptData.discountLabel,
                       discountAmount: receiptData.discountAmount,
                       total: receiptData.total,
                       createdAt: receiptData.createdAt,
                       paymentMethod: receiptData.paymentMethod as "cash" | "card" | "digital",
                       paidAmount: receiptData.paidAmount,
                       changeAmount: receiptData.changeAmount
                     }}
                     variant="customer"
                   />
                 </div>
                 <div ref={merchantReceiptRef}>
                   <ReceiptCard
                     data={{
                       title: "Merchant Copy",
                       orderId: receiptData.orderId || "",
                       customer: receiptData.customer,
                       cashierName: receiptData.cashierName,
                       items: receiptData.items,
                       subtotal: receiptData.subtotal,
                       discountLabel: receiptData.discountLabel,
                       discountAmount: receiptData.discountAmount,
                       total: receiptData.total,
                       createdAt: receiptData.createdAt,
                       paymentMethod: receiptData.paymentMethod as "cash" | "card" | "digital",
                       paidAmount: receiptData.paidAmount,
                       changeAmount: receiptData.changeAmount
                     }}
                     variant="merchant"
                   />
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
  {/* Enhanced Sugar Selection Dialog */}
  <Dialog open={isSugarDialogOpen} onOpenChange={setIsSugarDialogOpen}>
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-4">
          <Droplets className="h-8 w-8 text-amber-600" />
        </div>
        <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
          Customize Your Sweetness
        </DialogTitle>
        <DialogDescription className="text-base text-gray-600">
          {pendingProduct ? `Perfecting your ${pendingProduct.name}` : "Choose your ideal sugar level"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-8 py-6">
        {/* Quick Selection - Enhanced Design */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-800">Quick Selection</Label>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {parseFloat(selectedSugar) === 0 && "Pure & Natural"}
              {parseFloat(selectedSugar) > 0 && parseFloat(selectedSugar) <= 25 && "Subtly Sweet"}
              {parseFloat(selectedSugar) > 25 && parseFloat(selectedSugar) <= 75 && "Perfectly Balanced"}
              {parseFloat(selectedSugar) > 75 && parseFloat(selectedSugar) <= 125 && "Sweet Indulgence"}
              {parseFloat(selectedSugar) > 125 && "Extra Sweet"}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { level: 0, label: "Pure", description: "No sugar added", color: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
              { level: 25, label: "Light", description: "Subtle sweetness", color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-200" },
              { level: 50, label: "Regular", description: "Perfect balance", color: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200" },
              { level: 75, label: "Sweet", description: "Sweet indulgence", color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-200" },
              { level: 100, label: "Extra", description: "Very sweet", color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" }
            ].map(({ level, label, description, color, bgColor, textColor, borderColor }) => (
              <button
                key={level}
                onClick={() => setSelectedSugar(level.toString())}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  parseFloat(selectedSugar) === level
                    ? `${color} ${textColor} border-current shadow-lg scale-105`
                    : `${bgColor} ${textColor} border-current hover:shadow-md`
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${color} mx-auto mb-2 flex items-center justify-center transition-all duration-200 ${
                  parseFloat(selectedSugar) === level ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  <span className="text-white font-bold text-sm">
                    {level === 0 ? '0' : level === 25 ? '¼' : level === 50 ? '½' : level === 75 ? '¾' : '+'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{label}</div>
                  <div className="text-xs opacity-75">{description}</div>
                </div>
                {parseFloat(selectedSugar) === level && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Slider Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-amber-600" />
              Fine-tune Your Preference
            </Label>
            <div className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
              {selectedSugar}%
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
            <div className="px-4">
              <Slider
                value={[parseFloat(selectedSugar)]}
                onValueChange={(value) => setSelectedSugar(value[0].toString())}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">0%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">200%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Custom Input */}
        <div className="space-y-3">
          <Label htmlFor="custom-sugar" className="text-lg font-semibold text-gray-800">
            Custom Value
          </Label>
          <div className="flex gap-3">
            <Input
              id="custom-sugar"
              type="number"
              inputMode="decimal"
              value={selectedSugar}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "")
                setSelectedSugar(v)
              }}
              placeholder="0 - 200"
              min={0}
              max={200}
              step="1"
              className="text-center text-lg font-semibold h-12 border-2 border-amber-200 focus:border-amber-400 rounded-lg"
            />
            <div className="flex items-center px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg">
              <span className="text-lg">%</span>
            </div>
          </div>
        </div>

        {/* Enhanced Preview */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 shadow-inner">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Your Selection</h3>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="text-lg font-bold text-gray-800">
                Sugar Level: <span className="text-amber-600">{selectedSugar}%</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {parseFloat(selectedSugar) === 0 && "🌿 Pure and natural - No sugar added"}
                {parseFloat(selectedSugar) > 0 && parseFloat(selectedSugar) <= 25 && "🍃 Lightly sweetened - Subtle enhancement"}
                {parseFloat(selectedSugar) > 25 && parseFloat(selectedSugar) <= 75 && "☕ Perfectly balanced - Classic sweetness"}
                {parseFloat(selectedSugar) > 75 && parseFloat(selectedSugar) <= 125 && "🍯 Sweet indulgence - Enhanced flavor"}
                {parseFloat(selectedSugar) > 125 && "🍬 Extra sweet - Maximum sweetness"}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsSugarDialogOpen(false)}
            className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (pendingProduct) {
                const pct = Math.max(0, Math.min(200, parseFloat(selectedSugar || "0")))
                addToCart(pendingProduct, `${pct}%`)
              }
              setIsSugarDialogOpen(false)
              setPendingProduct(null)
            }}
            className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Coffee className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
    </div>
  )
}
