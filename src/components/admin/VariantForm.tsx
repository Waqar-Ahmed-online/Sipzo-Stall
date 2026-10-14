"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { FLAVOR_FAMILIES } from "@/data/products";
import { uploadImage } from "@/lib/api/upload";
import type { useVariantForm } from "@/hooks/useVariantForm";

const FAMILY_KEYS = Object.keys(FLAVOR_FAMILIES);

const fieldClass =
  "rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-brand hover:border-brand/60";

interface VariantFormProps {
  form: ReturnType<typeof useVariantForm>;
  onSubmit: () => void;
  submitLabel: string;
  submitIcon: React.ReactNode;
}

export default function VariantForm({ form, onSubmit, submitLabel, submitIcon }: VariantFormProps) {
  const { values, setField } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const data = await uploadImage(file);
      setField("image", data.url);
    } catch {
      setUploadError("Image upload failed, try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Variant name</span>
          <input
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className={fieldClass}
          />
        </label>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <div className="flex items-center gap-2">
          {values.image && (
            <Image src={values.image} alt="" width={36} height={36} unoptimized className="rounded-md object-cover" />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-brand px-3 py-2 text-sm text-brand disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading..." : values.image ? "Change Image" : "Browse Image"}
          </button>
        </div>

        <label className="flex min-w-[130px] flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Flavor family</span>
          <select
            value={values.family}
            onChange={(e) => setField("family", e.target.value)}
            className={fieldClass}
          >
            <option value="" />
            {FAMILY_KEYS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[140px] flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Size name</span>
          <input
            placeholder="Small / Single / Jumbo..."
            value={values.size}
            onChange={(e) => setField("size", e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="flex min-w-[110px] flex-col gap-1">
          <span className="text-xs text-[#a0a0a0]">Price</span>
          <input
            type="number"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      {uploadError && <p className="mb-2 text-xs text-danger">{uploadError}</p>}

      <button
        onClick={onSubmit}
        className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-bg hover:bg-brand-dark"
      >
        {submitIcon}
        {submitLabel}
      </button>
    </>
  );
}
