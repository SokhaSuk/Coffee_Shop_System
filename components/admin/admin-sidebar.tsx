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
        fixed inset-y-0 left-0 z-50 w-60 sm:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-[var(--surface-elevation-1)] transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0 md:z-auto
      `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-sidebar-border bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-sidebar-primary rounded-full p-3 flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <Coffee className="h-6 w-6 sm:h-7 sm:w-7 text-sidebar-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate bg-gradient-to-r from-sidebar-accent-foreground to-sidebar-accent-foreground/80 bg-clip-text">DARK COFFEE</h1>
                <p className="text-xs sm:text-sm opacity-90 font-medium">Admin Panel</p>
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
          <nav className="flex-1 p-2 sm:p-3 overflow-y-auto">
            <div className="space-y-1 sm:space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 relative rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base group ${
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground hover:shadow-sm"
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 mr-3 sm:mr-4 transition-all duration-200 flex-shrink-0 ${
                    activeSection === item.id
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground group-hover:scale-110"
                  }`} />
                  <span className="truncate font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-3 sm:p-4 border-t border-sidebar-border bg-gradient-to-tr from-sidebar-accent to-sidebar-accent/90 text-sidebar-accent-foreground">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="bg-sidebar-primary/20 rounded-full p-2 sm:p-3 flex-shrink-0 ring-2 ring-sidebar-primary/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold truncate">{user?.name}</p>
                <p className="text-xs sm:text-sm opacity-90 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex w-full border border-sidebar-border/60 text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base transition-all duration-200 hover:shadow-md"
              onClick={async () => {
                await logoutWithConfirmation()
              }}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 transition-transform duration-200 group-hover:translate-x-1" />
              <span className="font-medium">Logout</span>
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
