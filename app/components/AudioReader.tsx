'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Gauge, Mic } from 'lucide-react';

interface AudioReaderProps {
  documentText: string;
}

const SPEED_OPTIONS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x',    value: 1    },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x',  value: 1.5  },
  { label: '2x',    value: 2    },
];

type ReadingState = 'idle' | 'playing' | 'paused';

export default function AudioReader({ documentText }: AudioReaderProps) {
  const [readingState, setReadingState] = useState<ReadingState>('idle');
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Stop and reset if the source text changes
  useEffect(() => {
    handleStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentText]);

  const handleStop = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setReadingState('idle');
  }, []);

  const handlePlay = useCallback(() => {
    if (!supported) return;

    // Resume from pause
    if (readingState === 'paused') {
      window.speechSynthesis.resume();
      setReadingState('playing');
      return;
    }

    // Stop any currently running speech
    window.speechSynthesis.cancel();

    const text = documentText?.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = 'en-US';

    utterance.onstart = () => setReadingState('playing');
    utterance.onpause = () => setReadingState('paused');
    utterance.onresume = () => setReadingState('playing');
    utterance.onend = () => {
      utteranceRef.current = null;
      setReadingState('idle');
    };
    utterance.onerror = (e) => {
      // 'interrupted' fires on cancel(), which is intentional — suppress it
      if (e.error === 'interrupted') return;
      console.error('SpeechSynthesis error:', e.error);
      utteranceRef.current = null;
      setReadingState('idle');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, readingState, documentText, rate]);

  const handlePause = useCallback(() => {
    if (readingState !== 'playing') return;
    window.speechSynthesis.pause();
    setReadingState('paused');
  }, [readingState]);

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);

    // If currently active, restart with the new rate
    if (readingState === 'playing' || readingState === 'paused') {
      window.speechSynthesis.cancel();
      const text = documentText?.trim();
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = newRate;
      utterance.lang = 'en-US';
      utterance.onend = () => {
        utteranceRef.current = null;
        setReadingState('idle');
      };
      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return;
        setReadingState('idle');
      };
      utteranceRef.current = utterance;

      // Small delay for cancellation to propagate
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        setReadingState('playing');
      }, 120);
    }
  }, [readingState, documentText]);

  const isActive = readingState === 'playing' || readingState === 'paused';

  if (!supported) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-sm font-medium">
        <Volume2 size={18} /> Your browser does not support audio reading.
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 p-2 pr-4 rounded-2xl shadow-md border transition-all duration-300 ${
      readingState === 'playing'
        ? 'bg-gradient-to-r from-tacsfon-green/10 via-white to-white border-tacsfon-green/30 shadow-tacsfon-green/10'
        : readingState === 'paused'
        ? 'bg-orange-50/60 border-tacsfon-orange/30'
        : 'bg-white border-gray-100'
    }`}>

      {/* Animated Icon / Indicator */}
      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
        readingState === 'playing' ? 'bg-tacsfon-green' : readingState === 'paused' ? 'bg-tacsfon-orange' : 'bg-gray-100'
      }`}>
        {readingState === 'playing' ? (
          <Mic size={20} className="text-white animate-pulse" />
        ) : readingState === 'paused' ? (
          <Mic size={20} className="text-white" />
        ) : (
          <Volume2 size={20} className="text-gray-400" />
        )}

        {/* Pulsing ring when playing */}
        {readingState === 'playing' && (
          <span className="absolute inset-0 rounded-xl ring-2 ring-tacsfon-green/40 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Status Label */}
      <div className="flex flex-col leading-tight select-none min-w-[64px]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Audio</span>
        <span className={`text-xs font-extrabold capitalize ${
          readingState === 'playing' ? 'text-tacsfon-green' : readingState === 'paused' ? 'text-tacsfon-orange' : 'text-gray-500'
        }`}>
          {readingState === 'idle' ? 'Ready' : readingState}
        </span>
      </div>

      <div className="h-8 w-px bg-gray-200 mx-1" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play / Pause toggle */}
        {readingState === 'playing' ? (
          <button
            onClick={handlePause}
            title="Pause"
            className="p-2.5 bg-tacsfon-orange/10 text-tacsfon-orange rounded-xl hover:bg-tacsfon-orange/20 active:scale-95 transition-all"
          >
            <Pause size={18} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            disabled={!documentText?.trim()}
            title={readingState === 'paused' ? 'Resume' : 'Play'}
            className="p-2.5 bg-tacsfon-green text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-tacsfon-green/20"
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}

        {/* Stop */}
        <button
          onClick={handleStop}
          disabled={!isActive}
          title="Stop"
          className={`p-2.5 rounded-xl active:scale-95 transition-all ${
            isActive
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Square size={18} fill="currentColor" />
        </button>
      </div>

      <div className="h-8 w-px bg-gray-200 mx-1" />

      {/* Speed Selector */}
      <div className="flex items-center gap-2">
        <Gauge size={14} className="text-gray-400 hidden sm:block" />
        <select
          value={rate}
          onChange={handleRateChange}
          title="Playback speed"
          className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-tacsfon-green focus:border-tacsfon-green hover:bg-gray-100 cursor-pointer transition-colors"
        >
          {SPEED_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
