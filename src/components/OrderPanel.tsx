"use client";

import { useState } from "react";
import { ShoppingCart, Bike } from "lucide-react";
import CartItemRow from "./CartItem";
import DeliveryDetailsForm from "./DeliveryDetailsForm";
import type { CartItem, DeliveryDetails, OrderType, PaymentType } from "@/types";

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online" },
];

function DeliveryChargesInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const [synced, setSynced] = useState(value);

  if (synced !== value) {
    setSynced(value);
    setLocal(value);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[#a0a0a0]">Delivery charges</span>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onChange(local)}
        className="w-full rounded-md border border-white/15 bg-paper-2 px-3 py-2 text-sm text-white outline-none focus:border-brand"
      />
    </label>
  );
}

interface OrderPanelProps {
  orderType: OrderType;
  table: number | null;
  cart: CartItem[];
  total: number;
  itemCount: number;
  paymentType: PaymentType;
  onPaymentTypeChange: (p: PaymentType) => void;
  deliveryDetails: DeliveryDetails;
  onDeliveryDetailsChange: (d: Partial<DeliveryDetails>) => void;
  deliveryCharges: string;
  onDeliveryChargesChange: (v: string) => void;
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  checkoutError: string | null;
}

export default function OrderPanel({
  orderType,
  table,
  cart,
  total,
  itemCount,
  paymentType,
  onPaymentTypeChange,
  deliveryDetails,
  onDeliveryDetailsChange,
  deliveryCharges,
  onDeliveryChargesChange,
  onChangeQty,
  onRemove,
  onCheckout,
  isCheckingOut,
  checkoutError,
}: OrderPanelProps) {
  const isDelivery = orderType === "home-delivery";
  const charges = isDelivery ? Number(deliveryCharges) || 0 : 0;
  const grandTotal = total + charges;

  const canCharge =
    cart.length > 0 &&
    (orderType === "takeaway" ||
      (isDelivery && deliveryDetails.name.trim() && deliveryDetails.phone.trim()) ||
      (orderType === "dine-in" && Boolean(table)));

  const headerLabel = isDelivery
    ? "Home Delivery"
    : orderType === "takeaway"
    ? "Takeaway order"
    : table
    ? `Table ${table}`
    : "Select a table";

  return (
    <div className="sticky top-4 rounded-xl border border-white/8 bg-paper">
      <div className="flex items-center gap-2 border-b border-white/8 p-4">
        {isDelivery ? <Bike className="h-4 w-4 text-brand" /> : <ShoppingCart className="h-4 w-4 text-brand" />}
        <span className="font-semibold text-white">{headerLabel}</span>
      </div>

      {isDelivery && (
        <>
          <DeliveryDetailsForm deliveryDetails={deliveryDetails} onChange={onDeliveryDetailsChange} />
          <div className="px-4 pb-3">
            <DeliveryChargesInput value={deliveryCharges} onChange={onDeliveryChargesChange} />
          </div>
        </>
      )}

      <div className="max-h-[360px] overflow-y-auto">
        {cart.length === 0 && (
          <p className="flex items-center gap-1 p-4 text-sm text-[#a0a0a0]">No items yet. Tap a flavor to add it.</p>
        )}
        {cart.map((item, idx) => (
          <CartItemRow
            key={item.key}
            item={item}
            isLast={idx === cart.length - 1}
            onChangeQty={onChangeQty}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="mb-1 flex justify-between text-sm text-[#a0a0a0]">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="mb-1 flex justify-between text-sm text-[#a0a0a0]">
          <span>Subtotal</span>
          <span>Rs {total}</span>
        </div>
        {isDelivery && (
          <div className="mb-1 flex justify-between text-sm text-[#a0a0a0]">
            <span>Delivery charges</span>
            <span>Rs {charges}</span>
          </div>
        )}
        <div className="mb-3 flex justify-between font-bold text-white">
          <span>Total</span>
          <span className="text-brand">Rs {grandTotal}</span>
        </div>

        <p className="mb-1 block text-xs text-[#a0a0a0]">Payment</p>
        <div className="mb-3 flex gap-2">
          {PAYMENT_TYPES.map((p) => (
            <button
              key={p.value}
              onClick={() => onPaymentTypeChange(p.value)}
              className={`rounded-full px-3 py-1 text-[13px] font-semibold transition-colors ${
                paymentType === p.value ? "bg-brand text-bg" : "bg-[#2a2a2a] text-[#ccc] hover:bg-[#3a3a3a]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          disabled={!canCharge || isCheckingOut}
          onClick={onCheckout}
          className="w-full rounded-full bg-brand py-2.5 font-bold text-bg transition-colors hover:bg-brand-dark disabled:bg-[#2a2a2a] disabled:text-[#666]"
        >
          {isCheckingOut ? "Processing..." : `Checkout · Rs ${grandTotal}`}
        </button>
        {checkoutError && <p className="mt-2 block text-xs text-danger">{checkoutError}</p>}
      </div>
    </div>
  );
}
