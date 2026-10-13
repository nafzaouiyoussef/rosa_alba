import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { Providers } from "@/components/Providers";
import UtmCapture from "@/components/UtmCapture";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Rosa Alba — Soins naturels marocains", template: "%s · Rosa Alba" },
  description:
    "Soins visage et corps aux huiles précieuses du Maroc : argan, figue de Barbarie, macadamia. Livraison gratuite et paiement à la livraison partout au Maroc.",
  openGraph: { type: "website", siteName: "Rosa Alba", locale: "fr_MA" },
  icons: { icon: "/logo.png" }
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
