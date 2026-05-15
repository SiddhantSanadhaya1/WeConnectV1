import { NextResponse } from "next/server";
import { listCatalogSuppliers } from "@/lib/store/buyer-catalog";

export async function GET() {
  const requests = listCatalogSuppliers()
    .filter((supplier) => supplier.cert_type === "digital" && supplier.cert_status === "pending")
    .map((supplier) => ({
      id: supplier.id,
      businessName: supplier.business_name,
      country: supplier.country,
      industryCodes: supplier.industry_codes,
      categoryCodes: supplier.category_codes,
      trustScore: supplier.trust_score,
      lastVerified: supplier.last_verified,
      businessSummary: supplier.business_summary,
    }));

  return NextResponse.json({ ok: true, requests });
}
