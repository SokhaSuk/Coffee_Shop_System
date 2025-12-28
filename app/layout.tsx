import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { ProductProvider } from "@/lib/product-context"
import { OrderProvider } from "@/lib/order-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Geist fonts provided by the `geist` package already include variables
// and do not require initialization like Google fonts.

export const metadata: Metadata = {
  title: "DARK COFFEE - Management System",
  description: "Coffee shop management system for DARK COFFEE",
  generator: 'E8.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans min-h-screen" suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProductProvider>
              <OrderProvider>
                <main id="main" role="main">{children}</main>
              </OrderProvider>
            </ProductProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
