import { VoiceConcierge } from "../VoiceConcierge";
import { WebcamCapture } from "../WebcamCapture";
import type { VerificationProgressStep } from "./useVerification";

type VerificationDisplayProps = {
  show: boolean;
  stage: string;
  assistant: string;
  badge: string | null;
  visionNote: string;
  visionWarning: string;
  visionBlockers: string[];
  sessionId: string | null;
  match: unknown;
  onVoice: (text: string) => void;
  selectedDocuments: File[];
  setSelectedDocuments: (v: File[]) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isVerifyingDocs: boolean;
  documentProgress: VerificationProgressStep[];
  videoProgress: VerificationProgressStep[];
  scanning: boolean;
  sendVision: (dataUrl: string) => void;
  currentFlowStep: number;
};

function ProgressTimeline({ steps }: { steps: VerificationProgressStep[] }) {
  if (!steps.length) return null;

  return (
    <div className="mt-5 w-full max-w-md rounded-2xl border border-cyan-100 bg-white/80 p-4 text-left shadow-sm">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Backend verification activity</p>
      <ol className="space-y-2.5">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                step.status === "done"
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : step.status === "running"
                    ? "border-cyan-300 bg-cyan-100 text-cyan-700"
                    : "border-slate-200 bg-slate-50 text-slate-300"
              }`}
            >
              {step.status === "done" ? "✓" : step.status === "running" ? "•" : ""}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold ${step.status === "pending" ? "text-slate-400" : "text-slate-700"}`}>
                {step.label}
              </p>
              {step.status === "running" && (
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-cyan-50">
                  <div className="h-full w-1/2 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-cyan-400" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function VerificationDisplay({
  show,
  stage,
  assistant,
  badge,
  visionNote,
  visionWarning,
  visionBlockers,
  sessionId,
  match,
  onVoice,
  selectedDocuments,
  setSelectedDocuments,
  handleFileUpload,
  isVerifyingDocs,
  documentProgress,
  videoProgress,
  scanning,
  sendVision,
  currentFlowStep,
}: VerificationDisplayProps) {
  if (!show) return null;

  return (
    <section className="rounded-2xl sm:rounded-[32px] border border-white/40 bg-white/80 p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
          {stage === "doc_upload"
            ? "Step 4: Document upload"
            : currentFlowStep === 3
              ? "Step 4: Voice verification"
              : currentFlowStep === 4
                ? "Step 5: Document upload"
                : "Step 6: Vision ID check"}
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
          Stage: {stage}
        </div>
      </div>
      
      <div className="mt-5 space-y-3">
        <p className="rounded-2xl bg-cyan-50/50 p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
          {assistant || "Awaiting input..."}
        </p>
        
        {badge && (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-white/50 px-3 py-2 font-mono text-[11px] text-cyan-700 shadow-sm">
            <span className="font-bold opacity-40">SYSTEM:</span> {badge}
          </div>
        )}
        
        {visionNote && (
          <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            Vision: {visionNote}
          </p>
        )}
        
        {visionWarning && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs font-medium text-amber-700">
            <span className="text-sm">⚠</span> {visionWarning}
          </div>
        )}
        
        {!!visionBlockers.length && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-medium text-rose-700">
            <span className="text-sm">✖</span> Blockers: {visionBlockers.join(", ")}
          </div>
        )}
      </div>

      {stage !== "doc_upload" && (
        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
          <VoiceConcierge
            onTranscript={(t) => void onVoice(t)}
            disabled={!sessionId || !match || stage === "complete"}
          />
          <div className="flex-1">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/5 placeholder:text-slate-400"
              placeholder="Type instead of speaking..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) {
                    onVoice(val);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
      {stage === "doc_upload" && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/30 p-8 text-center transition-colors hover:bg-cyan-50/50">
          <div className="mb-3 rounded-full bg-cyan-100 p-3 text-cyan-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-base font-semibold text-cyan-900">Upload Registration Documents</p>
          <p className="mt-1 text-xs text-slate-500">Supported formats: PDF, DOCX (Max 3 files)</p>
          
          {!!selectedDocuments.length && (
            <div className="mt-6 w-full max-w-md divide-y divide-cyan-100 rounded-xl border border-cyan-100 bg-white p-2 shadow-sm">
              <div className="flex flex-col gap-2 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected files ({selectedDocuments.length}/3)</p>
                <ul className="space-y-1.5">
                  {selectedDocuments.map((file) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-2 truncate text-[11px] font-medium text-slate-600">
                      <span className="h-1 w-1 rounded-full bg-cyan-400" />
                      {file.name}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setSelectedDocuments([])}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                  disabled={isVerifyingDocs}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
          
          {isVerifyingDocs ? (
            <>
              <div className="mt-5 flex items-center gap-3 rounded-full bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-200">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                VERIFYING DOCUMENT...
              </div>
              <ProgressTimeline steps={documentProgress} />
            </>
          ) : (
            <label className="mt-6 cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition-all hover:-translate-y-0.5 hover:shadow-cyan-300 active:translate-y-0 active:scale-95">
              <span>SELECT FILES</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      )}

      {stage === "vision_id" && (
        <div className="mt-6">
          <WebcamCapture
            scanning={scanning}
            label="Record ID clip (2s)"
            onCapture={(dataUrl) => sendVision(dataUrl)}
          />
          <ProgressTimeline steps={videoProgress} />
        </div>
      )}
    </section>
  );
}
