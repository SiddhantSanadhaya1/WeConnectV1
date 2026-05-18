import AuthGate from "@/components/auth/AuthGate";
import Navbar from "@/components/layout/Navbar";
import { SellerProfileClient } from "@/components/seller/SellerProfileClient";
import { type Language } from "@/lib/i18n";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = lang as Language;

  return (
    <AuthGate allowed={["seller"]}>
      <div className="app-shell flex min-h-screen flex-col">
        <Navbar language={language} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-10">
          <SellerProfileClient language={language} />
        </main>
      </div>
    </AuthGate>
  );
}
