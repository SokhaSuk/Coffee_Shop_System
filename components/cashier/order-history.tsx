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
import { downloadElementAsPdf } from "@/lib/pdf"
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
  const simpleReceiptRef = useRef<HTMLDivElement | null>(null)

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
      // Create simple receipt data
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
      }

      // Create a temporary print container with simple receipt component
      const printContainer = document.createElement('div')
      printContainer.id = 'receipt-print-container'
      printContainer.style.position = 'fixed'
      printContainer.style.left = '-9999px'
      printContainer.style.top = '0'
      printContainer.style.width = '800px'
      printContainer.style.background = 'white'
      printContainer.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans'
      printContainer.style.color = 'black'
      printContainer.style.padding = '20px'
      printContainer.style.boxSizing = 'border-box'

      // Generate simple receipt HTML
      const receiptHTML = `
        <div style="background: white; color: black; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans; font-size: 14px; line-height: 1.5; width: 100%; max-width: 400px; margin: 0 auto; word-wrap: break-word; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; border: 1px solid #e5e7eb;">

          <!-- Simple Header Section -->
          <div style="text-align: center; margin-bottom: 24px; padding: 16px;">
            <div style="margin-bottom: 16px;">
              <h1 style="font-weight: bold; font-size: 24px; letter-spacing: 0.025em; color: #111827; margin-bottom: 8px;">Coffee-Shop</h1>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
                <div>Lorem ipsum 258</div>
                <div>City Index - 02025</div>
                <div>Tel.: +456-468-987-02</div>
              </div>
            </div>
            <div style="border-top: 2px; border-style: dotted; border-color: #d1d5db; padding-top: 12px;"></div>
          </div>

          <!-- Store and Transaction Info -->
          <div style="padding: 0 16px 16px;">
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #374151;">Store: 25896</span>
                <span style="color: #374151; font-weight: 500;">${new Date(receiptData.createdAt).toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #374151;">Server: NY 58/8</span>
                <span style="color: #374151;">AM</span>
              </div>
              <div style="color: #374151;">Survey code: 0000-2555-2588-4545-69</div>
            </div>
            <div style="border-top: 2px; border-style: dotted; border-color: #d1d5db; padding-top: 12px;"></div>
          </div>

          <!-- Items Table -->
          <div style="padding: 0 16px 24px;">
            <div style="margin-bottom: 12px;">
              <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 16px; text-sm; font-weight: 500; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
                <span>Name</span>
                <span style="text-align: center;">Qty</span>
                <span style="text-align: right;">Price</span>
              </div>
            </div>

            <div>
              ${receiptData.items.map(item => `
                <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 16px; text-sm; padding: 4px 0; color: #111827;">
                  <div>${item.name}</div>
                  <div style="text-align: center;">${item.quantity}</div>
                  <div style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>

            <div style="border-top: 2px; border-style: dotted; border-color: #d1d5db; padding-top: 12px; margin-top: 12px;"></div>
          </div>

          <!-- Simple Totals Section -->
          <div style="padding: 0 16px 24px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #111827;">Price</span>
                <span style="font-size: 18px; font-weight: bold; color: #111827;">$${receiptData.total.toFixed(2)}</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #111827;">CASH</span>
                <span style="font-size: 18px; font-weight: bold; color: #111827;">$100.00</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #111827;">CHANGE</span>
                <span style="font-size: 18px; font-weight: bold; color: #111827;">$${(100 - receiptData.total).toFixed(2)}</span>
              </div>

              <div style="border-top: 2px; border-style: dotted; border-color: #d1d5db; padding-top: 12px; margin-top: 12px;"></div>
            </div>
          </div>

          <!-- Simple Footer -->
          <div style="text-align: center; padding: 0 16px 24px;">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px;">THANK YOU!</h2>

              <!-- Simple Barcode -->
              <div style="background: #000000; color: white; padding: 12px; border-radius: 4px; display: inline-block;">
                <div style="display: flex; justify-content: center; gap: 2px; margin-bottom: 4px;">
                  ${Array.from({ length: 32 }, (_, i) => (
                    `<div style="width: 3px; height: 32px; background: ${Math.random() > 0.3 ? 'white' : 'black'};"></div>`
                  )).join('')}
                </div>
                <div style="font-size: 10px;">modif.ai</div>
              </div>
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
      // Create simple receipt data
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
      }

      // Generate simple receipt using visual component
      const simpleElement = simpleReceiptRef.current
      if (simpleElement) {
        await downloadElementAsPdf(
          simpleElement,
          `receipt-${targetOrder.id}.pdf`,
          { orientation: "p", format: "a4", marginMm: 8, scale: 3 }
        )

        toast({
          title: "Success",
          description: "Receipt downloaded successfully!"
        })
      } else {
        // Fallback to print function if component not available
        console.warn("Simple receipt component not available, falling back to print")
        printReceipt(targetOrder)
      }
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
            className="bg-gray-50 hover:bg-gray-100 border-gray-300"
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
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

              {/* Receipt */}
              <div className="border rounded-xl p-8 bg-gray-100 shadow-inner">
                <div className="flex justify-end mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(selectedOrder)}
                    disabled={isDownloading}
                    className="gap-2 shadow-md"
                  >
                    <Download className={`h-4 w-4 ${isDownloading ? 'animate-spin' : ''}`} />
                    <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                  </Button>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-300 shadow-lg max-h-[600px] overflow-y-auto">
                  <ReceiptCard
                    data={{
                      title: "Receipt",
                      orderId: selectedOrder.id,
                      customer: selectedOrder.customer,
                      cashierName: "System",
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
                    }}
                    variant="simple"
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
        <div ref={simpleReceiptRef}>
          <ReceiptCard
            data={{
              title: "Receipt",
              orderId: selectedOrder?.id || "",
              customer: selectedOrder?.customer || "",
              cashierName: "System",
              items: selectedOrder?.items.map((item, idx) => ({
                id: item.id || `item-${idx}`,
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })) || [],
              subtotal: selectedOrder?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0,
              total: selectedOrder?.total || 0,
              createdAt: selectedOrder?.createdAt || "",
              paymentMethod: selectedOrder?.paymentMethod as "cash" | "card" | "digital",
            }}
            variant="simple"
          />
        </div>
      </div>
    </div>
  )
}
