'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Mic,
  Gauge,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useAudioStore } from '@/lib/audioStore';

const SPEED_OPTIONS = [
  { label: '0.75×', value: 0.75 },
  { label: '1×',    value: 1    },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×',  value: 1.5  },
  { label: '2×',    value: 2    },
];

export default function FloatingPlayer() {
  // ─── Zustand state ───────────────────────────────────────────────────────────
  const {
    currentAudioText,
    currentAudioTitle,
    isPlaying,
    isPaused,
    setIsPlaying,
    setIsPaused,
    stop: storeStop,
  } = useAudioStore();

  // ─── Local state ─────────────────────────────────────────────────────────────
  const [rate, setRate]         = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ─── Browser support check ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ─── React to store changes: auto-start when new text is loaded ──────────────
  useEffect(() => {
    if (isPlaying && currentAudioText) {
      startSpeech(currentAudioText, rate);
      setDismissed(false);   // re-show player when new audio is loaded
      setCollapsed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudioText, isPlaying]);

  // ─── Core speech helpers ──────────────────────────────────────────────────────
  const startSpeech = useCallback(
    (text: string, speechRate: number) => {
      if (!supported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.lang = 'en-US';

      utterance.onstart  = () => { setIsPlaying(true); };
      utterance.onpause  = () => { setIsPaused(true); };
      utterance.onresume = () => { setIsPlaying(true); };
      utterance.onend    = () => {
        utteranceRef.current = null;
        storeStop();
      };
      utterance.onerror  = (e) => {
        if (e.error === 'interrupted') return;
        console.error('SpeechSynthesis error:', e.error);
        utteranceRef.current = null;
        storeStop();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, setIsPlaying, setIsPaused, storeStop]
  );

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }
    startSpeech(currentAudioText, rate);
  }, [isPaused, currentAudioText, rate, setIsPlaying, startSpeech]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [setIsPaused]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    storeStop();
  }, [storeStop]);

  const handleRateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRate = parseFloat(e.target.value);
      setRate(newRate);
      if (isPlaying || isPaused) {
        startSpeech(currentAudioText, newRate);
      }
    },
    [isPlaying, isPaused, currentAudioText, startSpeech]
  );

  const handleDismiss = useCallback(() => {
    handleStop();
    setDismissed(true);
  }, [handleStop]);

  // ─── Visibility guard ─────────────────────────────────────────────────────────
  // Only show the player when there is text loaded and it hasn't been dismissed
  const hasContent = Boolean(currentAudioText.trim());
  if (!hasContent || dismissed || !supported) return null;

  const readingState = isPlaying ? 'playing' : isPaused ? 'paused' : 'idle';

  return (
    <div
      role="region"
      aria-label="Floating audio reader"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-[calc(100%-2rem)] max-w-xl
        rounded-2xl shadow-2xl shadow-black/20
        border border-white/20
        backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${readingState === 'playing'
          ? 'bg-gradient-to-r from-tacsfon-green to-emerald-700'
          : readingState === 'paused'
          ? 'bg-gradient-to-r from-tacsfon-dark to-gray-800'
          : 'bg-gradient-to-r from-gray-800 to-gray-900'}
      `}
    >
      {/* ── Top handle bar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {/* Animated live dot + title */}
        <div className="flex items-center gap-2 min-w-0">
          {readingState === 'playing' && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
          )}
          {readingState === 'paused' && (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-tacsfon-orange" />
          )}
          {readingState === 'idle' && (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-500" />
          )}

          <p className="text-white/90 font-bold text-sm truncate">
            {currentAudioTitle || 'Audio Reader'}
          </p>

          <span className={`
            hidden sm:inline text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full
            ${readingState === 'playing' ? 'bg-white/20 text-white' : readingState === 'paused' ? 'bg-tacsfon-orange/30 text-tacsfon-orange' : 'bg-white/10 text-white/40'}
          `}>
            {readingState}
          </span>
        </div>

        {/* Collapse & Dismiss buttons */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={handleDismiss}
            title="Close player"
            className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Collapsible controls area ── */}
      <div className={`overflow-hidden transition-all duration-300 ${collapsed ? 'max-h-0' : 'max-h-40'}`}>
        <div className="px-4 pb-4 pt-2 flex items-center gap-3">

          {/* Mic icon */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${readingState === 'playing' ? 'bg-white/20' : 'bg-white/10'}
          `}>
            <Mic
              size={20}
              className={`text-white ${readingState === 'playing' ? 'animate-pulse' : 'opacity-50'}`}
            />
          </div>

          <div className="h-8 w-px bg-white/20" />

          {/* Play / Pause */}
          {readingState === 'playing' ? (
            <button
              onClick={handlePause}
              title="Pause"
              className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl active:scale-95 transition-all"
            >
              <Pause size={18} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              title={readingState === 'paused' ? 'Resume' : 'Play'}
              className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" />
            </button>
          )}

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={readingState === 'idle'}
            title="Stop"
            className={`p-2.5 rounded-xl active:scale-95 transition-all ${
              readingState !== 'idle'
                ? 'bg-white/20 hover:bg-rose-500/40 text-white'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <Square size={18} fill="currentColor" />
          </button>

          <div className="h-8 w-px bg-white/20" />

          {/* Speed selector */}
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-white/50 hidden sm:block" />
            <select
              value={rate}
              onChange={handleRateChange}
              title="Playback speed"
              className="
                bg-white/10 border border-white/20 text-white text-xs font-bold
                rounded-xl px-2.5 py-2 outline-none
                focus:ring-2 focus:ring-white/40
                hover:bg-white/20 cursor-pointer transition-colors
              "
            >
              {SPEED_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
