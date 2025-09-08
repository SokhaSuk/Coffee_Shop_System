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
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-[60] rounded-md bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-[var(--surface-elevation-1)]"
        onClick={handleToggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-[var(--surface-elevation-1)] transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0 md:z-auto
      `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <div className="flex items-center gap-3">
              <div className="bg-sidebar-primary rounded-full p-2">
                <Coffee className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">DARK COFFEE</h1>
                <p className="text-sm opacity-90">Admin Panel</p>
              </div>
              {/* Mobile logout button in header */}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto md:hidden"
                onClick={async () => {
                  await logoutWithConfirmation()
                  setIsOpen(false)
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start transition-colors relative rounded-md ${
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 mr-3 opacity-90" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-sidebar-primary/20 rounded-full p-2">
                <Users className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs opacity-90 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex w-full border border-sidebar-border/60 text-sidebar-foreground hover:bg-sidebar-accent/60 bg-transparent"
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
