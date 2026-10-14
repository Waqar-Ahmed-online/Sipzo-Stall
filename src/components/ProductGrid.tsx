"use client";

import { Star } from "lucide-react";
import ProductCard from "./ProductCard";
import { CATEGORY_GROUPS } from "@/data/products";
import type { Product, Variant } from "@/types";

interface ProductGridProps {
  products: Product[];
  category: string;
  onAdd: (product: Product, variant: Variant) => void;
}

export default function ProductGrid({ products, category, onAdd }: ProductGridProps) {
  const visibleProducts =
    category === "All Items"
      ? products
      : products.filter((p) => (CATEGORY_GROUPS[category] || []).includes(p.category));

  return (
    <div className="bg-bg p-4 md:p-6">
      {visibleProducts.map((product) => (
        <div key={product._id} className="mb-10">
          <h6 className="mb-1 flex items-center gap-2 font-heading text-lg font-bold tracking-wide text-brand">
            <Star className="h-4 w-4" />
            {product.name.toUpperCase()}
            <Star className="h-4 w-4" />
          </h6>
          <hr className="mb-6 border-white/10" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {product.variants.map((variant, index) => (
              <div
                key={variant.name}
                className="animate-fade-up"
                style={{ animationDelay: `${(index % 3) * 100}ms` }}
              >
                <ProductCard product={product} variant={variant} onAdd={onAdd} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {visibleProducts.length === 0 && <p className="text-white/60">Is category mein koi item nahi hai.</p>}
    </div>
  );
}
