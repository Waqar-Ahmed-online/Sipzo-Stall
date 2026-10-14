"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import NewProductForm from "./admin/NewProductForm";
import ProductVariantsCard from "./admin/ProductVariantsCard";
import SalesPanel from "./admin/SalesPanel";

type Tab = "products" | "sales";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const {
    products,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    addProduct,
    addProductVariant,
    saveVariant,
    saveManyVariants,
    removeVariant,
    removeProduct,
  } = useAdminProducts();

  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccessMsg]);

  return (
    <div className="mx-auto max-w-[820px] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
        <button onClick={onClose} className="rounded-full border border-brand px-4 py-1.5 text-sm font-semibold text-brand">
          Back to POS
        </button>
      </div>

      <div className="mb-4 flex gap-1 border-b border-white/8">
        <button
          onClick={() => setTab("products")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "products" ? "border-b-2 border-brand text-white" : "text-[#a0a0a0]"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "sales" ? "border-b-2 border-brand text-white" : "text-[#a0a0a0]"
          }`}
        >
          Sales
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {tab === "products" && (
        <>
          <NewProductForm products={products} onAdd={addProduct} onError={setError} />

          {loading && <Loader2 className="h-6 w-6 animate-spin text-brand" />}

          <div className="flex flex-col gap-4">
            {products.map((p) => (
              <ProductVariantsCard
                key={p._id}
                product={p}
                onDeleteProduct={removeProduct}
                onSaveVariant={saveVariant}
                onSaveManyVariants={saveManyVariants}
                onAddVariant={addProductVariant}
                onDeleteVariant={removeVariant}
                onError={setError}
              />
            ))}
          </div>

          {!loading && products.length === 0 && <p className="text-[#a0a0a0]">Abhi koi product nahi hai. Upar se add karo.</p>}
        </>
      )}

      {tab === "sales" && <SalesPanel />}
    </div>
  );
}
