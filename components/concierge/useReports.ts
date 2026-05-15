import { useCallback, useState } from "react";
import { parseJsonSafe } from "./utils";

export function useReports(sessionId: string | null, cert: any, setAssistant: (v: string) => void) {
  const [downloadingAiReport, setDownloadingAiReport] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const downloadAiAssessmentReport = useCallback(async () => {
    if (!sessionId) return;
    setDownloadingAiReport(true);
    try {
      const response = await fetch(`/api/ai-assessment/report?sessionId=${encodeURIComponent(sessionId)}`);
      if (!response.ok) {
        const parsed = await parseJsonSafe<{ error?: string }>(response);
        setAssistant(parsed.errorMessage ?? "AI assessment report is not ready yet.");
        return;
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename=\"([^\"]+)\"/i);
      const filename = filenameMatch?.[1] ?? `ai-assessment-${sessionId.slice(0, 8)}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setAssistant("AI assessment report downloaded.");
    } catch {
      setAssistant("Could not download AI assessment report. Please retry.");
    } finally {
      setDownloadingAiReport(false);
    }
  }, [sessionId, setAssistant]);

  const downloadCertificatePdf = useCallback(async () => {
    if (!cert) return;
    setDownloadingCertificate(true);
    try {
      const response = await fetch(`/api/certificate/${encodeURIComponent(cert.id)}/document`);
      if (!response.ok) {
        const parsed = await parseJsonSafe<{ error?: string }>(response);
        setAssistant(parsed.errorMessage ?? "Certificate is not ready yet.");
        return;
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename=\"([^\"]+)\"/i);
      const filename = filenameMatch?.[1] ?? `weconnect-certificate-${cert.id.slice(0, 8)}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setAssistant("Official certificate downloaded.");
    } catch {
      setAssistant("Could not download certificate PDF. Please retry.");
    } finally {
      setDownloadingCertificate(false);
    }
  }, [cert, setAssistant]);

  return {
    downloadingAiReport,
    downloadingCertificate,
    downloadAiAssessmentReport,
    downloadCertificatePdf,
  };
}
