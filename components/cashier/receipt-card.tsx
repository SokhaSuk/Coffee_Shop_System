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
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const dateStr = `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })


  const isCustomer = variant === "customer"
  const isSimple = variant === "simple"

  return (
    <div
      ref={ref}
      className={
        "receipt-container bg-white text-black font-sans text-sm leading-relaxed print:shadow-none print:border-none w-full max-w-sm mx-auto break-words shadow-lg rounded-lg border border-gray-300 bg-white " +
        (className || "")
      }
    >
      {/* Simple Header Section */}
      <div className="receipt-header text-center mb-5 print:mb-3 p-5 bg-gray-50">
        {/* Business Logo and Name */}
        <div className="mb-4">
          <h1 className="font-bold text-3xl tracking-wide text-gray-800 mb-3">Coffee-Shop</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Lorem ipsum 258</div>
            <div>City Index - 02025</div>
            <div>Tel.: +456-468-987-02</div>
          </div>
        </div>
        <div className="border-t-2 border-dotted border-gray-400 pt-3"></div>
      </div>

      {/* Store and Transaction Info */}
      <div className="receipt-details px-5 py-4 mb-5 bg-gray-50">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Store: 25896</span>
            <span className="text-gray-700 font-semibold">{dateStr} {timeStr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Server: NY 58/8</span>
            <span className="text-gray-700 font-medium">AM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Survey code: 0000-2555-2588-4545-69</span>
          </div>
        </div>
        <div className="border-t-2 border-dotted border-gray-400 pt-4 mt-4"></div>
      </div>

      {/* Items Table */}
      <div className="receipt-items mb-6 px-5">
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-6 text-sm font-bold text-gray-800 border-b-2 border-gray-400 pb-3">
            <span>Name</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
          </div>
        </div>

        <div className="space-y-3">
          {data.items.map((item, index) => {
            const lineTotal = item.quantity * item.price
            return (
              <div key={item.id} className="grid grid-cols-3 gap-6 text-sm py-2">
                <div className="text-gray-800 font-medium">
                  {isSimple ? `Lorem ipsum${index === 1 ? ' dolor sit' : ''}` : item.name}
                </div>
                <div className="text-center text-gray-800 font-medium">{item.quantity}</div>
                <div className="text-right text-gray-800 font-medium">${lineTotal.toFixed(2)}</div>
              </div>
            )
          })}
        </div>

        <div className="border-t-2 border-dotted border-gray-400 pt-4 mt-4"></div>
      </div>

      {/* Simple Totals Section */}
      <div className="receipt-totals px-5 py-5 mb-6 bg-gray-50">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <span className="text-xl font-bold text-gray-800">Price</span>
            <span className="text-xl font-bold text-gray-800">${data.total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-xl font-bold text-gray-800">CASH</span>
            <span className="text-xl font-bold text-gray-800">$100.00</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-xl font-bold text-gray-800">CHANGE</span>
            <span className="text-xl font-bold text-gray-800">${(100 - data.total).toFixed(2)}</span>
          </div>

          <div className="border-t-2 border-dotted border-gray-400 pt-4 mt-4"></div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="receipt-footer text-center px-5 py-8 bg-gray-50">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">THANK YOU!</h2>

          {/* Simple Barcode */}
          <div className="bg-black text-white p-4 rounded-lg inline-block shadow-md">
            <div className="flex justify-center space-x-1 mb-2">
              {Array.from({ length: 32 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 h-10 ${
                    Math.random() > 0.3 ? 'bg-white' : 'bg-black'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-medium">modif.ai</div>
          </div>
        </div>
      </div>
    </div>
  )
}
)

ReceiptCard.displayName = "ReceiptCard"


