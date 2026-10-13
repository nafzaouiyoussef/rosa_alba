import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { getLegalPage, legalLinks, LEGAL_SLUGS } from "@/lib/legal";
import { tr } from "@/lib/tr";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getSettings();
  const p = getLegalPage(params.slug, "fr", s);
  return p ? { title: p.title, description: p.intro || p.title } : {};
}

export default async function LegalPage({ params }: { params: { slug: string } }) {
  if (!(LEGAL_SLUGS as readonly string[]).includes(params.slug)) notFound();
  const lang = getLang();
  const settings = await getSettings();
  const page = getLegalPage(params.slug, lang, settings);
  if (!page) notFound();

  return (
    <div className="container-x grid gap-10 py-12 md:grid-cols-[14rem_1fr] md:py-16">
      <aside className="md:sticky md:top-28 md:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/50">{tr(lang, "Informations", "معلومات")}</p>
        <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {legalLinks(lang).map((l) => (
            <Link
              key={l.slug}
              href={`/legal/${l.slug}`}
              className={`rounded-full px-3 py-1.5 text-sm md:rounded-lg ${l.slug === params.slug ? "bg-ink text-white" : "bg-white/70 text-ink/70 hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="max-w-3xl">
        <h1 className="h-section">{page.title}</h1>
        {page.intro && <p className="mt-4 text-lg leading-relaxed text-ink/70">{page.intro}</p>}
        <div className="mt-8 space-y-8">
          {page.sections.map((sec) => (
            <section key={sec.h}>
              <h2 className="font-serif text-xl font-bold">{sec.h}</h2>
              <div className="mt-2 space-y-2 leading-relaxed text-ink/75">
                {sec.p.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-xs text-ink/45">{tr(lang, "Dernière mise à jour : ", "آخر تحديث: ")}{new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", { month: "long", year: "numeric" })}</p>
      </article>
    </div>
  );
}
