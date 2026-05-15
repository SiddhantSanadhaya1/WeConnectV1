"use client";

import { useCallback, useState, useMemo } from "react";
import { emptyRegistrationDraft, validateRegistration } from "@/lib/registration";
import { type CertificationType, type ComplianceResult, type TrustReport } from "@/lib/domains/contracts";
import { getTranslations, getLanguageMetadata, type Language } from "@/lib/i18n";
import { BlockAnchorAnimation } from "./BlockAnchorAnimation";

// Concierge sub-components
import { Header } from "./concierge/Header";
import { IntroSection } from "./concierge/IntroSection";
import { IntakeSection } from "./concierge/IntakeSection";
import { StepperUI } from "./concierge/StepperUI";
import { RegistrationReview } from "./concierge/RegistrationReview";
import { VerificationDisplay } from "./concierge/VerificationDisplay";
import { SelfVerificationAdvanced } from "./concierge/SelfVerificationAdvanced";
import { CertificateDisplay } from "./concierge/CertificateDisplay";
import { UpgradePortal } from "./concierge/UpgradePortal";

// Concierge hooks
import { useSpeechSynthesis } from "./concierge/useSpeechSynthesis";
import { useConciergeSession } from "./concierge/useConciergeSession";
import { useConciergeWorkflow } from "./concierge/useConciergeWorkflow";
import { useDiscovery } from "./concierge/useDiscovery";
import { useVerification } from "./concierge/useVerification";
import { useAgent } from "./concierge/useAgent";
import { useAnchoring } from "./concierge/useAnchoring";
import { useReports } from "./concierge/useReports";
import { useBuyerFlow } from "./concierge/useBuyerFlow";

import { 
  GeminiFallbackReason, 
  GeminiQuotaSubtype, 
  WorkflowState, 
  AiAssessmentReport,
  Match,
  OwnershipSummary,
  OwnershipBreakdown
} from "./concierge/types";

