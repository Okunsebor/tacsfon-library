'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Gauge, Mic, X } from 'lucide-react';

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedVoiceURIRef = useRef<string>('');
  
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

  // Load and sort voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const allowedNames = ['David', 'Mark', 'UK English Female', 'UK English Male', 'English United Kingdom'];
      const filteredVoices = allVoices.filter(v =>
        allowedNames.some(allowed => v.name.includes(allowed))
      );

      // fallback to English if no allowed voices found
      const enVoices = filteredVoices.length > 0 
        ? filteredVoices 
        : allVoices.filter(v => v.lang.startsWith('en'));

      // Sort voices by hierarchy (Natural > Google > Apple > Default)
      enVoices.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const getScore = (name: string) => {
          if (name.includes('natural')) return 4;
          if (name.includes('google')) return 3;
          if (name.includes('apple')) return 2;
          return 1;
        };

        return getScore(bName) - getScore(aName);
      });

      setVoices(enVoices);
      
      // Auto-select the best voice if none is selected yet
      setSelectedVoiceURI(current => {
        if (!current && enVoices.length > 0) {
          selectedVoiceURIRef.current = enVoices[0].voiceURI;
          return enVoices[0].voiceURI;
        }
        return current;
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
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
    
    if (selectedVoiceURIRef.current) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURIRef.current);
      if (voice) utterance.voice = voice;
    }

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
      
      if (selectedVoiceURIRef.current) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURIRef.current);
        if (voice) utterance.voice = voice;
      }
      
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
  }, [readingState, documentText, selectedVoiceURI, voices]);

  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceURI = e.target.value;
    setSelectedVoiceURI(newVoiceURI);
    selectedVoiceURIRef.current = newVoiceURI;

    // If currently playing or paused, restart with the new voice
    if (readingState === 'playing' || readingState === 'paused') {
      window.speechSynthesis.cancel();
      const text = documentText?.trim();
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = 'en-US';
      
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === newVoiceURI);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        utteranceRef.current = null;
        setReadingState('idle');
      };
      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return;
        setReadingState('idle');
      };
      utteranceRef.current = utterance;

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        setReadingState('playing');
      }, 120);
    }
  }, [readingState, documentText, rate, voices]);

  const isActive = readingState === 'playing' || readingState === 'paused';

  if (!supported) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg sm:bottom-6 sm:left-6 sm:translate-x-0 sm:w-auto z-50 flex items-center justify-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-full text-rose-500 text-xs sm:text-sm font-medium shadow-lg">
        <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Browser not supported for audio.
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 p-3 sm:p-4 bg-white border border-gray-200 rounded-full shadow-lg opacity-80 sm:opacity-50 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center group"
        title="Open Audio Reader"
      >
        {readingState === 'playing' ? (
          <Mic size={24} className="text-tacsfon-green animate-pulse" />
        ) : readingState === 'paused' ? (
          <Mic size={24} className="text-tacsfon-orange" />
        ) : (
          <Volume2 size={24} className="text-gray-500 group-hover:text-tacsfon-green transition-colors" />
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[400px] sm:w-auto sm:left-6 sm:translate-x-0 sm:bottom-6 z-50 flex items-center justify-between sm:justify-start gap-1 sm:gap-3 p-1.5 sm:p-2 pr-2 sm:pr-4 rounded-full shadow-2xl border transition-all duration-300 ${
      readingState === 'playing'
        ? 'bg-gradient-to-r from-tacsfon-green/10 via-white to-white border-tacsfon-green/30 shadow-tacsfon-green/20'
        : readingState === 'paused'
        ? 'bg-orange-50/60 border-tacsfon-orange/30'
        : 'bg-white border-gray-100'
    }`}>

      {/* Animated Icon / Indicator */}
      <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
        readingState === 'playing' ? 'bg-tacsfon-green' : readingState === 'paused' ? 'bg-tacsfon-orange' : 'bg-gray-100'
      }`}>
        {readingState === 'playing' ? (
          <Mic size={16} className="text-white animate-pulse sm:w-[20px] sm:h-[20px]" />
        ) : readingState === 'paused' ? (
          <Mic size={16} className="text-white sm:w-[20px] sm:h-[20px]" />
        ) : (
          <Volume2 size={16} className="text-gray-400 sm:w-[20px] sm:h-[20px]" />
        )}

        {/* Pulsing ring when playing */}
        {readingState === 'playing' && (
          <span className="absolute inset-0 rounded-full ring-2 ring-tacsfon-green/40 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Status Label */}
      <div className="hidden sm:flex flex-col leading-tight select-none min-w-[64px]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Audio</span>
        <span className={`text-xs font-extrabold capitalize ${
          readingState === 'playing' ? 'text-tacsfon-green' : readingState === 'paused' ? 'text-tacsfon-orange' : 'text-gray-500'
        }`}>
          {readingState === 'idle' ? 'Ready' : readingState}
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

      {/* Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Play / Pause toggle */}
        {readingState === 'playing' ? (
          <button
            onClick={handlePause}
            title="Pause"
            className="p-2 sm:p-2.5 bg-tacsfon-orange/10 text-tacsfon-orange rounded-full hover:bg-tacsfon-orange/20 active:scale-95 transition-all"
          >
            <Pause size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            disabled={!documentText?.trim()}
            title={readingState === 'paused' ? 'Resume' : 'Play'}
            className="p-2 sm:p-2.5 bg-tacsfon-green text-white rounded-full hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-tacsfon-green/20"
          >
            <Play size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
          </button>
        )}

        {/* Stop */}
        <button
          onClick={handleStop}
          disabled={!isActive}
          title="Stop"
          className={`p-2 sm:p-2.5 rounded-full active:scale-95 transition-all ${
            isActive
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Square size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-0.5 sm:mx-1" />

      {/* Speed Selector */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Gauge size={14} className="text-gray-400 hidden sm:block" />
        <select
          value={rate}
          onChange={handleRateChange}
          title="Playback speed"
          className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold rounded-xl px-1.5 py-1.5 sm:px-2.5 sm:py-2 outline-none focus:ring-2 focus:ring-tacsfon-green focus:border-tacsfon-green hover:bg-gray-100 cursor-pointer transition-colors"
        >
          {SPEED_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {voices.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-200 mx-0.5 sm:mx-1" />
          
          {/* Voice Selector */}
          <div className="flex items-center max-w-[80px] sm:max-w-[140px]">
            <select
              value={selectedVoiceURI}
              onChange={handleVoiceChange}
              title="Voice Selection"
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-medium rounded-xl px-1.5 py-1.5 sm:px-2.5 sm:py-2 outline-none focus:ring-2 focus:ring-tacsfon-green focus:border-tacsfon-green hover:bg-gray-100 cursor-pointer transition-colors truncate"
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.replace(/(Microsoft|Google|Apple)\s/gi, '').substring(0, 25)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="h-6 w-px bg-gray-200 mx-0.5 sm:mx-1" />
      
      {/* Minimize Button */}
      <button
        onClick={() => setIsExpanded(false)}
        className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0"
        title="Minimize"
      >
        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  );
}
