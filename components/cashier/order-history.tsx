"use client"

import { useMemo, useState } from "react"
import { useOrders, type Order, type DateFilterType } from "@/lib/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Eye, Receipt, DollarSign, CheckCircle, AlertCircle } from "lucide-react"

export function OrderHistory() {
  const { orders, getOrdersByDateFilter } = useOrders()
  const { cancelOrder, createAdjustment } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilterType>("day")

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order History</h2>
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
                      <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={() => {
                          const details = order.items
                            .map((i) => `${i.quantity}x ${i.name} - $${(i.quantity * i.price).toFixed(2)}`)
                            .join("\n")
                          const receipt = `Receipt for ${order.id}\n${details}\nTotal: $${order.total.toFixed(2)}`
                          try {
                            navigator.clipboard.writeText(receipt)
                          } catch {}
                          alert(`Receipt copied to clipboard for ${order.id}`)
                        }}
                        aria-label={`Copy receipt for ${order.id}`}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                      {/* Correction actions */}
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={() => {
                          localStorage.setItem(
                            "darkCoffeeDraftOrder",
                            JSON.stringify({ customer: order.customer, items: order.items })
                          )
                          alert("Draft loaded into POS. Open POS tab to edit and reprocess.")
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
                              alert(`Adjustment order ${id} created for $${amount.toFixed(2)}`)
                            }
                          }}
                        >
                          Refund/Adjust
                        </Button>
                      )}
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

      {/* Order Detail Modal would go here */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Customer: {selectedOrder.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(selectedOrder.createdAt)} - {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">Items:</p>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
