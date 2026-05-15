import { ConciergeClient } from "@/components/ConciergeClient";
import AuthGate from "@/components/auth/AuthGate";
import Navbar from "@/components/layout/Navbar";
import { type Language } from "@/lib/i18n";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const embed = sp.embed === "1";

  if (embed) {
    return (
      <div className="app-shell flex min-h-full flex-1 flex-col p-4">
        <ConciergeClient embed={embed} language={lang as Language} />
      </div>
    );
  }

  return (
    <AuthGate allowed={["seller", "admin"]}>
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar language={lang as Language} />
      <div className="mx-auto w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-10">
        <ConciergeClient embed={embed} language={lang as Language} />
      </div>
    </div>
    </AuthGate>
  );
}
