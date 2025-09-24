"use client"

import * as React from "react"

type OrderReportItem = {
  name: string
  quantity: number
  price: number
}

type OrderReportProps = {
  orderId: string
  customer: string
  cashierName: string
  items: OrderReportItem[]
  subtotal: number
  discountLabel?: string
  discountAmount?: number
  total: number
  createdAt: string
  paymentMethod?: string
}

export const OrderReport = React.forwardRef<HTMLDivElement, OrderReportProps>(
  ({ orderId, customer, cashierName, items, subtotal, discountLabel, discountAmount, total, createdAt, paymentMethod }, ref) => {
    const dateTime = new Date(createdAt)
    const dateStr = dateTime.toLocaleDateString()
    const timeStr = dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className="bg-white text-black p-8 max-w-2xl mx-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order Report</h1>
            <p className="text-sm text-gray-600">DaCoffee Shop</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-semibold">{orderId}</div>
            <div className="text-sm text-gray-600">{dateStr} {timeStr}</div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-600">Customer:</span>
            <span className="ml-2 font-medium">{customer}</span>
          </div>
          <div>
            <span className="text-gray-600">Cashier:</span>
            <span className="ml-2 font-medium">{cashierName}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Item</th>
                <th className="text-center p-3 text-sm font-medium text-gray-700">Qty</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-center font-mono">{item.quantity}x</td>
                  <td className="p-3 text-right font-mono">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-gray-300 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            
            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount{discountLabel ? ` (${discountLabel})` : ""}:</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {paymentMethod && (
          <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
            <div className="text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="ml-2 font-medium capitalize">{paymentMethod}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Generated on {dateStr} at {timeStr}</p>
          <p>DaCoffee Shop - Order Management System</p>
        </div>
      </div>
    )
  },
)

OrderReport.displayName = "OrderReport"