import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { LEGAL_SLUGS } from "@/lib/legal";

export const dynamic = "force-dynamic";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${SITE}/` },
    { url: `${SITE}/routine` },
    ...products.map((p) => ({ url: `${SITE}/products/${p.slug}` })),
    ...LEGAL_SLUGS.map((s) => ({ url: `${SITE}/legal/${s}` }))
  ];
}
