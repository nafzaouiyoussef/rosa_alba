"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw })
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setErr(d.error || "Erreur");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4" dir="ltr">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-4 text-center font-serif text-2xl font-bold">Rosa Alba · Admin</h1>
        <label className="label mt-6" htmlFor="pw">Mot de passe</label>
        <input id="pw" type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} className="input" autoComplete="current-password" />
        {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button disabled={busy || !pw} className="btn-primary mt-5 w-full">{busy ? "…" : "Connexion"}</button>
      </form>
    </div>
  );
}
