import { CertificationType } from "@/lib/domains/contracts";
import { Match, RegistrationDraft } from "./types";
import { emptyRegistrationDraft } from "@/lib/registration";

type StepperUIProps = {
  flowSteps: readonly string[];
  currentFlowStep: number;
  match: Match | null;
  activeCertType: CertificationType;
  setCertificationType: (v: CertificationType) => void;
  setMatch: (v: Match | null) => void;
  setRegistration: (v: any) => void;
  setStage: (v: string) => void;
  setNeedsCandidateConfirmation: (v: boolean) => void;
  setCountryConfirmed: (v: boolean) => void;
  setPaid: (v: boolean) => void;
  setManualFlowStep: (v: number | null) => void;
  compliance: any;
  trustReport: any;
  runCompliance: () => void;
  createTrustReport: () => void;
  startVerification: () => void;
  stage: string;
  cert: any;
};

export function StepperUI({
  flowSteps,
  currentFlowStep,
  match,
  activeCertType,
  setCertificationType,
  setMatch,
  setRegistration,
  setStage,
  setNeedsCandidateConfirmation,
  setCountryConfirmed,
  setPaid,
  setManualFlowStep,
  compliance,
  trustReport,
  runCompliance,
  createTrustReport,
  startVerification,
  stage,
  cert,
}: StepperUIProps) {
  return (
    <section className="rounded-2xl sm:rounded-[32px] border border-white/40 bg-white/60 p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl">
      <h2 className="text-xl font-bold tracking-tight text-slate-800">Guided Flow</h2>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Registration */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Registration</h3>
              <p className="text-xs text-slate-500">Complete initial onboarding</p>
            </div>
            {currentFlowStep > 1 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {flowSteps.slice(0, 2).map((step, index) => {
              const actualIndex = index;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    if (actualIndex === 0) {
                      setCertificationType("none");
                      setMatch(null);
                      setRegistration(emptyRegistrationDraft());
                    } else if (actualIndex === 1 && match) {
                      setStage("discovered");
                      setNeedsCandidateConfirmation(false);
                      setCountryConfirmed(true);
                    }
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    actualIndex < currentFlowStep
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : actualIndex === currentFlowStep
                      ? "border-cyan-400 bg-cyan-500 text-white shadow-md shadow-cyan-100"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {actualIndex + 1}. {step}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center pt-10 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15" />
          </svg>
        </div>

        {/* Verification */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Self Verification</h3>
              <p className="text-xs text-slate-500">Verify identity & details</p>
            </div>
            {currentFlowStep > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {flowSteps.slice(2, 4).map((step, index) => {
              const actualIndex = index + 2;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    setCountryConfirmed(true);
                    setNeedsCandidateConfirmation(false);
                    if (actualIndex === 2) {
                      setStage("doc_upload");
                    } else if (actualIndex === 3) {
                      if (!compliance) runCompliance();
                      if (!trustReport) createTrustReport();
                    }
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    actualIndex < currentFlowStep
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : actualIndex === currentFlowStep
                      ? "border-violet-400 bg-violet-500 text-white shadow-md shadow-violet-100"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {actualIndex + 1}. {step}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center pt-10 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15" />
          </svg>
        </div>

        {/* Certification */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Get Certified</h3>
              <p className="text-xs text-slate-500">Final approval & upgrade</p>
            </div>
            {cert && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {flowSteps.slice(4, 6).map((step, index) => {
              const actualIndex = index + 4;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    if (actualIndex === 4) {
                      setStage("anchoring");
                    } else if (actualIndex === 5 && cert) {
                      setManualFlowStep(5);
                    }
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    actualIndex < currentFlowStep
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : actualIndex === currentFlowStep
                      ? "border-amber-400 bg-amber-500 text-white shadow-md shadow-amber-100"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {actualIndex + 1}. {step}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {match && (stage === "discovered" || stage === "voice_confirm" || stage === "idle") && (
        <button
          type="button"
          onClick={startVerification}
          className="mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(8,120,90,0.32)] transition hover:from-emerald-500 hover:to-teal-400"
        >
          Start Verification
        </button>
      )}
    </section>
  );
}
