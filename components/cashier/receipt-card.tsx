"use client"

import * as React from "react"
import { Coffee } from "lucide-react"

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
  paymentMethod?: "cash" | "card" | "digital"
  paidAmount?: number
  changeAmount?: number
  // Customer Copy enhancements
  loyaltyPoints?: number
  loyaltyMessage?: string
  qrCodeUrl?: string
  // Merchant Copy enhancements
  authorizationCode?: string
  maskedCardNumber?: string
  cardType?: string
  requiresSignature?: boolean
  internalNotes?: string
  registerNumber?: string
  shiftId?: string
  transactionReference?: string
}

export const ReceiptCard = React.forwardRef<HTMLDivElement, { data: ReceiptData; className?: string; variant?: "merchant" | "customer" | "simple" }>(
  ({ data, className, variant = "simple" }, ref) => {
    const date = new Date(data.createdAt)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    const isCustomer = variant === "customer"
    const isSimple = variant === "simple"

    return (
      <div
        ref={ref}
        className={
          "receipt-container print-content bg-white text-black font-sans leading-relaxed print:shadow-none print:border-none w-full max-w-sm mx-auto shadow-lg rounded-xl border border-gray-200 overflow-hidden " +
          (className || "")
        }
      >
        {/* Modern Header */}
        <div className="receipt-header text-center py-6 px-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="h-6 w-6 text-amber-700" />
            <h1 className="font-bold text-2xl tracking-tight text-gray-900">DARK COFFEE</h1>
          </div>
          <p className="text-xs text-gray-600 mb-1">Premium Coffee Experience</p>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>123 Coffee Street, Downtown</div>
            <div>Tel: (555) 123-4567</div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Order:</span>
              <span className="ml-1 font-semibold text-gray-900">{data.orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Date:</span>
              <span className="ml-1 font-medium text-gray-900">{dateStr}</span>
            </div>
            <div>
              <span className="text-gray-500">Cashier:</span>
              <span className="ml-1 font-medium text-gray-900">{data.cashierName}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Time:</span>
              <span className="ml-1 font-medium text-gray-900">{timeStr}</span>
            </div>
          </div>
          {data.customer && data.customer !== "Walk-in Customer" && (
            <div className="mt-2 text-xs">
              <span className="text-gray-500">Customer:</span>
              <span className="ml-1 font-medium text-gray-900">{data.customer}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <div className="space-y-3">
            {data.items.map((item) => {
              const lineTotal = item.quantity * item.price
              return (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm font-mono whitespace-nowrap">
                    ${lineTotal.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t-2 border-dashed border-gray-300">
          <div className="space-y-2">
            {/* Subtotal */}
            {data.discountAmount && data.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-mono text-gray-900">${data.subtotal.toFixed(2)}</span>
              </div>
            )}

            {/* Discount */}
            {data.discountAmount && data.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">
                  Discount {data.discountLabel && `(${data.discountLabel})`}
                </span>
                <span className="font-mono text-green-600">-${data.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">TOTAL</span>
              <span className="text-xl font-bold text-gray-900 font-mono">${data.total.toFixed(2)}</span>
            </div>

            {/* Payment Details */}
            {data.paymentMethod === 'cash' && data.paidAmount !== undefined && (
              <>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Cash Received</span>
                  <span className="font-mono text-gray-900">${data.paidAmount.toFixed(2)}</span>
                </div>
                {data.changeAmount !== undefined && data.changeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Change</span>
                    <span className="font-mono text-gray-900">${data.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {(data.paymentMethod === 'card' || data.paymentMethod === 'digital') && (
              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 uppercase">{data.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-gradient-to-b from-amber-50 to-white border-t border-gray-200 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-xs text-gray-600 mb-3">We appreciate your business</p>

          {/* Barcode */}
          <div className="inline-block bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
            <div className="flex justify-center gap-px mb-2">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="w-0.5"
                  style={{
                    height: `${Math.random() > 0.5 ? '24px' : '16px'}`,
                    backgroundColor: '#000'
                  }}
                />
              ))}
            </div>
            <div className="text-[10px] font-mono text-gray-700">{data.orderId}</div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Visit us again soon!</p>
            <p className="mt-1">www.darkcoffee.com</p>
          </div>
        </div>
      </div>
    )
  }
)

ReceiptCard.displayName = "ReceiptCard"

