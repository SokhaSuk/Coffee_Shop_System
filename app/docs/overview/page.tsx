"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

type Item = { name: string; description: string }
type Section = { title: string; items: Item[] }

const sections: Section[] = [
  {
    title: "App (routing and providers)",
    items: [
      {
        name: "app/layout.tsx",
        description:
          "Root layout that loads Geist fonts, global styles, and wraps the app with AuthProvider, ProductProvider, and OrderProvider.",
      },
      {
        name: "app/page.tsx",
        description:
          "Home route using ProtectedRoute; renders AdminDashboard or CashierDashboard based on the authenticated user's role.",
      },
    ],
  },
  {
    title: "Lib (global state/contexts)",
    items: [
      {
        name: "lib/auth-context.tsx",
        description:
          "Authentication context with demo users. Exposes login, logout, logoutWithConfirmation, and user CRUD helpers.",
      },
      {
        name: "lib/product-context.tsx",
        description:
          "Products and categories context. Exposes add/update/delete product & category, stock updates, and discount utilities.",
      },
      {
        name: "lib/order-context.tsx",
        description:
          "Orders context with create/update/cancel, getOrderById, createAdjustment (refunds), and date-scoped stats/revenue/filtering helpers.",
      },
      { name: "lib/utils.ts", description: "cn() helper combining clsx with tailwind-merge for class names." },
    ],
  },
  {
    title: "Components – Admin",
    items: [
      { name: "components/admin/admin-dashboard.tsx", description: "Admin shell with sidebar; switches dashboard, orders, products, analytics, users, settings." },
      { name: "components/admin/admin-sidebar.tsx", description: "Admin sidebar with mobile toggle, role display, and logout action." },
      { name: "components/admin/dashboard-overview.tsx", description: "Static KPIs, recent orders, and top products overview." },
      { name: "components/admin/order-management.tsx", description: "Search/filter orders, update status, cancel, and view details with scoped metrics." },
      { name: "components/admin/product-management.tsx", description: "Scaffold for product/category management; handlers implemented, UI markup pending." },
      { name: "components/admin/user-management.tsx", description: "User CRUD with validation and toasts." },
    ],
  },
  {
    title: "Components – Cashier",
    items: [
      { name: "components/cashier/cashier-dashboard.tsx", description: "Cashier shell with tabs (POS, History, Products) and logout." },
      { name: "components/cashier/cashier-pos.tsx", description: "POS flow with cart ops, manual discount (% or $), checkout and responsive dual receipts (merchant/customer)." },
      { name: "components/cashier/order-history.tsx", description: "Searchable, date-filtered order list with quick receipt copy, Cancel for in-progress, Duplicate-to-POS, and Refund/Adjust for completed." },
      { name: "components/cashier/receipt-card.tsx", description: "Responsive printable receipt component with merchant/customer variants and optional discount line." },
    ],
  },
  {
    title: "Shared Components",
    items: [
      { name: "components/login-form.tsx", description: "Email/password login form using auth-context (demo: password123)." },
      { name: "components/protected-route.tsx", description: "Auth gate with loading, login fallback, and optional role checking." },
      { name: "components/theme-provider.tsx", description: "Thin wrapper around next-themes provider." },
    ],
  },
  {
    title: "Hooks",
    items: [
      { name: "hooks/use-mobile.ts", description: "useIsMobile() media-query hook for <768px." },
      { name: "hooks/use-toast.ts", description: "Headless toast store exposing useToast() and toast()." },
    ],
  },
  {
    title: "UI Primitives (shadcn/Radix)",
    items: [
      { name: "components/ui/button.tsx", description: "Button with CVA variants/sizes and motion states." },
      { name: "components/ui/card.tsx", description: "Card primitives (Card, CardHeader, CardContent, etc.)." },
      { name: "components/ui/input.tsx", description: "Styled input with focus/error states." },
      { name: "components/ui/select.tsx", description: "Radix Select bindings and slots." },
      { name: "components/ui/dialog.tsx", description: "Radix Dialog bindings and slots." },
      { name: "components/ui/*", description: "Additional primitives (accordion, badge, tabs, toast, etc.)." },
    ],
  },
  {
    title: "Scripts",
    items: [
      { name: "scripts/run-dev.js", description: "Finds LAN IP/port and starts next dev bound to LAN." },
      { name: "scripts/print-host.js", description: "Prints Local and Network URLs for a target port." },
    ],
  },
  {
    title: "Config & Meta",
    items: [
      { name: "next.config.mjs", description: "Build config; ignores ESLint/TS errors on build; images.unoptimized." },
      { name: "tsconfig.json", description: "Strict TS config with Next plugin and @/* path alias." },
      { name: "components.json", description: "shadcn UI config and alias mapping." },
      { name: "public/*", description: "Product images, placeholders, logos." },
      { name: "README.md", description: "Local/LAN commands and firewall note." },
    ],
  },
]

export default function OverviewPage() {
  const [now] = React.useState(() => new Date())

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Overview</h1>
          <p className="text-sm text-muted-foreground">
            DARK COFFEE – Management System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            aria-label="Print overview"
            title="Print overview (or Save as PDF)"
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="print-area bg-card rounded-lg border shadow-sm">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">DARK COFFEE – Project Map</h2>
          <p className="text-xs text-muted-foreground">
            Generated on {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3" style={{ breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="grid gap-2">
                {section.items.map((it) => (
                  <li key={it.name} className="border rounded-md p-3 bg-background/60">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-muted-foreground">{it.description}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="pt-4 text-xs text-muted-foreground">
            Tip: Use your browser's Print dialog and choose "Save as PDF". For best results, enable background graphics.
          </div>
        </div>
      </div>
    </div>
  )
}


