import { getSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettings() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold">Réglages & tracking</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
