"use client";

import Link from "next/link";
import { Sparkles, Shield, Globe, ArrowRight, CheckCircle, Cpu, Network, FileText, Settings, Users, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { pageEnter, panelLift, staggerContainer } from "@/lib/motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const FEATURES = [
  { icon: Sparkles, title: "Guided certification", desc: "A calm, step-by-step workflow helps founders complete registration, evidence, and review without heavy paperwork." },
  { icon: Shield, title: "Procurement-ready trust", desc: "Clear verification status, document checks, and certificate signals give buyers confidence before outreach." },
  { icon: Globe, title: "Enterprise discovery", desc: "Women-owned suppliers can be found by category, geography, trust level, and buyer requirement." },
];

const JOURNEY = [
  { id: 1, label: "Register", active: true, future: false },
  { id: 2, label: "Self Verify", active: true, future: false },
  { id: 3, label: "Get Certified", active: true, future: false },
  // { id: 4, label: "Digital Cert", active: true },
  // { id: 5, label: "Auditor Cert", active: true },
  // { id: 6, label: "Industry/Geo", active: false, future: true },
  // { id: 7, label: "Code/RFP", active: false, future: true },
];

const STATS = [
  { value: "100K+", label: "WOBs target (Year 3)" },
  { value: "576", label: "Gender-focused bonds globally" },
  { value: "20%", label: "Top companies with female CPO" },
  { value: "3yr", label: "Certification validity" },
];

