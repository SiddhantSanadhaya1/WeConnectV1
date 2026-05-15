"use client";

import Link from "next/link";
import { Activity, BarChart3, Building2, FileSearch, ShieldAlert } from "lucide-react";
import AuthGate from "@/components/auth/AuthGate";
import Navbar from "@/components/layout/Navbar";
import { AdminDashboard } from "@/components/AdminDashboard";
import DigitalCertificationRequests from "@/components/admin/DigitalCertificationRequests";

const ADMIN_LINKS = [
  { href: "/en/dashboard", label: "Seller registration", icon: Building2 },
  { href: "/admin/review", label: "Manual review", icon: FileSearch },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/fraud", label: "Fraud monitoring", icon: ShieldAlert },
];

export default function AdminPage() {
  return (
    <AuthGate allowed={["admin"]}>
      <div className="app-shell">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-muted)] px-3 py-1 text-xs font-medium text-[color:var(--brand-plum)]">
                <Activity size={12} />Admin access
              </p>
              <h1 className="font-display text-2xl font-bold text-[color:var(--foreground)]">Admin Command Center</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Full platform controls, digital certification requests, live sessions, and system health.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-outline gap-2 px-3 py-2 text-sm"
                >
                  <link.icon size={14} />{link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <DigitalCertificationRequests />
          </div>

          <AdminDashboard />
        </main>
      </div>
    </AuthGate>
  );
}
