import type { Faq } from "@/lib/content";

export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-2xl bg-white shadow-soft">
      {items.map((f, i) => (
        <details key={i} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {f.q}
            <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
