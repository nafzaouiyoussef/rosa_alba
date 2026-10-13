import type { Metadata } from "next";
import { isDemoMode } from "@/lib/supabase";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f4ef] md:flex" dir="ltr" lang="fr">
      <AdminNav />
      <div className="min-w-0 flex-1 p-4 sm:p-8">
        {isDemoMode() && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <b>Mode démo :</b> Supabase n&apos;est pas configuré (variables <code>SUPABASE_URL</code> et{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> manquantes). Vous pouvez voir l&apos;interface, mais rien ne sera enregistré.
            {process.env.ADMIN_DEMO === "1" && " Les commandes affichées sont des exemples fictifs (ADMIN_DEMO=1)."}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
