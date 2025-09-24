"use client"

import * as React from "react"
import { Coffee, MapPin, Phone, Mail, Clock, User, CreditCard, Award } from "lucide-react"

type ReceiptItem = {
  id: string
  name: string
  quantity: number
  price: number
}

export type ReceiptData = {
  title: string
  orderId: string
  customer: string
  cashierName: string
  items: ReceiptItem[]
  subtotal: number
  discountAmount?: number
  discountLabel?: string
  total: number
  createdAt: string
  paymentMethod?: "cash" | "card"
  paidAmount?: number
  changeAmount?: number
}

export const ReceiptCard = React.forwardRef<HTMLDivElement, { data: ReceiptData; className?: string; variant?: "merchant" | "customer" }>(
  ({ data, className, variant = "customer" }, ref) => {
  const date = new Date(data.createdAt)
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const dateStr = `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })


  const isCustomer = variant === "customer"

  return (
    <div
      ref={ref}
      className={
        "receipt-container bg-white text-black font-mono text-sm leading-relaxed print:shadow-none print:border-none w-full max-w-md mx-auto break-words shadow-lg rounded-lg border " +
        (className || "")
      }
    >
      {/* Header Section */}
      <div className="receipt-header text-center mb-6 print:mb-3 p-4">
        {/* Business Logo and Name */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-wide text-gray-800">DaCoffee Shop</h1>
              <div className="text-xs text-amber-600 font-semibold tracking-wider">Premium Coffee Experience</div>
            </div>
          </div>
          {data.title && (
            <div className="bg-amber-50 px-4 py-2 rounded-full inline-block border border-amber-200">
              <span className="text-sm uppercase tracking-wider text-amber-800 font-bold">{data.title}</span>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3 text-amber-600" />
              <span className="font-medium">#12 Street 123, Phnom Penh, Cambodia</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Phone className="w-3 h-3 text-amber-600" />
              <span className="font-medium">+855 12-345-678</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Mail className="w-3 h-3 text-amber-600" />
              <span className="font-medium">info@dacoffee.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Details Section */}
      <div className="receipt-details bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 my-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <span>Receipt No:</span>
            </span>
            <span className="font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border shadow-sm">{data.orderId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Date & Time:</span>
            </span>
            <span className="font-semibold text-gray-800">{dateStr} {timeStr}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <User className="w-3 h-3 text-amber-600" />
              <span>Cashier:</span>
            </span>
            <span className="font-semibold text-gray-800 capitalize">{data.cashierName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <Coffee className="w-3 h-3 text-amber-600" />
              <span>Customer:</span>
            </span>
            <span className="font-semibold text-gray-800 capitalize">{data.customer}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="receipt-items mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600" />
              Order Items
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {data.items.length} item{data.items.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {data.items.map((item, index) => {
              const lineTotal = item.quantity * item.price
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-600">${item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-1 bg-white rounded border">
                      <div className="text-sm font-bold">{item.quantity}x</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Totals Section */}
      <div className="receipt-totals bg-gradient-to-br from-gray-50 to-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Subtotal:</span>
            <span className="font-semibold">${data.subtotal.toFixed(2)}</span>
          </div>

          {typeof data.discountAmount === "number" && data.discountAmount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
              <span className="font-medium">
                Discount{data.discountLabel ? ` (${data.discountLabel})` : ""}:
              </span>
              <span className="font-bold">- ${data.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-amber-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">TOTAL:</span>
              <span className="text-2xl font-bold text-amber-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                ${data.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">Payment Method:</span>
            </div>
            <span className="capitalize font-semibold">{data.paymentMethod}</span>
          </div>
          
          {data.paymentMethod === "cash" && typeof data.paidAmount === "number" && (
            <>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-mono">${data.paidAmount.toFixed(2)}</span>
              </div>
              {typeof data.changeAmount === "number" && data.changeAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Change:</span>
                  <span className="font-mono">${data.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="receipt-footer border-t border-dashed border-gray-400 pt-4 text-center">
        {isCustomer ? (
          <>
            <div className="mb-4">
              <p className="text-base font-medium text-gray-800 mb-2">Thank you for visiting!</p>
              <p className="text-xs text-gray-600 mb-1">We appreciate your business</p>
              <p className="text-xs text-gray-600">Follow us: @DaCoffee | www.dacoffee.com</p>
            </div>
            
            {/* QR Code for customer feedback or loyalty program */}
            <div className="mb-3 flex justify-center print:mb-2">
              <div className="bg-gray-100 p-2 rounded print:p-1">
                <p className="text-xs text-gray-600 mt-1 print:text-[8px] print:mt-0">Visit: www.dacoffee.com for feedback</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Customer Copy - Please keep your receipt</p>
              <p>Receipt #{data.orderId}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 space-y-2">
              <p className="text-sm font-bold text-gray-800">MERCHANT COPY</p>
              <p className="text-xs text-gray-600">Keep for business records</p>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>For internal use only</p>
              <p>Transaction ID: {data.orderId}</p>
              <p>Generated: {dateStr} at {timeStr}</p>
            </div>
            
            {/* Merchant tax info removed */}
          </>
        )}
        
        {/* Print-only cut line */}
        <div className="mt-4 print:block hidden">
          <div className="text-center text-xs text-gray-400 border-t border-dashed border-gray-300 pt-2">
            ——————— cut here ———————
          </div>
        </div>
      </div>
    </div>
  )
}
)

ReceiptCard.displayName = "ReceiptCard"


