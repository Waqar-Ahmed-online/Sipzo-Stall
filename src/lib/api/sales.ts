import type { SalesRangeResult, SalesRow } from "@/types";

export async function fetchDailySales(days = 30): Promise<SalesRow[]> {
  const res = await fetch(`/api/sales/daily?days=${days}`);
  if (!res.ok) throw new Error("Failed to load daily sales");
  return res.json();
}

export async function fetchMonthlySales(year = new Date().getFullYear()): Promise<SalesRow[]> {
  const res = await fetch(`/api/sales/monthly?year=${year}`);
  if (!res.ok) throw new Error("Failed to load monthly sales");
  return res.json();
}

export async function fetchYearlySales(): Promise<SalesRow[]> {
  const res = await fetch("/api/sales/yearly");
  if (!res.ok) throw new Error("Failed to load yearly sales");
  return res.json();
}

export async function fetchRangeSales(from: string, to: string): Promise<SalesRangeResult> {
  const res = await fetch(`/api/sales/range?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to load sales for that date range");
  return res.json();
}
