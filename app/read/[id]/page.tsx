'use client';
import { supabase } from '@/lib/supabaseClient';
import { extractTextFromPDF } from '@/lib/pdfUtils';
import AudioReader from '@/app/components/AudioReader';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Loader2, Sun, Moon, Plus, Minus,
  Menu, X, Headphones, ChevronUp, Library, AlertTriangle, Volume2
} from 'lucide-react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('reader-theme') as Theme) || 'light';
}
function getStoredFontSize(): number {
  if (typeof window === 'undefined') return 18;
  return parseInt(localStorage.getItem('reader-font-size') || '18', 10);
}

const FONT_SIZES = [14, 16, 18, 20, 22];

export default function BookReader() {
  const { id } = useParams();
  const router = useRouter();

  // Book data
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Text extraction
  const [extractedText, setExtractedText] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractError, setExtractError] = useState('');

  // Reader settings
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState(18);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAudio, setShowAudio] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Paragraph-level audio
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [speakingParagraph, setSpeakingParagraph] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Refs
  const readingRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Init theme/font from localStorage
  useEffect(() => {
    setTheme(getStoredTheme());
    setFontSize(getStoredFontSize());
  }, []);

  // Fetch book
  useEffect(() => {
    async function fetchBook() {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();
      setBook(data);
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  // Extract text when book loads
  useEffect(() => {
    if (!book?.pdf_url) return;
    let cancelled = false;
    async function extract() {
      setExtracting(true);
      setExtractError('');
      try {
        const { text } = await extractTextFromPDF(book.pdf_url, {
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
    return () => { cancelled = true; };
  }, [book]);

  // Scroll progress
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
  }, [sections]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('reader-theme', next);
      return next;
    });
  }, []);

  // Font size
  const changeFontSize = useCallback((dir: 1 | -1) => {
    setFontSize(prev => {
      const idx = FONT_SIZES.indexOf(prev);
      const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, idx + dir))];
      localStorage.setItem('reader-font-size', String(next));
      return next;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 't' || e.key === 'T') toggleTheme();
      if (e.key === '=' || e.key === '+') changeFontSize(1);
      if (e.key === '-') changeFontSize(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleTheme, changeFontSize]);

  // Scroll to section
  const scrollToSection = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  };

  // Scroll to top
  const scrollToTop = () => {
    readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── PARAGRAPH CLICK-TO-PLAY ──
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setSpeakingParagraph(null);
  }, []);

  const playParagraph = useCallback((paraIndex: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any current playback
    window.speechSynthesis.cancel();
    utteranceRef.current = null;

    const text = paragraphs[paraIndex]?.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => setSpeakingParagraph(paraIndex);
    utterance.onend = () => {
      // Auto-advance to next paragraph
      const next = paraIndex + 1;
      if (next < paragraphs.length) {
        playParagraph(next);
      } else {
        setSpeakingParagraph(null);
        utteranceRef.current = null;
      }
    };
    utterance.onerror = (e) => {
      if (e.error === 'interrupted') return;
      setSpeakingParagraph(null);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [paragraphs]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // Auto-scroll to keep the speaking paragraph visible
  useEffect(() => {
    if (speakingParagraph !== null && paragraphRefs.current[speakingParagraph]) {
      paragraphRefs.current[speakingParagraph]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [speakingParagraph]);

  // Theme colors
  const isDark = theme === 'dark';
  const bg = isDark ? '#0F172A' : '#FAF9F6';
  const bgSidebar = isDark ? '#0B1120' : '#F3F2EE';
  const textColor = isDark ? '#D1D5DB' : '#2D2D2D';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const accent = '#006838';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={32} style={{ color: accent }} />
          <p style={{ color: textMuted }} className="text-sm font-medium">Loading book…</p>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ──
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

  const coverImage = book.cover_url || `https://placehold.co/400x600?text=${encodeURIComponent(book.title?.substring(0, 10))}`;
  const sectionLabels = sections.map((s, i) => {
    const first = s.trim().substring(0, 50).replace(/\n/g, ' ');
    return first.length >= 50 ? first + '…' : first;
  });

  // ── IFRAME FALLBACK ──
  const renderFallback = () => {
    const pdfUrl = book.pdf_url;
    const iaId = book.ia_id;
    let embedUrl = pdfUrl;
    if (pdfUrl?.includes('drive.google.com')) {
      const m = pdfUrl.match(/\/d\/(.*?)\//);
      if (m) embedUrl = `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    const hasEmbed = !!embedUrl;
    const hasIA = iaId && !pdfUrl;

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
          <Link href={`/book/${id}`} className="px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: accent }}>
            Return to Book Details
          </Link>
        )}
      </div>
    );
  };

  // Generate section labels for TOC
  const tocItems = sectionLabels.slice(0, 40); // cap at 40 items for performance

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-500" style={{ background: bg, color: textColor }}>

      {/* ── PROGRESS BAR ── */}
      <div className="h-[3px] w-full shrink-0 relative" style={{ background: borderColor }}>
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%`, background: `linear-gradient(90deg, ${accent}, #00FF88)` }}
        />
      </div>

      {/* ── TOP BAR ── */}
      <header
        className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b transition-colors duration-500"
        style={{ borderColor, background: isDark ? 'rgba(11,17,32,0.95)' : 'rgba(243,242,238,0.95)', backdropFilter: 'blur(12px)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:opacity-70 transition-opacity"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            href={`/book/${id}`}
            className="flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity"
            style={{ color: accent }}
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Book Details</span>
          </Link>
          <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: isDark ? 'rgba(0,104,56,0.2)' : 'rgba(0,104,56,0.08)', color: accent }}>
            {Math.round(scrollProgress)}% read
          </span>
        </div>

        {/* Center — Title */}
        <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md text-center" style={{ color: textColor }}>
          {book.title}
        </h1>

        {/* Right — Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => changeFontSize(-1)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" title="Decrease font"><Minus size={16} /></button>
          <span className="text-xs font-bold w-8 text-center" style={{ color: textMuted }}>{fontSize}</span>
          <button onClick={() => changeFontSize(1)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" title="Increase font"><Plus size={16} /></button>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:opacity-70 transition-opacity" title="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 relative">

        {/* ── SIDEBAR (desktop: static, mobile: overlay) ── */}
        <aside
          className={`
            absolute lg:relative z-30 top-0 left-0 h-full w-[280px] shrink-0 border-r transition-all duration-300 overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ borderColor, background: bgSidebar }}
        >
          {/* Book Info */}
          <div className="p-5 border-b" style={{ borderColor }}>
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-lg">
              <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <h2 className="font-bold text-base leading-tight mb-1">{book.title}</h2>
            <p className="text-sm" style={{ color: textMuted }}>{book.author}</p>
            {book.category && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: isDark ? 'rgba(0,104,56,0.15)' : 'rgba(0,104,56,0.08)', color: accent }}>
                {book.category}
              </span>
            )}
          </div>

          {/* Table of Contents */}
          {sections.length > 1 && (
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: textMuted }}>
                Contents · {sections.length} sections
              </p>
              <nav className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
                {tocItems.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(i)}
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all font-medium leading-snug truncate ${
                      activeSection === i
                        ? 'font-bold'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      color: activeSection === i ? accent : textMuted,
                      background: activeSection === i ? (isDark ? 'rgba(0,104,56,0.12)' : 'rgba(0,104,56,0.06)') : 'transparent',
                    }}
                  >
                    <span className="opacity-40 mr-1.5">§{i + 1}</span>
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Sidebar Actions */}
          <div className="p-4 mt-auto border-t space-y-2" style={{ borderColor }}>
            {extractedText && (
              <button
                onClick={() => { setShowAudio(!showAudio); setSidebarOpen(false); }}
                className="w-full flex items-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl transition-all hover:opacity-80"
                style={{ background: isDark ? 'rgba(247,148,29,0.12)' : 'rgba(247,148,29,0.08)', color: '#F7941D' }}
              >
                <Headphones size={16} />
                {showAudio ? 'Hide Audio Reader' : 'Listen to Book'}
              </button>
            )}
            <Link
              href="/"
              className="w-full flex items-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl transition-all hover:opacity-80"
              style={{ background: isDark ? 'rgba(0,104,56,0.12)' : 'rgba(0,104,56,0.06)', color: accent }}
            >
              <Library size={16} /> Back to Library
            </Link>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── READING COLUMN ── */}
        <main ref={readingRef} className="flex-1 overflow-y-auto min-h-0 scroll-smooth">

          {/* Audio Reader (collapsible) */}
          {showAudio && extractedText && (
            <div className="sticky top-0 z-10 p-3 border-b" style={{ borderColor, background: bgSidebar }}>
              <AudioReader documentText={extractedText} />
            </div>
          )}

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
              {(() => {
                let globalParaIdx = 0;
                return sections.map((section, sectionIdx) => {
                  const sectionParas = section.split(/\n/).filter((p: string) => p.trim().length > 5);
                  const rendered = (
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
                        {sectionParas.map((para, pIdx) => {
                          const thisGlobalIdx = globalParaIdx++;
                          const isSpeaking = speakingParagraph === thisGlobalIdx;
                          return (
                            <div
                              key={thisGlobalIdx}
                              ref={el => { paragraphRefs.current[thisGlobalIdx] = el; }}
                              onClick={() => {
                                if (isSpeaking) { stopSpeaking(); }
                                else { playParagraph(thisGlobalIdx); }
                              }}
                              className={`group relative py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border-l-[3px] ${
                                isSpeaking
                                  ? 'border-l-green-500'
                                  : 'border-l-transparent hover:border-l-gray-300'
                              }`}
                              style={{
                                background: isSpeaking
                                  ? (isDark ? 'rgba(0,104,56,0.1)' : 'rgba(0,104,56,0.04)')
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
                              }`} style={{ color: isSpeaking ? (isDark ? '#E5E7EB' : '#111827') : textColor }}>
                                {para.trim()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                  return rendered;
                });
              })()}

              {/* Playback stop bar */}
              {speakingParagraph !== null && (
                <div className="sticky bottom-4 z-10 flex items-center justify-center mt-6">
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                    style={{ background: isDark ? '#1E293B' : '#fff', color: accent, border: `1px solid ${borderColor}` }}
                  >
                    <Volume2 size={16} className="animate-pulse" /> Speaking §{speakingParagraph + 1} · Click to Stop
                  </button>
                </div>
              )}

              {/* End of book */}
              <div className="text-center py-16 space-y-4 border-t mt-12" style={{ borderColor }}>
                <BookOpen size={28} className="mx-auto" style={{ color: textMuted }} />
                <p className="text-sm font-bold" style={{ color: textMuted }}>End of Book</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/book/${id}`}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                    style={{ background: isDark ? 'rgba(0,104,56,0.15)' : 'rgba(0,104,56,0.08)', color: accent }}
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
              <Link href={`/book/${id}`} className="text-sm font-bold hover:underline" style={{ color: accent }}>
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
      {scrollProgress > 20 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: accent, color: '#fff' }}
          title="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}