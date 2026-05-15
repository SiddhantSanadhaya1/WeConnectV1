import { GeminiFallbackReason, GeminiQuotaSubtype } from "./types";

export function fallbackReasonCopy(reason: GeminiFallbackReason | null, subtype: GeminiQuotaSubtype | null) {
  switch (reason) {
    case "quota":
      if (subtype === "capacity") return "Gemini model capacity is temporarily exhausted.";
      return "Gemini quota/rate limit was hit.";
    case "api_key_invalid":
      return "Gemini API key is missing or invalid.";
    case "model_not_found":
      return "Configured Gemini model name is unavailable.";
    case "permission":
      return "Gemini request was denied by permissions.";
    case "network":
      return "Network/provider issue reaching Gemini.";
    default:
      return "Gemini live call failed.";
  }
}

export function fallbackReasonGuidance(reason: GeminiFallbackReason | null, subtype: GeminiQuotaSubtype | null) {
  switch (reason) {
    case "api_key_invalid":
      return "Set a valid GEMINI_API_KEY in .env.local and restart the server.";
    case "model_not_found":
      return "Update GEMINI_MODEL to an available model from Google AI Studio.";
    case "permission":
      return "Check API key permissions and project access for the selected Gemini model.";
    case "quota":
      if (subtype === "capacity") {
        return "Current model is at capacity. Retry shortly or configure model fallbacks with available capacity.";
      }
      return "Quota/rate limit reached. Retry later or switch to a model/tier with capacity.";
    case "network":
      return "Provider/network issue. Verify internet/proxy/DNS, then retry.";
    default:
      return "Review GEMINI_API_KEY and GEMINI_MODEL in .env.local.";
  }
}

export function humanizeMissingField(field: string): string {
  const map: Record<string, string> = {
    business_name: "business name",
    country: "country",
    naics_codes: "NAICS codes",
    unspsc_codes: "UNSPSC codes",
    owner_details: "owner details",
    business_description: "business description",
    cert_type: "certification type",
  };
  return map[field] ?? field.replace(/_/g, " ");
}

export async function parseJsonSafe<T>(r: Response): Promise<{
  ok: boolean;
  data?: T;
  errorMessage?: string;
}> {
  const raw = await r.text();
  if (!raw.trim()) {
    return {
      ok: r.ok,
      errorMessage: r.ok ? undefined : `Empty response (HTTP ${r.status})`,
    };
  }
  try {
    const data = JSON.parse(raw) as T;
    if (!r.ok) {
      const err = (data as { error?: string }).error ?? `Request failed (HTTP ${r.status})`;
      return { ok: false, data, errorMessage: err };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      errorMessage: `Invalid response (HTTP ${r.status}). Expected JSON.`,
    };
  }
}

export async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, retries = 1): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(input, init);
    } catch (e) {
      lastError = e;
      await new Promise((resolve) => setTimeout(resolve, 250 * (i + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("network error");
}