export function ConciergeClient({ embed, language = "en" }: { embed?: boolean; language?: Language }) {
  const translations = getTranslations(language);
  const langMeta = getLanguageMetadata(language);
  
  // --- Local State ---
  const [query, setQuery] = useState(translations.intake.placeholder);
  const [stage, setStage] = useState<string>("idle");
  const [assistant, setAssistant] = useState<string>("");
  const [badge, setBadge] = useState<string | null>(null);
  const [cert, setCert] = useState<any>(null);
  const [quotaFallbackNotice, setQuotaFallbackNotice] = useState(false);
  const [quotaFallbackReason, setQuotaFallbackReason] = useState<GeminiFallbackReason | null>(null);
  const [quotaFallbackSubtype, setQuotaFallbackSubtype] = useState<GeminiQuotaSubtype | null>(null);
  const [registration, setRegistration] = useState(emptyRegistrationDraft());
  const [paid, setPaid] = useState(false);
  const [visionChecks, setVisionChecks] = useState<{ idPassed?: boolean }>({});
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [aiAssessmentReport, setAiAssessmentReport] = useState<AiAssessmentReport | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [trustReport, setTrustReport] = useState<TrustReport | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({
    ownership_control: "",
    operational_involvement: "",
    years_in_business: "",
    clients_worked_with: "",
    product_scale: "",
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [manualFlowStep, setManualFlowStep] = useState<number | null>(null);

  // Discovery related states (shared)
  const [match, setMatch] = useState<Match | null>(null);
  const [fieldConfidence, setFieldConfidence] = useState<Partial<Record<string, number>>>({});
  const [fieldEvidence, setFieldEvidence] = useState<Partial<Record<string, string>>>({});
  const [discoverCandidates, setDiscoverCandidates] = useState<any[]>([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
  const [needsCandidateConfirmation, setNeedsCandidateConfirmation] = useState(false);
  const [countryConfirmed, setCountryConfirmed] = useState(true);
  const [countryRequiresConfirmation, setCountryRequiresConfirmation] = useState(false);
  const [ownershipEvidenceConfidence, setOwnershipEvidenceConfidence] = useState(0);
  const [ownership, setOwnership] = useState<OwnershipSummary | null>(null);
  const [ownershipBreakdown, setOwnershipBreakdown] = useState<OwnershipBreakdown | null>(null);
  const [founderNames, setFounderNames] = useState<string[]>([]);
  const [classificationSummary, setClassificationSummary] = useState<any>(undefined);

  // --- Hooks ---
  const { speak: speakWithLanguage, stop: stopAudio } = useSpeechSynthesis(langMeta.langCode, audioEnabled);

  const { sessionId, saveRegistration, refreshSession } = useConciergeSession(
    match,
    registration, setRegistration,
    paid, setPaid,
    stage, setStage,
    setAssistant,
    visionChecks, setVisionChecks,
    setAiAssessmentReport,
    setWorkflow,
    setCompliance,
    setTrustReport,
    setQuestionnaireAnswers
  );

  const { setCertificationType, saveQuestionnaire, runCompliance, createTrustReport } = useConciergeWorkflow(
    sessionId, setWorkflow, setCompliance, setTrustReport, setAssistant, setBadge, setRegistration
  );

  const { runDiscover } = useDiscovery(
    sessionId, query, registration, setRegistration, workflow, setAssistant, speakWithLanguage, setBadge, refreshSession,
    match, setMatch,
    fieldConfidence, setFieldConfidence,
    fieldEvidence, setFieldEvidence,
    discoverCandidates, setDiscoverCandidates,
    selectedCandidateIndex, setSelectedCandidateIndex,
    needsCandidateConfirmation, setNeedsCandidateConfirmation,
    countryConfirmed, setCountryConfirmed,
    setCountryRequiresConfirmation,
    setOwnershipEvidenceConfidence,
    setOwnership,
    setOwnershipBreakdown,
    setFounderNames,
    setClassificationSummary
  );

  const verification = useVerification(
    sessionId, setAssistant, speakWithLanguage, setBadge, refreshSession, setStage, 
    workflow?.certificationType === "self",
    runCompliance, createTrustReport
  );

  const { callAgent } = useAgent(
    sessionId, setAssistant, speakWithLanguage, setBadge, setStage, refreshSession,
    setQuotaFallbackNotice, setQuotaFallbackReason, setQuotaFallbackSubtype
  );

  const { anchoring, anchorBlockers, anchorFailureReason, anchorOperatorHint, pendingTx, anchorCert } = useAnchoring(
    sessionId, registration, paid, saveRegistration, setCert, setStage, setBadge, refreshSession, speakWithLanguage
  );

  const reports = useReports(sessionId, cert, setAssistant);

  const buyerFlow = useBuyerFlow(translations.intake.description, setAssistant);

  // --- Derived State ---
  const activeCertType: CertificationType = workflow?.certificationType && workflow.certificationType !== "none"
    ? workflow.certificationType
    : ((registration.cert_type as CertificationType | undefined) ?? "none");
  const isDigitalPath = activeCertType === "digital";
  const isSelfPath = activeCertType === "self";
  
  const registrationCheck = validateRegistration(registration, isDigitalPath ? paid : true);
  const readinessBlockers = [
    ...registrationCheck.missingRequired,
    ...(isDigitalPath && !visionChecks.idPassed ? ["vision_id"] : []),
  ];
  const countryConfirmationBlockers = countryRequiresConfirmation && !countryConfirmed ? ["country_confirmation"] : [];
  const mergedBlockers = Array.from(new Set([...readinessBlockers, ...countryConfirmationBlockers, ...anchorBlockers]));
  const readinessForIssue = mergedBlockers.length === 0;

  const mockCardValid = cardNumber.replace(/\s+/g, "").length >= 12 && cardExpiry.trim().length >= 4 && cardCvv.length >= 3;

  const flowSteps = ["Intake", "Confirm", "Upload", "Verification", "Certificate", "Digital Upgrade"] as const;
  
  const computedFlowStep = useMemo(() => {
    if (stage === "complete" && activeCertType === "digital") return 5;
    if (cert || stage === "complete") return 4;
    if (stage === "anchoring") return 4;
    if (!match) return 0;
    if (
      needsCandidateConfirmation ||
      !registration.country.trim() ||
      (countryRequiresConfirmation && !countryConfirmed) ||
      stage === "discovered"
    ) {
      return 1;
    }
    if (stage === "doc_upload" && !compliance) return 2;
    if (compliance && !trustReport) return 3;
    if (trustReport && !cert) return 3;
    if (isDigitalPath) return 5;
    return 2;
  }, [stage, activeCertType, cert, match, needsCandidateConfirmation, registration.country, countryRequiresConfirmation, countryConfirmed, compliance, trustReport, isDigitalPath]);

  const currentFlowStep = manualFlowStep ?? computedFlowStep;

  // --- Actions ---
  const startVerification = async () => {
    if (needsCandidateConfirmation) {
      const msg = "Please select the best web candidate and click 'Use selected candidate' before starting verification.";
      setAssistant(msg);
      speakWithLanguage(msg);
      return;
    }
    if (!registration.country.trim()) {
      const msg = "Country is required before verification. Please enter and confirm the country.";
      setAssistant(msg);
      speakWithLanguage(msg);
      return;
    }
    if (countryRequiresConfirmation && !countryConfirmed) {
      const msg = "Please confirm the country field before starting verification.";
      setAssistant(msg);
      speakWithLanguage(msg);
      return;
    }
    
    let currentCertType = activeCertType;
    if (currentCertType === "none") {
      void setCertificationType("self");
      currentCertType = "self";
    }
    
    if (currentCertType === "self") {
      const msg = "Self-Certified path selected. Please upload your business registration documents to continue.";
      setStage("doc_upload");
      setAssistant(msg);
      if (sessionId) {
        await fetch("/api/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, stage: "doc_upload" }),
        });
      }
      speakWithLanguage(msg);
      return;
    }
    await saveRegistration(registration, paid);
    await callAgent();
  };

  const onVoice = async (text: string) => {
    if (stage === "voice_attestation") {
      await callAgent(text, "attestation");
      return;
    }
    await callAgent(text);
  };

  const onUpgrade = async () => {
    if (!registration.email || !registration.phone || !mockCardValid) {
      alert("Please fill all fields and enter valid card details.");
      return;
    }
    setPaid(true);
    await setCertificationType("digital");
    setStage("complete");
    const msg = "Digital certification request submitted. We will verify your details within 72 hours.";
    setAssistant(msg);
    speakWithLanguage(msg);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-6">
      <BlockAnchorAnimation active={anchoring} txHash={pendingTx} />

      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-5">
        <Header 
          translations={translations} 
          audioEnabled={audioEnabled} 
          setAudioEnabled={setAudioEnabled} 
          embed={embed} 
        />

        <IntroSection 
          translations={translations}
          quotaFallbackNotice={quotaFallbackNotice}
          quotaFallbackReason={quotaFallbackReason}
          quotaFallbackSubtype={quotaFallbackSubtype}
        />

        <IntakeSection 
          show={currentFlowStep === 0}
          query={query}
          setQuery={setQuery}
          onDiscover={() => runDiscover()}
          sessionId={sessionId}
        />

        <StepperUI 
          flowSteps={flowSteps}
          currentFlowStep={currentFlowStep}
          match={match}
          activeCertType={activeCertType}
          setCertificationType={setCertificationType}
          setMatch={setMatch}
          setRegistration={setRegistration}
          setStage={setStage}
          setNeedsCandidateConfirmation={setNeedsCandidateConfirmation}
          setCountryConfirmed={setCountryConfirmed}
          setPaid={setPaid}
          setManualFlowStep={setManualFlowStep}
          compliance={compliance}
          trustReport={trustReport}
          runCompliance={runCompliance}
          createTrustReport={createTrustReport}
          startVerification={startVerification}
          stage={stage}
          cert={cert}
        />

        <SelfVerificationAdvanced 
          show={(currentFlowStep === 3) || (isSelfPath && currentFlowStep === 3)}
          workflow={workflow}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          isSelfPath={isSelfPath}
          registration={registration}
          setRegistration={setRegistration}
          setCertificationType={setCertificationType}
          questionnaireAnswers={questionnaireAnswers}
          setQuestionnaireAnswers={setQuestionnaireAnswers}
          saveQuestionnaire={() => saveQuestionnaire(questionnaireAnswers)}
          runCompliance={runCompliance}
          createTrustReport={createTrustReport}
          compliance={compliance}
          trustReport={trustReport}
          currentFlowStep={currentFlowStep}
        />

        <RegistrationReview 
          show={currentFlowStep === 1}
          match={match}
          registration={registration}
          setRegistration={setRegistration}
          fieldConfidence={fieldConfidence}
          fieldEvidence={fieldEvidence}
          countryRequiresConfirmation={countryRequiresConfirmation}
          countryConfirmed={countryConfirmed}
          setCountryConfirmed={setCountryConfirmed}
          ownership={ownership}
          ownershipEvidenceConfidence={ownershipEvidenceConfidence}
          ownershipBreakdown={ownershipBreakdown}
          needsCandidateConfirmation={needsCandidateConfirmation}
          discoverCandidates={discoverCandidates}
          selectedCandidateIndex={selectedCandidateIndex}
          setSelectedCandidateIndex={setSelectedCandidateIndex}
          onRunDiscover={runDiscover}
          founderNames={founderNames}
          registrationCheck={registrationCheck}
          mergedBlockers={mergedBlockers}
          anchorFailureReason={anchorFailureReason}
          anchorOperatorHint={anchorOperatorHint}
        />

        <VerificationDisplay 
          show={currentFlowStep === 2 || (currentFlowStep === 3 && !compliance)}
          stage={stage}
          assistant={assistant}
          badge={badge}
          visionNote={verification.visionNote}
          visionWarning={verification.visionWarning}
          visionBlockers={verification.visionBlockers}
          sessionId={sessionId}
          match={match}
          onVoice={onVoice}
          selectedDocuments={verification.selectedDocuments}
          setSelectedDocuments={verification.setSelectedDocuments}
          handleFileUpload={verification.handleFileUpload}
          isVerifyingDocs={verification.isVerifyingDocs}
          documentProgress={verification.documentProgress}
          videoProgress={verification.videoProgress}
          scanning={verification.scanning}
          sendVision={verification.sendVision}
          currentFlowStep={currentFlowStep}
        />

        <CertificateDisplay 
          show={currentFlowStep === 4}
          cert={cert}
          verifyUrl={typeof window !== "undefined" && cert ? `${window.location.origin}/verify/${cert.id}` : ""}
          downloadCertificatePdf={reports.downloadCertificatePdf}
          downloadingCertificate={reports.downloadingCertificate}
          setManualFlowStep={setManualFlowStep}
          readinessForIssue={readinessForIssue}
          mergedBlockers={mergedBlockers}
          anchoring={anchoring}
          anchorCert={anchorCert}
          setAssistant={setAssistant}
          speakWithLanguage={speakWithLanguage}
        />

        <UpgradePortal 
          show={currentFlowStep === 5 && cert}
          cert={cert}
          verifyUrl={typeof window !== "undefined" && cert ? `${window.location.origin}/verify/${cert.id}` : ""}
          registration={registration}
          setRegistration={setRegistration}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiry={cardExpiry}
          setCardExpiry={setCardExpiry}
          cardCvv={cardCvv}
          setCardCvv={setCardCvv}
          mockCardValid={mockCardValid}
          onUpgrade={onUpgrade}
        />
      </main>
    </div>
  );
}
