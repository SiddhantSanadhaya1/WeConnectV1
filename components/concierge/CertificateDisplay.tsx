import { CertificateCard } from "../CertificateCard";

type CertificateDisplayProps = {
  show: boolean;
  cert: any;
  verifyUrl: string;
  downloadCertificatePdf: () => void;
  downloadingCertificate: boolean;
  setManualFlowStep: (v: number | null) => void;
  readinessForIssue: boolean;
  mergedBlockers: string[];
  anchoring: boolean;
  anchorCert: () => void;
  setAssistant: (v: string) => void;
  speakWithLanguage: (v: string) => void;
};

export function CertificateDisplay({
  show,
  cert,
  verifyUrl,
  downloadCertificatePdf,
  downloadingCertificate,
  setManualFlowStep,
  readinessForIssue,
  mergedBlockers,
  anchoring,
  anchorCert,
  setAssistant,
  speakWithLanguage,
}: CertificateDisplayProps) {
  if (!show) return null;

  return (
    <section className="rounded-2xl sm:rounded-[32px] border border-white/40 bg-white/80 p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl">
       {cert ? (
         <div className="space-y-3">
           <CertificateCard cert={cert} verifyUrl={verifyUrl || `/verify/${cert.id}`} />
           <button
             type="button"
             onClick={downloadCertificatePdf}
             disabled={downloadingCertificate}
             className="w-full rounded-2xl border border-[#fac400] bg-[#fac400] py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-95 disabled:opacity-40"
           >
             {downloadingCertificate ? "PREPARING CERTIFICATE..." : "DOWNLOAD OFFICIAL CERTIFICATE PDF"}
           </button>
           <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
             <p className="text-sm font-bold text-blue-800">Your Self-Certified Certificate is ready!</p>
             <p className="mt-1 text-xs text-blue-600">Want higher trust? Upgrade to Digital Certification in the next step.</p>
             <button 
               onClick={() => setManualFlowStep(5)}
               className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-200"
             >
               Go to Step 6: Digital Upgrade
             </button>
           </div>
         </div>
       ) : (
         <div className="text-center py-8">
           <h2 className="text-xl font-bold tracking-tight text-slate-900">Issue your Certificate</h2>
           <p className="mt-1 text-sm text-slate-500">Your self-verification is complete. You can now issue your certificate.</p>
           
           {!!mergedBlockers.length && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
              <p className="font-bold">Missing Requirements:</p>
              <p>{mergedBlockers.join(", ")}</p>
            </div>
           )}

           <button
             type="button"
             onClick={() => {
               if (!readinessForIssue) {
                 const pending = mergedBlockers.join(", ");
                 const message = `Cannot issue certificate yet. Pending: ${pending}`;
                 setAssistant(message);
                 speakWithLanguage(message);
                 return;
               }
               anchorCert();
             }}
             disabled={anchoring}
             className="mt-8 w-full max-w-sm rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
           >
             {anchoring ? "ISSUING CERTIFICATE..." : "ISSUE CERTIFICATE"}
           </button>
         </div>
       )}
    </section>
  );
}
