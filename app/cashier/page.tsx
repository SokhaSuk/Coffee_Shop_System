"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { CashierDashboard } from "@/components/cashier/cashier-dashboard"

export default function CashierPage() {
  return (
    <ProtectedRoute allowedRoles={["cashier"]}>
      <CashierDashboard />
    </ProtectedRoute>
  )
}
