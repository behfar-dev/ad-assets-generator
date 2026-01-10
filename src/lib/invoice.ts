import { jsPDF } from "jspdf";

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
  paymentId: string;
}

/**
 * Generate an invoice number based on timestamp and payment ID
 * Format: INV-YYYYMMDD-XXXX where XXXX is derived from payment ID
 */
export function generateInvoiceNumber(paymentId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // Use last 6 chars of payment ID (uppercase)
  const suffix = paymentId.slice(-6).toUpperCase();
  return `INV-${year}${month}${day}-${suffix}`;
}

/**
 * Generate a PDF invoice as a Buffer
 */
export function generateInvoicePDF(data: InvoiceData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Company header - left aligned
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("AD ASSETS", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ad Assets Generator", margin, y);
  y += 5;
  doc.text("hello@adassets.io", margin, y);
  y += 5;
  doc.text("www.adassets.io", margin, y);

  // Invoice title - right aligned
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, margin, { align: "right" });

  // Invoice details - right aligned
  y = margin + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - margin, y, {
    align: "right",
  });
  y += 5;
  doc.text(
    `Date: ${data.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );
  y += 5;
  doc.text(`Status: PAID`, pageWidth - margin, y, { align: "right" });

  // Horizontal line
  y = 55;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // Bill To section
  y += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name || "Customer", margin, y);
  y += 5;
  doc.text(data.customer.email, margin, y);

  // Items table
  y += 20;

  // Table header
  const col1 = margin;
  const col2 = pageWidth - margin - 80;
  const col3 = pageWidth - margin - 50;
  const col4 = pageWidth - margin - 20;

  doc.setFont("helvetica", "bold");
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", col1 + 3, y + 2);
  doc.text("QTY", col2, y + 2, { align: "right" });
  doc.text("PRICE", col3, y + 2, { align: "right" });
  doc.text("TOTAL", col4, y + 2, { align: "right" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Table rows
  y += 12;
  doc.setFont("helvetica", "normal");

  for (const item of data.items) {
    doc.text(item.description, col1, y);
    doc.text(item.quantity.toString(), col2, y, { align: "right" });
    doc.text(formatCurrency(item.unitPrice, data.currency), col3, y, {
      align: "right",
    });
    doc.text(formatCurrency(item.total, data.currency), col4, y, {
      align: "right",
    });
    y += 8;
  }

  // Line above totals
  y += 5;
  doc.setLineWidth(0.3);
  doc.line(col2 - 20, y, pageWidth - margin, y);

  // Totals
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", col3 - 15, y, { align: "right" });
  doc.text(formatCurrency(data.subtotal, data.currency), col4, y, {
    align: "right",
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL:", col3 - 15, y, { align: "right" });
  doc.text(formatCurrency(data.total, data.currency), col4, y, {
    align: "right",
  });

  // Payment info box
  y += 25;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, pageWidth - 2 * margin, 25, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, pageWidth - 2 * margin, 25, "S");

  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Information", margin + 5, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Method: Credit Card (via Stripe)`, margin + 5, y);

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for your purchase!", pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  doc.text(
    "For questions about this invoice, contact hello@adassets.io",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 5;
  doc.text(`Transaction ID: ${data.paymentId}`, pageWidth / 2, y, {
    align: "center",
  });

  // Return as Buffer
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Format currency with symbol
 */
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
  };
  const symbol = symbols[currency.toLowerCase()] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Create invoice data from a payment record
 */
export function createInvoiceData(
  payment: {
    id: string;
    amount: number;
    currency: string;
    creditsGranted: number | null;
    createdAt: Date;
    invoiceNumber: string;
  },
  user: {
    name: string | null;
    email: string;
  }
): InvoiceData {
  const credits = payment.creditsGranted || 0;
  const unitPrice = credits > 0 ? payment.amount / credits : payment.amount;

  return {
    invoiceNumber: payment.invoiceNumber,
    date: payment.createdAt,
    customer: {
      name: user.name || "Customer",
      email: user.email,
    },
    items: [
      {
        description: `${credits} Credits - Ad Assets Generator`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount,
      },
    ],
    subtotal: payment.amount,
    total: payment.amount,
    currency: payment.currency,
    paymentId: payment.id,
  };
}
