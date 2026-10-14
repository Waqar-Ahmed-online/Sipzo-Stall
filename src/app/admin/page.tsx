"use client";

import { useRouter } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  const router = useRouter();
  return <AdminPanel onClose={() => router.push("/")} />;
}
