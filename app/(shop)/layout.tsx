import { getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TrackingScripts from "@/components/TrackingScripts";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  const settings = await getSettings();
  return (
    <>
      <Header lang={lang} settings={settings} />
      <main>{children}</main>
      <Footer lang={lang} settings={settings} />
      <WhatsAppFloat number={settings.whatsapp} />
      <TrackingScripts settings={settings} />
    </>
  );
}
