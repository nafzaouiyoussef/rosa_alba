"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { STATUSES, STATUS_LABEL } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

export default function StatusSelect({ id, status, className = "" }: { id: string; status: OrderStatus; className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <div>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          const prev = value;
          setValue(next);
          setErr("");
          start(async () => {
            const r = await updateOrderStatus(id, next);
            if (!r.ok) {
              setValue(prev);
              setErr(r.error || "Erreur");
            } else router.refresh();
          });
        }}
        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${className}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}
