"use client";

import { useRouter } from "next/navigation";
import { useLang } from "./Providers";

export default function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();
  const next = lang === "ar" ? "fr" : "ar";

  return (
    <button
      type="button"
      aria-label="Language"
      onClick={() => {
        document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className={`rounded-full border border-ink/20 px-3 py-1.5 text-sm font-semibold hover:border-ink/50 ${className}`}
    >
      {lang === "ar" ? "Français" : "العربية"}
    </button>
  );
}
