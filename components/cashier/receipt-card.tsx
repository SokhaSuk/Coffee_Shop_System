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
        
        {/* Enhanced Payment Information */}
        <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-amber-600" />
              <span className="font-medium">Payment Method:</span>
            </div>
            <span className="capitalize font-semibold">{data.paymentMethod}</span>
          </div>

          {/* Card Payment Details - Merchant Copy Only */}
          {!isCustomer && data.paymentMethod === "card" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="space-y-2 text-sm">
                {data.cardType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Type:</span>
                    <span className="font-semibold text-blue-600">{data.cardType}</span>
                  </div>
                )}
                {data.maskedCardNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Number:</span>
                    <span className="font-mono font-semibold">{data.maskedCardNumber}</span>
                  </div>
                )}
                {data.authorizationCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Code:</span>
                    <span className="font-mono font-bold text-green-600">{data.authorizationCode}</span>
                  </div>
                )}
                {data.transactionReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-gray-700">{data.transactionReference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cash Payment Details */}
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

          {/* Digital Payment Details */}
          {data.paymentMethod === "digital" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Digital Wallet:</span>
                  <span className="font-semibold text-purple-600">Mobile Payment</span>
                </div>
                {data.transactionReference && (
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-gray-700">{data.transactionReference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature Line - Merchant Copy Only */}
          {!isCustomer && data.paymentMethod === "card" && data.requiresSignature && (
            <div className="mt-3 pt-3 border-t border-dotted border-gray-400">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">Customer Signature:</span>
              </div>
              <div className="border-b border-gray-400 w-full mb-2">
                <div className="h-8 bg-gray-50"></div>
              </div>
              <div className="text-xs text-gray-500">I agree to pay the above amount according to card issuer agreement</div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer Section */}
      <div className="receipt-footer border-t border-dashed border-gray-400 pt-4 text-center">
        {isCustomer ? (
          <>
            {/* Customer Thank You Section */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-lg font-bold text-gray-800 mb-2">Thank you for visiting!</p>
                <p className="text-sm text-gray-600 mb-1">We appreciate your business</p>
                <p className="text-sm text-amber-700 font-medium">Follow us: @DaCoffee | www.dacoffee.com</p>
              </div>

              {/* Loyalty Points Section */}
              {data.loyaltyPoints !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-800">Loyalty Points Earned!</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-green-600">+{data.loyaltyPoints}</span>
                    <span className="text-sm text-green-700">points</span>
                  </div>
                  {data.loyaltyMessage && (
                    <p className="text-xs text-green-600 mt-1">{data.loyaltyMessage}</p>
                  )}
                </div>
              )}

              {/* Enhanced QR Code for feedback */}
              {data.qrCodeUrl && (
                <div className="mb-3 flex justify-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    </div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Scan for Feedback</p>
                    <p className="text-xs text-blue-600">Rate your experience</p>
                  </div>
                </div>
              )}

              {/* Return Policy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  <strong>Return Policy:</strong> Items may be returned within 30 days with receipt
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 pt-2">
              <p className="font-medium">Customer Copy - Please keep your receipt</p>
              <p>Receipt #{data.orderId}</p>
              <p>Generated: {dateStr} at {timeStr}</p>
            </div>
          </>
        ) : (
          <>
            {/* Merchant Header */}
            <div className="mb-4 space-y-2">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-800">MERCHANT COPY</p>
                <p className="text-sm text-gray-600">Keep for business records</p>
              </div>
            </div>

            {/* Internal Notes Section */}
            {(data.internalNotes || data.registerNumber || data.shiftId) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Internal Notes:</span>
                  </div>
                  {data.registerNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Register:</span>
                      <span className="font-semibold text-gray-800">#{data.registerNumber}</span>
                    </div>
                  )}
                  {data.shiftId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shift ID:</span>
                      <span className="font-semibold text-gray-800">{data.shiftId}</span>
                    </div>
                  )}
                  {data.internalNotes && (
                    <div className="mt-2 pt-2 border-t border-yellow-300">
                      <p className="text-xs text-gray-700 italic">Note: {data.internalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-bold text-blue-800">{data.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cashier:</span>
                  <span className="font-semibold text-blue-800">{data.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-semibold text-blue-800">{dateStr} {timeStr}</span>
                </div>
              </div>
            </div>

            {/* For Internal Use Only */}
            <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 pt-2">
              <p className="font-bold text-gray-600">FOR INTERNAL USE ONLY</p>
              <p>This receipt is for accounting and tracking purposes</p>
              <p>Keep in secure location for audit purposes</p>
            </div>
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


