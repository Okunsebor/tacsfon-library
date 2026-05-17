import { create } from 'zustand';

interface AudioState {
  /** The full text currently loaded into the player */
  currentAudioText: string;
  /** The display title shown on the player bar (e.g. book title) */
  currentAudioTitle: string;
  /** Whether the player is actively speaking */
  isPlaying: boolean;
  /** Whether the player is paused mid-utterance */
  isPaused: boolean;

  // --- Actions ---
  /** Load a new text into the player and start playing immediately */
  loadAndPlay: (text: string, title?: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentAudioText: '',
  currentAudioTitle: '',
  isPlaying: false,
  isPaused: false,

  loadAndPlay: (text, title = 'Document') =>
    set({
      currentAudioText: text,
      currentAudioTitle: title,
      isPlaying: true,
      isPaused: false,
    }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setIsPaused: (paused) =>
    set({ isPaused: paused, isPlaying: !paused }),

  stop: () =>
    set({
      isPlaying: false,
      isPaused: false,
      // Intentionally keep currentAudioText so the user can replay
    }),
}));
