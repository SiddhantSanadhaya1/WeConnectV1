import { useCallback, useEffect, useRef, useState } from "react";
import { RegistrationDraft, emptyRegistrationDraft } from "@/lib/registration";
import { parseJsonSafe } from "./utils";
import { Match, AiAssessmentReport, WorkflowState } from "./types";

export function useConciergeSession(
  match: Match | null,
  registration: RegistrationDraft,
  setRegistration: (v: RegistrationDraft) => void,
  paid: boolean,
  setPaid: (v: boolean) => void,
  stage: string,
  setStage: (v: string) => void,
  setAssistant: (v: string) => void,
  visionChecks: { idPassed?: boolean },
  setVisionChecks: (v: any) => void,
  setAiAssessmentReport: (v: AiAssessmentReport | null) => void,
  setWorkflow: (v: WorkflowState | null) => void,
  setCompliance: (v: any) => void,
  setTrustReport: (v: any) => void,
  setQuestionnaireAnswers: (v: any) => void,
) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const lastAutosavedSessionIdRef = useRef<string | null>(null);
  const lastAutosavedPayloadRef = useRef<string>("");

  const refreshSession = useCallback(async (sid: string) => {
    const r = await fetch(`/api/session?id=${sid}`);
    if (!r.ok) {
      if (r.status === 404) {
        const restore = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid }),
        });
        if (restore.ok) {
          const company = match?.id ? {
            id: match.id,
            companyName: match.companyName,
            jurisdiction: match.jurisdiction,
            registrySnippet: match.registrySnippet,
            primaryOwner: match.primaryOwner,
            ownershipFemalePct: match.ownershipFemalePct ?? 0,
          } : undefined;
          
          await fetch("/api/session/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sid, registration, paid, company }),
          });
          await fetch("/api/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sid, stage }),
          });
          setAssistant("Recovered your session after a server reset. Continuing verification.");
          return;
        }
        setPollingEnabled(false);
        setAssistant("Session expired or reset. Please refresh to start a new verification session.");
      }
      return;
    }
    const j = (await r.json()) as {
      terminalLines?: string[];
      stage?: string;
      registration?: RegistrationDraft;
      paid?: boolean;
      visionChecks?: { idPassed?: boolean };
      aiAssessmentReport?: AiAssessmentReport;
      workflow?: WorkflowState;
    };
    if (j.stage && j.stage !== stage) setStage(j.stage);
    if (j.registration) {
      const workflowCertType = j.workflow?.certificationType;
      const selectedCertType =
        workflowCertType === "self" || workflowCertType === "digital"
          ? workflowCertType
          : registration.cert_type === "self" || registration.cert_type === "digital"
            ? registration.cert_type
            : "";
      const serverRegistrationWithCert =
        !j.registration.cert_type && selectedCertType
          ? { ...j.registration, cert_type: selectedCertType }
          : j.registration;
      if (JSON.stringify(serverRegistrationWithCert) !== JSON.stringify(registration)) {
        setRegistration(serverRegistrationWithCert);
      }
    }
    const nextPaid = Boolean(j.paid);
    if (nextPaid !== paid) setPaid(nextPaid);
    if (j.visionChecks && j.visionChecks.idPassed !== visionChecks.idPassed) {
      setVisionChecks(j.visionChecks);
    }
    if (j.aiAssessmentReport) {
      setAiAssessmentReport(j.aiAssessmentReport);
    } else {
      setAiAssessmentReport(null);
    }
    if (j.workflow) {
      setWorkflow(j.workflow);
      setCompliance(j.workflow.compliance ?? null);
      setTrustReport(j.workflow.trustReport ?? null);
      setQuestionnaireAnswers((prev: any) => ({ ...prev, ...(j.workflow?.questionnaireAnswers ?? {}) }));
    }
  }, [stage, registration, paid, visionChecks.idPassed, match]);

  const saveRegistration = useCallback(async (nextRegistration: RegistrationDraft, nextPaid: boolean) => {
    if (!sessionId) return;
    const company = match?.id ? {
      id: match.id,
      companyName: match.companyName,
      jurisdiction: match.jurisdiction,
      registrySnippet: match.registrySnippet,
      primaryOwner: match.primaryOwner,
      ownershipFemalePct: match.ownershipFemalePct ?? 0,
    } : undefined;
    
    await fetch("/api/session/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        registration: nextRegistration,
        paid: nextPaid,
        company,
      }),
    });
  }, [sessionId, match]);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/session", { method: "POST" });
      const parsed = await parseJsonSafe<{ sessionId: string }>(r);
      if (parsed.ok && parsed.data?.sessionId) {
        setPollingEnabled(true);
        setSessionId(parsed.data.sessionId);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sessionId || !pollingEnabled) return;
    const t = setInterval(() => void refreshSession(sessionId), 2500);
    return () => clearInterval(t);
  }, [sessionId, pollingEnabled, refreshSession]);

  useEffect(() => {
    if (!sessionId) return;
    const payload = JSON.stringify({ registration, paid });
    if (
      lastAutosavedSessionIdRef.current === sessionId &&
      lastAutosavedPayloadRef.current === payload
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveRegistration(registration, paid).then(() => {
        lastAutosavedSessionIdRef.current = sessionId;
        lastAutosavedPayloadRef.current = payload;
      });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [sessionId, registration, paid, saveRegistration]);

  return { sessionId, saveRegistration, refreshSession, pollingEnabled, setPollingEnabled };
}
