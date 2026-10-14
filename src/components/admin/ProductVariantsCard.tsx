"use client";

import { useRef, useState } from "react";
import { Trash2, Plus, Save, ChevronDown } from "lucide-react";
import { useVariantForm } from "@/hooks/useVariantForm";
import VariantForm from "./VariantForm";
import VariantEditRow, { type VariantEditRowHandle } from "./VariantEditRow";
import type { Product, Variant } from "@/types";

interface ProductVariantsCardProps {
  product: Product;
  onDeleteProduct: (productId: string) => Promise<void>;
  onSaveVariant: (productId: string, index: number, payload: Variant) => Promise<boolean>;
  onSaveManyVariants: (productId: string, edits: { index: number; payload: Variant }[]) => Promise<boolean>;
  onAddVariant: (productId: string, payload: Variant) => Promise<boolean>;
  onDeleteVariant: (productId: string, index: number, variantName?: string) => Promise<boolean>;
  onError: (msg: string) => void;
}

export default function ProductVariantsCard({
  product,
  onDeleteProduct,
  onSaveVariant,
  onSaveManyVariants,
  onAddVariant,
  onDeleteVariant,
  onError,
}: ProductVariantsCardProps) {
  const newVariantForm = useVariantForm();
  const rowRefs = useRef(new Map<number, VariantEditRowHandle>());
  const [savingAll, setSavingAll] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAddVariant = async () => {
    if (!newVariantForm.isValid) {
      onError("Variant name aur kam az kam ek size ki price zaroori hai");
      return;
    }
    const ok = await onAddVariant(product._id, newVariantForm.toPayload());
    if (ok) newVariantForm.reset();
  };

  const handleSaveAll = async () => {
    const edits: { index: number; payload: Variant }[] = [];
    rowRefs.current.forEach((row, index) => {
      const payload = row?.getDirtyPayload();
      if (payload) edits.push({ index, payload });
    });

    if (edits.length === 0) {
      onError("Koi changes nahi hain save karne ke liye");
      return;
    }

    setSavingAll(true);
    try {
      const ok = await onSaveManyVariants(product._id, edits);
      if (ok) {
        edits.forEach(({ index }) => rowRefs.current.get(index)?.markSaved());
      }
    } finally {
      setSavingAll(false);
    }
  };

  const AddVariantBox = (
    <div className="rounded-lg border border-dashed border-brand/35 bg-paper-2 p-3">
      <p className="mb-2 block text-xs text-[#a0a0a0]">Naya variant is product mein add karo</p>
      <VariantForm
        form={newVariantForm}
        onSubmit={handleAddVariant}
        submitLabel="Add Variant"
        submitIcon={<Plus className="h-3.5 w-3.5" />}
      />
    </div>
  );

  return (
    <div className="rounded-xl border border-white/8 bg-paper p-4">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-5 w-5 text-brand transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          <p className="font-semibold text-white">
            {product.name}{" "}
            <span className="ml-2 rounded-full bg-[#2a2a2a] px-2 py-0.5 text-sm text-[#ccc]">
              {product.category} · {product.variants.length} variants
            </span>
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteProduct(product._id);
          }}
          className="p-1.5"
        >
          <Trash2 className="h-4 w-4 text-danger" />
        </button>
      </div>

      {expanded && (
        <>
          <hr className="my-3 border-white/8" />

          <div className="mb-3 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={savingAll}
              className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-bg hover:bg-brand-dark disabled:bg-[#2a2a2a] disabled:text-[#666]"
            >
              <Save className="h-3.5 w-3.5" />
              {savingAll ? "Saving..." : "Save All"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {product.variants.map((v, i) => (
              <div key={i}>
                <VariantEditRow
                  ref={(el) => {
                    if (el) rowRefs.current.set(i, el);
                    else rowRefs.current.delete(i);
                  }}
                  variant={v}
                  batchSaving={savingAll}
                  onSave={(payload) => onSaveVariant(product._id, i, payload)}
                  onDelete={() => onDeleteVariant(product._id, i, v.name).then(() => undefined)}
                  onError={onError}
                />
                <div className="mt-2">{AddVariantBox}</div>
              </div>
            ))}

            {product.variants.length === 0 && AddVariantBox}
          </div>
        </>
      )}
    </div>
  );
}
