"use client"

import React, { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { ThermalReceipt } from "@/components/cashier/ThermalReceipt"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Coffee } from "lucide-react"

// Sample order data
const sampleOrder = {
  orderId: "RCP-2024-001",
  customer: "John Doe",
  items: [
    {
      name: "Americano",
      quantity: 2,
      price: 3.50,
    },
    {
      name: "Cappuccino",
      quantity: 1,
      price: 4.25,
    },
    {
      name: "Blueberry Muffin",
      quantity: 1,
      price: 2.75,
    },
    {
      name: "Chocolate Croissant",
      quantity: 2,
      price: 3.00,
    },
  ],
  subtotal: 19.25,
  discountLabel: "Student Discount",
  discountAmount: 1.93,
  total: 17.32,
  createdAt: new Date().toISOString(),
  paymentMethod: "cash",
  paidAmount: 20.00,
  changeAmount: 2.68,
}

export default function ThermalReceiptPage() {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${sampleOrder.orderId}`,
    onAfterPrint: () => {
      console.log("Receipt printed successfully!")
    },
    pageStyle: `
      @page {
        size: 80mm auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `,
    // Set the paper size to 80mm
    bodyClass: "thermal-print",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Thermal Receipt Demo</h1>
              <p className="text-gray-600">80mm thermal printer receipt with react-to-print</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-600" />
                Receipt Preview
              </CardTitle>
              <CardDescription>
                This is how the receipt will appear before printing (80mm width)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                maxWidth: '320px',
                margin: '0 auto'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: '8px' }}>
                  Receipt Preview (80mm width)
                </div>
                <ThermalReceipt
                  ref={receiptRef}
                  orderId={sampleOrder.orderId}
                  customer={sampleOrder.customer}
                  items={sampleOrder.items}
                  subtotal={sampleOrder.subtotal}
                  discountLabel={sampleOrder.discountLabel}
                  discountAmount={sampleOrder.discountAmount}
                  total={sampleOrder.total}
                  createdAt={sampleOrder.createdAt}
                  paymentMethod={sampleOrder.paymentMethod}
                  paidAmount={sampleOrder.paidAmount}
                  changeAmount={sampleOrder.changeAmount}
                />
              </div>

              {/* Print Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handlePrint}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 flex items-center gap-2"
                  size="lg"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Sample order data used for this receipt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                  <p className="text-lg font-semibold">{sampleOrder.orderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-lg font-semibold">{sampleOrder.customer}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Items</label>
                <div className="mt-2 space-y-2">
                  {sampleOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {item.quantity}x ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${sampleOrder.subtotal.toFixed(2)}</span>
                </div>
                {sampleOrder.discountAmount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({sampleOrder.discountLabel}):</span>
                    <span>-${sampleOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${sampleOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment:</span>
                  <span>{sampleOrder.paymentMethod} - ${sampleOrder.paidAmount?.toFixed(2)}</span>
                </div>
                {sampleOrder.changeAmount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Change:</span>
                    <span>${sampleOrder.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">For Printing:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Click the "Print Receipt" button</li>
                  <li>Select your thermal printer (80mm)</li>
                  <li>Ensure paper size is set to 80mm width</li>
                  <li>Print the receipt</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>80mm thermal printer compatible</li>
                  <li>Clean, simple layout</li>
                  <li>Monospace font for alignment</li>
                  <li>Print-only CSS optimization</li>
                  <li>High contrast for thermal paper</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
