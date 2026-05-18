import { useCallback, useState } from "react";
import { parseJsonSafe } from "./utils";
import { AnchorJson } from "./types";
import { RegistrationDraft } from "@/lib/registration";
import type { CertDisplay } from "@/components/CertificateCard";

export function useAnchoring(
  sessionId: string | null,
  registration: RegistrationDraft,
  paid: boolean,
  saveRegistration: (r: RegistrationDraft, p: boolean) => Promise<void>,
  setCert: (v: CertDisplay & { revoked?: boolean }) => void,
  setStage: (v: string) => void,
  setBadge: (v: string | null) => void,
  refreshSession: (sid: string) => Promise<void>,
  speakWithLanguage: (v: string) => void,
) {
  const [anchoring, setAnchoring] = useState(false);
  const [anchorBlockers, setAnchorBlockers] = useState<string[]>([]);
  const [anchorFailureReason, setAnchorFailureReason] = useState("");
  const [anchorOperatorHint, setAnchorOperatorHint] = useState("");
  const [pendingTx, setPendingTx] = useState<string | undefined>();

  const anchorCert = useCallback(async () => {
    if (!sessionId) return;
    setAnchoring(true);
    setAnchorBlockers([]);
    setAnchorFailureReason("");
    setAnchorOperatorHint("");
    setPendingTx("0x…pending");
    try {
      await saveRegistration(registration, paid);
      const r = await fetch("/api/certificate/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const parsed = await parseJsonSafe<AnchorJson>(r);
      if (!parsed.ok || !parsed.data) {
        const data = parsed.data;
        setAnchorBlockers(Array.from(new Set(data?.blockers ?? [])));
        setAnchorFailureReason(
          data?.reasonCode
            ? `${data.error ?? "Anchoring failed"} (${data.reasonCode})`
            : (data?.error ?? parsed.errorMessage ?? "Anchoring failed."),
        );
        const diagnosticsHint =
          data?.diagnostics?.attemptId
            ? `Attempt: ${data.diagnostics.attemptId}${data.diagnostics.stage ? ` · Stage: ${data.diagnostics.stage}` : ""}`
            : "";
        const baseHint = data?.operatorHint ?? (data?.reasonDetail ? `Details: ${data.reasonDetail}` : "");
        setAnchorOperatorHint([baseHint, diagnosticsHint].filter(Boolean).join(" · "));
        return;
      }
      const j = parsed.data;
      if (j.anchorMode === "demo" && j.anchorFallbackReason) {
        setBadge(`CHAIN FALLBACK · demo (${j.anchorFallbackReason})`);
      } else if (j.anchorMode === "real") {
        setBadge("CHAIN MODE · Base Sepolia confirmed");
      }
      if (j.certificate) {
        setCert({ ...j.certificate, revoked: j.certificate.revoked });
        setStage("complete");
        await refreshSession(sessionId);
        speakWithLanguage("Verification complete. Your certificate is ready.");
      }
    } catch {
      setAnchorFailureReason("Could not issue certificate. Please retry.");
    } finally {
      setAnchoring(false);
      setPendingTx(undefined);
    }
  }, [sessionId, registration, paid, saveRegistration, setCert, setStage, setBadge, refreshSession, speakWithLanguage]);

  return { anchoring, anchorBlockers, anchorFailureReason, anchorOperatorHint, pendingTx, anchorCert };
}
