"use client";

import { TABLES } from "@/data/products";

interface TableSelectorProps {
  table: number | null;
  onSelect: (t: number) => void;
}

export default function TableSelector({ table, onSelect }: TableSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4">
      <span className="mr-1 text-sm font-medium text-[#a0a0a0]">Table</span>
      {TABLES.map((t) => {
        const selected = table === t;
        return (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-sm font-bold transition-shadow"
            style={{
              width: 34,
              height: 34,
              backgroundColor: selected ? "#7ED321" : "#12160f",
              color: selected ? "#0a0a0a" : "#ccc",
              border: selected ? "1px solid #7ED321" : "1px solid rgba(255,255,255,0.15)",
              boxShadow: selected ? "0 0 10px rgba(126,211,33,0.5)" : "none",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
