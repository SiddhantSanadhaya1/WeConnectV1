import { useCallback, useState } from "react";
import { parseJsonSafe, fetchWithRetry, humanizeMissingField } from "./utils";
import { DiscoverJson, Match, OwnershipSummary, OwnershipBreakdown, WorkflowState } from "./types";
import { RegistrationDraft, emptyRegistrationDraft } from "@/lib/registration";

export function useDiscovery(
  sessionId: string | null,
  query: string,
  registration: RegistrationDraft,
  setRegistration: (v: RegistrationDraft) => void,
  workflow: WorkflowState | null,
  setAssistant: (v: string) => void,
  speakWithLanguage: (v: string) => void,
  setBadge: (v: string | null) => void,
  refreshSession: (sid: string) => Promise<void>,
  match: Match | null,
  setMatch: (v: Match | null) => void,
  fieldConfidence: any,
  setFieldConfidence: (v: any) => void,
  fieldEvidence: any,
  setFieldEvidence: (v: any) => void,
  discoverCandidates: any[],
  setDiscoverCandidates: (v: any[]) => void,
  selectedCandidateIndex: number,
  setSelectedCandidateIndex: (v: number) => void,
  needsCandidateConfirmation: boolean,
  setNeedsCandidateConfirmation: (v: boolean) => void,
  countryConfirmed: boolean,
  setCountryConfirmed: (v: boolean) => void,
  setCountryRequiresConfirmation: (v: boolean) => void,
  setOwnershipEvidenceConfidence: (v: number) => void,
  setOwnership: (v: any) => void,
  setOwnershipBreakdown: (v: any) => void,
  setFounderNames: (v: string[]) => void,
  setClassificationSummary: (v: any) => void,
) {
  const runDiscover = useCallback(async (candidateIndex = selectedCandidateIndex, confirmedSelection = false) => {
    if (!sessionId) return;
    const r = await fetchWithRetry("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, query, selectedCandidateIndex: candidateIndex }),
    });
    const parsed = await parseJsonSafe<DiscoverJson>(r);
    if (!parsed.ok || !parsed.data) {
      setAssistant(parsed.errorMessage ?? "Discovery failed.");
      return;
    }
    const j = parsed.data;
    await refreshSession(sessionId);
    if (!j.ok || !j.match) {
      setMatch(null);
      setOwnership(null);
      setOwnershipBreakdown(null);
      setAssistant(j.message ?? "No match.");
      speakWithLanguage(j.message ?? "No match in the demo registry.");
      return;
    }
    setMatch(j.match);
    const preservedCertType =
      registration.cert_type === "self" || registration.cert_type === "digital"
        ? registration.cert_type
        : workflow?.certificationType === "self" || workflow?.certificationType === "digital"
          ? workflow.certificationType
          : "";
    setRegistration({
      ...(j.prefill ?? emptyRegistrationDraft()),
      cert_type: preservedCertType,
    });
    setFieldConfidence(j.fieldConfidence ?? {});
    setFieldEvidence(j.evidence ?? {});
    setDiscoverCandidates(j.candidates ?? []);
    setSelectedCandidateIndex(candidateIndex);
    setNeedsCandidateConfirmation(Boolean(j.source === "web" && j.lowConfidence && !confirmedSelection));
    setCountryRequiresConfirmation(Boolean(j.countryRequiresConfirmation));
    setCountryConfirmed(!Boolean(j.countryRequiresConfirmation));
    setOwnership(j.ownership ?? null);
    setOwnershipBreakdown(j.ownershipBreakdown ?? null);
    setOwnershipEvidenceConfidence(
      Number(j.ownershipEvidenceConfidence ?? j.ownershipConfidence ?? j.ownership?.confidence ?? 0),
    );
    setClassificationSummary(j.classificationSummary);
    setFounderNames(j.enrichmentSummary?.founderNames ?? []);
    
    const missingFromPrefill = (j.missingRequired ?? [])
      .filter((f) => f !== "paid")
      .slice(0, 4)
      .map(humanizeMissingField);
    const missingLine = missingFromPrefill.length
      ? ` I couldn't fetch ${missingFromPrefill.join(", ")} from web sources, so please add it manually.`
      : "";
    setAssistant(
      j.source === "web"
        ? `We’ve pre-filled your business details. Please confirm. I found ${j.match.companyName} from live web search and prepared the draft.${missingLine}`
        : `We’ve pre-filled your business details. Please confirm. I found ${j.match.companyName} in ${j.match.jurisdiction}.`,
    );
    if (j.source === "web") {
      const fallbackNote = j.fallbackReason ? ` (${j.fallbackReason})` : "";
      setBadge(`DISCOVERY SOURCE · AWS Bedrock Claude${fallbackNote}`);
      if (j.lowConfidence) {
        setAssistant(`I found multiple possible matches for ${j.match.companyName}. Please choose the best candidate before continuing.`);
        setBadge("DISCOVERY REVIEW · candidate confirmation required");
      }
    }
    if (j.source === "web" && j.lowConfidence && !confirmedSelection) {
      const speechMissingLine = missingFromPrefill.length
        ? ` I couldn't fetch ${missingFromPrefill.join(", ")} from SERP and web data. Please fill those manually after confirming the company.`
        : "";
      speakWithLanguage(`I found multiple matches for ${j.match.companyName}. Please confirm the best candidate.${speechMissingLine}`);
    } else {
      const speechMissingLine = missingFromPrefill.length
        ? ` I couldn't fetch ${missingFromPrefill.join(", ")} from SERP and web data. Please fill those manually.`
        : "";
      speakWithLanguage(`We have pre-filled your business details. Please confirm and continue.${speechMissingLine}`);
    }
  }, [sessionId, query, selectedCandidateIndex, registration, workflow, refreshSession]);

  return { runDiscover };
}
