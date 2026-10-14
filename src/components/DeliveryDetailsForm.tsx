"use client";

import { useState } from "react";
import type { DeliveryDetails } from "@/types";

interface DeliveryDetailsFormProps {
  deliveryDetails: DeliveryDetails;
  onChange: (details: Partial<DeliveryDetails>) => void;
}

const fieldClass =
  "w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-[#a0a0a0] focus:border-brand hover:border-brand/60";

export default function DeliveryDetailsForm({ deliveryDetails, onChange }: DeliveryDetailsFormProps) {
  const [name, setName] = useState(deliveryDetails.name);
  const [phone, setPhone] = useState(deliveryDetails.phone);
  // Tracks the last-seen prop values so we can detect an external change
  // (e.g. edit-order restore) and resync during render — no effect needed.
  const [synced, setSynced] = useState(deliveryDetails);

  if (synced.name !== deliveryDetails.name || synced.phone !== deliveryDetails.phone) {
    setSynced(deliveryDetails);
    setName(deliveryDetails.name);
    setPhone(deliveryDetails.phone);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-white/8 p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[#a0a0a0]">Customer name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onChange({ name })}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[#a0a0a0]">Phone number</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => onChange({ phone })}
          className={fieldClass}
        />
      </label>
    </div>
  );
}
