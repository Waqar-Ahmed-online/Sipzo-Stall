export type OrderType = "dine-in" | "takeaway" | "home-delivery";
export type PaymentType = "cash" | "card" | "online";

export interface Variant {
  name: string;
  size: string;
  price: number;
  family: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  variants: Variant[];
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  riderName?: string;
  area?: string;
  city?: string;
  address?: string;
  landmark?: string;
  instructions?: string;
}

export interface CartItem {
  key: string;
  productName: string;
  variantName: string;
  size: string;
  price: number;
  family: string;
  qty: number;
}

export interface OrderItem {
  productName: string;
  variantName: string;
  size?: string;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  orderNumber?: number;
  orderType: OrderType;
  table: number | null;
  paymentType: PaymentType;
  deliveryDetails?: DeliveryDetails;
  deliveryCharges: number;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface SalesRow {
  _id: string;
  totalSales: number;
  orderCount: number;
}

export interface SalesRangeResult {
  days: SalesRow[];
  grandTotal: number;
  orderCount: number;
}
export type PeriodType = "daily" | "monthly" | "yearly";

export interface Expense {
  periodType: PeriodType;
  periodKey: string;
  expense: number;
  rent: number;
}
