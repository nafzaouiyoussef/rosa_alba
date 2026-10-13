import type { Lang, Review } from "@/lib/types";
import { tr } from "@/lib/tr";
import Stars from "./Stars";

/** Renders only real, admin-approved reviews. Renders nothing when there are none. */
export default function Reviews({ reviews, lang }: { reviews: Review[]; lang: Lang }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-8 text-center">
          <h2 className="h-section">{tr(lang, "Elles en parlent", "آراء زبوناتنا")}</h2>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-ink/70">
            <Stars value={avg} />
            <span className="font-semibold">{avg.toFixed(1)}/5</span>
            <span>· {reviews.length} {tr(lang, "avis", "تقييم")}</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 9).map((r) => (
            <figure key={r.id} className="card p-5">
              <Stars value={r.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-ink/80">{r.body}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {r.author}
                {r.city && <span className="font-normal text-ink/50"> · {r.city}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
