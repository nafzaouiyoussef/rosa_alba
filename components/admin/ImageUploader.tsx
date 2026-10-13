"use client";

import { useRef, useState } from "react";

/** Uploads one or more images to Supabase Storage and reports the public URLs. */
export default function ImageUploader({ onUploaded, label = "Téléverser des images", multiple = true }: { onUploaded: (urls: string[]) => void; label?: string; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setErr("");
    const urls: string[] = [];
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) urls.push(d.url);
      else setErr(d.error || "Échec du téléversement");
    }
    if (urls.length) onUploaded(urls);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={onChange} className="hidden" />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-medium hover:border-ink/50">
        {busy ? "Envoi…" : `⬆ ${label}`}
      </button>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
