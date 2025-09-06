import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { ProductProvider } from "@/lib/product-context"
import { OrderProvider } from "@/lib/order-context"
import "./globals.css"

// Geist fonts provided by the `geist` package already include variables
// and do not require initialization like Google fonts.

export const metadata: Metadata = {
  title: "DARK COFFEE - Management System",
  description: "Coffee shop management system for DARK COFFEE",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <ProductProvider>
            <OrderProvider>{children}</OrderProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
