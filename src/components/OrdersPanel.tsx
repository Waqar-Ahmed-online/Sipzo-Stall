"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Wallet,
  X,
  Pencil,
  Trash2,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";
import { generateReceiptPDF } from "@/utils/generateReceipt";
import { fetchOrders } from "@/lib/api/orders";
import type { Order, OrderType } from "@/types";

const PAYMENT_LABELS: Record<string, string> = { cash: "Cash", card: "Card", online: "Online" };

const ORDER_TYPE_ICON: Record<OrderType, typeof UtensilsCrossed> = {
  "dine-in": UtensilsCrossed,
  takeaway: ShoppingBag,
  "home-delivery": Bike,
};

const orderTypeLabel = (order: Order) => {
  if (order.orderType === "dine-in") return `Dine-in — Table ${order.table}`;
  if (order.orderType === "home-delivery") return "Home Delivery";
  return "Takeaway";
};

interface OrdersPanelProps {
  onClose: () => void;
  onEditOrder: (order: Order) => void;
  onClearHistory: () => Promise<void>;
  isClearingHistory: boolean;
  clearHistoryError: string | null;
}

export default function OrdersPanel({
  onClose,
  onEditOrder,
  onClearHistory,
  isClearingHistory,
  clearHistoryError,
}: OrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const grandTotal = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
      setError(null);
    } catch {
      setError("Orders load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetching data on mount is a legitimate effect (synchronizing with the
    // network), not something to compute during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
     
  }, []);

  const handleClearClick = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await onClearHistory();
    setConfirmClear(false);
    loadOrders();
  };

  return (
    <div className="mx-auto max-w-[700px] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
          <Receipt className="h-6 w-6 text-brand" />
          Orders / Receipts
        </h1>
        <button
          onClick={onClose}
          className="rounded-full border border-brand px-4 py-1.5 text-sm font-semibold text-brand"
        >
          Back to POS
        </button>
      </div>

      {!loading && orders.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-brand bg-paper-2 p-3">
          <span className="font-semibold text-[#a0a0a0]">Grand Total ({orders.length} orders)</span>
          <span className="text-[1.1rem] font-bold text-brand">Rs {grandTotal}</span>
        </div>
      )}

      <button
        disabled={isClearingHistory}
        onClick={handleClearClick}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition-colors"
        style={{
          color: confirmClear ? "#0a0a0a" : "#e05555",
          backgroundColor: confirmClear ? "#e05555" : "transparent",
          borderColor: "#e05555",
        }}
      >
        <Trash2 className="h-4 w-4" />
        {isClearingHistory ? "Clearing..." : confirmClear ? "Confirm? Sab orders delete ho jayenge" : "Clear History"}
      </button>
      {clearHistoryError && <p className="mb-4 block text-xs text-danger">{clearHistoryError}</p>}

      {loading && <Loader2 className="h-6 w-6 animate-spin text-brand" />}
      {error && <p className="text-danger">{error}</p>}

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const TypeIcon = ORDER_TYPE_ICON[order.orderType] || ShoppingBag;
          const isDelivery = order.orderType === "home-delivery";
          const deliveryCharges = order.deliveryCharges || 0;
          const itemsSubtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

          return (
            <div key={order._id} className="rounded-xl border border-white/8 bg-paper p-4">
              <div className="flex flex-wrap items-center justify-between gap-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-brand bg-paper-2 px-2.5 py-0.5 text-sm font-bold text-brand">
                    #{order.orderNumber ?? "—"}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold"
                    style={{
                      backgroundColor: order.orderType === "dine-in" ? "#7ED321" : isDelivery ? "#E8781A" : "#2a2a2a",
                      color: order.orderType === "dine-in" || isDelivery ? "#0a0a0a" : "#ccc",
                    }}
                  >
                    <TypeIcon className="h-4 w-4" />
                    {orderTypeLabel(order)}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-[#2a2a2a] px-2.5 py-0.5 text-sm font-semibold text-[#ccc]">
                    <Wallet className="h-4 w-4" />
                    {PAYMENT_LABELS[order.paymentType] || "Cash"}
                  </span>
                  {isDelivery && order.deliveryDetails?.riderName && (
                    <span className="flex items-center gap-1 rounded-full border border-brand/40 bg-paper-2 px-2.5 py-0.5 text-sm font-semibold text-brand">
                      <MapPin className="h-4 w-4" />
                      Rider: {order.deliveryDetails.riderName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#a0a0a0]">{new Date(order.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => onEditOrder(order)}
                    className="flex items-center gap-1 rounded-full border border-brand px-2.5 py-1 text-sm font-semibold text-brand"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => generateReceiptPDF(order)}
                    className="flex items-center gap-1 rounded-full border border-brand px-2.5 py-1 text-sm font-semibold text-brand"
                  >
                    <FileText className="h-4 w-4" />
                    Receipt
                  </button>
                </div>
              </div>

              {isDelivery && order.deliveryDetails && (
                <div className="mt-3 rounded-lg border border-white/6 bg-paper-2 p-3">
                  <p className="text-sm font-semibold text-white">
                    {order.deliveryDetails.name} · {order.deliveryDetails.phone}
                  </p>
                  <p className="block text-xs text-[#a0a0a0]">
                    {order.deliveryDetails.area}, {order.deliveryDetails.city} — {order.deliveryDetails.address}
                  </p>
                  {order.deliveryDetails.landmark && (
                    <p className="block text-xs text-[#a0a0a0]">Landmark: {order.deliveryDetails.landmark}</p>
                  )}
                  {order.deliveryDetails.instructions && (
                    <p className="block text-xs text-[#a0a0a0]">Note: {order.deliveryDetails.instructions}</p>
                  )}
                </div>
              )}

              <hr className="my-2.5 border-white/8" />

              <div className="flex flex-col gap-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-[#ddd]">
                      {item.productName} ({item.variantName}
                      {item.size ? `, ${item.size}` : ""})
                      <X className="h-3.5 w-3.5 text-brand" />
                      {item.qty}
                    </span>
                    <span className="text-sm text-[#ddd]">Rs {item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <hr className="my-2.5 border-white/8" />

              {isDelivery && (
                <div className="mb-1 flex justify-between text-sm text-[#a0a0a0]">
                  <span>Subtotal</span>
                  <span>Rs {itemsSubtotal}</span>
                </div>
              )}
              {isDelivery && (
                <div className="mb-1 flex justify-between text-sm text-[#a0a0a0]">
                  <span>Delivery charges</span>
                  <span>Rs {deliveryCharges}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-brand">Rs {order.total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && orders.length === 0 && <p className="text-[#a0a0a0]">Abhi tak koi order nahi hai.</p>}
    </div>
  );
}
