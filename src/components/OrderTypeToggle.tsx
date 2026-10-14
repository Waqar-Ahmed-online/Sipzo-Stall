"use client";

import { UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import type { OrderType } from "@/types";

interface OrderTypeToggleProps {
  orderType: OrderType;
  onChange: (val: OrderType) => void;
}

const OPTIONS: { value: OrderType; label: string; Icon: typeof UtensilsCrossed }[] = [
  { value: "dine-in", label: "Dine-in", Icon: UtensilsCrossed },
  { value: "takeaway", label: "Takeaway", Icon: ShoppingBag },
  { value: "home-delivery", label: "Home Delivery", Icon: Bike },
];

export default function OrderTypeToggle({ orderType, onChange }: OrderTypeToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
      <span className="mr-1 text-sm font-medium text-[#a0a0a0]">Customer wants</span>
      <div className="flex gap-1 rounded-full border border-white/10 bg-paper p-1">
        {OPTIONS.map(({ value, label, Icon }) => {
          const selected = orderType === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                selected ? "bg-brand font-bold text-bg" : "text-[#a0a0a0]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
