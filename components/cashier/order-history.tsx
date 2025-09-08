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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Order History</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilterType)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="transition-all hover:shadow-lg hover:-translate-y-0.5 border border-coffee-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span>{order.customer}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(order.createdAt)} - {formatDate(order.createdAt)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                    {order.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {order.status === "preparing" && <Clock className="h-3 w-3 mr-1" />}
                    {order.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {order.status}
                  </Badge>
                  <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {order.paymentMethod}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
