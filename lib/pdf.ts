import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type { Order } from "@/lib/order-context"

export type PdfOptions = {
  orientation?: "p" | "portrait" | "l" | "landscape"
  format?: "a4" | "a3" | "a5" | "letter" | "legal"
  marginMm?: number
  scale?: number
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  options: PdfOptions = {}
): Promise<void> {
  const {
    orientation = "p",
    format = "a4",
    marginMm = 8,
    scale = 3
  } = options

  // Validate input parameters
  if (!element) {
    throw new Error("Element is required for PDF generation")
  }

  if (!filename || filename.trim() === "") {
    throw new Error("Filename is required for PDF generation")
  }

  // Check if element is visible and has content
  if (element.offsetWidth === 0 || element.offsetHeight === 0) {
    throw new Error("Element must be visible and have dimensions for PDF generation")
  }

  // Check if element has any content
  const hasContent = element.textContent?.trim() || element.querySelector('*')
  if (!hasContent) {
    throw new Error("Element appears to be empty - no content to generate PDF from")
  }

  try {
    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement

    // Remove or replace problematic CSS that causes issues with PDF generation
    const style = document.createElement('style')
    style.textContent = `
      * {
        color: black !important;
        background-color: white !important;
      }
      .text-coffee-600, .bg-coffee-600, .border-coffee-200 {
        color: #8B5A2B !important;
        background-color: #8B5A2B !important;
        border-color: #8B5A2B !important;
      }
      .text-gray-600, .text-gray-700, .text-gray-500, .text-muted-foreground {
        color: #4B5563 !important;
      }
      .text-green-600 {
        color: #059669 !important;
      }
      .border-gray-300, .border-gray-400, .border-dashed, .border-dotted {
        border-color: #9CA3AF !important;
      }
    `
    clonedElement.appendChild(style)

    // Capture the element as canvas with improved options for better quality
    const canvas = await html2canvas(clonedElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false, // Disable html2canvas console logs
      width: clonedElement.scrollWidth,
      height: clonedElement.scrollHeight,
      foreignObjectRendering: false, // Disable foreign object rendering to avoid CSS issues
      imageTimeout: 15000, // Increase timeout for better image loading
      removeContainer: true
    })

    // Clean up the cloned element if it was added to DOM
    if (clonedElement.parentNode) {
      clonedElement.parentNode.removeChild(clonedElement)
    }

    // Validate canvas was created successfully
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to capture element content - canvas creation failed")
    }

    // Create PDF with improved settings
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
      compress: true
    })

    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate content area (minus margins)
    const contentWidth = pdfWidth - (marginMm * 2)
    const contentHeight = pdfHeight - (marginMm * 2)

    // Calculate image dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight)

    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Center the image
    const x = (pdfWidth - scaledWidth) / 2
    const y = marginMm

    // Validate image data
    const imgData = canvas.toDataURL("image/png")
    if (!imgData || imgData === "data:,") {
      throw new Error("Failed to generate image data from canvas")
    }

    // Add image to PDF with error handling and better quality
    try {
      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight, undefined, "FAST")
    } catch (imageError) {
      console.error("Error adding image to PDF:", imageError)
      throw new Error("Failed to add image to PDF document")
    }

    // Download the PDF
    try {
      pdf.save(filename)
    } catch (saveError) {
      console.error("Error saving PDF:", saveError)
      throw new Error("Failed to download PDF file")
    }
  } catch (error) {
    console.error("Error generating PDF:", error)

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes("canvas")) {
        throw new Error("Failed to capture element content. Please ensure the element is fully loaded and visible.")
      } else if (error.message.includes("CORS")) {
        throw new Error("Cross-origin resource blocked PDF generation. Please ensure all images are from the same domain.")
      } else if (error.message.includes("memory") || error.message.includes("quota")) {
        throw new Error("Insufficient memory to generate PDF. Try reducing the content size or scale.")
      } else {
        throw error
      }
    } else {
      throw new Error("An unexpected error occurred while generating the PDF")
    }
  }
}

// Fallback function to create a simple text-based PDF receipt
export async function createSimpleReceiptPdf(
  order: Order,
  filename: string
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
      putOnlyUsedFonts: true
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Set font
    pdf.setFont("helvetica", "normal")

    // Header - differentiate between merchant and customer copy
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("DaCoffee Shop", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 12
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "normal")

    // Check if this is a merchant or customer copy based on filename
    const isMerchantCopy = filename.includes('merchant')
    const receiptType = isMerchantCopy ? "MERCHANT COPY" : "CUSTOMER COPY"
    const receiptSubtitle = isMerchantCopy ? "For Internal Records" : "Please Keep Your Receipt"

    pdf.text(receiptType, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.setFontSize(10)
    pdf.text(receiptSubtitle, pageWidth / 2, yPosition, { align: "center" })

    yPosition += 15
    pdf.setFontSize(10)
    pdf.text("#12 Street 123, Phnom Penh, Cambodia", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 5
    pdf.text("Tel: +855 12-345-678", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 5
    pdf.text("info@dacoffee.com", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 20
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")

    // Order details
    pdf.text(`Receipt No: ${order.id}`, margin, yPosition)
    yPosition += 10
    pdf.text(`Customer: ${order.customer}`, margin, yPosition)
    yPosition += 10
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin, yPosition)
    yPosition += 10
    pdf.text(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`, margin, yPosition)
    yPosition += 10
    pdf.text(`Payment: ${order.paymentMethod}`, margin, yPosition)

    yPosition += 20

    // Items header
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("Item", margin, yPosition)
    pdf.text("Qty", pageWidth - 60, yPosition)
    pdf.text("Price", pageWidth - 30, yPosition)
    yPosition += 10

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    order.items.forEach((item) => {
      const lineTotal = item.quantity * item.price
      pdf.text(item.name, margin, yPosition)
      pdf.text(item.quantity.toString(), pageWidth - 60, yPosition)
      pdf.text(`$${lineTotal.toFixed(2)}`, pageWidth - 30, yPosition)
      yPosition += 8
    })

    yPosition += 15
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text("TOTAL:", margin, yPosition)
    pdf.text(`$${order.total.toFixed(2)}`, pageWidth - 30, yPosition)

    yPosition += 15
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)

    // Different footer content for merchant vs customer copy
    if (isMerchantCopy) {
      pdf.text("Thank you for your service!", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5
      pdf.text("For internal business records", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5
      pdf.text("Transaction ID: " + order.id, pageWidth / 2, yPosition, { align: "center" })
    } else {
      pdf.text("Thank you for visiting!", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5
      pdf.text("We appreciate your business", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5
      pdf.text("Follow us: @DaCoffee | www.dacoffee.com", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5
      pdf.text("🌟 Rate us on our website! 🌟", pageWidth / 2, yPosition, { align: "center" })
    }

    // Download the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("Error creating simple PDF:", error)
    throw new Error("Failed to create PDF receipt")
  }
}