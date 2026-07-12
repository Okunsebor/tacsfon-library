import React from 'react';
import { Volume2 } from 'lucide-react';
import { ReadingTheme } from '@/lib/types';

interface ParagraphBlockProps {
  text: string;
  index: number;
  isSpeaking: boolean;
  onClick: () => void;
  readingTheme: ReadingTheme;
  fontSize: number;
  accent: string;
  textMuted: string;
  readingText: string;
}

/**
 * Click-to-read interactive block rendering individual paragraphs.
 * Highlights visually when spoken by Web Speech API.
 */
export const ParagraphBlock = React.forwardRef<HTMLDivElement, ParagraphBlockProps>(({
  text,
  index,
  isSpeaking,
  onClick,
  readingTheme,
  fontSize,
  accent,
  textMuted,
  readingText
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group relative py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border-l-[3px] ${
        isSpeaking
          ? 'border-l-green-500'
          : 'border-l-transparent hover:border-l-gray-300'
      }`}
      style={{
        background: isSpeaking
          ? (readingTheme === 'dark' ? 'rgba(0,104,56,0.15)' : 'rgba(0,104,56,0.06)')
          : 'transparent',
        fontSize: `${fontSize}px`,
        lineHeight: 1.85,
        wordSpacing: '0.02em',
        letterSpacing: '0.01em',
      }}
    >
      {/* Hover play icon */}
      <span className={`absolute -left-1 top-3 transition-all duration-200 ${
        isSpeaking
          ? 'opacity-100 scale-100'
          : 'opacity-0 group-hover:opacity-60 scale-75 group-hover:scale-100'
      }`}>
        <Volume2 size={14} style={{ color: isSpeaking ? accent : textMuted }} className={isSpeaking ? 'animate-pulse' : ''} />
      </span>
      <span className={`transition-colors duration-300 ${
        isSpeaking ? 'font-medium' : 'group-hover:opacity-90'
      }`} style={{ color: isSpeaking ? (readingTheme === 'dark' ? '#E5E7EB' : '#111827') : readingText }}>
        {text.trim()}
      </span>
    </div>
  );
});

ParagraphBlock.displayName = 'ParagraphBlock';
