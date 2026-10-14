"use client";

import { useCallback, useState } from "react";
import { fetchDailySales, fetchMonthlySales, fetchRangeSales, fetchYearlySales } from "@/lib/api/sales";
import type { SalesRangeResult, SalesRow } from "@/types";

export function useSales() {
  const [daily, setDaily] = useState<SalesRow[]>([]);
  const [monthly, setMonthly] = useState<SalesRow[]>([]);
  const [yearly, setYearly] = useState<SalesRow[]>([]);
  const [rangeResult, setRangeResult] = useState<SalesRangeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDaily = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      setDaily(await fetchDailySales(days));
    } catch {
      setError("Failed to load daily sales");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthly = useCallback(async (year: number = new Date().getFullYear()) => {
    setLoading(true);
    setError(null);
    try {
      setMonthly(await fetchMonthlySales(year));
    } catch {
      setError("Failed to load monthly sales");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYearly = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setYearly(await fetchYearlySales());
    } catch {
      setError("Failed to load yearly sales");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRange = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      setRangeResult(await fetchRangeSales(from, to));
    } catch {
      setError("Failed to load sales for that date range");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    daily,
    monthly,
    yearly,
    rangeResult,
    loading,
    error,
    setError,
    fetchDaily,
    fetchMonthly,
    fetchYearly,
    fetchRange,
  };
}
