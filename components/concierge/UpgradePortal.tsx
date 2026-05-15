import { CertificateCard } from "../CertificateCard";
import { RegistrationDraft } from "./types";
import { CertificationType } from "@/lib/domains/contracts";

type UpgradePortalProps = {
  show: boolean;
  cert: any;
  verifyUrl: string;
  registration: RegistrationDraft;
  setRegistration: (v: any) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCvv: string;
  setCardCvv: (v: string) => void;
  mockCardValid: boolean;
  onUpgrade: () => void;
};

export function UpgradePortal({
  show,
  cert,
  verifyUrl,
  registration,
  setRegistration,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  mockCardValid,
  onUpgrade,
}: UpgradePortalProps) {
  if (!show) return null;

  return (
    <section className="rounded-2xl sm:rounded-[32px] border border-white/40 bg-white/80 p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl">
      <div className="mb-6 opacity-60 scale-95 origin-top">
        <CertificateCard cert={cert} verifyUrl={verifyUrl || `/verify/${cert.id}`} />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900">Upgrade to Digital Certification</h2>
      <p className="mt-1 text-sm text-slate-500">
        Get verified by our team for higher trust and better visibility to buyers.
      </p>
      
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Address</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
              placeholder="email@company.com"
              value={registration.email}
              onChange={(e) => setRegistration((prev: any) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone Number</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
              placeholder="+1 (555) 000-0000"
              value={registration.phone}
              onChange={(e) => setRegistration((prev: any) => ({ ...prev, phone: e.target.value }))}
            />
          </label>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800">
          <p className="font-bold uppercase tracking-wider text-[10px] mb-2">Process & Refund Policy</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>It takes up to 72 hours to get you digitally verified.</li>
            <li>A $100 payment hold will be placed.</li>
            <li>If the verification fails, your $100 will be fully refunded.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Payment Details</p>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
              placeholder="Card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
              placeholder="CVV"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={onUpgrade}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:shadow-blue-300"
          >
            Pay $100 & Start Digital Verification
          </button>
        </div>
      </div>
    </section>
  );
}
