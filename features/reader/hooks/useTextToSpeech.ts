import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Splits text into sentence/clause-sized chunks to ensure smooth Web Speech API playback
 * without hitting limits on different browser engines.
 */
function chunkText(text: string, maxLen = 150): string[] {
  const chunks: string[] = [];
  const regex = /[^,.!?]+[,.!?]+(?:\s+|$)|[^,.!?]+$/g;
  const matches = text.match(regex);
  
  if (!matches) {
    let str = text.trim();
    while (str.length > maxLen) {
      let spaceIdx = str.lastIndexOf(' ', maxLen);
      if (spaceIdx === -1) spaceIdx = maxLen;
      chunks.push(str.substring(0, spaceIdx).trim());
      str = str.substring(spaceIdx).trim();
    }
    if (str) chunks.push(str);
    return chunks;
  }

  matches.forEach(match => {
    let str = match.trim();
    while (str.length > maxLen) {
      let spaceIdx = str.lastIndexOf(' ', maxLen);
      if (spaceIdx === -1) spaceIdx = maxLen;
      chunks.push(str.substring(0, spaceIdx).trim());
      str = str.substring(spaceIdx).trim();
    }
    if (str) chunks.push(str);
  });

  return chunks;
}

/**
 * Encapsulates the complete SpeechSynthesis logic, voice selectors, and automatic sentence
 * parsing for clean, uninterrupted reading of text documents.
 */
export function useTextToSpeech(paragraphs: string[]) {
  const [speakingParagraph, setSpeakingParagraph] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRateRef = useRef(1);
  const selectedVoiceURIRef = useRef<string>('');
  const sentenceQueueRef = useRef<string[]>([]);
  const currentSentenceIdxRef = useRef<number>(0);

  // Keep references updated for async callbacks
  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);
  useEffect(() => { selectedVoiceURIRef.current = selectedVoiceURI; }, [selectedVoiceURI]);

  // Load and sort browser voices on load
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const allowedNames = ['David', 'Mark', 'UK English Female', 'UK English Male', 'English United Kingdom'];
      const filteredVoices = allVoices.filter(v =>
        allowedNames.some(allowed => v.name.includes(allowed))
      );

      const gbVoices = allVoices.filter(v => v.lang === 'en-GB' || v.lang.includes('en-GB'));
      const enVoices = filteredVoices.length > 0 
        ? filteredVoices 
        : (gbVoices.length > 0 ? gbVoices : allVoices.filter(v => v.lang.startsWith('en')));

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
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    sentenceQueueRef.current = [];
    setSpeakingParagraph(null);
    setIsPaused(false);
  }, []);

  const playParagraph = useCallback((paraIndex: number, sentenceIdx = 0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (sentenceIdx === 0) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsPaused(false);
    }

    const text = paragraphs[paraIndex]?.trim();
    if (!text) return;

    if (sentenceIdx === 0) {
      sentenceQueueRef.current = chunkText(text, 150).filter(Boolean);
      currentSentenceIdxRef.current = 0;
    }

    const sentences = sentenceQueueRef.current;

    if (sentenceIdx >= sentences.length) {
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
    if (speakingParagraph !== null && !isPaused) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        playParagraph(speakingParagraph, currentSentenceIdxRef.current);
      }, 100);
    }
  }, [speakingParagraph, isPaused, playParagraph]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return {
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
  };
}
