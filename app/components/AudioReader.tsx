'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface AudioReaderProps {
  documentText: string;
}

export default function AudioReader({ documentText }: AudioReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech if the document text changes completely
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [documentText]);

  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const play = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Your browser does not support Speech Synthesis.");
      return;
    }

    // If currently paused, just resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Otherwise, start fresh
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    // Ensure we don't try to read empty text
    if (!documentText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(documentText);
    utterance.rate = rate;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    
    // If it's already playing, we need to restart it to apply the new rate
    // Note: SpeechSynthesis API doesn't support changing rate on the fly reliably across all browsers.
    if (isPlaying || isPaused) {
      stop();
      // Brief timeout to ensure the previous utterance is fully cancelled before restarting
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(documentText);
        utterance.rate = newRate;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 w-fit">
      
      <div className="flex items-center gap-3 text-tacsfon-green pr-2">
        <Volume2 size={24} />
      </div>

      <div className="h-8 w-px bg-gray-200"></div>

      {/* Controls */}
      <div className="flex items-center gap-2 pl-2">
        {!isPlaying ? (
          <button 
            onClick={play} 
            disabled={!documentText.trim()}
            className="p-2.5 md:p-3 bg-tacsfon-green text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Play"
          >
            <Play size={18} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={pause} 
            className="p-2.5 md:p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors" 
            title="Pause"
          >
            <Pause size={18} fill="currentColor" />
          </button>
        )}

        <button 
          onClick={stop} 
          disabled={!isPlaying && !isPaused} 
          className={`p-2.5 md:p-3 rounded-xl transition-colors ${isPlaying || isPaused ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} 
          title="Stop"
        >
          <Square size={18} fill="currentColor" />
        </button>
      </div>

      <div className="h-8 w-px bg-gray-200 mx-1 md:mx-2"></div>

      {/* Speed Dropdown */}
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed</span>
        <select
          value={rate}
          onChange={handleRateChange}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-2 focus:ring-tacsfon-green focus:border-tacsfon-green block px-2 py-2 md:px-3 md:py-2 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

    </div>
  );
}
