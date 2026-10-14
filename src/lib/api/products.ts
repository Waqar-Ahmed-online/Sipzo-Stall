import type { Product, Variant } from "@/types";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function createProduct(payload: {
  name: string;
  category: string;
  variants: Variant[];
}): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function addVariant(productId: string, variant: Variant): Promise<Product> {
  const res = await fetch(`/api/products/${productId}/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variant),
  });
  if (!res.ok) throw new Error("Failed to add variant");
  return res.json();
}

export async function updateVariant(
  productId: string,
  index: number,
  variant: Variant
): Promise<Product> {
  const res = await fetch(`/api/products/${productId}/variants/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variant),
  });
  if (!res.ok) throw new Error("Failed to update variant");
  return res.json();
}

export async function deleteVariant(productId: string, index: number): Promise<Product> {
  const res = await fetch(`/api/products/${productId}/variants/${index}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete variant");
  return res.json();
}

export async function deleteProduct(productId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}
