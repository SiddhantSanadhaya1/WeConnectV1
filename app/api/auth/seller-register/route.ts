import { NextResponse } from "next/server";
import { BUSINESS_DESIGNATIONS } from "@/lib/constants";
import { upsertCatalogSupplier } from "@/lib/store/buyer-catalog";

type SellerRegisterBody = {
  companyName?: string;
  contactName?: string;
  email?: string;
  country?: string;
  naics?: string;
  unspsc?: string;
  womenOwned?: boolean;
  digitalCertification?: boolean;
  summary?: string;
};

function toId(value: string) {
  return `seller-${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)}`;
}

export async function POST(req: Request) {
  const body = (await req.json()) as SellerRegisterBody;
  const companyName = body.companyName?.trim();
  const email = body.email?.trim();

  if (!companyName || !email) {
    return NextResponse.json(
      { ok: false, message: "Company name and email are required." },
      { status: 400 },
    );
  }

  const id = toId(companyName || email);
  const digitalCertification = Boolean(body.digitalCertification);
  const womenOwned = body.womenOwned !== false;
  const designations = womenOwned
    ? ["Women-Owned", "Small Business"]
    : [BUSINESS_DESIGNATIONS[0] ?? "Small Business"];

  const supplier = upsertCatalogSupplier({
    id,
    business_name: companyName,
    country: body.country?.trim() || "United States",
    industry_codes: [body.naics?.trim() || "54"],
    category_codes: [body.unspsc?.trim() || "80000000"],
    designations,
    cert_type: digitalCertification ? "digital" : "self",
    cert_status: digitalCertification ? "pending" : "active",
    trust_score: digitalCertification ? 72 : 68,
    blockchain_verified: false,
    women_owned: womenOwned,
    last_verified: new Date().toISOString().slice(0, 10),
    business_summary:
      body.summary?.trim() ||
      `${companyName} registered through the seller login and is visible to buyer discovery teams.`,
    clients_worked_with: `Registered by ${body.contactName?.trim() || "seller contact"} (${email})`,
  });

  return NextResponse.json({
    ok: true,
    supplier,
    redirectTo: `/buyer-portal?supplierId=${encodeURIComponent(supplier.id)}`,
  });
}
