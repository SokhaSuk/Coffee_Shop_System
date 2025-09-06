"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { CashierDashboard } from "@/components/cashier/cashier-dashboard"

function DashboardContent() {
  const { user } = useAuth()

  if (user?.role === "admin") {
    return <AdminDashboard />
  }

  return <CashierDashboard />
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
