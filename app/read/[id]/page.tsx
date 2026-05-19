'use client';
import { supabase } from '@/lib/supabaseClient';
import { extractTextFromPDF } from '@/lib/pdfUtils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Loader2, Sun, Moon, Plus, Minus,
  Menu, X, Headphones, ChevronUp, Library, AlertTriangle,
  Volume2, Play, Pause, Square, Gauge, SkipForward
} from 'lucide-react';

const SPEED_OPTIONS = [
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
];

type ReadingTheme = 'light' | 'dark' | 'sepia';

function getStoredTheme(): ReadingTheme {
  if (typeof window === 'undefined') return 'light';
  const val = localStorage.getItem('reader-theme');
  if (val === 'light' || val === 'dark' || val === 'sepia') return val;
  return 'light';
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
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [fontSize, setFontSize] = useState(18);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // Paragraph-level audio (integrated)
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [speakingParagraph, setSpeakingParagraph] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRateRef = useRef(1);
  const sentenceQueueRef = useRef<string[]>([]);
  const currentSentenceIdxRef = useRef<number>(0);

  // Voice Selection
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const selectedVoiceURIRef = useRef<string>('');

  // Refs
  const readingRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Init theme/font from localStorage
  useEffect(() => {
    setReadingTheme(getStoredTheme());
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
            // Because pdfUtils already fused broken sentences, single \n means a real line break or paragraph we want to preserve.
            // Split by \n to get paragraph blocks.
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

  // Load and sort voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const allowedNames = ['UK English Female', 'UK English Male', 'US English', 'David', 'Mark'];
      const filteredVoices = allVoices.filter(v =>
        allowedNames.some(allowed => v.name.includes(allowed))
      );

      // fallback to English if no allowed voices found
      const enVoices = filteredVoices.length > 0 
        ? filteredVoices 
        : allVoices.filter(v => v.lang.startsWith('en'));

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

  // Theme change
  const changeTheme = useCallback((theme: ReadingTheme) => {
    setReadingTheme(theme);
    localStorage.setItem('reader-theme', theme);
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
      if (e.key === '=' || e.key === '+') changeFontSize(1);
      if (e.key === '-') changeFontSize(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [changeFontSize]);

  // Scroll to section
  const scrollToSection = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  };

  // Scroll to top
  const scrollToTop = () => {
    readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keep ref in sync with state so callbacks use latest value
  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);

  // ── INTEGRATED AUDIO ENGINE ──
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    sentenceQueueRef.current = [];
    setSpeakingParagraph(null);
    setIsPaused(false);
  }, []);

  const playParagraph = useCallback((paraIndex: number, sentenceIdx: number = 0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (sentenceIdx === 0) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsPaused(false);
    }

    const text = paragraphs[paraIndex]?.trim();
    if (!text) return;

    if (sentenceIdx === 0) {
      // Regex sentence boundary detection: chunks by punctuation (.!?) followed by space or end of string.
      const chunks = text.match(/[^\.!\?]+[\.!\?]+(?:\s+|$)|[^\.!\?]+$/g) || [text];
      sentenceQueueRef.current = chunks.map(s => s.trim()).filter(Boolean);
      currentSentenceIdxRef.current = 0;
    }

    const sentences = sentenceQueueRef.current;

    if (sentenceIdx >= sentences.length) {
      // Auto-advance to next paragraph
      const next = paraIndex + 1;
      if (next < paragraphs.length) {
        setTimeout(() => playParagraph(next, 0), 80);
      } else {
        setSpeakingParagraph(null);
        utteranceRef.current = null;
        sentenceQueueRef.current = [];
      }
      return;
    }

    const utteranceText = sentences[sentenceIdx];
    if (!utteranceText) {
      playParagraph(paraIndex, sentenceIdx + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = speechRateRef.current;
    utterance.lang = 'en-US';

    if (selectedVoiceURIRef.current) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURIRef.current);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setSpeakingParagraph(paraIndex);
      currentSentenceIdxRef.current = sentenceIdx;
      setIsPaused(false);
    };

    utterance.onend = () => {
      playParagraph(paraIndex, sentenceIdx + 1);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted') return;
      setSpeakingParagraph(null);
      utteranceRef.current = null;
      sentenceQueueRef.current = [];
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [paragraphs]);

  const pauseSpeaking = useCallback(() => {
    if (speakingParagraph === null) return;
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, [speakingParagraph]);

  const resumeSpeaking = useCallback(() => {
    if (!isPaused) return;
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, [isPaused]);

  const skipToNextParagraph = useCallback(() => {
    if (speakingParagraph === null) return;
    const next = speakingParagraph + 1;
    if (next < paragraphs.length) playParagraph(next, 0);
    else stopSpeaking();
  }, [speakingParagraph, paragraphs, playParagraph, stopSpeaking]);

  const handleSpeedChange = useCallback((newRate: number) => {
    setSpeechRate(newRate);
    // If currently playing, restart current paragraph from the CURRENT SENTENCE with new speed
    if (speakingParagraph !== null && !isPaused) {
      speechRateRef.current = newRate;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        playParagraph(speakingParagraph, currentSentenceIdxRef.current);
      }, 100);
    }
  }, [speakingParagraph, isPaused, playParagraph]);

  const handleVoiceChange = useCallback((newVoiceURI: string) => {
    setSelectedVoiceURI(newVoiceURI);
    selectedVoiceURIRef.current = newVoiceURI;
    // If currently playing, restart current paragraph from the CURRENT SENTENCE with new voice
    if (speakingParagraph !== null && !isPaused) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        playParagraph(speakingParagraph, currentSentenceIdxRef.current);
      }, 100);
    }
  }, [speakingParagraph, isPaused, playParagraph]);

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

  // Global Light Theme Colors for the Shell
  const bg = '#ffffff';
  const bgSidebar = '#f9fafb';
  const textColor = '#111827';
  const textMuted = '#6b7280';
  const accent = '#006838';
  const borderColor = 'rgba(0,0,0,0.1)';

  // Localized Reading Container Colors
  const getReadingColors = () => {
    switch (readingTheme) {
      case 'dark': return { readingBg: '#0f172a', readingText: '#e5e7eb' };
      case 'sepia': return { readingBg: '#fffbeb', readingText: '#78350f' };
      case 'light':
      default: return { readingBg: '#ffffff', readingText: '#000000' };
    }
  };
  const { readingBg, readingText } = getReadingColors();

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
      <div
        className={`fixed inset-y-0 left-0 z-[10000] w-full sm:w-[340px] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: bgSidebar, borderRight: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor }}>
          <h2 className="font-bold text-sm truncate pr-4" style={{ color: textColor }}>{book.title}</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: textMuted }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Audio Controls */}
          <div className="p-4 border-b space-y-4" style={{ borderColor }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: textMuted }}>Audio Player</p>
            <div className="flex flex-col gap-3">
              {paragraphs.length > 0 ? (
                <>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        if (speakingParagraph === null) playParagraph(0);
                        else if (isPaused) resumeSpeaking();
                        else pauseSpeaking();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:opacity-90 active:scale-95"
                      style={{ background: accent, color: '#fff' }}
                    >
                      {speakingParagraph !== null && !isPaused ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                      {speakingParagraph !== null ? (isPaused ? 'Resume' : 'Pause') : 'Play Audio'}
                    </button>
                    {speakingParagraph !== null && (
                      <button
                        onClick={stopSpeaking}
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
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
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
                        onChange={(e) => handleVoiceChange(e.target.value)}
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
                </>
              ) : (
                <p className="text-xs text-center italic" style={{ color: textMuted }}>Audio unavailable</p>
              )}
            </div>
          </div>

          {/* Theme & Font */}
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

          {/* TOC */}
          {sections.length > 1 && (
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: textMuted }}>
                Contents · {sections.length} sections
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

        <div className="p-4 shrink-0 border-t space-y-2 bg-white/50" style={{ borderColor }}>
            <Link
              href={`/book/${id}`}
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


              {/* End of book */}
              <div className="text-center py-16 space-y-4 border-t mt-12" style={{ borderColor }}>
                <BookOpen size={28} className="mx-auto" style={{ color: textMuted }} />
                <p className="text-sm font-bold" style={{ color: textMuted }}>End of Book</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/book/${id}`}
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