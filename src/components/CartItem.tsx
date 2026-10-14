"use client";

import { Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  isLast: boolean;
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
}

export default function CartItem({ item, isLast, onChangeQty, onRemove }: CartItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{item.productName}</p>
          <p className="truncate text-xs text-[#a0a0a0]">
            {item.size ? `${item.variantName} · ${item.size}` : item.variantName}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={() => onChangeQty(item.key, -1)} className="text-[#a0a0a0] hover:text-white">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[18px] text-center text-[13px] text-white">{item.qty}</span>
          <button onClick={() => onChangeQty(item.key, 1)} className="text-brand hover:text-brand-dark">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[56px] text-right text-[13px] font-semibold text-brand">
            Rs {item.price * item.qty}
          </span>
          <button onClick={() => onRemove(item.key)} className="ml-1 text-danger hover:text-danger-dark">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!isLast && <hr className="border-white/8" />}
    </div>
  );
}
