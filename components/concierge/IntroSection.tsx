import { GeminiFallbackReason, GeminiQuotaSubtype } from "./types";
import { fallbackReasonCopy, fallbackReasonGuidance } from "./utils";
import type { getTranslations } from "@/lib/i18n";

type IntroSectionProps = {
  translations: ReturnType<typeof getTranslations>;
  quotaFallbackNotice: boolean;
  quotaFallbackReason: GeminiFallbackReason | null;
  quotaFallbackSubtype: GeminiQuotaSubtype | null;
};

export function IntroSection({
  translations,
  quotaFallbackNotice,
  quotaFallbackReason,
  quotaFallbackSubtype,
}: IntroSectionProps) {
  return (
    <>
      <section className="enterprise-panel rounded-lg p-4 backdrop-blur-xl sm:p-6">
        <p className="text-base font-bold text-[color:var(--foreground)]">{translations.main.certificateProcess}</p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">
          {translations.main.certificateProcessDesc}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-muted)] px-2 py-1 text-[color:var(--brand-gold)]">
            {translations.main.demoMode}
          </span>
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-muted)] px-2 py-1 text-[color:var(--brand-teal)]">
            {translations.main.multiLanguageReady}
          </span>
        </div>
      </section>
      
      {quotaFallbackNotice && (
        <p className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card-muted)] px-3 py-2 text-xs text-[color:var(--muted-strong)]">
          {fallbackReasonCopy(quotaFallbackReason, quotaFallbackSubtype)} Continuing in{" "}
          <strong className="font-medium">demo mode</strong>.{" "}
          {fallbackReasonGuidance(quotaFallbackReason, quotaFallbackSubtype)}
        </p>
      )}
    </>
  );
}
