"use client"

import { useMemo, useState, useRef } from "react"
import * as React from "react"
import { useOrders, type Order, type DateFilterType } from "@/lib/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Eye, Receipt, DollarSign, CheckCircle, AlertCircle, Download, MoreVertical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DailySalesReport } from "./sales-report"
import { ReceiptCard, type ReceiptData } from "./receipt-card"
import { downloadElementAsPdf, createSimpleReceiptPdf } from "@/lib/pdf"
import { useToast } from "@/hooks/use-toast"

export function OrderHistory() {
  const { orders, getOrdersByDateFilter } = useOrders()
  const { cancelOrder, createAdjustment } = useOrders()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilterType>("day")
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null)
  const customerReceiptRef = useRef<HTMLDivElement | null>(null)
  const merchantReceiptRef = useRef<HTMLDivElement | null>(null)

  const timeFiltered = useMemo(() => getOrdersByDateFilter(dateFilter), [dateFilter, getOrdersByDateFilter])
  const filteredOrders = useMemo(
    () =>
      timeFiltered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [timeFiltered, searchTerm],
  )

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatStatus = (status: Order["status"]) => {
    if (status === "cancelled") return "Cancelled"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const printReceipt = (order?: Order) => {
    const targetOrder = order || selectedOrder
    if (!targetOrder) {
      toast({
        title: "Error",
        description: "Unable to print receipt. Order data not available.",
        variant: "destructive"
      })
      return
    }

    try {
      // Create a temporary print container with receipt HTML
      const printContainer = document.createElement('div')
      printContainer.id = 'receipt-print-container'
      printContainer.style.position = 'fixed'
      printContainer.style.left = '-9999px'
      printContainer.style.top = '0'
      printContainer.style.width = '400px'
      printContainer.style.background = 'white'
      printContainer.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", Courier, monospace'
      printContainer.style.color = 'black'
      printContainer.style.padding = '20px'
      printContainer.style.boxSizing = 'border-box'

      const receiptData: ReceiptData = {
        title: "Receipt",
        orderId: targetOrder.id,
        customer: targetOrder.customer,
        cashierName: "System",
        items: targetOrder.items.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: targetOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        total: targetOrder.total,
        createdAt: targetOrder.createdAt,
        paymentMethod: targetOrder.paymentMethod as "cash" | "card" | "digital"
      }

      // Generate receipt HTML directly
      const receiptHTML = `
        <div class="receipt-container bg-white text-black font-mono text-sm leading-relaxed w-full max-w-md mx-auto break-words shadow-lg rounded-lg border">
          <div class="receipt-header text-center mb-6 p-4">
            <div class="mb-4">
              <div class="flex items-center justify-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="font-bold text-xl tracking-wide text-gray-800">DaCoffee Shop</h1>
                  <div class="text-xs text-amber-600 font-semibold tracking-wider">Premium Coffee Experience</div>
                </div>
              </div>
              <div class="bg-amber-50 px-4 py-2 rounded-full inline-block border border-amber-200">
                <span class="text-sm uppercase tracking-wider text-amber-800 font-bold">CUSTOMER COPY</span>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="space-y-2">
                <div class="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span>#12 Street 123, Phnom Penh, Cambodia</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span>+855 12-345-678</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span>info@dacoffee.com</span>
                </div>
              </div>
            </div>
          </div>
          <div class="receipt-details bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 my-4">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-700 font-medium">Receipt No:</span>
                <span class="font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border shadow-sm">${receiptData.orderId}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700 font-medium">Date & Time:</span>
                <span class="font-semibold text-gray-800">${new Date(receiptData.createdAt).toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700 font-medium">Customer:</span>
                <span class="font-semibold text-gray-800 capitalize">${receiptData.customer}</span>
              </div>
            </div>
          </div>
          <div class="receipt-items mb-6">
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold text-gray-800 flex items-center gap-2">Order Items</h3>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ${receiptData.items.length} item${receiptData.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div class="space-y-3">
                ${receiptData.items.map(item => `
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <div class="font-medium text-gray-800">${item.name}</div>
                      <div class="text-xs text-gray-600">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="text-center px-3 py-1 bg-white rounded border">
                        <div class="text-sm font-bold">${item.quantity}x</div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-lg">$${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="receipt-totals bg-gradient-to-br from-gray-50 to-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-700 font-medium">Subtotal:</span>
                <span class="font-semibold">$${receiptData.subtotal.toFixed(2)}</span>
              </div>
              <div class="border-t border-amber-200 pt-3 mt-3">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-gray-800">TOTAL:</span>
                  <span class="text-2xl font-bold text-amber-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                    $${receiptData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-dotted border-gray-300">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-1">
                  <span class="font-medium">Payment Method:</span>
                </div>
                <span class="capitalize font-semibold">${receiptData.paymentMethod}</span>
              </div>
            </div>
          </div>
          <div class="receipt-footer border-t border-dashed border-gray-400 pt-4 text-center">
            <div class="mb-4">
              <p class="text-base font-medium text-gray-800 mb-2">Thank you for visiting!</p>
              <p class="text-xs text-gray-600 mb-1">We appreciate your business</p>
              <p class="text-xs text-gray-600">Follow us: @DaCoffee | www.dacoffee.com</p>
            </div>
            <div class="text-xs text-gray-500 space-y-1">
              <p>Customer Copy - Please keep your receipt</p>
              <p>Receipt #${receiptData.orderId}</p>
            </div>
          </div>
        </div>
      `

      printContainer.innerHTML = receiptHTML
      document.body.appendChild(printContainer)

      // Use browser's native print dialog
      window.focus()
      window.print()

      // Clean up after printing
      setTimeout(() => {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer)
        }
      }, 1000)

    } catch (error) {
      console.error('Print failed:', error)
      alert('Unable to print receipt. Please try again or check your browser settings.')
    }
  }

  const handleDownloadReceipt = async (order?: Order) => {
    const targetOrder = order || selectedOrder
    if (!targetOrder) {
      toast({
        title: "Error",
        description: "Unable to generate receipt. Order data not available.",
        variant: "destructive"
      })
      return
    }

    setDownloadingOrderId(targetOrder.id)
    setIsDownloading(true)

    try {
      // Create receipt data for visual components
      const receiptData: ReceiptData = {
        title: "Receipt",
        orderId: targetOrder.id,
        customer: targetOrder.customer,
        cashierName: "System",
        items: targetOrder.items.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: targetOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        total: targetOrder.total,
        createdAt: targetOrder.createdAt,
        paymentMethod: targetOrder.paymentMethod as "cash" | "card" | "digital",
        // Customer Copy enhancements
        loyaltyPoints: Math.floor(targetOrder.total * 2), // 2 points per dollar spent
        loyaltyMessage: "Thank you for being a valued customer!",
        qrCodeUrl: "https://dacoffee.com/feedback",
        // Merchant Copy enhancements
        authorizationCode: targetOrder.paymentMethod === "card" ? "AUTH" + Math.random().toString().substring(2, 8).toUpperCase() : undefined,
        maskedCardNumber: targetOrder.paymentMethod === "card" ? "XXXX-XXXX-XXXX-1234" : undefined,
        cardType: targetOrder.paymentMethod === "card" ? "VISA" : undefined,
        requiresSignature: targetOrder.paymentMethod === "card" && targetOrder.total > 25,
        internalNotes: `Customer satisfaction rating: Excellent. Order completed successfully.`,
        registerNumber: "REG-001",
        shiftId: "SHIFT-A",
        transactionReference: targetOrder.id,
      }

      // Generate customer receipt using visual component
      const customerElement = customerReceiptRef.current
      if (customerElement) {
        await downloadElementAsPdf(
          customerElement,
          `customer-${targetOrder.id}.pdf`,
          { orientation: "p", format: "a4", marginMm: 10, scale: 2 }
        )
      }

      // Generate merchant receipt using visual component
      const merchantElement = merchantReceiptRef.current
      if (merchantElement) {
        await downloadElementAsPdf(
          merchantElement,
          `merchant-${targetOrder.id}.pdf`,
          { orientation: "p", format: "a4", marginMm: 10, scale: 2 }
        )
      }

      toast({
        title: "Success",
        description: "Both customer and merchant receipts downloaded successfully!"
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      const errorMessage = (error as Error).message || "Could not generate PDF receipt."

      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
      setDownloadingOrderId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order History</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => printReceipt()}
            disabled={!selectedOrder || isDownloading}
            className="bg-coffee-50 hover:bg-coffee-100 border-coffee-200"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Orders list */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="transition-all hover:shadow-lg hover:-translate-y-0.5 border border-coffee-200">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{order.id}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="truncate max-w-[60vw] sm:max-w-none">{order.customer}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          {formatTime(order.createdAt)} - {formatDate(order.createdAt)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
                        {order.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status === "preparing" && <Clock className="h-3 w-3 mr-1" />}
                        {order.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {formatStatus(order.status)}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {order.paymentMethod}
                      </Badge>
                      <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item.quantity}x {item.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mobile responsive action buttons */}
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 md:mr-2" />
                          <span className="hidden sm:inline">View</span>
                        </Button>

                        {/* Mobile dropdown menu for additional actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="px-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => printReceipt(order)}
                              className="flex items-center gap-2"
                            >
                              <Receipt className="h-4 w-4" />
                              Print Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadReceipt(order)}
                              disabled={isDownloading || downloadingOrderId === order.id}
                              className="flex items-center gap-2"
                            >
                              <Download className={`h-4 w-4 ${isDownloading && downloadingOrderId === order.id ? 'animate-spin' : ''}`} />
                              {isDownloading && downloadingOrderId === order.id ? 'Downloading...' : 'Download Receipt'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                localStorage.setItem(
                                  "darkCoffeeDraftOrder",
                                  JSON.stringify({ customer: order.customer, items: order.items })
                                )
                                toast({
                                  title: "Order Loaded",
                                  description: "Order loaded into POS. Open POS tab to edit and reprocess."
                                })
                              }}
                            >
                              Duplicate to POS
                            </DropdownMenuItem>
                            {order.status === "completed" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const input = prompt("Refund/Adjustment amount ($):", "0")
                                  const amount = input ? parseFloat(input) : 0
                                  if (!isNaN(amount) && amount > 0) {
                                    const id = createAdjustment(order.id, amount)
                                    toast({
                                      title: "Adjustment Created",
                                      description: `Adjustment order ${id} created for $${amount.toFixed(2)}`
                                    })
                                  }
                                }}
                              >
                                Refund/Adjust
                              </DropdownMenuItem>
                            )}
                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Cancel order ${order.id}?`)) {
                                    cancelOrder(order.id)
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Desktop buttons - only show on larger screens */}
                        <div className="hidden lg:flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap"
                            onClick={() => {
                              localStorage.setItem(
                                "darkCoffeeDraftOrder",
                                JSON.stringify({ customer: order.customer, items: order.items })
                              )
                              toast({
                                title: "Order Loaded",
                                description: "Order loaded into POS. Open POS tab to edit and reprocess."
                              })
                            }}
                          >
                            Duplicate to POS
                          </Button>
                          {order.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="whitespace-nowrap"
                              onClick={() => {
                                const input = prompt("Refund/Adjustment amount ($):", "0")
                                const amount = input ? parseFloat(input) : 0
                                if (!isNaN(amount) && amount > 0) {
                                  const id = createAdjustment(order.id, amount)
                                  toast({
                                    title: "Adjustment Created",
                                    description: `Adjustment order ${id} created for $${amount.toFixed(2)}`
                                  })
                                }
                              }}
                            >
                              Refund/Adjust
                            </Button>
                          )}
                          {order.status !== "completed" && order.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="whitespace-nowrap"
                              onClick={() => {
                                if (confirm(`Cancel order ${order.id}?`)) {
                                  cancelOrder(order.id)
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search/Filter panel */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find orders quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilterType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("")
                  setDateFilter("day")
                }}
              >
                Clear
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No orders found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* This section is now replaced by the dialog above */}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Customer: {selectedOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(selectedOrder.createdAt)} - {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge variant={selectedOrder.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
                      {formatStatus(selectedOrder.status)}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payment: <Badge variant="outline" className="capitalize">{selectedOrder.paymentMethod}</Badge>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${selectedOrder.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="font-medium mb-2">Items:</p>
                <div className="border rounded-lg p-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <p className="font-medium">Receipt Preview:</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(selectedOrder)}
                      disabled={isDownloading}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Download className={`h-4 w-4 ${isDownloading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                      <span className="sm:hidden">{isDownloading ? 'Generating...' : 'Download'}</span>
                    </Button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                  <ReceiptCard
                    data={{
                      title: "Receipt",
                      orderId: selectedOrder.id,
                      customer: selectedOrder.customer,
                      cashierName: "System", // You might want to add cashier name to Order type
                      items: selectedOrder.items.map((item, idx) => ({
                        id: item.id || `item-${idx}`,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                      })),
                      subtotal: selectedOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
                      total: selectedOrder.total,
                      createdAt: selectedOrder.createdAt,
                      paymentMethod: selectedOrder.paymentMethod as "cash" | "card" | "digital",
                      // Customer Copy enhancements
                      loyaltyPoints: Math.floor(selectedOrder.total * 2), // 2 points per dollar spent
                      loyaltyMessage: "Thank you for being a valued customer!",
                      qrCodeUrl: "https://dacoffee.com/feedback",
                      // Merchant Copy enhancements
                      authorizationCode: selectedOrder.paymentMethod === "card" ? "AUTH" + Math.random().toString().substring(2, 8).toUpperCase() : undefined,
                      maskedCardNumber: selectedOrder.paymentMethod === "card" ? "XXXX-XXXX-XXXX-1234" : undefined,
                      cardType: selectedOrder.paymentMethod === "card" ? "VISA" : undefined,
                      requiresSignature: selectedOrder.paymentMethod === "card" && selectedOrder.total > 25,
                      internalNotes: `Customer satisfaction rating: Excellent. Order completed successfully.`,
                      registerNumber: "REG-001",
                      shiftId: "SHIFT-A",
                      transactionReference: selectedOrder.id,
                    }}
                    variant="customer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.setItem(
                      "darkCoffeeDraftOrder",
                      JSON.stringify({ customer: selectedOrder.customer, items: selectedOrder.items })
                    )
                    toast({
                      title: "Order Loaded",
                      description: "Order loaded into POS. Open POS tab to edit and reprocess."
                    })
                  }}
                >
                  Duplicate to POS
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Off-screen areas for PDF export (must be rendered for html2canvas) */}
      <div style={{ position: "absolute", left: -99999, top: 0 }} aria-hidden>
        <div ref={customerReceiptRef}>
          <ReceiptCard
            data={{
              title: "Customer Receipt",
              orderId: selectedOrder?.id || "",
              customer: selectedOrder?.customer || "",
              cashierName: "System",
              items: selectedOrder?.items.map((item) => ({
                id: item.id || `item-${selectedOrder?.items.indexOf(item)}`,
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })) || [],
              subtotal: selectedOrder?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0,
              total: selectedOrder?.total || 0,
              createdAt: selectedOrder?.createdAt || "",
              paymentMethod: selectedOrder?.paymentMethod as "cash" | "card" | "digital"
            }}
            variant="customer"
          />
        </div>
        <div ref={merchantReceiptRef}>
          <ReceiptCard
            data={{
              title: "Merchant Copy",
              orderId: selectedOrder?.id || "",
              customer: selectedOrder?.customer || "",
              cashierName: "System",
              items: selectedOrder?.items.map((item) => ({
                id: item.id || `item-${selectedOrder?.items.indexOf(item)}`,
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })) || [],
              subtotal: selectedOrder?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0,
              total: selectedOrder?.total || 0,
              createdAt: selectedOrder?.createdAt || "",
              paymentMethod: selectedOrder?.paymentMethod as "cash" | "card" | "digital"
            }}
            variant="merchant"
          />
        </div>
      </div>
    </div>
  )
}
