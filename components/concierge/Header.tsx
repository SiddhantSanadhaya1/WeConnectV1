import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import type { getTranslations } from "@/lib/i18n";

type HeaderProps = {
  translations: ReturnType<typeof getTranslations>;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  embed?: boolean;
};

export function Header({ translations, audioEnabled, setAudioEnabled, embed }: HeaderProps) {
  if (embed) return null;

  return (
    <header className="enterprise-panel rounded-lg px-4 py-3 backdrop-blur-xl sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--muted)]">
        <span className="font-medium text-[color:var(--foreground)]">{translations.header.title}</span>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1.5 text-sm font-medium text-[color:var(--muted-strong)] transition hover:border-[color:var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring-soft)]"
            title={audioEnabled ? translations.header.audioDisable : translations.header.audioEnable}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <Link href="/admin" className="font-medium text-[color:var(--brand-plum)] transition hover:text-[color:var(--brand-rose)]">
            {translations.header.admin}
          </Link>
          <Link href="/demo" className="font-medium text-[color:var(--brand-plum)] transition hover:text-[color:var(--brand-rose)]">
            {translations.header.splitDemo}
          </Link>
        </div>
      </div>
    </header>
  );
}
