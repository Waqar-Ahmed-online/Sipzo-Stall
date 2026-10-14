"use client";

import { useCallback, useMemo, useState } from "react";
import type { Variant } from "@/types";

interface VariantFormValues {
  name: string;
  image: string;
  family: string;
  size: string;
  price: string;
}

function buildValues(initial?: Partial<Variant>): VariantFormValues {
  return {
    name: initial?.name || "",
    image: initial?.image || "",
    family: initial?.family || "",
    size: initial?.size || "",
    price: initial?.price != null ? String(initial.price) : "",
  };
}

export function useVariantForm(initial?: Partial<Variant>) {
  const [values, setValues] = useState<VariantFormValues>(() => buildValues(initial));
  const [baseline, setBaseline] = useState<VariantFormValues>(() => buildValues(initial));

  const setField = useCallback((field: keyof VariantFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues({ name: "", image: "", family: "", size: "", price: "" });
  }, []);

  const toPayload = useCallback(
    (): Variant => ({
      name: values.name.trim(),
      image: values.image.trim(),
      family: values.family,
      size: values.size.trim(),
      price: Number(values.price),
    }),
    [values]
  );

  const isValid =
    values.name.trim().length > 0 &&
    values.size.trim().length > 0 &&
    values.price !== "" &&
    values.price != null &&
    !Number.isNaN(Number(values.price));

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);

  const markSaved = useCallback(() => {
    setBaseline(values);
  }, [values]);

  return { values, setField, reset, toPayload, isValid, isDirty, markSaved };
}

export type { VariantFormValues };
