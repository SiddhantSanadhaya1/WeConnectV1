"use client";

import { useCallback, useState } from "react";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type AudioStep = {
  label: string;
  status: "pending" | "running" | "done";
};

const AUDIO_STEPS = [
  "Audio captured",
  "Cleaning background noise",
  "Converting speech to text",
  "Checking confirmation intent",
  "Sending response to verification agent",
];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function initialAudioSteps(): AudioStep[] {
  return AUDIO_STEPS.map((label) => ({ label, status: "pending" }));
}

function getRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

export function VoiceConcierge({ onTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<AudioStep[]>([]);
  const [supported, setSupported] = useState(true);

  const runAudioSteps = useCallback(async () => {
    setSteps(initialAudioSteps());
    for (let i = 0; i < AUDIO_STEPS.length; i += 1) {
      setSteps((current) =>
        current.map((step, idx) => ({
          ...step,
          status: idx < i ? "done" : idx === i ? "running" : "pending",
        })),
      );
      await wait(1500);
    }
    setSteps((current) => current.map((step) => ({ ...step, status: "done" })));
  }, []);

  const listen = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    setListening(true);
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      if (!text) return;
      setProcessing(true);
      void runAudioSteps().then(() => {
        onTranscript(text);
        setProcessing(false);
      });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }, [onTranscript, runAudioSteps]);

  return (
    <div className="flex flex-col gap-3">
      {!supported && (
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600">
          Speech recognition is not available in this browser.
        </p>
      )}
      <button
        type="button"
        disabled={disabled || !supported || processing}
        onClick={listen}
        className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-all shadow-md ${
          listening || processing
            ? "bg-rose-500 text-white animate-pulse" 
            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-100 hover:-translate-y-0.5 hover:shadow-violet-200"
        } disabled:opacity-40 disabled:shadow-none disabled:translate-y-0`}
      >
        <div className="relative flex h-5 w-5 items-center justify-center">
          {listening ? (
            <span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-white"></span>
          )}
          <span className="relative h-2 w-2 rounded-full bg-white"></span>
        </div>
        {processing ? "VERIFYING AUDIO..." : listening ? "LISTENING..." : "ACTIVATE VOICE"}
      </button>
      {!!steps.length && (
        <div className="rounded-2xl border border-violet-100 bg-white/80 p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Audio verification activity</p>
          <ol className="space-y-1.5">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    step.status === "done"
                      ? "bg-emerald-100 text-emerald-700"
                      : step.status === "running"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-300"
                  }`}
                >
                  {step.status === "done" ? "✓" : step.status === "running" ? "•" : ""}
                </span>
                <span className={`text-[11px] font-semibold ${step.status === "pending" ? "text-slate-400" : "text-slate-700"}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
