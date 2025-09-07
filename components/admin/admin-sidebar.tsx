"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, Users, Settings, Coffee, LogOut, Menu, X, ShoppingCart, TrendingUp } from "lucide-react"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logoutWithConfirmation } = useAuth()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: Package },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleSectionChange = useCallback(
    (section: string) => {
      onSectionChange(section)
      setIsOpen(false)
    },
    [onSectionChange],
  )

  const handleOverlayClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-[60] bg-background/80 backdrop-blur-sm border-coffee-200 hover:bg-coffee-50"
        onClick={handleToggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-coffee-50 border-r border-coffee-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0 md:z-auto
      `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-coffee-200 bg-coffee-100">
            <div className="flex items-center gap-3">
              <div className="bg-coffee-600 rounded-full p-2">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-coffee-900">DARK COFFEE</h1>
                <p className="text-sm text-coffee-700">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start transition-colors ${
                    activeSection === item.id
                      ? "bg-coffee-600 text-white hover:bg-coffee-700"
                      : "text-coffee-800 hover:bg-coffee-200 hover:text-coffee-900"
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-coffee-200 bg-coffee-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-coffee-600/20 rounded-full p-2">
                <Users className="h-4 w-4 text-coffee-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-coffee-900">{user?.name}</p>
                <p className="text-xs text-coffee-700 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-coffee-300 text-coffee-800 hover:bg-coffee-200 bg-transparent"
              onClick={async () => {
                await logoutWithConfirmation()
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={handleOverlayClick} aria-hidden="true" />
      )}
    </>
  )
}
