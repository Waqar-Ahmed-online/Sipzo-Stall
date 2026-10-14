"use client";

import { useEffect, useState } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { fetchExpense, saveExpense } from "@/lib/api/expenses";
import { generateSalesReceiptPDF } from "@/utils/generateReceipt";
import type { PeriodType, SalesRow } from "@/types";

interface ExpenseReceiptModalProps {
  periodType: PeriodType;
  periodKey: string;
  periodLabel: string;
  sales: SalesRow;
  onClose: () => void;
}

export default function ExpenseReceiptModal({
  periodType,
  periodKey,
  periodLabel,
  sales,
  onClose,
}: ExpenseReceiptModalProps) {
  const [expense, setExpense] = useState("");
  const [rent, setRent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsRent = periodType !== "daily";

  useEffect(() => {
    fetchExpense(periodType, periodKey)
      .then((data) => {
        setExpense(String(data.expense || ""));
        setRent(String(data.rent || ""));
      })
      .catch(() => setError("Purani expense load nahi ho saki"))
      .finally(() => setLoading(false));
  }, [periodType, periodKey]);

  const handleGenerate = async () => {
    if (!expense.trim() || Number.isNaN(Number(expense))) {
      setError("Expense zaroori hai");
      return;
    }
    if (needsRent && (!rent.trim() || Number.isNaN(Number(rent)))) {
      setError("Rent zaroori hai");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        periodType,
        periodKey,
        expense: Number(expense),
        rent: needsRent ? Number(rent) : 0,
      };
      const saved = await saveExpense(payload);
      generateSalesReceiptPDF(periodLabel, sales, saved);
      onClose();
    } catch {
      setError("Save nahi ho saka, dobara try karo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-95 rounded-xl border border-white/10 bg-paper p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-white">Receipt — {periodLabel}</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-[#a0a0a0] hover:text-white" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex justify-between text-sm text-[#a0a0a0]">
              <span>Total Sales</span>
              <span className="text-white">Rs {sales.totalSales}</span>
            </div>

            <label className="mb-3 flex flex-col gap-1">
              <span className="text-xs text-[#a0a0a0]">Expense</span>
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-brand"
              />
            </label>

            {needsRent && (
              <label className="mb-3 flex flex-col gap-1">
                <span className="text-xs text-[#a0a0a0]">Rent</span>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
              </label>
            )}

            {error && <p className="mb-3 text-xs text-danger">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-bold text-bg hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {saving ? "Saving..." : "Generate Receipt"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}