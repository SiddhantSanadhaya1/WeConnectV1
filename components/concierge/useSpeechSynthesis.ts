import { useCallback, useEffect, useRef } from "react";

let ttsUnlocked = false;
let pendingSpeechText: string | null = null;
const speechQueue: string[] = [];
let speechActive = false;
let audioEnabledGlobal = true;

function selectVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === langCode) ??
    voices.find((v) => v.lang.startsWith(langCode.split("-")[0])) ??
    voices.find((v) => /en-US|en_US/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0] ??
    null
  );
}

function flushSpeechQueue(langCode: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!ttsUnlocked || speechActive || !audioEnabledGlobal) return;
  const nextText = speechQueue.shift();
  if (!nextText) return;
  
  const utterance = new SpeechSynthesisUtterance(nextText);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = langCode;
  const voice = selectVoice(langCode);
  if (voice) utterance.voice = voice;
  speechActive = true;
  utterance.onend = () => {
    speechActive = false;
    flushSpeechQueue(langCode);
  };
  utterance.onerror = () => {
    speechActive = false;
    flushSpeechQueue(langCode);
  };
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

function unlockTtsFromGesture() {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    ttsUnlocked = true;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.resume();
    const primer = new SpeechSynthesisUtterance(" ");
    primer.volume = 0;
    window.speechSynthesis.speak(primer);
    if (pendingSpeechText) {
      const queued = pendingSpeechText;
      pendingSpeechText = null;
      speechQueue.push(queued);
    }
    window.setTimeout(() => flushSpeechQueue("en-US"), 30);
  } catch (error) {
    console.warn("[TTS] unlock failed", error);
  }
}

function stopAudio() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  speechQueue.length = 0;
  speechActive = false;
}

function speak(text: string, langCode: string = "en-US") {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("[TTS] speechSynthesis unavailable");
      return;
    }
    if (!audioEnabledGlobal) return;
    const normalized = text.trim().toLowerCase();
    if (
      normalized === "please continue following the on-screen prompts." ||
      normalized === "please continue with the on-screen verification steps."
    ) {
      return;
    }
    if (!ttsUnlocked) {
      pendingSpeechText = text;
      return;
    }
    speechQueue.push(text);
    flushSpeechQueue(langCode);
  } catch (error) {
    console.warn("[TTS] failed to speak", error);
  }
}

export function useSpeechSynthesis(langCode: string, audioEnabled: boolean) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onVoicesChanged = () => {
      if (ttsUnlocked) flushSpeechQueue(langCode);
    };
    const unlock = () => unlockTtsFromGesture();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.speechSynthesis?.addEventListener?.("voiceschanged", onVoicesChanged);
    unlockTtsFromGesture();
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.speechSynthesis?.removeEventListener?.("voiceschanged", onVoicesChanged);
    };
  }, [langCode]);

  useEffect(() => {
    audioEnabledGlobal = audioEnabled;
    if (!audioEnabled) stopAudio();
  }, [audioEnabled]);

  const speakWithLanguage = useCallback((text: string) => {
    speak(text, langCode);
  }, [langCode]);

  return { speak: speakWithLanguage, stop: stopAudio };
}
