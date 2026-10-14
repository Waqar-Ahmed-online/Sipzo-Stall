import type { Expense, PeriodType } from "@/types";

export async function fetchExpense(periodType: PeriodType, periodKey: string): Promise<Expense> {
  const res = await fetch(`/api/expenses?periodType=${periodType}&periodKey=${periodKey}`);
  if (!res.ok) throw new Error("Failed to load expense");
  return res.json();
}

export async function saveExpense(payload: Expense): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save expense");
  return res.json();
}