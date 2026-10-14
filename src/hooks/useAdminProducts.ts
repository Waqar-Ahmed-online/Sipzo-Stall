"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVariant,
  createProduct,
  deleteProduct,
  deleteVariant,
  fetchProducts,
  updateVariant,
} from "@/lib/api/products";
import type { Product, Variant } from "@/types";

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch {
      setError("Products load nahi ho sake");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetching data is a side effect by definition (React docs: "Effects
    // let you run some code after rendering so that you can synchronize
    // your component with a system outside of React" — a network request
    // qualifies). Load once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const addProduct = useCallback(
    async (payload: { name: string; category: string; variants: Variant[] }) => {
      try {
        await createProduct(payload);
        await load();
        return true;
      } catch {
        setError("Product add nahi hua");
        return false;
      }
    },
    [load]
  );

  const addProductVariant = useCallback(
    async (productId: string, payload: Variant) => {
      try {
        await addVariant(productId, payload);
        await load();
        return true;
      } catch {
        setError("Variant add nahi hua");
        return false;
      }
    },
    [load]
  );

  const saveVariant = useCallback(async (productId: string, index: number, payload: Variant) => {
    try {
      await updateVariant(productId, index, payload);
      setProducts((prev) =>
        prev.map((p) =>
          p._id !== productId
            ? p
            : { ...p, variants: p.variants.map((v, i) => (i === index ? { ...v, ...payload } : v)) }
        )
      );
      setSuccessMsg(`${payload.name} update ho gaya`);
      return true;
    } catch {
      setError("Variant update nahi hua");
      return false;
    }
  }, []);

  // Fires all variant updates concurrently instead of one-at-a-time — a
  // "Save All" on N variants used to cost N sequential round trips.
  const saveManyVariants = useCallback(
    async (productId: string, edits: { index: number; payload: Variant }[]) => {
      try {
        await Promise.all(edits.map(({ index, payload }) => updateVariant(productId, index, payload)));
        setProducts((prev) =>
          prev.map((p) => {
            if (p._id !== productId) return p;
            const variants = [...p.variants];
            edits.forEach(({ index, payload }) => {
              variants[index] = { ...variants[index], ...payload };
            });
            return { ...p, variants };
          })
        );
        setSuccessMsg(`${edits.length} variant(s) update ho gaye`);
        return true;
      } catch {
        setError("Kuch variants update nahi ho paye");
        return false;
      }
    },
    []
  );

  const removeVariant = useCallback(async (productId: string, index: number, variantName?: string) => {
    try {
      await deleteVariant(productId, index);
      setProducts((prev) =>
        prev.map((p) => (p._id !== productId ? p : { ...p, variants: p.variants.filter((_, i) => i !== index) }))
      );
      setSuccessMsg(`${variantName || "Variant"} delete ho gaya`);
      return true;
    } catch {
      setError("Variant delete nahi hua");
      return false;
    }
  }, []);

  const removeProduct = useCallback(
    async (productId: string) => {
      try {
        await deleteProduct(productId);
        await load();
      } catch {
        setError("Product delete nahi hua");
      }
    },
    [load]
  );

  return {
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
  };
}
