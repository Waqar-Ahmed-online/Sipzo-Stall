"use client";

import Image from "next/image";
import { Droplet } from "lucide-react";
import { FLAVOR_FAMILIES } from "@/data/products";
import type { Product, Variant } from "@/types";

interface ProductCardProps {
  product: Product;
  variant: Variant;
  onAdd: (product: Product, variant: Variant) => void;
}

export default function ProductCard({ product, variant, onAdd }: ProductCardProps) {
  const fam = FLAVOR_FAMILIES[variant.family] ?? { bg: "#2a2a2a", border: "#7ED321", text: "#fff" };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-paper transition-[border-color,box-shadow] duration-200 hover:border-brand hover:shadow-[0_0_16px_rgba(126,211,33,0.35)]">
      <div className="relative w-full bg-white pt-[100%]">
        {variant.image ? (
          <Image src={variant.image} alt={variant.name} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: fam.bg }}>
            <Droplet className="h-16 w-16" style={{ color: fam.border }} />
          </div>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
          {product.name}
        </span>
      </div>

      <div className="flex grow flex-col gap-3 p-4">
        <p className="text-lg font-bold text-white">{variant.name}</p>

        {variant.size && (
          <span className="self-start rounded-full bg-[#2a2a2a] px-2.5 py-0.5 text-[13px] font-semibold text-[#ccc]">
            {variant.size}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xl font-bold text-brand">Rs. {variant.price}</span>
          <button
            onClick={() => onAdd(product, variant)}
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-bg transition-colors hover:bg-brand-dark"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
