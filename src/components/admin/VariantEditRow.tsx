"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useVariantForm } from "@/hooks/useVariantForm";
import VariantForm from "./VariantForm";
import type { Variant } from "@/types";

export interface VariantEditRowHandle {
  getDirtyPayload: () => Variant | null;
  markSaved: () => void;
}

interface VariantEditRowProps {
  variant: Variant;
  batchSaving: boolean;
  onSave: (payload: Variant) => Promise<boolean>;
  onDelete: () => Promise<void>;
  onError: (msg: string) => void;
}

const VariantEditRow = forwardRef<VariantEditRowHandle, VariantEditRowProps>(function VariantEditRow(
  { variant, onSave, onDelete, onError, batchSaving },
  ref
) {
  const form = useVariantForm(variant);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useImperativeHandle(ref, () => ({
    getDirtyPayload: () => {
      if (!form.isDirty) return null;
      if (!form.isValid) {
        onError(`${form.values.name || "Variant"}: name aur kam az kam ek size ki price zaroori hai`);
        return null;
      }
      return form.toPayload();
    },
    markSaved: () => form.markSaved(),
  }));

  const handleSave = async () => {
    if (!form.isValid) {
      onError("Variant name aur kam az kam ek size ki price zaroori hai");
      return;
    }
    setSaving(true);
    try {
      const ok = await onSave(form.toPayload());
      if (ok) form.markSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isDisabled = saving || deleting || batchSaving;

  return (
    <div
      className="rounded-lg p-3 transition-opacity"
      style={{
        backgroundColor: "#0d100a",
        border: form.isDirty ? "1px solid #7ED321" : "1px solid rgba(255,255,255,0.06)",
        opacity: isDisabled ? 0.55 : 1,
        pointerEvents: isDisabled ? "none" : "auto",
      }}
    >
      <div className="mb-2 flex items-center justify-end gap-2">
        {confirmDelete && <span className="self-center text-xs text-danger">Pakka delete karna hai?</span>}
        <button
          onClick={handleDeleteClick}
          className="rounded-md p-1.5"
          style={{
            color: confirmDelete ? "#fff" : "#e05555",
            backgroundColor: confirmDelete ? "#e05555" : "transparent",
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <VariantForm
        form={form}
        onSubmit={handleSave}
        submitLabel={saving ? "Saving..." : "Save"}
        submitIcon={<Save className="h-3.5 w-3.5" />}
      />
    </div>
  );
});

export default VariantEditRow;
