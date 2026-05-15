import { useCallback } from "react";
import { parseJsonSafe } from "./utils";
import { WorkflowState, CertificationType } from "./types";
import { ComplianceResult, TrustReport } from "@/lib/domains/contracts";

export function useConciergeWorkflow(
  sessionId: string | null,
  setWorkflow: (v: WorkflowState | null) => void,
  setCompliance: (v: ComplianceResult | null) => void,
  setTrustReport: (v: TrustReport | null) => void,
  setAssistant: (v: string) => void,
  setBadge: (v: string | null) => void,
  setRegistration: (v: any) => void,
) {
  const setCertificationType = useCallback(async (certificationType: CertificationType) => {
    setRegistration((prev: any) => ({ ...prev, cert_type: certificationType }));
    if (!sessionId) {
      setAssistant("Session is still initializing. Please retry in a moment.");
      return;
    }

    const optimisticTrustLevel =
      certificationType === "digital"
        ? "digitally_certified"
        : certificationType === "self"
          ? "self_certified"
          : "self_declared";
    const optimisticStage =
      certificationType === "digital"
        ? "digital_verification"
        : certificationType === "self"
          ? "self_certification"
          : "intake";
          
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        certificationType,
        trustLevel: optimisticTrustLevel,
        certificationStage: optimisticStage,
      };
    });
    
    setAssistant(
      certificationType === "digital"
        ? "Digital certification path selected."
        : certificationType === "self"
          ? "Self-certification path selected."
          : "Switched to self-declared path.",
    );
    setBadge(
      certificationType === "digital"
        ? "PATH · Level 3 Digital"
        : certificationType === "self"
          ? "PATH · Level 2 Self-Certified"
          : "PATH · Level 1 Self-Declared",
    );

    try {
      const r = await fetch("/api/workflow/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "select_certification_type",
          certificationType,
        }),
      });
      const parsed = await parseJsonSafe<{ workflow?: WorkflowState }>(r);
      if (parsed.ok && parsed.data?.workflow) {
        setWorkflow(parsed.data.workflow);
        return;
      }
      setAssistant(parsed.errorMessage ?? "Could not update certification path.");
    } catch {
      setAssistant("Could not reach workflow service. Please retry.");
    }
  }, [sessionId]);

  const saveQuestionnaire = useCallback(async (questionnaireAnswers: Record<string, string>) => {
    if (!sessionId) return;
    const r = await fetch("/api/workflow/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        action: "update_questionnaire",
        questionnaireAnswers,
      }),
    });
    const parsed = await parseJsonSafe<{ workflow?: WorkflowState }>(r);
    if (parsed.ok && parsed.data?.workflow) {
      setWorkflow(parsed.data.workflow);
      setAssistant("Questionnaire saved.");
    }
  }, [sessionId]);

  const runCompliance = useCallback(async () => {
    if (!sessionId) return;
    const r = await fetch("/api/compliance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const parsed = await parseJsonSafe<{ compliance?: ComplianceResult; workflow?: WorkflowState }>(r);
    if (parsed.ok && parsed.data) {
      if (parsed.data.compliance) setCompliance(parsed.data.compliance);
      if (parsed.data.workflow) setWorkflow(parsed.data.workflow);
      setAssistant("Compliance checks completed.");
    }
  }, [sessionId]);

  const createTrustReport = useCallback(async () => {
    if (!sessionId) return;
    const r = await fetch("/api/trust-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const parsed = await parseJsonSafe<{
      trustReport?: TrustReport;
      workflow?: WorkflowState;
    }>(r);
    if (parsed.ok && parsed.data) {
      if (parsed.data.trustReport) setTrustReport(parsed.data.trustReport);
      if (parsed.data.workflow) setWorkflow(parsed.data.workflow);
      setAssistant("WeConnect Trust Report generated.");
    }
  }, [sessionId]);

  return { setCertificationType, saveQuestionnaire, runCompliance, createTrustReport };
}
