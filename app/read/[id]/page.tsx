'use client';

import { extractTextFromPDF } from '@/lib/pdfUtils';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Loader2, Sun, Moon, Plus, Minus,
  Menu, X, Headphones, ChevronUp, Library, AlertTriangle,
  Volume2, Play, Pause, Square, Gauge, SkipForward
} from 'lucide-react';

import { useBook } from '@/features/books/hooks/useBook';
import { useReaderSettings } from '@/features/reader/hooks/useReaderSettings';
import { useTextToSpeech } from '@/features/reader/hooks/useTextToSpeech';

import { ReaderToolbar } from '@/features/reader/components/ReaderToolbar';
import { ReaderSidebar } from '@/features/reader/components/ReaderSidebar';
import { ParagraphBlock } from '@/features/reader/components/ParagraphBlock';

export default function BookReader() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasAutoplayed, setHasAutoplayed] = useState(false);

  const bookId = Array.isArray(id) ? id[0] : id;

  // ⚡ Clean Architecture Hooks
  const { book, loading: bookLoading } = useBook(bookId);
  const {
    readingTheme,
    changeTheme,
    fontSize,
    changeFontSize,
    sidebarOpen,
    setSidebarOpen,
    scrollProgress,
    setScrollProgress,
    activeSection,
    setActiveSection,
    readingColors,
  } = useReaderSettings();

  // Text extraction states
  const [extractedText, setExtractedText] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractError, setExtractError] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  // ⚡ TTS Engine Hook
  const {
    speakingParagraph,
    isPaused,
    speechRate,
    voices,
    selectedVoiceURI,
    playParagraph,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    skipToNextParagraph,
    handleSpeedChange,
    handleVoiceChange,
  } = useTextToSpeech(paragraphs);

  // Refs for DOM scroll syncing
  const readingRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Extract text when book details load
  useEffect(() => {
    if (!book || !book.pdf_url) return;
    const pdfUrl = book.pdf_url;
    let cancelled = false;
    async function extract() {
      setExtracting(true);
      setExtractError('');
      try {
        const { text } = await extractTextFromPDF(pdfUrl, {
          preserveParagraphs: true,
          onProgress: (_msg, pct) => {
            if (!cancelled) setExtractProgress(pct);
          },
        });
        if (!cancelled) {
          setExtractedText(text);
          // Parse into sections by double-newlines
          const parts = text.split(/\n\s*\n/).filter((s: string) => s.trim().length > 20);
          setSections(parts.length > 0 ? parts : [text]);

          // Build flat paragraph list for click-to-play
          const allParas: string[] = [];
          (parts.length > 0 ? parts : [text]).forEach((section: string) => {
            section.split(/\n/).filter((p: string) => p.trim().length > 5).forEach((p: string) => allParas.push(p.trim()));
          });
          setParagraphs(allParas);
        }
      } catch (err: any) {
        if (!cancelled) setExtractError(err.message || 'Failed to extract text');
      } finally {
        if (!cancelled) setExtracting(false);
      }
    }
    extract();
    return () => {
      cancelled = true;
      paragraphRefs.current = [];
      sectionRefs.current = [];
    };
  }, [book]);

  // Scroll progress and active section tracker
  useEffect(() => {
    const el = readingRef.current;
    if (!el) return;
    const handler = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(100, Math.max(0, pct * 100)));

      // Track active section
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const ref = sectionRefs.current[i];
        if (ref && ref.offsetTop - el.scrollTop <= 150) {
          setActiveSection(i);
          break;
        }
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [sections, setScrollProgress, setActiveSection]);

  // Autoplay trigger
  useEffect(() => {
    const autoplay = searchParams.get('autoplay') === 'true';
    if (autoplay && !extracting && paragraphs.length > 0 && !hasAutoplayed) {
      setHasAutoplayed(true);
      setTimeout(() => {
        setSidebarOpen(true);
        playParagraph(0);
      }, 500);
    }
  }, [searchParams, extracting, paragraphs.length, hasAutoplayed, playParagraph, setSidebarOpen]);

  // Auto-scroll to keep the speaking paragraph visible
  useEffect(() => {
    if (speakingParagraph !== null && paragraphRefs.current[speakingParagraph]) {
      paragraphRefs.current[speakingParagraph]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [speakingParagraph]);

  const scrollToSection = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  };

  const scrollToTop = () => {
    readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Theme Constants
  const bg = '#ffffff';
  const bgSidebar = '#f9fafb';
  const textColor = '#111827';
  const textMuted = '#6b7280';
  const accent = '#006838';
  const borderColor = 'rgba(0,0,0,0.1)';

  const { readingBg, readingText } = readingColors;

  // Fallback iframe rendering
  const renderFallback = () => {
    const pdfUrl = book?.pdf_url || undefined;
    const iaId = book?.ia_id || undefined;
    let embedUrl = pdfUrl;
    if (pdfUrl && pdfUrl.includes('drive.google.com')) {
      const m = pdfUrl.match(/\/d\/(.*?)\//);
      if (m) embedUrl = `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    const hasEmbed = !!embedUrl;
    const hasIA = !!(iaId && !pdfUrl);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6" style={{ color: textMuted }}>
        <AlertTriangle size={40} />
        <p className="text-center font-medium max-w-md">{extractError || 'Could not extract text from this book.'}</p>
        {(hasEmbed || hasIA) && (
          <div className="w-full max-w-4xl flex-1 min-h-[70vh] rounded-2xl overflow-hidden border" style={{ borderColor }}>
            <iframe
              src={hasEmbed ? embedUrl : `https://archive.org/embed/${iaId}`}
              className="w-full h-full border-none"
              title="Fallback Reader"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        )}
        {!hasEmbed && !hasIA && (
          <Link href={`/book/${bookId}`} className="px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: accent }}>
            Return to Book Details
          </Link>
        )}
      </div>
    );
  };

  // Pre-compute paragraph markers
  const sectionData = useMemo(() => {
    let offset = 0;
    return sections.map(section => {
      const paras = section.split(/\n/).filter((p: string) => p.trim().length > 5);
      const startIdx = offset;
      offset += paras.length;
      return { paras, startIdx };
    });
  }, [sections]);

  if (bookLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={32} style={{ color: accent }} />
          <p style={{ color: textMuted }} className="text-sm font-medium">Loading book…</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: bg }}>
        <AlertTriangle size={40} style={{ color: '#EF4444' }} />
        <h1 className="text-xl font-bold" style={{ color: textColor }}>Book Not Found</h1>
        <Link href="/" className="text-sm font-bold hover:underline" style={{ color: accent }}>
          ← Return to Library
        </Link>
      </div>
    );
  }

  const tocItems = sections.map((s) => {
    const first = s.trim().substring(0, 50).replace(/\n/g, ' ');
    return first.length >= 50 ? first + '…' : first;
  }).slice(0, 40);

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-500" style={{ background: bg, color: textColor }}>

      {/* ── PROGRESS BAR ── */}
      <ReaderToolbar scrollProgress={scrollProgress} borderColor={borderColor} accent={accent} />

      {/* ── FLOATING TRIGGER BUTTON ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-[9999] p-3 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 border"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderColor, color: accent }}
        title="Open Reader Menu"
      >
        <Menu size={20} />
      </button>

      {/* ── SLIDE-OVER READER MENU ── */}
      <ReaderSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        bookTitle={book.title}
        bookId={book.id.toString()}
        bgSidebar={bgSidebar}
        borderColor={borderColor}
        textColor={textColor}
        textMuted={textMuted}
        accent={accent}
        activeSection={activeSection}
        sectionsLength={sections.length}
        tocItems={tocItems}
        scrollToSection={scrollToSection}
        readingTheme={readingTheme}
        changeTheme={changeTheme}
        fontSize={fontSize}
        changeFontSize={changeFontSize}
        paragraphsLength={paragraphs.length}
        speakingParagraph={speakingParagraph}
        isPaused={isPaused}
        speechRate={speechRate}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        onPlay={() => playParagraph(0)}
        onPause={pauseSpeaking}
        onResume={resumeSpeaking}
        onStop={stopSpeaking}
        onSpeedChange={handleSpeedChange}
        onVoiceChange={handleVoiceChange}
      />

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* ── READING COLUMN ── */}
        <main ref={readingRef} className="flex-1 overflow-y-auto min-h-0 scroll-smooth transition-colors duration-500" style={{ background: readingBg, color: readingText }}>

          {/* Extracting state */}
          {extracting && (
            <div className="flex-1 flex flex-col items-center justify-center py-32 gap-5">
              <div className="relative w-16 h-16">
                <BookOpen size={28} className="absolute inset-0 m-auto animate-pulse" style={{ color: accent }} />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke={borderColor} strokeWidth="3" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={accent} strokeWidth="3"
                    strokeDasharray={`${extractProgress * 1.76} 176`} strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Extracting text…</p>
                <p className="text-xs" style={{ color: textMuted }}>{Math.round(extractProgress)}% complete</p>
              </div>
            </div>
          )}

          {/* Error / Fallback */}
          {!extracting && extractError && renderFallback()}

          {/* Extracted text — Interactive Paragraph Blocks */}
          {!extracting && !extractError && sections.length > 0 && (
            <article className="mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-16" style={{ maxWidth: '72ch' }}>
              {sectionData.map(({ paras: sectionParas, startIdx }, sectionIdx) => (
                <div
                  key={sectionIdx}
                  ref={el => { sectionRefs.current[sectionIdx] = el; }}
                  className="mb-10 scroll-mt-20"
                >
                  {sections.length > 1 && (
                    <div className="flex items-center gap-2 mb-5 select-none">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textMuted }}>
                        Section {sectionIdx + 1}
                      </span>
                      <div className="flex-1 h-px" style={{ background: borderColor }} />
                    </div>
                  )}
                  <div className="space-y-1">
                    {sectionParas.map((para: string, pIdx: number) => {
                      const thisGlobalIdx = startIdx + pIdx;
                      const isSpeaking = speakingParagraph === thisGlobalIdx;
                      return (
                        <ParagraphBlock
                          key={thisGlobalIdx}
                          ref={el => { paragraphRefs.current[thisGlobalIdx] = el; }}
                          text={para}
                          index={thisGlobalIdx}
                          isSpeaking={isSpeaking}
                          onClick={() => {
                            if (isSpeaking) { stopSpeaking(); }
                            else { playParagraph(thisGlobalIdx); }
                          }}
                          readingTheme={readingTheme}
                          fontSize={fontSize}
                          accent={accent}
                          textMuted={textMuted}
                          readingText={readingText}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* End of book */}
              <div className="text-center py-16 space-y-4 border-t mt-12" style={{ borderColor }}>
                <BookOpen size={28} className="mx-auto" style={{ color: textMuted }} />
                <p className="text-sm font-bold" style={{ color: textMuted }}>End of Book</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/book/${bookId}`}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                    style={{ background: readingTheme === 'dark' ? 'rgba(0,104,56,0.15)' : 'rgba(0,104,56,0.08)', color: accent }}
                  >
                    ← Book Details
                  </Link>
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: accent }}
                  >
                    Browse Library
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* No PDF URL at all */}
          {!extracting && !extractError && !book.pdf_url && !book.ia_id && (
            <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
              <BookOpen size={40} style={{ color: textMuted }} />
              <p className="font-medium" style={{ color: textMuted }}>No digital version available</p>
              <Link href={`/book/${bookId}`} className="text-sm font-bold hover:underline" style={{ color: accent }}>
                ← Return to Book Details
              </Link>
            </div>
          )}

          {/* No PDF URL but has IA */}
          {!extracting && !extractError && !book.pdf_url && book.ia_id && (
            <div className="flex-1 flex flex-col p-4 min-h-[80vh]">
              <div className="flex-1 rounded-2xl overflow-hidden border" style={{ borderColor }}>
                <iframe
                  src={`https://archive.org/embed/${book.ia_id}`}
                  className="w-full h-full border-none"
                  title="Internet Archive Reader"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── SCROLL TO TOP FAB ── */}
      {scrollProgress > 15 && (
        <button
          onClick={scrollToTop}
          className="fixed z-30 bottom-6 right-6 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: '#fff', color: accent, border: `1px solid ${borderColor}` }}
          title="Jump to top"
        >
          <ChevronUp size={22} />
        </button>
      )}
    </div>
  );
}