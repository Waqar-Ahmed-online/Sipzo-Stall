"use client";

import { OrderProvider } from "@/context/OrderContext";
import Background from "@/components/Background";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <Background />
      <div className="relative z-[1] min-h-screen">{children}</div>
    </OrderProvider>
  );
}
