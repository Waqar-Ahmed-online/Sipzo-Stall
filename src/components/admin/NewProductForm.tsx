"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { useVariantForm } from "@/hooks/useVariantForm";
import VariantForm from "./VariantForm";
import type { Product, Variant } from "@/types";

interface NewProductFormProps {
  products: Product[];
  onAdd: (payload: { name: string; category: string; variants: Variant[] }) => Promise<boolean>;
  onError: (msg: string) => void;
}

export default function NewProductForm({ products, onAdd, onError }: NewProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const variantForm = useVariantForm();

  const categoryOptions = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...CATEGORIES, ...fromProducts]));
  }, [products]);

  const handleAdd = async () => {
    if (!name.trim() || !category.trim()) return;

    const variants: Variant[] = [];
    if (variantForm.values.name.trim()) {
      if (!variantForm.isValid) {
        onError("Kam az kam ek size ki price daalo variant ke liye");
        return;
      }
      variants.push(variantForm.toPayload());
    }

    const ok = await onAdd({ name: name.trim(), category: category.trim(), variants });
    if (ok) {
      setName("");
      variantForm.reset();
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-white/8 bg-paper p-4">
      <h3 className="mb-2 font-semibold text-white">Add New Product</h3>

      <div className="mb-3 flex flex-wrap gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Product name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
        </label>

        <label className="flex min-w-[180px] flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Category (naya likh sakte ho)</span>
          <input
            list="category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
          <datalist id="category-options">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
      </div>

      <p className="mb-2 block text-xs text-[#a0a0a0]">Optional: pehla variant bhi sath add kar do</p>

      <VariantForm form={variantForm} onSubmit={handleAdd} submitLabel="Add" submitIcon={<Plus className="h-3.5 w-3.5" />} />
    </div>
  );
}
