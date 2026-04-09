'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { resultIndex: number; results: { [k: number]: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Browser speech-to-text (Web Speech API). Chrome/Edge typically supported.
 */
export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    stop();
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    rec.onresult = (ev) => {
      let out = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        out += ev.results[i][0].transcript;
      }
      const t = out.trim();
      if (t) onFinal(t);
    };
    rec.onerror = (ev) => {
      setError(ev.error || 'speech error');
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start microphone.');
      setListening(false);
    }
  }, [onFinal, stop]);

  return { listening, supported, error, start, stop };
}
