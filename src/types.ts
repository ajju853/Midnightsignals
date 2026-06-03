export interface LyricLine {
  id: number;
  text: string;
  time: number; // Start time in seconds
  duration: number; // Approximate duration in seconds
  section: string; // e.g., 'Intro', 'Verse 1', 'Chorus'
}

export interface FloatingSignal {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  color: string;
  vibe: string;
  createdAt: number;
}

export type VibeType = "dreamy" | "melancholy" | "hopeful" | "neon" | "ambient" | "chillhop" | "jazzy" | "ethereal" | "dark" | "rainy" | "cozy";

export interface SynthSettings {
  isPlaying: boolean;
  volume: number;        // 0 to 1
  tempo: number;         // Beats per minute
  vibe: VibeType;
  rainVolume: number;    // White noise / crackling volume
  melodyStyle: "plucky" | "glowing" | "none";
}

export interface EchoItem {
  id: string;
  userMessage: string;
  reply: string;
  verse: string;
  vibe: VibeType;
  timestamp: string;
}

// Mix creation schema — saved to localStorage, shareable via URL
export interface MixLyrics {
  title: string;
  verse1: string;
  chorus: string;
  verse2: string;
  bridge: string;
  outro: string;
}

export interface MixData {
  id: string;
  name: string;
  lyrics: MixLyrics;
  voice: { type: string; speed: number; pitch: number };
  birds: { selected: string[]; volumes: number[]; timing: string };
  soundscape: {
    rain: number;
    ocean: number;
    wind: number;
    brook: number;
    lofi: { style: string; bpm: number };
    binaural: string;
  };
  createdAt: number;
}
