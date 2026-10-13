import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = { title: "Commande", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-x max-w-4xl py-8 sm:py-12">
      <CheckoutClient shipping={settings.shipping_fee} />
    </div>
  );
}
