import type { Product, Settings } from "./types";

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const abs = (p: string) => (/^https?:\/\//.test(p) ? p : `${SITE}${p.startsWith("/") ? "" : "/"}${p}`);

export const BRAND_DESC =
  "Soins visage et corps naturels aux huiles précieuses du Maroc : sérum anti-âge, crème de nuit, masque éclat rose, huile sèche et gel gommage. Livraison gratuite partout au Maroc, paiement à la livraison.";

export function clip(s: string, n = 155) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

export function organizationLd(s: Settings) {
  const sameAs = [s.instagram && `https://www.instagram.com/${s.instagram}`].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#org`,
        name: s.business_name || "Rosa Alba",
        url: SITE,
        logo: abs("/logo.png"),
        image: abs("/og.jpg"),
        ...(sameAs.length ? { sameAs } : {}),
        ...(s.contact_email || s.whatsapp
          ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", areaServed: "MA", availableLanguage: ["fr", "ar"], ...(s.contact_email ? { email: s.contact_email } : {}), ...(s.whatsapp ? { telephone: s.whatsapp } : {}) } }
          : {}),
        ...(s.business_address ? { address: { "@type": "PostalAddress", streetAddress: s.business_address, addressCountry: "MA" } } : {})
      },
      { "@type": "WebSite", "@id": `${SITE}/#site`, url: SITE, name: "Rosa Alba", inLanguage: ["fr-MA", "ar-MA"], publisher: { "@id": `${SITE}/#org` } }
    ]
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) }))
  };
}

export function productLd(p: Product, s: Settings, rating?: { avg: number; count: number }) {
  const price = Number(p.price);
  const until = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": abs(`/products/${p.slug}`) + "#product",
    name: p.name_fr,
    description: p.description_fr,
    sku: p.slug,
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care",
    image: (p.images || []).map(abs),
    brand: { "@type": "Brand", name: "Rosa Alba" },
    ...(rating && rating.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg.toFixed(1), reviewCount: rating.count } } : {}),
    offers: {
      "@type": "Offer",
      url: abs(`/products/${p.slug}`),
      priceCurrency: "MAD",
      price,
      priceValidUntil: until,
      itemCondition: "https://schema.org/NewCondition",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE}/#org` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: Number(s.shipping_fee) || 0, currency: "MAD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "MA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
      }
    }
  };
}
