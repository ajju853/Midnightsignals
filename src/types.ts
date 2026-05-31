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

export type VibeType = "dreamy" | "melancholy" | "hopeful" | "neon";

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
