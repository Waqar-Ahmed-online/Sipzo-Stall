"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import ExpenseReceiptModal from "./ExpenseReceiptModal";
import type { PeriodType, SalesRow } from "@/types";

function SalesTable({ rows, periodType }: { rows: SalesRow[]; periodType: PeriodType }) {
  const total = rows.reduce((sum, r) => sum + r.totalSales, 0);
  const orders = rows.reduce((sum, r) => sum + r.orderCount, 0);
  const [receiptRow, setReceiptRow] = useState<SalesRow | null>(null);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="py-2 text-left font-normal text-[#a0a0a0]">Date</th>
            <th className="py-2 text-right font-normal text-[#a0a0a0]">Orders</th>
            <th className="py-2 text-right font-normal text-[#a0a0a0]">Sales (Rs)</th>
            <th className="py-2 text-right font-normal text-[#a0a0a0]"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td className="py-1.5 text-white">{r._id}</td>
              <td className="py-1.5 text-right text-white">{r.orderCount}</td>
              <td className="py-1.5 text-right text-white">{r.totalSales}</td>
              <td className="py-1.5 text-right">
                <button
                  onClick={() => setReceiptRow(r)}
                  className="inline-flex items-center gap-1 rounded-full border border-brand px-2 py-0.5 text-xs font-semibold text-brand"
                >
                  <FileText className="h-3 w-3" />
                  Receipt
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-[#a0a0a0]">
                No sales in this period yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {rows.length > 0 && (
        <div className="mt-1 flex justify-end gap-6 pr-1">
          <span className="text-[#a0a0a0]">Total orders: {orders}</span>
          <span className="font-bold text-brand">Total sales: Rs {total}</span>
        </div>
      )}

      {receiptRow && (
        <ExpenseReceiptModal
          periodType={periodType}
          periodKey={receiptRow._id}
          periodLabel={receiptRow._id}
          sales={receiptRow}
          onClose={() => setReceiptRow(null)}
        />
      )}
    </div>
  );
}

const TABS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "range", label: "Date-wise" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default function SalesPanel() {
  const { daily, monthly, yearly, rangeResult, loading, error, setError, fetchDaily, fetchMonthly, fetchYearly, fetchRange } =
    useSales();

  const [tab, setTab] = useState<Tab>("daily");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (tab === "daily") fetchDaily(30);
    if (tab === "monthly") fetchMonthly(year);
    if (tab === "yearly") fetchYearly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRangeSearch = () => {
    if (!from || !to) {
      setError("Please pick both dates");
      return;
    }
    fetchRange(from, to);
  };

  const inputClass = "rounded-md border border-white/15 bg-transparent px-3 py-1.5 text-sm text-white outline-none focus:border-brand";

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-white/8">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.value ? "border-b-2 border-brand text-white" : "text-[#a0a0a0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && <p className="mb-2 text-[#a0a0a0]">Loading...</p>}

      {tab === "daily" && <SalesTable rows={daily} periodType="daily" />}

      {tab === "monthly" && (
        <>
          <div className="mb-4 flex gap-2">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            />
            <button onClick={() => fetchMonthly(year)} className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand">
              Load
            </button>
          </div>
          <SalesTable rows={monthly} periodType="monthly" />
        </>
      )}

      {tab === "yearly" && <SalesTable rows={yearly} periodType="yearly" />}

      {tab === "range" && (
        <>
          <div className="mb-4 flex gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
            <button onClick={handleRangeSearch} className="rounded-md bg-brand px-3 py-1.5 text-sm font-bold text-bg">
              Search
            </button>
          </div>
          {rangeResult && <SalesTable rows={rangeResult.days} periodType="daily" />}
        </>
      )}
    </div>
  );
}