type IntakeSectionProps = {
  show: boolean;
  query: string;
  setQuery: (v: string) => void;
  onDiscover: () => void;
  sessionId: string | null;
};

export function IntakeSection({ show, query, setQuery, onDiscover, sessionId }: IntakeSectionProps) {
  if (!show) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white/85 p-4 shadow-[0_14px_36px_rgb(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-bold text-slate-900">Step 1: Seller Registration</h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter the seller name, business name, or URL. We will call the Google-powered discovery service and prefill organisation details for review.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-200/40"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Seller name, business name, or URL"
        />
        <button
          type="button"
          onClick={onDiscover}
          disabled={!sessionId}
          className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(8,112,184,0.35)] transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40"
        >
          Prefill Details
        </button>
      </div>
    </section>
  );
}
