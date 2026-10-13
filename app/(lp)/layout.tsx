import { getSettings } from "@/lib/data";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TrackingScripts from "@/components/TrackingScripts";

export const dynamic = "force-dynamic";

/** Landing pages for ads: no menu, no footer links, nothing that leaks traffic. */
export default async function LpLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      {children}
      <WhatsAppFloat number={settings.whatsapp} />
      <TrackingScripts settings={settings} />
    </>
  );
}
