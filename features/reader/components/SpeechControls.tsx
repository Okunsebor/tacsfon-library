import React from 'react';
import { Play, Pause, Square, Gauge, Headphones } from 'lucide-react';
import { SPEED_OPTIONS } from '@/lib/types';

interface SpeechControlsProps {
  paragraphsLength: number;
  speakingParagraph: number | null;
  isPaused: boolean;
  speechRate: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (rate: number) => void;
  onVoiceChange: (voiceURI: string) => void;
  accent: string;
  textMuted: string;
  textColor: string;
  borderColor: string;
}

/**
 * Visual controls for Speech playback, speed adjustments, and voice options.
 */
export const SpeechControls: React.FC<SpeechControlsProps> = ({
  paragraphsLength,
  speakingParagraph,
  isPaused,
  speechRate,
  voices,
  selectedVoiceURI,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
  onVoiceChange,
  accent,
  textMuted,
  textColor,
  borderColor,
}) => {
  if (paragraphsLength === 0) {
    return <p className="text-xs text-center italic" style={{ color: textMuted }}>Audio unavailable</p>;
  }

  const handlePlayToggle = () => {
    if (speakingParagraph === null) {
      onPlay();
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePlayToggle}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:opacity-90 active:scale-95"
          style={{ background: accent, color: '#fff' }}
        >
          {speakingParagraph !== null && !isPaused ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {speakingParagraph !== null ? (isPaused ? 'Resume' : 'Pause') : 'Play Audio'}
        </button>
        {speakingParagraph !== null && (
          <button
            onClick={onStop}
            className="p-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
            title="Stop"
          >
            <Square size={18} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white/50 p-2 rounded-xl border" style={{ borderColor }}>
        <Gauge size={16} style={{ color: textMuted }} />
        <select
          value={speechRate}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="bg-transparent text-xs font-bold outline-none cursor-pointer flex-1"
          style={{ color: textColor }}
        >
          {SPEED_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label} Speed</option>
          ))}
        </select>
      </div>

      {voices.length > 0 && (
        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-xl border" style={{ borderColor }}>
          <Headphones size={16} style={{ color: textMuted }} />
          <select
            value={selectedVoiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer flex-1 truncate"
            style={{ color: textColor }}
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name.replace(/(Microsoft|Google|Apple)\s/gi, '').substring(0, 25)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
