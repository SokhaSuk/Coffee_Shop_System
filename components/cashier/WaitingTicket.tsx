"use client"

import * as React from "react"

type WaitingTicketProps = {
  shopName?: string
  orderId: string
  createdAt?: string
}

export const WaitingTicket = React.forwardRef<HTMLDivElement, WaitingTicketProps>(
  ({ shopName = "DaCoffee Shop", orderId, createdAt }, ref) => {
    const match = orderId.match(/(\d+)/)
    const queue = match ? match[1].padStart(3, "0") : orderId
    const timeStr = createdAt
      ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className="bg-white text-black p-6 w-[320px] mx-auto">
        <div className="text-center">
          <div className="text-lg font-bold">{shopName}</div>
          <div className="text-xs text-gray-500 mt-1">Customer Waiting Ticket</div>
          <div className="border-t border-dashed my-3"></div>
          <div className="font-mono text-7xl font-extrabold tracking-wider leading-none">{queue}</div>
          <div className="text-sm text-gray-600 mt-2">Order {orderId}</div>
          <div className="text-xs text-gray-500">{timeStr}</div>
          <div className="border-t border-dashed my-3"></div>
          <div className="text-xs">Please keep this ticket and wait for your number.</div>
        </div>
      </div>
    )
  },
)

WaitingTicket.displayName = "WaitingTicket"


