"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import OrderTypeToggle from "@/components/OrderTypeToggle";
import TableSelector from "@/components/TableSelector";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import OrderPanel from "@/components/OrderPanel";
import { useOrder } from "@/context/OrderContext";
import { useProducts } from "@/hooks/useProducts";
import SipzoLoader from "@/components/SipzoLoader";

export default function PosPage() {
  const router = useRouter();
  const { products, loading } = useProducts();  
  const [searchQuery, setSearchQuery] = useState("");

  const {
    orderType,
    table,
    category,
    activeCart,
    total,
    itemCount,
    paymentType,
    deliveryDetails,
    deliveryCharges,
    isCheckingOut,
    checkoutError,
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
  } = useOrder();

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;

    return products
      .map((p) => ({
        ...p,
        variants: p.variants.filter(
          (v) => v.name.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
        ),
      }))
      .filter((p) => p.variants.length > 0);
  }, [products, searchQuery]);

  const effectiveCategory = searchQuery.trim() ? "All Items" : category;

  return (
    <>
      <Header
        onShowOrders={() => router.push("/orders")}
        onShowAdmin={() => router.push("/admin")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <OrderTypeToggle orderType={orderType} onChange={setOrderType} />

      {orderType === "dine-in" && <TableSelector table={table} onSelect={setTable} />}

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_360px]">
        <div>
          <CategoryTabs category={category} onChange={setCategory} />
          {loading ? (
            <SipzoLoader />
          ) : (
            <ProductGrid products={filteredProducts} category={effectiveCategory} onAdd={addItem} />
          )}
          {/* <ProductGrid products={filteredProducts} category={effectiveCategory} onAdd={addItem} /> */}
        </div>

        <div>
          <OrderPanel
            orderType={orderType}
            table={table}
            cart={activeCart}
            total={total}
            itemCount={itemCount}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            deliveryDetails={deliveryDetails}
            onDeliveryDetailsChange={setDeliveryDetails}
            deliveryCharges={deliveryCharges}
            onDeliveryChargesChange={setDeliveryCharges}
            onChangeQty={changeQty}
            onRemove={removeItem}
            onCheckout={checkout}
            isCheckingOut={isCheckingOut}
            checkoutError={checkoutError}
          />
        </div>
      </div>
    </>
  );
}
