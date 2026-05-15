import { trustLevelLabel } from "@/lib/domains/contracts";
import { WorkflowState, RegistrationDraft } from "./types";
import { CertificationType } from "@/lib/domains/contracts";

type SelfVerificationAdvancedProps = {
  show: boolean;
  workflow: WorkflowState | null;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean | ((prev: boolean) => boolean)) => void;
  isSelfPath: boolean;
  registration: RegistrationDraft;
  setRegistration: (v: any) => void;
  setCertificationType: (v: CertificationType) => void;
  questionnaireAnswers: Record<string, string>;
  setQuestionnaireAnswers: (v: any) => void;
  saveQuestionnaire: () => void;
  runCompliance: () => void;
  createTrustReport: () => void;
  compliance: any;
  trustReport: any;
  currentFlowStep: number;
};

export function SelfVerificationAdvanced({
  show,
  workflow,
  showAdvanced,
  setShowAdvanced,
  isSelfPath,
  registration,
  setRegistration,
  setCertificationType,
  questionnaireAnswers,
  setQuestionnaireAnswers,
  saveQuestionnaire,
  runCompliance,
  createTrustReport,
  compliance,
  trustReport,
  currentFlowStep,
}: SelfVerificationAdvancedProps) {
  if (!show) return null;

  return (
    <section className="rounded-2xl sm:rounded-[32px] border border-white/40 bg-white/80 p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {currentFlowStep === 3 ? "Step 4: Verification & Reports" : "Verification"}
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {workflow
              ? `${trustLevelLabel(workflow.trustLevel)} · Stage: ${workflow.certificationStage}`
              : "Level 1: Self-Declared · Stage: intake"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
        >
          {showAdvanced ? "HIDE CONTROLS" : "SHOW CONTROLS"}
        </button>
      </div>
      
      {false && isSelfPath && (
        <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          <p className="font-semibold">Upgrade option</p>
          <p className="mt-1">Upgrade to Digital Certification for higher visibility.</p>
          <button
            type="button"
            onClick={() => {
              setRegistration((prev: any) => ({ ...prev, cert_type: "digital" }));
              setCertificationType("digital");
            }}
            className="mt-2 rounded border border-cyan-500/50 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10"
          >
            Upgrade to Digital Certification
          </button>
        </div>
      )}

      {!showAdvanced ? (
        <p className="mt-3 text-xs text-zinc-500">
          Advanced questionnaire, compliance checks, and trust report generation are available in this workspace.
        </p>
      ) : null}

      {showAdvanced && (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ownership control</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
                value={questionnaireAnswers.ownership_control ?? ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((prev: any) => ({ ...prev, ownership_control: e.target.value }))
                }
                placeholder="Who controls ownership decisions?"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Operational involvement</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
                value={questionnaireAnswers.operational_involvement ?? ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((prev: any) => ({
                    ...prev,
                    operational_involvement: e.target.value,
                  }))
                }
                placeholder="Describe day-to-day involvement"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Years in business</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
                value={questionnaireAnswers.years_in_business ?? ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((prev: any) => ({ ...prev, years_in_business: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clients worked with</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
                value={questionnaireAnswers.clients_worked_with ?? ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((prev: any) => ({ ...prev, clients_worked_with: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product scale</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 placeholder:text-slate-400"
                value={questionnaireAnswers.product_scale ?? ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((prev: any) => ({ ...prev, product_scale: e.target.value }))
                }
                placeholder="Current delivery scale/capacity"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveQuestionnaire}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              SAVE QUESTIONNAIRE
            </button>
            <button
              type="button"
              onClick={runCompliance}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 shadow-sm transition-all hover:bg-emerald-100 active:scale-95"
            >
              RUN COMPLIANCE CHECK
            </button>
            <button
              type="button"
              onClick={createTrustReport}
              className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-600 shadow-sm transition-all hover:bg-cyan-100 active:scale-95"
            >
              GENERATE TRUST REPORT
            </button>
          </div>

          {compliance && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">
              <p>Sanctions Check: {compliance.sanctionsCheck === "clear" ? "✅ clear" : compliance.sanctionsCheck}</p>
              <p>
                Entity Verification:{" "}
                {compliance.entityVerification === "verified" ? "✅ verified" : compliance.entityVerification}
              </p>
              <p>
                Risk Score: {compliance.riskScore}/100 ({compliance.riskLevel})
              </p>
            </div>
          )}

          {trustReport && (
            <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
              <p className="font-semibold">WeConnect Trust Report</p>
              <p>Trust Score: {trustReport.trustScore}/100</p>
              <p>Risk Level: {trustReport.riskLevel}</p>
              <p>Ownership Verified: {trustReport.ownershipVerified ? "✅" : "⚠"}</p>
              <p>Identity Match: {trustReport.identityMatch}</p>
              <p>Document Consistency: {trustReport.documentConsistency}</p>
            </div>
          )}

          {workflow?.governance && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-400">
              <p>Roles: {workflow.governance.roles.join(", ")}</p>
              <p>
                Lifecycle: {workflow.governance.validTill ? `Valid till ${new Date(workflow.governance.validTill).toLocaleDateString()}` : "Validity pending"} ·{" "}
                {workflow.governance.continuouslyMonitored ? "Continuously monitored" : "Monitoring paused"}
              </p>
              {workflow.governance.notifications.slice(0, 3).map((n, idx) => (
                <p key={`${n}-${idx}`}>- {n}</p>
              ))}
            </div>
          )}
          {workflow?.governance?.auditTrail?.length ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">
              <p className="font-semibold text-zinc-100">Audit trail timeline</p>
              <p className="mt-1 text-zinc-500">Verification steps completed:</p>
              <div className="mt-2 max-h-40 space-y-1 overflow-auto pr-1">
                {workflow.governance.auditTrail
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <p key={`${entry}-${idx}`} className="rounded border border-white/5 bg-white/[0.02] px-2 py-1">
                      {entry}
                    </p>
                  ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
