"use client";

import { useRouter } from "next/navigation";
import OrdersPanel from "@/components/OrdersPanel";
import { useOrder } from "@/context/OrderContext";

export default function OrdersPage() {
  const router = useRouter();
  const { editOrder, clearHistory, isClearingHistory, clearHistoryError } = useOrder();

  return (
    <OrdersPanel
      onClose={() => router.push("/")}
      onEditOrder={editOrder}
      onClearHistory={clearHistory}
      isClearingHistory={isClearingHistory}
      clearHistoryError={clearHistoryError}
    />
  );
}
