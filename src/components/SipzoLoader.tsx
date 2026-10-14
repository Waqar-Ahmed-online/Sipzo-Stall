import { Martini } from "lucide-react";

export default function SipzoLoader({ label = "Loading products..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand/30 border-t-brand animate-spin">
        <Martini className="h-6 w-6 text-brand" />
      </div>
      <span className="font-heading text-lg tracking-wide text-white">SIPZO</span>
      <span className="text-sm text-[#a0a0a0]">{label}</span>
    </div>
  );
}