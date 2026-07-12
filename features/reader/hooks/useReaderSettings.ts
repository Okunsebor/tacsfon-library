import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReadingTheme } from '@/lib/types';

const FONT_SIZES = [14, 16, 18, 20, 22];

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

/**
 * Custom hook managing local state and keyboard bindings for the e-reader layout shell.
 */
export function useReaderSettings() {
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [fontSize, setFontSize] = useState(18);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // Sync settings with browser storage on mount
  useEffect(() => {
    setReadingTheme(getStoredTheme());
    setFontSize(getStoredFontSize());
  }, []);

  const changeTheme = useCallback((theme: ReadingTheme) => {
    setReadingTheme(theme);
    localStorage.setItem('reader-theme', theme);
  }, []);

  const changeFontSize = useCallback((dir: 1 | -1) => {
    setFontSize(prev => {
      const idx = FONT_SIZES.indexOf(prev);
      const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, idx + dir))];
      localStorage.setItem('reader-font-size', String(next));
      return next;
    });
  }, []);

  // Set keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === '=' || e.key === '+') changeFontSize(1);
      if (e.key === '-') changeFontSize(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [changeFontSize]);

  // Memoized background colors matching active theme
  const readingColors = useMemo(() => {
    switch (readingTheme) {
      case 'dark':  return { readingBg: '#0f172a', readingText: '#e5e7eb' };
      case 'sepia': return { readingBg: '#fffbeb', readingText: '#78350f' };
      case 'light':
      default:      return { readingBg: '#ffffff', readingText: '#000000' };
    }
  }, [readingTheme]);

  return {
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
  };
}
