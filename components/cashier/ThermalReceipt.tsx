"use client"

import * as React from "react"

type ThermalReceiptItem = {
  name: string
  quantity: number
  price: number
}

type ThermalReceiptProps = {
  orderId: string
  customer: string
  items: ThermalReceiptItem[]
  subtotal: number
  discountLabel?: string
  discountAmount?: number
  total: number
  createdAt: string
  paymentMethod?: string
  paidAmount?: number
  changeAmount?: number
}

export const ThermalReceipt = React.forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ orderId, customer, items, subtotal, discountLabel, discountAmount, total, createdAt, paymentMethod, paidAmount, changeAmount }, ref) => {
    const dateTime = new Date(createdAt)
    const dateStr = dateTime.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
    const timeStr = dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="thermal-receipt print-receipt"
        style={{
          width: '80mm',
          maxWidth: '80mm',
          minWidth: '80mm',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          lineHeight: '1.2',
          color: '#000000',
          backgroundColor: '#ffffff',
          padding: '8px',
          margin: '0',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px' }}>☕</span>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>DarkCoffee Shop</h1>
          </div>
          <div style={{ fontSize: '10px', color: '#000000' }}>Premium Coffee Experience</div>
        </div>

        {/* Business Info */}
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '10px' }}>
          <div style={{ borderBottom: '1px dashed #000000', paddingBottom: '4px', marginBottom: '4px' }}>
            <div style={{ marginBottom: '2px' }}>
              <span>📍 #12 Street 123, Phnom Penh</span>
            </div>
            <div style={{ marginBottom: '2px' }}>
              <span>📞 +855 12-345-678</span>
            </div>
            <div>
              <span>✉️ info@darkcoffee.com</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
          <div style={{ borderBottom: '1px dashed #000000', paddingBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Receipt No:</span>
              <span style={{ fontWeight: 'bold' }}>{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Date:</span>
              <span>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Time:</span>
              <span>{timeStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer:</span>
              <span>{customer}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              ----------------------
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              ORDER ITEMS
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              ----------------------
            </div>
            <div>
              {items.map((item, index) => (
                <div key={index} style={{ marginBottom: '2px', paddingBottom: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>{item.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '4px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '9px', color: '#000000' }}>
                        {item.quantity}x${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
          <div style={{ borderTop: '1px dashed #000000', paddingTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>${subtotal.toFixed(2)}</span>
            </div>

            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Discount{discountLabel ? ` (${discountLabel})` : ""}:</span>
                <span style={{ fontWeight: 'bold', color: '#000000' }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid #000000', paddingTop: '2px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>TOTAL:</span>
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {paymentMethod && (
          <div style={{ marginBottom: '8px', fontSize: '10px' }}>
            <div style={{ borderTop: '1px dashed #000000', paddingTop: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>💳 Payment Details</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Method:</span>
                <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{paymentMethod}</span>
              </div>

              {paymentMethod === "cash" && typeof paidAmount === "number" && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Paid:</span>
                    <span>${paidAmount.toFixed(2)}</span>
                  </div>
                  {typeof changeAmount === "number" && changeAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Change:</span>
                      <span style={{ fontWeight: 'bold' }}>${changeAmount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '10px',
          borderTop: '1px dashed #000000',
          paddingTop: '4px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Thank you for visiting!</div>
            <div>We appreciate your business</div>
            <div style={{ marginTop: '2px' }}>Follow us: @DarkCoffee</div>
          </div>

          <div style={{ borderTop: '1px solid #000000', paddingTop: '2px' }}>
            <div>Receipt #{orderId}</div>
            <div>Generated: {dateStr} {timeStr}</div>
          </div>
        </div>
      </div>
    )
  },
)

ThermalReceipt.displayName = "ThermalReceipt"
