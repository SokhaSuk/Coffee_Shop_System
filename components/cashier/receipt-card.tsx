"use client"

import * as React from "react"

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
  tax: number
  total: number
  createdAt: string
}

export function ReceiptCard({ data, className, variant = "customer" }: { data: ReceiptData; className?: string; variant?: "merchant" | "customer" }) {
  const date = new Date(data.createdAt)
  return (
    <div
      className={
        "surface-elevated rounded-lg p-3 md:p-4 text-[11px] md:text-sm font-mono leading-6 text-foreground bg-card print:bg-white print:border print:border-black print:shadow-none w-full max-w-full md:max-w-sm mx-auto break-words " +
        (className || "")
      }
    >
      <div className="text-center">
        <p className="text-xs tracking-widest">DARK COFFEE</p>
        <h3 className="font-semibold">{data.title}</h3>
        <p className="text-xs text-muted-foreground">Order #{data.orderId}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-1 text-[10px] md:text-xs">
        <span className="text-muted-foreground">Date</span>
        <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span className="text-muted-foreground">Cashier</span>
        <span className="capitalize">{data.cashierName}</span>
        <span className="text-muted-foreground">Customer</span>
        <span>{data.customer}</span>
      </div>

      <div className="my-3 border-t border-dashed" />

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 md:gap-x-4 gap-y-1">
        <span className="text-[10px] md:text-xs text-muted-foreground">Item</span>
        <span className="text-[10px] md:text-xs text-muted-foreground justify-self-end">Qty</span>
        <span className="text-[10px] md:text-xs text-muted-foreground justify-self-end">Amount</span>
        {data.items.map((it) => (
          <React.Fragment key={it.id}>
            <span className="truncate">{it.name}</span>
            <span className="justify-self-end">{it.quantity}</span>
            <span className="justify-self-end">${(it.price * it.quantity).toFixed(2)}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="my-3 border-t border-dashed" />

      <div className="grid grid-cols-2 gap-y-1">
        <span className="justify-self-start">Subtotal</span>
        <span className="justify-self-end">${data.subtotal.toFixed(2)}</span>
        {typeof data.discountAmount === "number" && data.discountAmount > 0 && (
          <>
            <span className="justify-self-start">Discount{data.discountLabel ? ` (${data.discountLabel})` : ""}</span>
            <span className="justify-self-end">- ${data.discountAmount.toFixed(2)}</span>
          </>
        )}
        <span className="justify-self-start">Tax</span>
        <span className="justify-self-end">${data.tax.toFixed(2)}</span>
        <span className="justify-self-start font-semibold">Total</span>
        <span className="justify-self-end font-semibold">${data.total.toFixed(2)}</span>
      </div>

      <div className="mt-3 border-t border-dashed" />

      <p className="mt-2 text-center text-[10px] md:text-xs">Thank you for your purchase!</p>
      {variant === "merchant" ? (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">Merchant copy · Keep for records</p>
      ) : (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">Customer copy · Please keep your receipt</p>
      )}
    </div>
  )
}


