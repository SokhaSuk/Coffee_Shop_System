"use client"

import * as React from "react"
import { Coffee, MapPin, Phone, Mail, Clock, User } from "lucide-react"

type MerchantReceiptItem = {
  name: string
  quantity: number
  price: number
}

type MerchantReceiptProps = {
  orderId: string
  customer: string
  cashierName: string
  items: MerchantReceiptItem[]
  subtotal: number
  discountLabel?: string
  discountAmount?: number
  total: number
  createdAt: string
  paymentMethod?: string
  paidAmount?: number
  changeAmount?: number
}

export const MerchantReceipt = React.forwardRef<HTMLDivElement, MerchantReceiptProps>(
  ({ orderId, customer, cashierName, items, subtotal, discountLabel, discountAmount, total, createdAt, paymentMethod, paidAmount, changeAmount }, ref) => {
    const dateTime = new Date(createdAt)
    const dateStr = dateTime.toLocaleDateString()
    const timeStr = dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className="bg-white text-black p-6 w-[400px] mx-auto font-mono text-sm shadow-lg rounded-lg border">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">DaCoffee Shop</h1>
              <div className="text-xs text-amber-600 font-medium tracking-wide">Premium Coffee Experience</div>
            </div>
          </div>
          <div className="bg-amber-50 px-3 py-1 rounded-full inline-block">
            <span className="text-xs text-amber-800 font-bold">MERCHANT COPY</span>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>#12 Street 123, Phnom Penh, Cambodia</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              <span>+855 12-345-678</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Mail className="w-3 h-3" />
              <span>info@dacoffee.com</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <span>Receipt No:</span>
              </span>
              <span className="text-sm font-bold text-gray-800 bg-white px-2 py-1 rounded border">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Date & Time:</span>
              </span>
              <span className="text-sm font-semibold text-gray-800">{dateStr} {timeStr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Cashier:</span>
              </span>
              <span className="text-sm font-semibold text-gray-800 capitalize">{cashierName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                <span>Customer:</span>
              </span>
              <span className="text-sm font-semibold text-gray-800 capitalize">{customer}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                Order Items
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-600">${item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-1 bg-white rounded border">
                      <div className="text-sm font-bold">{item.quantity}x</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gradient-to-br from-gray-50 to-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 font-medium">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div className="flex justify-between items-center py-2 text-green-700 bg-green-50 px-3 py-2 rounded">
                <span className="font-medium">
                  Discount{discountLabel ? ` (${discountLabel})` : ""}:
                </span>
                <span className="font-bold">- ${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-amber-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">TOTAL:</span>
                <span className="text-2xl font-bold text-amber-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {paymentMethod && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-gray-800">Payment Information</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Payment Method:</span>
                <span className="capitalize font-bold text-blue-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {paymentMethod}
                </span>
              </div>

              {paymentMethod === "cash" && typeof paidAmount === "number" && (
                <>
                  <div className="flex justify-between items-center py-2 border-t border-blue-200 pt-3">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">${paidAmount.toFixed(2)}</span>
                  </div>
                  {typeof changeAmount === "number" && changeAmount > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg border border-green-200">
                      <span className="text-green-800 font-medium">Change:</span>
                      <span className="font-bold text-green-600">${changeAmount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-lg p-6 text-center shadow-lg">
          <div className="mb-4">
            <p className="text-base font-bold mb-2">MERCHANT COPY</p>
            <p className="text-sm text-gray-300 mb-1">Keep for business records</p>
            <p className="text-sm text-gray-300">For internal use only</p>
          </div>

          <div className="border-t border-gray-600 pt-3 space-y-2">
            <div className="bg-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
              <p className="text-sm font-medium">Transaction ID: {orderId}</p>
              <p className="text-xs text-gray-300 mt-1">Generated: {dateStr} at {timeStr}</p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Thank you for your service!</p>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="mt-4 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-full"></div>
      </div>
    )
  },
)

MerchantReceipt.displayName = "MerchantReceipt"
