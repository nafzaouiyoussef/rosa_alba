import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { LEGAL_SLUGS } from "@/lib/legal";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  return [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/routine"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({
      url: abs(`/products/${p.slug}`),
      lastModified: (p as any).updated_at ? new Date((p as any).updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: (p.images || []).map(abs)
    })),
    ...LEGAL_SLUGS.map((s) => ({ url: abs(`/legal/${s}`), lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 }))
  ];
}
