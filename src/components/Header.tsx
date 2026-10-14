"use client";

import { Martini, Search, X } from "lucide-react";

interface HeaderProps {
  onShowOrders: () => void;
  onShowAdmin: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export default function Header({ onShowOrders, onShowAdmin, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/8 bg-black/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <Martini className="h-5 w-5 text-brand" />
          <span className="font-heading text-lg font-bold tracking-wide text-white">SIPZO</span>
        </div>

        <div className="flex max-w-[360px] flex-grow items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-[#a0a0a0]" />
          <input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-[#a0a0a0] outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} aria-label="Clear search" className="shrink-0">
              <X className="h-4 w-4 text-[#a0a0a0] hover:text-white" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onShowOrders}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:text-brand"
          >
            Orders
          </button>
          <button onClick={onShowAdmin} className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand">
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}
