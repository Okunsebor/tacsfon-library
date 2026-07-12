import React from 'react';
import Link from 'next/link';
import { X, Minus, Plus, BookOpen, Library } from 'lucide-react';
import { SpeechControls } from './SpeechControls';
import { ReadingTheme } from '@/lib/types';

interface ReaderSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  bookTitle: string;
  bookId: string;
  bgSidebar: string;
  borderColor: string;
  textColor: string;
  textMuted: string;
  accent: string;
  activeSection: number;
  sectionsLength: number;
  tocItems: string[];
  scrollToSection: (idx: number) => void;
  
  // Appearance
  readingTheme: ReadingTheme;
  changeTheme: (theme: ReadingTheme) => void;
  fontSize: number;
  changeFontSize: (dir: 1 | -1) => void;

  // Speech controls delegation
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
}

/**
 * Slide-over menu containing TOC navigation links, audio playback settings, and appearance selectors.
 */
export const ReaderSidebar: React.FC<ReaderSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  bookTitle,
  bookId,
  bgSidebar,
  borderColor,
  textColor,
  textMuted,
  accent,
  activeSection,
  sectionsLength,
  tocItems,
  scrollToSection,
  readingTheme,
  changeTheme,
  fontSize,
  changeFontSize,
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
}) => {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-[10000] w-full sm:w-[340px] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: bgSidebar, borderRight: `1px solid ${borderColor}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor }}>
          <h2 className="font-bold text-sm truncate pr-4" style={{ color: textColor }}>{bookTitle}</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: textMuted }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Speech Section */}
          <div className="p-4 border-b space-y-4" style={{ borderColor }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: textMuted }}>Audio Player</p>
            <SpeechControls
              paragraphsLength={paragraphsLength}
              speakingParagraph={speakingParagraph}
              isPaused={isPaused}
              speechRate={speechRate}
              voices={voices}
              selectedVoiceURI={selectedVoiceURI}
              onPlay={onPlay}
              onPause={onPause}
              onResume={onResume}
              onStop={onStop}
              onSpeedChange={onSpeedChange}
              onVoiceChange={onVoiceChange}
              accent={accent}
              textMuted={textMuted}
              textColor={textColor}
              borderColor={borderColor}
            />
          </div>

          {/* Settings Section */}
          <div className="p-4 border-b space-y-4" style={{ borderColor }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: textMuted }}>Appearance</p>
            <div className="flex items-center justify-between bg-white/50 p-2 rounded-xl border" style={{ borderColor }}>
              <button onClick={() => changeFontSize(-1)} className="p-2 rounded-lg hover:bg-black/5" title="Decrease font"><Minus size={16} style={{ color: textColor }} /></button>
              <span className="text-xs font-bold" style={{ color: textMuted }}>Font: {fontSize}px</span>
              <button onClick={() => changeFontSize(1)} className="p-2 rounded-lg hover:bg-black/5" title="Increase font"><Plus size={16} style={{ color: textColor }} /></button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => changeTheme('light')} className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${readingTheme === 'light' ? 'border-green-600 scale-110 shadow-md' : 'border-gray-200'}`} style={{ background: '#ffffff' }} title="Light Mode" />
              <button onClick={() => changeTheme('sepia')} className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${readingTheme === 'sepia' ? 'border-green-600 scale-110 shadow-md' : 'border-[#e7d4a6]'}`} style={{ background: '#fffbeb' }} title="Sepia Mode" />
              <button onClick={() => changeTheme('dark')} className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${readingTheme === 'dark' ? 'border-green-600 scale-110 shadow-md' : 'border-gray-700'}`} style={{ background: '#0f172a' }} title="Dark Mode" />
            </div>
          </div>

          {/* TOC Section */}
          {sectionsLength > 1 && (
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: textMuted }}>
                Contents · {sectionsLength} sections
              </p>
              <nav className="space-y-1">
                {tocItems.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(i)}
                    className={`w-full text-left text-xs py-2.5 px-3 rounded-xl transition-all font-medium leading-snug truncate ${
                      activeSection === i ? 'font-bold' : 'hover:opacity-80 hover:bg-black/5'
                    }`}
                    style={{
                      color: activeSection === i ? accent : textMuted,
                      background: activeSection === i ? 'rgba(0,104,56,0.06)' : 'transparent',
                    }}
                  >
                    <span className="opacity-40 mr-2">§{i + 1}</span>
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 shrink-0 border-t space-y-2 bg-white/50" style={{ borderColor }}>
          <Link
            href={`/book/${bookId}`}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl transition-all hover:opacity-80 border"
            style={{ background: '#fff', borderColor, color: textColor }}
          >
            <BookOpen size={16} /> Book Details
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl transition-all hover:opacity-80"
            style={{ background: 'rgba(0,104,56,0.06)', color: accent }}
          >
            <Library size={16} /> Back to Library
          </Link>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};
