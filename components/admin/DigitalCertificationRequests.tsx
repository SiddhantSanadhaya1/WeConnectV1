"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Building2, Clock, ExternalLink } from "lucide-react";

type DigitalRequest = {
  id: string;
  businessName: string;
  country: string;
  industryCodes: string[];
  categoryCodes: string[];
  trustScore: number;
  lastVerified?: string;
  businessSummary?: string;
};

export default function DigitalCertificationRequests() {
  const [items, setItems] = useState<DigitalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/digital-cert-requests");
      const json = (await res.json()) as { requests?: DigitalRequest[] };
      setItems(json.requests ?? []);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <section className="enterprise-panel rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
            <BadgeCheck size={15} />Digital certification requests
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">Seller registrations waiting for digital certification review.</p>
        </div>
        <Link
          href="/admin/review"
          className="btn-outline gap-1.5 px-3 py-1.5 text-xs"
        >
          Review queue <ExternalLink size={12} />
        </Link>
      </div>

      {loading ? <p className="text-xs text-[color:var(--muted)]">Loading requests...</p> : null}

      <div className="space-y-2">
        {!loading && items.length === 0 ? (
          <p className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card-muted)] px-3 py-4 text-sm text-[color:var(--muted)]">
            No pending digital certification requests.
          </p>
        ) : null}

        {items.map((item) => (
          <Link
            key={item.id}
            href={`/buyer-portal?supplierId=${encodeURIComponent(item.id)}`}
            className="block rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-3 transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-muted)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
                  <Building2 size={14} className="text-[color:var(--brand-plum)]" />
                  {item.businessName}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {item.country} · NAICS {item.industryCodes.join(", ") || "N/A"} · UNSPSC {item.categoryCodes.join(", ") || "N/A"}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{item.businessSummary ?? "No summary supplied."}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-[color:var(--foreground)]">{item.trustScore}</p>
                <p className="flex items-center gap-1 text-[10px] text-[color:var(--muted)]">
                  <Clock size={10} />{item.lastVerified ?? "new"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
