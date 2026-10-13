import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { Providers } from "@/components/Providers";
import UtmCapture from "@/components/UtmCapture";
import { BRAND_DESC } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Rosa Alba — Soins naturels marocains | Argan & figue de Barbarie", template: "%s · Rosa Alba" },
  description: BRAND_DESC,
  applicationName: "Rosa Alba",
  keywords: ["soins naturels Maroc", "huile d'argan", "figue de Barbarie", "sérum anti-âge", "crème de nuit", "masque visage", "cosmétique marocaine", "livraison gratuite Maroc", "paiement à la livraison", "منتجات العناية بالبشرة المغرب", "زيت الأركان"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    siteName: "Rosa Alba",
    locale: "fr_MA",
    alternateLocale: ["ar_MA"],
    url: SITE,
    title: "Rosa Alba — Soins naturels marocains",
    description: BRAND_DESC,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Rosa Alba — Masque Éclat Rose" }]
  },
  twitter: { card: "summary_large_image", title: "Rosa Alba — Soins naturels marocains", description: BRAND_DESC, images: ["/og.jpg"] },
  formatDetection: { telephone: false },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION ? { "facebook-domain-verification": process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION } : undefined
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2a33"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap"
        />
      </head>
      <body>
        <Providers lang={lang}>
          {children}
          <UtmCapture />
        </Providers>
      </body>
    </html>
  );
}
