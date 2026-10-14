"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api/products";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Products load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}