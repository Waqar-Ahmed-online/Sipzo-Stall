"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { checkoutOrder, deleteAllOrders } from "@/lib/api/orders";
import type { CartItem, DeliveryDetails, Order, OrderType, PaymentType } from "@/types";

const OrderContext = createContext<OrderContextValue | null>(null);

const emptyDeliveryDetails: DeliveryDetails = { name: "", phone: "" };

interface State {
  orderType: OrderType;
  table: number | null;
  category: string;
  paymentType: PaymentType;
  takeawayCart: CartItem[];
  tableCarts: Record<number, CartItem[]>;
  homeDeliveryCart: CartItem[];
  deliveryDetails: DeliveryDetails;
  deliveryCharges: string;
  editingOrderId: string | null;
  isCheckingOut: boolean;
  checkoutError: string | null;
  isClearingHistory: boolean;
  clearHistoryError: string | null;
}

const initialState: State = {
  orderType: "dine-in",
  table: null,
  category: "All Items",
  paymentType: "cash",
  takeawayCart: [],
  tableCarts: {},
  homeDeliveryCart: [],
  deliveryDetails: emptyDeliveryDetails,
  deliveryCharges: "",
  editingOrderId: null,
  isCheckingOut: false,
  checkoutError: null,
  isClearingHistory: false,
  clearHistoryError: null,
};

type Action =
  | { type: "SET_ORDER_TYPE"; payload: OrderType }
  | { type: "SET_TABLE"; payload: number }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_PAYMENT_TYPE"; payload: PaymentType }
  | { type: "SET_DELIVERY_DETAILS"; payload: Partial<DeliveryDetails> }
  | { type: "SET_DELIVERY_CHARGES"; payload: string }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: { product: { _id: string; name: string }; variant: { name: string; price: number; size: string; family: string } } }
  | { type: "CHANGE_QTY"; payload: { key: string; delta: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "RESTORE_ORDER_FOR_EDIT"; payload: Order }
  | { type: "CHECKOUT_START" }
  | { type: "CHECKOUT_SUCCESS" }
  | { type: "CHECKOUT_ERROR"; payload: string }
  | { type: "CLEAR_HISTORY_START" }
  | { type: "CLEAR_HISTORY_SUCCESS" }
  | { type: "CLEAR_HISTORY_ERROR"; payload: string };

function getActiveCart(state: State): CartItem[] {
  if (state.orderType === "takeaway") return state.takeawayCart;
  if (state.orderType === "home-delivery") return state.homeDeliveryCart;
  return state.tableCarts[state.table as number] || [];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ORDER_TYPE":
      return {
        ...state,
        orderType: action.payload,
        table: action.payload === "dine-in" ? state.table : null,
        deliveryCharges: action.payload === "home-delivery" ? state.deliveryCharges : "",
        editingOrderId: null,
      };

    case "SET_TABLE":
      return { ...state, table: action.payload, editingOrderId: null };

    case "SET_CATEGORY":
      return { ...state, category: action.payload };

    case "SET_PAYMENT_TYPE":
      return { ...state, paymentType: action.payload };

    case "SET_DELIVERY_DETAILS":
      return { ...state, deliveryDetails: { ...state.deliveryDetails, ...action.payload } };

    case "SET_DELIVERY_CHARGES":
      return { ...state, deliveryCharges: action.payload };

    case "SET_CART": {
      if (state.orderType === "takeaway") return { ...state, takeawayCart: action.payload };
      if (state.orderType === "home-delivery") return { ...state, homeDeliveryCart: action.payload };
      if (!state.table) return state;
      return { ...state, tableCarts: { ...state.tableCarts, [state.table]: action.payload } };
    }

    case "ADD_ITEM": {
      const { product, variant } = action.payload;
      const price = variant.price ?? 0;
      const key = `${product._id}::${variant.name}`;
      const cart = getActiveCart(state);
      const existing = cart.find((i) => i.key === key);
      const newCart = existing
        ? cart.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [
            ...cart,
            {
              key,
              productName: product.name,
              variantName: variant.name,
              size: variant.size,
              price,
              family: variant.family,
              qty: 1,
            },
          ];
      return reducer(state, { type: "SET_CART", payload: newCart });
    }

    case "CHANGE_QTY": {
      const { key, delta } = action.payload;
      const cart = getActiveCart(state)
        .map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      return reducer(state, { type: "SET_CART", payload: cart });
    }

    case "REMOVE_ITEM": {
      const cart = getActiveCart(state).filter((i) => i.key !== action.payload);
      return reducer(state, { type: "SET_CART", payload: cart });
    }

    case "RESTORE_ORDER_FOR_EDIT": {
      const order = action.payload;
      const restoredItems: CartItem[] = order.items.map((item) => ({
        key: `${item.productName}::${item.variantName}`,
        productName: item.productName,
        variantName: item.variantName,
        size: item.size || "",
        price: item.price,
        family: "cola",
        qty: item.qty,
      }));

      const base: State = {
        ...state,
        paymentType: order.paymentType || "cash",
        editingOrderId: order._id,
        deliveryDetails: order.deliveryDetails || emptyDeliveryDetails,
        deliveryCharges: order.deliveryCharges != null ? String(order.deliveryCharges) : "",
      };

      if (order.orderType === "takeaway") {
        return { ...base, orderType: "takeaway", table: null, takeawayCart: restoredItems };
      }
      if (order.orderType === "home-delivery") {
        return { ...base, orderType: "home-delivery", table: null, homeDeliveryCart: restoredItems };
      }
      return {
        ...base,
        orderType: "dine-in",
        table: order.table,
        tableCarts: { ...state.tableCarts, [order.table as number]: restoredItems },
      };
    }

    case "CHECKOUT_START":
      return { ...state, isCheckingOut: true, checkoutError: null };

    case "CHECKOUT_SUCCESS": {
      const cleared = reducer(state, { type: "SET_CART", payload: [] });
      return {
        ...cleared,
        isCheckingOut: false,
        editingOrderId: null,
        paymentType: "cash",
        deliveryDetails: emptyDeliveryDetails,
        deliveryCharges: "",
        table: state.orderType === "dine-in" ? null : state.table,
      };
    }

    case "CHECKOUT_ERROR":
      return { ...state, isCheckingOut: false, checkoutError: action.payload };

    case "CLEAR_HISTORY_START":
      return { ...state, isClearingHistory: true, clearHistoryError: null };

    case "CLEAR_HISTORY_SUCCESS":
      return { ...state, isClearingHistory: false };

    case "CLEAR_HISTORY_ERROR":
      return { ...state, isClearingHistory: false, clearHistoryError: action.payload };

    default:
      return state;
  }
}

