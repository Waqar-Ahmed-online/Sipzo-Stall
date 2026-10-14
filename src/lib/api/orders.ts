import type { CartItem, DeliveryDetails, Order, OrderType, PaymentType } from "@/types";

interface CheckoutArgs {
  orderId: string | null;
  orderType: OrderType;
  table: number | null;
  paymentType: PaymentType;
  deliveryDetails?: DeliveryDetails;
  deliveryCharges: number;
  cart: CartItem[];
  total: number;
}

export async function checkoutOrder({
  orderId,
  orderType,
  table,
  paymentType,
  deliveryDetails,
  deliveryCharges,
  cart,
  total,
}: CheckoutArgs): Promise<Order> {
  const payload = {
    orderType,
    table: orderType === "dine-in" ? table : null,
    paymentType: paymentType || "cash",
    deliveryDetails: orderType === "home-delivery" ? deliveryDetails : undefined,
    deliveryCharges: orderType === "home-delivery" ? Number(deliveryCharges) || 0 : 0,
    items: cart.map((i) => ({
      productName: i.productName,
      variantName: i.variantName,
      size: i.size,
      price: i.price,
      qty: i.qty,
    })),
    total,
  };

  const url = orderId ? `/api/orders/${orderId}` : "/api/orders";
  const method = orderId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(orderId ? "Order update failed" : "Checkout failed");
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function deleteAllOrders(): Promise<{ message: string }> {
  const res = await fetch("/api/orders", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear orders");
  return res.json();
}