const DOC_LINKS = [
  { icon: FileText, label: "Product Requirements (PRD)", href: "/documentation" },
  { icon: Settings, label: "Configuration", href: "/documentation" },
  { icon: FileText, label: "Configuration BRD", href: "/documentation" },
  { icon: FileText, label: "Configuration PRD", href: "/documentation" },
  { icon: Cpu, label: "Architecture", href: "/documentation" },
  { icon: Network, label: "Buyer Portal", href: "/buyer-portal" },
  { icon: Users, label: "Ecosystem", href: "/ecosystem" },
];

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.main
      className="app-shell text-[color:var(--foreground)]"
      variants={pageEnter()}
      initial="hidden"
      animate="visible"
    >
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="brand-mark w-9 h-9 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold">WE</span>
          </div>
          <div className="leading-tight">
            <span className="block font-bold text-[color:var(--foreground)]">WEConnect</span>
            <span className="hidden text-[10px] font-semibold text-[color:var(--muted)] sm:block">Women-Owned Enterprise Network</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/ecosystem" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:bg-[color:var(--card-muted)] hover:text-[color:var(--foreground)]">Ecosystem</Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:bg-[color:var(--card-muted)] hover:text-[color:var(--foreground)]">Login</Link>
          <ThemeToggle />
          <Link href="/login" className="inline-flex items-center justify-center rounded-lg bg-[image:var(--button-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm">Get Certified</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-[color:var(--border)] bg-[color:var(--card-elevated)] text-[color:var(--muted)] hover:bg-[color:var(--card-muted)] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile dropdown nav */}
      {mobileMenuOpen && (
        <div className="sm:hidden border border-[color:var(--border)] bg-[color:var(--card-elevated)] backdrop-blur-xl animate-[slideDown_0.2s_ease-out] mx-4 rounded-lg mb-4 shadow-xl">
          <nav className="flex flex-col gap-1 px-3 py-3">
            <Link href="/ecosystem" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-4 py-3 rounded-lg hover:bg-[color:var(--card-muted)] transition-colors">Ecosystem</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-4 py-3 rounded-lg hover:bg-[color:var(--card-muted)] transition-colors">Login</Link>
            <ThemeToggle className="my-1 w-full justify-between" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold bg-[image:var(--button-primary)] text-white px-4 py-3 rounded-lg mt-1">Get Certified</Link>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="enterprise-band mx-auto grid max-w-6xl gap-8 rounded-lg p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[color:var(--brand-plum)] shadow-sm">
              <Sparkles size={13} />
              Certification and discovery for women-owned enterprises
            </div>
            <div className="mb-4 text-xs font-semibold text-[color:var(--muted)]">
              Multi-language ready demo: English, Hindi, Spanish
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[color:var(--foreground)] leading-tight mb-5">
              Build trusted supply chains with
              <span className="brand-gradient-text"> women-owned businesses.</span>
            </h1>
            <p className="text-[color:var(--muted)] text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
              WEConnect helps women-owned SMEs complete certification, demonstrate trust, and get discovered by enterprise procurement teams looking for resilient, inclusive suppliers.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/login" className="btn-blue gap-2 px-8 py-4 text-base">
                Start certification <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn-outline px-6 py-4 text-base">
                Explore as buyer
              </Link>
            </div>
          </div>
          <div className="grid content-center gap-4">
            <div className="enterprise-panel rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-[color:var(--brand-plum)]">Supplier trust profile</p>
                  <p className="mt-1 text-lg font-bold text-[color:var(--foreground)]">Aurora Textiles Cooperative</p>
                </div>
                <span className="badge status-active">Digital Certified</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["91", "Trust score"],
                  ["64%", "Women owned"],
                  ["18h", "Review time"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card-muted)] p-3">
                    <p className="font-display text-2xl font-bold text-[color:var(--foreground)]">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[color:var(--muted)]">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {["Entity verified", "Ownership evidence reviewed", "Buyer-ready category match"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm font-semibold text-[color:var(--muted-strong)]">
                    <CheckCircle size={15} className="text-[color:var(--brand-teal)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="enterprise-panel rounded-lg p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">Buyer match</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--foreground)]">96%</p>
              </div>
              <div className="enterprise-panel rounded-lg p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">RFP-ready suppliers</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--foreground)]">1,061</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" variants={staggerContainer(0.06)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          {STATS.map(s => (
            <motion.div key={s.label} variants={panelLift} className="card p-4 sm:p-5 text-center">
              <div className="font-display font-bold text-2xl sm:text-3xl text-slate-950">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {FEATURES.map(f => (
            <motion.div
              key={f.title}
              variants={panelLift}
              whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="card-hover cursor-pointer"
            >
              <div className="w-12 h-12 bg-[color:var(--card-muted)] border border-[color:var(--border)] rounded-lg flex items-center justify-center mb-4">
                <f.icon size={22} className="text-[color:var(--brand-plum)]" />
              </div>
              <h3 className="font-bold text-[color:var(--foreground)] mb-2">{f.title}</h3>
              <p className="text-[color:var(--muted)] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 7-Step Journey */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-center text-[color:var(--foreground)] mb-8 sm:mb-10">Your 3-Step Certification Journey</h2>
        <div className="flex items-end justify-center gap-3 sm:gap-4 flex-wrap">
          {JOURNEY.map(step => (
            <div key={step.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg
                ${step.active ? "bg-[image:var(--button-primary)] text-white shadow-lg" : "bg-[color:var(--card)] text-[color:var(--muted)] border border-[color:var(--border)]"}`}>
                {step.id}
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold text-center ${step.active ? "text-[color:var(--muted-strong)]" : "text-[color:var(--muted)]"}`}>{step.label}</span>
              {step.future && <span className="text-[9px] sm:text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">Future</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Market context */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="card p-6 sm:p-10">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[color:var(--foreground)] mb-2">Why WOB Certification Matters</h2>
          <p className="text-[color:var(--muted)] mb-6 sm:mb-8 max-w-2xl text-sm sm:text-base">Gender-responsive procurement has evolved from a CSR initiative into a core component of sustainable finance and global supply chain resilience.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { title: "Supply Chain Resilience", desc: "Enterprises that actively source from WOBs diversify their vendor base and reduce structural risk." },
              { title: "Regulatory Alignment", desc: "CSRD and GDPR mandates drive mandatory disclosures — certified WOBs are procurement-ready by default." },
              { title: "Capital Markets", desc: "576 gender-focused bond issuances globally link WOB engagement directly to ESG capital access." },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[color:var(--brand-teal)] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[color:var(--foreground)] text-sm mb-1">{item.title}</h4>
                  <p className="text-[color:var(--muted)] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doc footer */}
      <footer className="border-t border-[color:var(--border)] bg-[color:var(--card-elevated)] py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs text-[color:var(--muted)] font-semibold block mb-2 sm:mb-0 sm:inline sm:mr-4">Platform Documentation:</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:inline-flex sm:items-center sm:gap-5">
            {DOC_LINKS.map(d => (
              <Link key={d.label} href={d.href}
                className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand-plum)] transition-colors whitespace-nowrap">
                <d.icon size={12} />{d.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </motion.main>
  );
}