interface OrderContextValue extends State {
  activeCart: CartItem[];
  total: number;
  grandTotal: number;
  itemCount: number;
  isDeliveryDetailsValid: boolean;
  setOrderType: (val: OrderType) => void;
  setTable: (t: number) => void;
  setCategory: (c: string) => void;
  setPaymentType: (p: PaymentType) => void;
  setDeliveryDetails: (details: Partial<DeliveryDetails>) => void;
  setDeliveryCharges: (val: string) => void;
  addItem: (product: { _id: string; name: string }, variant: { name: string; price: number; size: string; family: string }) => void;
  changeQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  checkout: () => Promise<void>;
  editOrder: (order: Order) => void;
  clearHistory: () => Promise<void>;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const activeCart = getActiveCart(state);
  const total = useMemo(() => activeCart.reduce((sum, i) => sum + i.price * i.qty, 0), [activeCart]);
  const itemCount = useMemo(() => activeCart.reduce((sum, i) => sum + i.qty, 0), [activeCart]);

  const deliveryChargesNum = state.orderType === "home-delivery" ? Number(state.deliveryCharges) || 0 : 0;
  const grandTotal = total + deliveryChargesNum;

  const setOrderType = useCallback((val: OrderType) => dispatch({ type: "SET_ORDER_TYPE", payload: val }), []);
  const setTable = useCallback((t: number) => dispatch({ type: "SET_TABLE", payload: t }), []);
  const setCategory = useCallback((c: string) => dispatch({ type: "SET_CATEGORY", payload: c }), []);
  const setPaymentType = useCallback((p: PaymentType) => dispatch({ type: "SET_PAYMENT_TYPE", payload: p }), []);
  const setDeliveryDetails = useCallback(
    (details: Partial<DeliveryDetails>) => dispatch({ type: "SET_DELIVERY_DETAILS", payload: details }),
    []
  );
  const setDeliveryCharges = useCallback((val: string) => dispatch({ type: "SET_DELIVERY_CHARGES", payload: val }), []);
  const addItem = useCallback(
    (product: { _id: string; name: string }, variant: { name: string; price: number; size: string; family: string }) =>
      dispatch({ type: "ADD_ITEM", payload: { product, variant } }),
    []
  );
  const changeQty = useCallback((key: string, delta: number) => dispatch({ type: "CHANGE_QTY", payload: { key, delta } }), []);
  const removeItem = useCallback((key: string) => dispatch({ type: "REMOVE_ITEM", payload: key }), []);

  const isDeliveryDetailsValid =
    state.orderType !== "home-delivery" ||
    Boolean(state.deliveryDetails.name.trim() && state.deliveryDetails.phone.trim());

  const checkout = useCallback(async () => {
    dispatch({ type: "CHECKOUT_START" });
    try {
      await checkoutOrder({
        orderId: state.editingOrderId,
        orderType: state.orderType,
        table: state.table,
        paymentType: state.paymentType,
        deliveryDetails: state.orderType === "home-delivery" ? state.deliveryDetails : undefined,
        deliveryCharges: state.orderType === "home-delivery" ? deliveryChargesNum : 0,
        cart: activeCart,
        total: grandTotal,
      });
      dispatch({ type: "CHECKOUT_SUCCESS" });
    } catch {
      dispatch({ type: "CHECKOUT_ERROR", payload: "Checkout failed. Try again." });
    }
  }, [
    state.editingOrderId,
    state.orderType,
    state.table,
    state.paymentType,
    state.deliveryDetails,
    deliveryChargesNum,
    activeCart,
    grandTotal,
  ]);

  const editOrder = useCallback(
    (order: Order) => {
      dispatch({ type: "RESTORE_ORDER_FOR_EDIT", payload: order });
      router.push("/");
    },
    [router]
  );

  const clearHistory = useCallback(async () => {
    dispatch({ type: "CLEAR_HISTORY_START" });
    try {
      await deleteAllOrders();
      dispatch({ type: "CLEAR_HISTORY_SUCCESS" });
    } catch {
      dispatch({ type: "CLEAR_HISTORY_ERROR", payload: "Clear history failed. Try again." });
    }
  }, []);

  const value: OrderContextValue = {
    ...state,
    activeCart,
    total,
    grandTotal,
    itemCount,
    isDeliveryDetailsValid,
    setOrderType,
    setTable,
    setCategory,
    setPaymentType,
    setDeliveryDetails,
    setDeliveryCharges,
    addItem,
    changeQty,
    removeItem,
    checkout,
    editOrder,
    clearHistory,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
