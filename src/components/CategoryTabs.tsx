"use client";

import { UtensilsCrossed, Beer, IceCreamCone, Sandwich, type LucideIcon } from "lucide-react";
import { CATEGORY_GROUPS } from "@/data/products";

const GROUP_ICONS: Record<string, LucideIcon> = {
  "All Items": UtensilsCrossed,
  "Drinks & Limca": Beer,
  "Shakes & Ice-Cream": IceCreamCone,
  "Fast Food & Snacks": Sandwich,
};

const TABS = ["All Items", ...Object.keys(CATEGORY_GROUPS)];

interface CategoryTabsProps {
  category: string;
  onChange: (val: string) => void;
}

export default function CategoryTabs({ category, onChange }: CategoryTabsProps) {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {TABS.map((c) => {
        const Icon = GROUP_ICONS[c];
        const selected = category === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border border-white/8 px-4 py-2 text-sm font-bold transition-colors ${
              selected ? "bg-brand text-bg" : "bg-paper text-[#a0a0a0]"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {c}
          </button>
        );
      })}
    </div>
  );
}
