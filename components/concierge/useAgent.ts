import { useCallback } from "react";
import { parseJsonSafe } from "./utils";
import { AgentJson, GeminiFallbackReason, GeminiQuotaSubtype } from "./types";

export function useAgent(
  sessionId: string | null,
  setAssistant: (v: string) => void,
  speakWithLanguage: (v: string) => void,
  setBadge: (v: string | null) => void,
  setStage: (v: string) => void,
  refreshSession: (sid: string) => Promise<void>,
  setQuotaFallbackNotice: (v: boolean) => void,
  setQuotaFallbackReason: (v: GeminiFallbackReason | null) => void,
  setQuotaFallbackSubtype: (v: GeminiQuotaSubtype | null) => void,
) {
  const callAgent = useCallback(async (userText?: string, mode?: "dialogue" | "attestation") => {
    if (!sessionId) return;
    const r = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userText: userText ?? "", mode }),
    });
    const parsed = await parseJsonSafe<AgentJson>(r);
    if (!parsed.ok || !parsed.data?.assistantText) {
      setAssistant(parsed.errorMessage ?? "The verification service returned an error. Check the terminal or try again.");
      return undefined;
    }
    const j = parsed.data;
    if (j.quotaFallback) {
      setQuotaFallbackNotice(true);
      setQuotaFallbackReason(j.fallbackReason ?? "unknown");
      setQuotaFallbackSubtype(j.fallbackSubtype ?? null);
    }
    setAssistant(j.assistantText ?? "");
    if (j.stage) setStage(j.stage);
    if (j.uiHints?.badge) setBadge(j.uiHints.badge);
    await refreshSession(sessionId);
    speakWithLanguage(j.assistantText ?? "");
    return j;
  }, [sessionId, setAssistant, speakWithLanguage, setBadge, setStage, refreshSession, setQuotaFallbackNotice, setQuotaFallbackReason, setQuotaFallbackSubtype]);

  return { callAgent };
}
