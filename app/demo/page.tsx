import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="app-shell flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
        <h1 className="text-sm font-medium text-[color:var(--foreground)]">Split-screen demo</h1>
        <Link href="/admin" className="text-xs text-[color:var(--brand-plum)] hover:underline">
          Full admin
        </Link>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="border-b border-[color:var(--border)] bg-[color:var(--card-muted)] p-4 lg:border-b-0 lg:border-r">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[color:var(--muted)]">User phone</p>
          <iframe
            title="user-flow"
            src="/?embed=1"
            className="h-[min(720px,70vh)] w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)]"
          />
        </div>
        <div className="bg-[color:var(--card-muted)] p-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[color:var(--muted)]">WEC admin</p>
          <iframe
            title="admin"
            src="/admin"
            className="h-[min(720px,70vh)] w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)]"
          />
        </div>
      </div>
    </div>
  );
}
