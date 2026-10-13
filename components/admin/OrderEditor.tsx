"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOrderNotes, updateOrderCustomer } from "@/app/admin/actions";

export default function OrderEditor({
  id,
  name,
  phone,
  city,
  address,
  adminNotes
}: {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  adminNotes: string;
}) {
  const router = useRouter();
  const [f, setF] = useState({ customer_name: name, phone, city, address });
  const [notes, setNotes] = useState(adminNotes);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const a = await updateOrderCustomer(id, f);
      const b = await saveOrderNotes(id, notes);
      setMsg(a.ok && b.ok ? "Enregistré ✓" : a.error || b.error || "Erreur");
      if (a.ok && b.ok) router.refresh();
      setTimeout(() => setMsg(""), 2500);
    });
  }

  return (
    <div className="space-y-3">
      <div><label className="label">Nom</label><input className="input !py-2.5" value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Téléphone</label><input className="input !py-2.5" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div><label className="label">Ville</label><input className="input !py-2.5" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
      </div>
      <div><label className="label">Adresse</label><textarea rows={2} className="input !py-2.5" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      <div><label className="label">Notes internes (appel, livreur…)</label><textarea rows={3} className="input !py-2.5" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary !px-6 !py-2.5 text-sm">{pending ? "…" : "Enregistrer"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
