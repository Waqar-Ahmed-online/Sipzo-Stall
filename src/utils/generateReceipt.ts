import jsPDF from "jspdf";
import type { Order, Expense, SalesRow } from "@/types";

const PAYMENT_LABELS: Record<string, string> = { cash: "Cash", card: "Card", online: "Online" };

const orderTypeLabel = (order: Order) => {
  if (order.orderType === "dine-in") return `Dine-in - Table ${order.table}`;
  if (order.orderType === "home-delivery") return "Home Delivery";
  return "Takeaway";
};

export function generateReceiptPDF(order: Order) {
  // First pass just to measure the final content height, then we render
  // again at that exact height so the receipt isn't padded with blank paper.
  const finalHeight = renderReceipt(order, 400, true);
  renderReceipt(order, finalHeight, false);
}
const PERIOD_TITLES: Record<Expense["periodType"], string> = {
  daily: "Daily Sales Receipt",
  monthly: "Monthly Sales Receipt",
  yearly: "Yearly Sales Receipt",
};

export function generateSalesReceiptPDF(periodLabel: string, sales: SalesRow, expense: Expense) {
  const pageWidth = 80;
  const centerX = pageWidth / 2;
  const priceX = pageWidth - 4;
  const lineHeight = 6;

  const doc = new jsPDF({ unit: "mm", format: [pageWidth, 130] });
  let y = 10;

  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text(PERIOD_TITLES[expense.periodType], centerX, y, { align: "center" });
  y += 6;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(periodLabel, centerX, y, { align: "center" });
  y += 8;

  doc.setLineWidth(0.2);
  doc.line(4, y, pageWidth - 4, y);
  y += 7;

  const row = (label: string, value: string, bold = false) => {
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 9.5);
    doc.text(label, 4, y);
    doc.text(value, priceX, y, { align: "right" });
    y += lineHeight;
  };

  row("Orders", String(sales.orderCount));
  row("Total Sales", `Rs ${sales.totalSales}`);
  row("Expense", `Rs ${expense.expense}`);
  if (expense.periodType !== "daily") row("Rent", `Rs ${expense.rent}`);

  y += 1;
  doc.line(4, y, pageWidth - 4, y);
  y += 7;

  const netProfit = sales.totalSales - expense.expense - (expense.periodType !== "daily" ? expense.rent : 0);
  row("NET PROFIT", `Rs ${netProfit}`, true);

  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString(), centerX, y, { align: "center" });

  doc.save(`sales-receipt-${expense.periodType}-${expense.periodKey}.pdf`);
}

function renderReceipt(order: Order, pageHeight: number, measureOnly: boolean): number {
  const pageWidth = 80;
  const lineHeight = 4.2;
  const itemGap = 2;
  const centerX = pageWidth / 2;
  const nameMaxWidth = 50;
  const priceX = pageWidth - 4;

  const doc = new jsPDF({ unit: "mm", format: [pageWidth, pageHeight] });
  let y = 8;

  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text("RECEIPT", centerX, y, { align: "center" });
  y += 6;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(`Order #${order.orderNumber ?? "-"}`, centerX, y, { align: "center" });
  y += 5;
  doc.text(new Date(order.createdAt).toLocaleString(), centerX, y, { align: "center" });
  y += 5;
  doc.text(orderTypeLabel(order), centerX, y, { align: "center" });
  y += 5;
  doc.text(`Payment: ${PAYMENT_LABELS[order.paymentType] || "Cash"}`, centerX, y, { align: "center" });
  y += 6;

  doc.setLineWidth(0.2);
  doc.line(4, y, pageWidth - 4, y);
  y += 5;

  if (order.orderType === "home-delivery" && order.deliveryDetails) {
    const d = order.deliveryDetails;
    doc.setFontSize(8);
    doc.text(`${d.name || ""}  ${d.phone || ""}`, 4, y);
    y += 4;
    if (d.area || d.city) {
      doc.text(`${d.area || ""}, ${d.city || ""}`, 4, y);
      y += 4;
    }
    if (d.address) {
      const addrLines = doc.splitTextToSize(d.address, pageWidth - 8);
      doc.text(addrLines, 4, y);
      y += addrLines.length * lineHeight;
    }
    if (d.riderName) {
      doc.text(`Rider: ${d.riderName}`, 4, y);
      y += 4;
    }
    y += 2;
    doc.line(4, y, pageWidth - 4, y);
    y += 5;
  }

  doc.setFontSize(8.5);
  order.items.forEach((item) => {
    const name = `${item.productName} (${item.variantName}${item.size ? ", " + item.size : ""}) x${item.qty}`;
    const price = `Rs ${item.price * item.qty}`;
    const nameLines = doc.splitTextToSize(name, nameMaxWidth);

    doc.text(nameLines, 4, y);
    doc.text(price, priceX, y, { align: "right" });

    y += nameLines.length * lineHeight + itemGap;
  });

  y += 1;
  doc.line(4, y, pageWidth - 4, y);
  y += 5;

  const deliveryCharges = order.deliveryCharges || 0;
  if (order.orderType === "home-delivery") {
    const itemsSubtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.text("Subtotal", 4, y);
    doc.text(`Rs ${itemsSubtotal}`, priceX, y, { align: "right" });
    y += lineHeight;

    doc.text("Delivery charges", 4, y);
    doc.text(`Rs ${deliveryCharges}`, priceX, y, { align: "right" });
    y += lineHeight + 1;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", 4, y);
  doc.text(`Rs ${order.total}`, pageWidth - 4, y, { align: "right" });
  y += 8;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text("Shukriya!", centerX, y, { align: "center" });
  y += 8;

  if (measureOnly) return y;

  doc.save(`receipt-order-${order.orderNumber ?? order._id}.pdf`);
  return y;
}
