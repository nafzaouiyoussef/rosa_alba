import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rosa Alba — Soins naturels marocains",
    short_name: "Rosa Alba",
    description: "Soins naturels aux huiles précieuses du Maroc. Livraison gratuite, paiement à la livraison.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#0f2a33",
    icons: [{ src: "/logo.png", sizes: "476x476", type: "image/png", purpose: "any" }]
  };
}
