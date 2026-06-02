/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Sliders,
  Volume2,
  Sparkles,
  Send,
  RefreshCw,
  Layers,
  Radio,
  Globe,
  Clock,
  History,
  CloudRain,
  ChevronRight,
  Maximize2,
  Music,
  Trash2,
  Search,
  Bird
} from "lucide-react";

import { FloatingSignal, VibeType, EchoItem, LyricLine } from "./types";
import { lyrData, totalDuration } from "./lyricsData";
import { MidnightSynth } from "./lib/synthEngine";
import SignalCanvas from "./components/SignalCanvas";
import NatureSoundboard from "./components/NatureSoundboard";
import { calmLofiPresets, LofiPreset } from "./calmLyricsPresets";
import { SEO_PAGES, SEOPageData } from "./seoData";
import { BookOpen, MapPin, ExternalLink, Flame, Compass, Heart, Share2, Clipboard, Plus } from "lucide-react";

// SaaS Premium, Contact, Compliance and Exporter systems
import {
  CookieConsent,
  ContactHub,
  AccountsSimulator,
  ClientAccount,
  PremiumUpgrade,
  AdditionalPolicies,
  FounderCard,
  SignalExporter,
  SignalGallery,
  DonationSection
} from "./components/SaaSProducts";

// Aesthetic colors configuration matching Sophisticated Dark vibes
const VIBE_THEMES = {
  dreamy: {
    accent: "#a855f7",       // violet-500
    glowColor: "rgba(168, 85, 247, 0.4)",
    radialBg: "radial-gradient(circle at 80% 20%, #1c0e35 0%, transparent 50%), radial-gradient(circle at 10% 80%, #061e38 0%, transparent 50%)",
    activeLabel: "104.2 MHz [Ethereal Range]",
    statIntegrity: "94%"
  },
  melancholy: {
    accent: "#3b82f6",       // blue-500
    glowColor: "rgba(59, 130, 246, 0.4)",
    radialBg: "radial-gradient(circle at 80% 20%, #0c2040 0%, transparent 50%), radial-gradient(circle at 10% 80%, #0a1120 0%, transparent 50%)",
    activeLabel: "88.5 MHz [Low Haze]",
    statIntegrity: "89%"
  },
  hopeful: {
    accent: "#10b981",       // emerald-500
    glowColor: "rgba(16, 185, 129, 0.4)",
    radialBg: "radial-gradient(circle at 80% 20%, #062f22 0%, transparent 50%), radial-gradient(circle at 10% 80%, #0f172a 0%, transparent 50%)",
    activeLabel: "101.4 MHz [Dawn Star]",
    statIntegrity: "97%"
  },
  neon: {
    accent: "#f43f5e",       // rose-500
    glowColor: "rgba(244, 63, 94, 0.4)",
    radialBg: "radial-gradient(circle at 80% 20%, #3a0a1a 0%, transparent 50%), radial-gradient(circle at 10% 80%, #080f26 0%, transparent 50%)",
    activeLabel: "106.9 MHz [Cyber Pulse]",
    statIntegrity: "99%"
  }
};

// Helper to convert hexadecimal to RGBA formatted color
const hexToRgba = (hex: string, alpha = 0.4) => {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return `rgba(168, 85, 247, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function App() {
  // Synth Engine Instance saved to Ref
  const synthRef = useRef<MidnightSynth | null>(null);

  // User custom theme color overrides state
  const [themeCustomizations, setThemeCustomizations] = useState(VIBE_THEMES);

  // Search input query for Echo history logs filtering
  const [echoSearchQuery, setEchoSearchQuery] = useState("");

  // Sound and Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.6);
  const [rainVolume, setRainVolume] = useState(0.0);
  const [currentVibe, setCurrentVibe] = useState<VibeType>("dreamy");

  // Advanced Lofi Multi-Track Overlay Mixer States
  const [oceanVolume, setOceanVolume] = useState(0.0);
  const [vinylVolume, setVinylVolume] = useState(0.0);

  // Binaural Cognitive Focus Wave Generator States
  const [isBinauralActive, setIsBinauralActive] = useState(false);
  const [binauralVolume, setBinauralVolume] = useState(0.15);
  const [binauralOffset, setBinauralOffset] = useState(6); // 6Hz = Theta Wave (Deep focus/Relax)

  // Interactive Synth Pace States (Tempo/BPM & Waveform Shapes)
  const [activeBpm, setActiveBpm] = useState(70);
  const [synthWaveform, setSynthWaveform] = useState<OscillatorType>("triangle");

  // Sleep Timer Controller States
  const [sleepMinutes, setSleepMinutes] = useState<number>(0); // 0 implies OFF/Disabled
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number>(0);

  // Track state syncing
  const [activeLyrics, setActiveLyrics] = useState<LyricLine[]>(lyrData);
  const [activeSongTitle, setActiveSongTitle] = useState("Midnight Signals");
  const [activeArtistName, setActiveArtistName] = useState("The Urban Echo");
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Creative Panel Tab Selection on central view card
  const [activeCenterTab, setActiveCenterTab] = useState<"karaoke" | "presets" | "submit" | "nature">("nature");

  // Quick Preset Selection
  const [activeQuickPreset, setActiveQuickPreset] = useState<"focus" | "sleep" | "flow" | null>(null);

  // Client-side SEO Programmatic Router State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      return p === "/" ? "" : p;
    }
    return "";
  });

  // Track popstate changes (back/forward history clicks) and dynamic SEO metadata updates
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p === "/" ? "" : p);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update dynamic titles, metas, and structured FAQs dynamically on currentPath change
  useEffect(() => {
    if (typeof document !== "undefined") {
      const activePage = SEO_PAGES.find((p) => p.path === currentPath);
      if (activePage) {
        document.title = activePage.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute("content", activePage.metaDescription);
        }
      } else {
        document.title = "Midnight Signals | AI Ambient Radio, Lofi Sleep Sound Mixer & Nature Sound Generator";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute("content", "Create custom lofi radio stations with ocean waves, bird songs, rain ambience, AI lyrics and sleep-friendly soundscapes. Free online ambient sound generator.");
        }
      }

      // Manage/Update canonical link tag dynamically to resolve search index readiness
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      const baseUrl = "https://midnight-signals.cloud";
      canonicalLink.setAttribute("href", `${baseUrl}${currentPath || ""}`);
    }
  }, [currentPath]);

  // Legal administrative tabs modal: "about" | "privacy" | "terms" | "monetize" | "contact" | "compliance" | "founder" | "pro" | null
  const [activeLegalTab, setActiveLegalTab] = useState<string | null>(null);
  
  // Custom states for SaaS products integrations
  const [activeAccount, setActiveAccount] = useState<ClientAccount | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState<string>("cookie-policy");

  // Inputs for Custom Song Writer Studio
  const [customLyricsText, setCustomLyricsText] = useState("");
  const [customTitleInput, setCustomTitleInput] = useState("");
  const [customArtistInput, setCustomArtistInput] = useState("");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);

  // Dynamic sound reactive visualizer mockup bands (7 bands)
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([40, 70, 100, 60, 85, 30, 50]);
  const [pulseEvent, setPulseEvent] = useState<{ freq: number; type: string; id: number } | null>(null);

  // Sensory Breathing Guide State Block
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState<"box" | "478" | "deep">("box");
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Pause">("Inhale");
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [breathingScale, setBreathingScale] = useState(1.0);

  // Mobile-friendly Tuner expand/collapse state
  const [showTuner, setShowTuner] = useState(false);
  const [showSoundConsole, setShowSoundConsole] = useState(false);
  const [showEchoTerminal, setShowEchoTerminal] = useState(false);

  // Floating user coordinates signals
  const [floatingSignals, setFloatingSignals] = useState<FloatingSignal[]>([
    {
      id: "preset-1",
      text: "Searching through the static for your frequency...",
      x: 350,
      y: 120,
      vx: 0.12,
      vy: -0.08,
      scale: 1.1,
      opacity: 0.8,
      color: "rgb(168, 85, 247)",
      vibe: "dreamy",
      createdAt: Date.now() - 600000
    },
    {
      id: "preset-2",
      text: "I hope you are looking at the same stars tonight",
      x: 720,
      y: 180,
      vx: -0.09,
      vy: 0.14,
      scale: 1.3,
      opacity: 0.9,
      color: "rgb(59, 130, 246)",
      vibe: "melancholy",
      createdAt: Date.now() - 400000
    },
    {
      id: "preset-3",
      text: "One day, our orbits will cross again",
      x: 180,
      y: 220,
      vx: 0.15,
      vy: 0.09,
      scale: 1.0,
      opacity: 0.75,
      color: "rgb(16, 185, 129)",
      vibe: "hopeful",
      createdAt: Date.now() - 250000
    },
    {
      id: "preset-4",
      text: "Running through these neon streets alone...",
      x: 520,
      y: 90,
      vx: -0.18,
      vy: -0.11,
      scale: 1.2,
      opacity: 0.85,
      color: "rgb(244, 63, 94)",
      vibe: "neon",
      createdAt: Date.now() - 100000
    }
  ]);

  // AI Unsent message and responses state list
  const [unsentMessageInput, setUnsentMessageInput] = useState("");
  const [isSendingEcho, setIsSendingEcho] = useState(false);
  const [echoHistory, setEchoHistory] = useState<EchoItem[]>([
    {
      id: "sample-echo-1",
      userMessage: "I left our old coffee mug on the dashboard.",
      reply: "Another traveler reports seeing a dim light flicker on the highway edge. Maybe some memories hold their warmth in the cold rain.",
      verse: "The coffee's cold, the radio plays low,\nTracing the paths we used to go,\nYour signal echoes in the heavy night,\nA single spark that refuses the light.",
      vibe: "melancholy",
      timestamp: "10:14 PM"
    }
  ]);

  const [activeEchoTab, setActiveEchoTab] = useState<"compose" | "history">("compose");

  // Indian Vocalist TTS Guide States
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [isVocalGuideActive, setIsVocalGuideActive] = useState<boolean>(false);
  const lastSpokenLineIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        const indianList = allVoices.filter(v => 
          v.lang.toLowerCase().includes("-in") || 
          v.name.toLowerCase().includes("india") || 
          v.lang.toLowerCase().startsWith("hi")
        );
        setVoices(indianList);
        
        if (indianList.length > 0) {
          const enINVoice = indianList.find(v => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("english"));
          const chosen = enINVoice || indianList[0];
          setSelectedVoiceName(chosen.name);
        } else {
          const fallback = allVoices.find(v => v.lang.toLowerCase().startsWith("en")) || allVoices[0];
          if (fallback) {
            setSelectedVoiceName(fallback.name);
          }
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!text) return;
    const cleanText = text.replace(/[\&\"\#\$\%\*\+\-\/\\:<=>@\[\]\^\_\`\{\|\}\~]/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const allVoices = window.speechSynthesis.getVoices();
    const selectedVoice = allVoices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.pitch = 1.0;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Dynamic Ambient Visuals Layer settings
  const [visualMode, setVisualMode] = useState<"off" | "static" | "animated">("animated");
  
  // Backdoor/Manual triggers so users can toggle Campfire and Train independently too!
  const [manualCampfire, setManualCampfire] = useState(false);
  const [manualTrain, setManualTrain] = useState(false);

  const [natureSoundboardState, setNatureSoundboardState] = useState({
    activeChannels: {
      birds: true,
      owl: false,
      trees: true,
      ocean: false,
      crickets: true,
    },
    isPlaying: false
  });

  useEffect(() => {
    const handleState = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail) {
        setNatureSoundboardState(customEvent.detail);
      }
    };
    window.addEventListener("nature-soundboard-state", handleState);
    return () => window.removeEventListener("nature-soundboard-state", handleState);
  }, []);

  // No-login Shared States: Favorites, Recents and Share Link
  const [presetsSubTab, setPresetsSubTab] = useState<"all" | "favorites" | "recents" | "share">("all");
  const [favoriteNameInput, setFavoriteNameInput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Load favorites from local storage
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("midnight_signals_favorites");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Load recents from local storage
  const [recents, setRecents] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("midnight_signals_recents");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Auto-load share link if loaded in address bar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URL(window.location.href).searchParams;
      if (searchParams.get("share") === "true") {
        const queryVibe = searchParams.get("vibe") as VibeType;
        const queryRain = searchParams.get("rain");
        const queryOcean = searchParams.get("ocean");
        const queryVinyl = searchParams.get("vinyl");
        const queryMaster = searchParams.get("master");
        const queryBinaural = searchParams.get("binaural");
        const queryBinOffset = searchParams.get("binOffset");
        const queryBpm = searchParams.get("bpm");
        const queryBirds = searchParams.get("birds");
        const queryOwl = searchParams.get("owl");
        const queryTrees = searchParams.get("trees");
        const queryNatureOcean = searchParams.get("n_ocean");
        const queryCrickets = searchParams.get("crickets");
        const queryName = searchParams.get("name") || "Shared Atmosphere";
        const querySongTitle = searchParams.get("title");
        const queryArtist = searchParams.get("artist");

        if (queryVibe) setCurrentVibe(queryVibe);
        if (queryRain !== null) setRainVolume(parseFloat(queryRain));
        if (queryOcean !== null) setOceanVolume(parseFloat(queryOcean));
        if (queryVinyl !== null) setVinylVolume(parseFloat(queryVinyl));
        if (queryMaster !== null) setMasterVolume(parseFloat(queryMaster));
        if (queryBinaural !== null) setIsBinauralActive(queryBinaural === "true");
        if (queryBinOffset !== null) setBinauralOffset(parseInt(queryBinOffset, 10));
        if (queryBpm !== null) setActiveBpm(parseInt(queryBpm, 10));
        if (querySongTitle) setActiveSongTitle(querySongTitle);
        if (queryArtist) setActiveArtistName(queryArtist);
        
        // Setup channels
        const nextChannels = {
          birds: queryBirds === "true",
          owl: queryOwl === "true",
          trees: queryTrees === "true",
          ocean: queryNatureOcean === "true",
          crickets: queryCrickets === "true",
        };

        // Notify nature soundboard via standard event
        setTimeout(() => {
          const launchEvent = new CustomEvent("launch-seo-preset", {
            detail: {
              activeChannels: nextChannels,
              channelVolumes: {
                birds: queryBirds === "true" ? 0.7 : 0.0,
                owl: queryOwl === "true" ? 0.6 : 0.0,
                trees: queryTrees === "true" ? 0.6 : 0.0,
                ocean: queryNatureOcean === "true" ? 0.65 : 0.0,
                crickets: queryCrickets === "true" ? 0.55 : 0.0,
              }
            }
          });
          window.dispatchEvent(launchEvent);
        }, 400);

        // Keep it in recents list
        setTimeout(() => {
          saveToRecents(queryName, {
            vibe: queryVibe || currentVibe,
            rainVolume: queryRain !== null ? parseFloat(queryRain) : rainVolume,
            oceanVolume: queryOcean !== null ? parseFloat(queryOcean) : oceanVolume,
            vinylVolume: queryVinyl !== null ? parseFloat(queryVinyl) : vinylVolume,
            isBinauralActive: queryBinaural === "true",
            binauralOffset: queryBinOffset !== null ? parseInt(queryBinOffset, 10) : binauralOffset,
            bpm: queryBpm !== null ? parseInt(queryBpm, 10) : activeBpm,
            activeChannels: nextChannels,
            songTitle: querySongTitle || "Shared Atmosphere",
            artistName: queryArtist || "Midnight Signals Live"
          });
        }, 1200);

        speakText(`Incoming ambient configuration matching style: ${queryName}. Ready to play.`);
      }
    }
  }, []);

  const saveToFavorites = (name: string) => {
    const activeChs = natureSoundboardState.activeChannels;
    const newFav = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim() || `Atmosphere ${favorites.length + 1}`,
      createdAt: Date.now(),
      config: {
        vibe: currentVibe,
        rainVolume,
        oceanVolume,
        vinylVolume,
        isBinauralActive,
        binauralOffset,
        bpm: activeBpm,
        activeChannels: { ...activeChs },
        songTitle: activeSongTitle,
        artistName: activeArtistName
      }
    };
    const updated = [newFav, ...favorites];
    setFavorites(updated);
    localStorage.setItem("midnight_signals_favorites", JSON.stringify(updated));
    speakText(`Custom signal configuration saved to your browser favorites.`);
    setFavoriteNameInput("");
  };

  const deleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(fav => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem("midnight_signals_favorites", JSON.stringify(updated));
    speakText(`Removed.`);
  };

  const saveToRecents = (name: string, config: any) => {
    const newRecent = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      timestamp: Date.now(),
      config
    };
    setRecents((prev) => {
      const filtered = prev.filter(r => r.name !== name);
      const next = [newRecent, ...filtered].slice(0, 5);
      localStorage.setItem("midnight_signals_recents", JSON.stringify(next));
      return next;
    });
  };

  const loadSavedPreset = (config: any) => {
    setCurrentVibe(config.vibe);
    setRainVolume(config.rainVolume);
    setOceanVolume(config.oceanVolume);
    setVinylVolume(config.vinylVolume);
    setIsBinauralActive(config.isBinauralActive);
    setBinauralOffset(config.binauralOffset);
    setActiveBpm(config.bpm);
    setActiveSongTitle(config.songTitle);
    setActiveArtistName(config.artistName);

    // Sync nature soundboard channels
    setTimeout(() => {
      const launchEvent = new CustomEvent("launch-seo-preset", {
        detail: {
          activeChannels: config.activeChannels,
          channelVolumes: {
            birds: config.activeChannels.birds ? 0.7 : 0.0,
            owl: config.activeChannels.owl ? 0.6 : 0.0,
            trees: config.activeChannels.trees ? 0.6 : 0.0,
            ocean: config.activeChannels.ocean ? 0.65 : 0.0,
            crickets: config.activeChannels.crickets ? 0.55 : 0.0,
          }
        }
      });
      window.dispatchEvent(launchEvent);
    }, 150);

    speakText(`Tuned setup successfully.`);
  };

  const generateShareUrl = (presetName?: string) => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    params.set("share", "true");
    params.set("vibe", currentVibe);
    params.set("rain", rainVolume.toFixed(2));
    params.set("ocean", oceanVolume.toFixed(2));
    params.set("vinyl", vinylVolume.toFixed(2));
    params.set("master", masterVolume.toFixed(2));
    params.set("binaural", isBinauralActive ? "true" : "false");
    params.set("binOffset", binauralOffset.toString());
    params.set("bpm", activeBpm.toString());
    params.set("birds", natureSoundboardState.activeChannels.birds ? "true" : "false");
    params.set("owl", natureSoundboardState.activeChannels.owl ? "true" : "false");
    params.set("trees", natureSoundboardState.activeChannels.trees ? "true" : "false");
    params.set("n_ocean", natureSoundboardState.activeChannels.ocean ? "true" : "false");
    params.set("crickets", natureSoundboardState.activeChannels.crickets ? "true" : "false");
    
    const label = presetName || activeSongTitle || "Ambient Session";
    params.set("name", label);
    if (activeSongTitle) params.set("title", activeSongTitle);
    if (activeArtistName) params.set("artist", activeArtistName);
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleCopyLink = (customUrl?: string, alertText = "Share link copied!") => {
    const url = customUrl || generateShareUrl();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      speakText(alertText);
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    }
  };

  const handleLaunchSEOPreset = (seoPage: typeof SEO_PAGES[0]) => {
    const preset = seoPage.presetConfig;
    
    // Play instrumentals
    if (!isPlaying) {
      handleTogglePlayback();
    }
    
    // Set custom text details
    setActiveSongTitle(preset.customTitle);
    setActiveArtistName(preset.customArtist);
    
    // Set BPM & Waveform
    setActiveBpm(preset.bpm);
    setSynthWaveform(preset.synthWaveform);
    
    // Emit CustomEvent to sync nature tracks
    setTimeout(() => {
      const launchEvent = new CustomEvent("launch-seo-preset", {
        detail: {
          activeChannels: preset.activeChannels,
          channelVolumes: preset.channelVolumes
        }
      });
      window.dispatchEvent(launchEvent);
    }, 150);
    
    // Go to nature soundboard tab so they see it playing
    setActiveCenterTab("nature");
    
    // Preset customized templates in songwriters sandbox
    setCustomLyricsText(preset.customLyrics);
    setCustomTitleInput(preset.customTitle);
    setCustomArtistInput(preset.customArtist);
    
    // Switch ambient background theme
    setCurrentVibe(seoPage.vibe);
    
    // Speak voice confirmation
    speakText(`Tuned in to: ${preset.customTitle} sleep station.`);
    
    // Move layout back to home
    setCurrentPath("");
    window.history.pushState({}, "", "/");
  };

  const handleToggleVocalGuide = () => {
    const newVal = !isVocalGuideActive;
    setIsVocalGuideActive(newVal);
    if (!newVal && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    } else if (newVal && activeLineId !== null) {
      const activeLine = activeLyrics.find(line => line.id === activeLineId);
      if (activeLine) {
        speakText(activeLine.text);
      }
    }
  };

  useEffect(() => {
    if (isVocalGuideActive && activeLineId !== null) {
      if (lastSpokenLineIdRef.current !== activeLineId) {
        lastSpokenLineIdRef.current = activeLineId;
        const activeLine = activeLyrics.find(line => line.id === activeLineId);
        if (activeLine) {
          speakText(activeLine.text);
        }
      }
    } else if (activeLineId === null) {
      lastSpokenLineIdRef.current = null;
    }
  }, [activeLineId, isVocalGuideActive, activeLyrics]);

  // Reference hooks
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize synth engine once on mount
  useEffect(() => {
    const synth = new MidnightSynth();
    synthRef.current = synth;

    // Registers reactive callbacks
    synth.registerCallbacks(
      (secs: number) => {
        setCurrentTime(secs);
      },
      (freq: number, type: "kick" | "snare" | "chord" | "melody") => {
        // Record trigger pulse event
        setPulseEvent({ freq, type, id: Math.random() });

        // Drive responsive animation waves heights in right sidebar visualizer with organic bounce
        setVisualizerHeights((prev) => {
          const next = [...prev];
          if (type === "kick") {
            next[0] = Math.min(100, Math.floor(Math.random() * 32) + 68);
            next[1] = Math.min(100, Math.floor(Math.random() * 30) + 60);
          } else if (type === "snare") {
            next[2] = Math.min(100, Math.floor(Math.random() * 35) + 65);
            next[3] = Math.min(100, Math.floor(Math.random() * 35) + 65);
          } else if (type === "melody") {
            const highFreqIdx = Math.floor(Math.random() * 2) + 5; // index 5 or 6
            next[highFreqIdx] = Math.min(100, Math.floor(Math.random() * 45) + 55);
          } else if (type === "chord") {
            const midFreqIdx = Math.floor(Math.random() * 2) + 3; // index 3 or 4
            next[midFreqIdx] = Math.min(100, Math.floor(Math.random() * 40) + 50);
          }
          return next;
        });
      }
    );

    // Initial volumes
    synth.setVolume(masterVolume);
    synth.setRainVolume(rainVolume);
    synth.setVibe(currentVibe);

    return () => {
      synth.shutdown();
    };
  }, []);

  // Update master and rain volume instantly when sliders change
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVolume(masterVolume);
    }
  }, [masterVolume]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setRainVolume(rainVolume);
    }
  }, [rainVolume]);

  // Synchronically connect newly modified sound settings to synth engine
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setOceanVolume(oceanVolume);
    }
  }, [oceanVolume]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVinylVolume(vinylVolume);
    }
  }, [vinylVolume]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.toggleBinaural(isBinauralActive);
      synthRef.current.setBinauralVolume(binauralVolume);
      synthRef.current.setBinauralFrequency(binauralOffset);
    }
  }, [isBinauralActive, binauralVolume, binauralOffset]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setBPM(activeBpm);
    }
  }, [activeBpm]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setWaveform(synthWaveform);
    }
  }, [synthWaveform]);

  // Sleep Auto-Off Timer Countdown Handler
  useEffect(() => {
    if (sleepMinutes > 0) {
      setSleepSecondsLeft(sleepMinutes * 60);
    } else {
      setSleepSecondsLeft(0);
    }
  }, [sleepMinutes]);

  useEffect(() => {
    if (sleepSecondsLeft <= 0 || !isPlaying) return;

    const timer = setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger automatic stop
          if (synthRef.current) {
            synthRef.current.pause();
          }
          setIsPlaying(false);
          setSleepMinutes(0); // Reset timer
          speakText("Sleeper timer complete. Goodnight and stay relaxed.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepSecondsLeft, isPlaying]);

  // Handle vibe modification trigger and update active BPM accordingly
  const handleVibeChange = (newVibe: VibeType) => {
    setCurrentVibe(newVibe);
    let matchedBpm = 75;
    if (newVibe === "dreamy") matchedBpm = 70;
    else if (newVibe === "melancholy") matchedBpm = 65;
    else if (newVibe === "hopeful") matchedBpm = 82;
    else if (newVibe === "neon") matchedBpm = 90;

    setActiveBpm(matchedBpm);

    if (synthRef.current) {
      synthRef.current.setVibe(newVibe);
      synthRef.current.setBPM(matchedBpm);
    }
  };

  // Dynamically change Accent Color mapping with the Custom Color Picker
  const handleAccentColorChange = (vibe: VibeType, newHex: string) => {
    setThemeCustomizations((prev) => {
      const glow = hexToRgba(newHex, 0.4);
      const darkMix1 = hexToRgba(newHex, 0.12);
      const darkMix2 = hexToRgba(newHex, 0.04);
      const radialBg = `radial-gradient(circle at 80% 20%, ${darkMix1} 0%, transparent 50%), radial-gradient(circle at 10% 80%, ${darkMix2} 0%, transparent 50%)`;
      
      return {
        ...prev,
        [vibe]: {
          ...prev[vibe],
          accent: newHex,
          glowColor: glow,
          radialBg: radialBg
        }
      };
    });
  };

  // Perform continuous decay timer on spectrum visualizer bars to look fluid
  useEffect(() => {
    const handle = setInterval(() => {
      setVisualizerHeights((prev) => {
        return prev.map((h) => Math.max(15, h - 3.5)); // decays gracefully
      });
    }, 45);
    return () => clearInterval(handle);
  }, []);

  // Track active lyric line highlighting matching current playback seconds
  useEffect(() => {
    const active = activeLyrics.find(
      (line) => currentTime >= line.time && currentTime < (line.time + line.duration)
    );
    if (active) {
      setActiveLineId(active.id);
    } else {
      // If we fall off, find the closest previous line
      const pastLines = activeLyrics.filter((line) => currentTime >= line.time + line.duration);
      if (pastLines.length > 0) {
        setActiveLineId(pastLines[pastLines.length - 1].id);
      } else {
        setActiveLineId(null);
      }
    }
  }, [currentTime, activeLyrics]);

  // Smooth scroll highlighted active lyric into center of viewable box
  useEffect(() => {
    if (!autoScroll || activeLineId === null) return;
    const scrollTarget = document.getElementById(`lyric-line-${activeLineId}`);
    if (scrollTarget && lyricsContainerRef.current) {
      scrollTarget.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeLineId, autoScroll]);

  // Submits custom floating coordinate node to live signal canvas
  const addLocalSignal = (text: string, selectedVibe: VibeType) => {
    const colors = {
      dreamy: "rgb(168, 85, 247)",
      melancholy: "rgb(59, 130, 246)",
      hopeful: "rgb(16, 185, 129)",
      neon: "rgb(244, 63, 94)"
    };

    const newSignal: FloatingSignal = {
      id: String(Date.now()),
      text,
      x: Math.random() * 500 + 150,
      y: Math.random() * 200 + 80,
      vx: (Math.random() * 0.2 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.2 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
      scale: Math.random() * 0.4 + 0.9,
      opacity: 0.9,
      color: colors[selectedVibe] || "rgb(168, 85, 247)",
      vibe: selectedVibe,
      createdAt: Date.now()
    };

    setFloatingSignals((prev) => [newSignal, ...prev]);
  };

  const handleQuickPreset = (mode: "focus" | "sleep" | "flow") => {
    setActiveQuickPreset(mode);
    if (!synthRef.current) return;

    if (mode === "focus") {
      setActiveBpm(74);
      setRainVolume(0.35);
      setVinylVolume(0.12);
      setOceanVolume(0.0);
      setIsBinauralActive(true);
      setBinauralOffset(15); // 15Hz Beta Focus
      setActiveSongTitle("Deep Focus Sequence");
      setActiveArtistName("Midnight Channels");
      
      const launchEvent = new CustomEvent("launch-seo-preset", {
        detail: {
          activeChannels: {
            birds: false,
            owl: false,
            trees: true,
            ocean: false,
            crickets: false
          },
          channelVolumes: {
            birds: 0,
            owl: 0,
            trees: 0.35,
            ocean: 0,
            crickets: 0
          }
        }
      });
      window.dispatchEvent(launchEvent);
      speakText("Deep Focus preset activated. Concentrating neural frequencies.");
    } else if (mode === "sleep") {
      setActiveBpm(60);
      setRainVolume(0.1);
      setVinylVolume(0.05);
      setOceanVolume(0.5);
      setIsBinauralActive(true);
      setBinauralOffset(2); // 2Hz Delta Sleep
      setActiveSongTitle("Deep Rest & Hibernate");
      setActiveArtistName("Somnus Frequency");

      const launchEvent = new CustomEvent("launch-seo-preset", {
        detail: {
          activeChannels: {
            birds: false,
            owl: true,
            trees: false,
            ocean: true,
            crickets: true
          },
          channelVolumes: {
            birds: 0,
            owl: 0.45,
            trees: 0,
            ocean: 0.5,
            crickets: 0.25
          }
        }
      });
      window.dispatchEvent(launchEvent);
      speakText("Sleep and Hibernate preset activated. Delta sleep waves initiated.");
    } else if (mode === "flow") {
      setActiveBpm(88);
      setRainVolume(0.05);
      setVinylVolume(0.15);
      setOceanVolume(0.0);
      setIsBinauralActive(true);
      setBinauralOffset(10); // 10Hz Alpha Creative Flow
      setActiveSongTitle("Creative Flow Resonance");
      setActiveArtistName("Aether Waves");

      const launchEvent = new CustomEvent("launch-seo-preset", {
        detail: {
          activeChannels: {
            birds: true,
            owl: false,
            trees: true,
            ocean: false,
            crickets: false
          },
          channelVolumes: {
            birds: 0.6,
            owl: 0,
            trees: 0.35,
            ocean: 0,
            crickets: 0
          }
        }
      });
      window.dispatchEvent(launchEvent);
      speakText("Creative Flow preset activated. Stimulating alpha brainwaves.");
    }

    // Auto toggle synth playing if currently paused
    if (!isPlaying) {
      synthRef.current.start(0);
      setIsPlaying(true);
    }
  };

  // Triggers main media playback controls (Play / Pause toggle)
  const handleTogglePlayback = () => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      synthRef.current.start(currentTime >= totalDuration ? 0 : currentTime);
      setIsPlaying(true);
    }
  };

  // Seeks playback point along progression scrubber bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetSecs = Math.max(0, Math.min(totalDuration, percentage * totalDuration));
    
    setCurrentTime(targetSecs);
    if (synthRef.current) {
      synthRef.current.seek(targetSecs);
    }
  };

  // Jumps to specific song lyric start time when clicked dynamically
  const handleLyricLineClick = (time: number) => {
    setCurrentTime(time);
    if (synthRef.current) {
      synthRef.current.seek(time);
    }
    // Auto kick play if paused for extreme ease-of use
    if (!isPlaying && synthRef.current) {
      synthRef.current.start(time);
      setIsPlaying(true);
    }
  };

  // Synchronizes a curated lo-fi preset to the active timeline player
  const loadPresetLyrics = (index: number) => {
    if (index < 0 || index >= calmLofiPresets.length) return;
    setSelectedPresetIndex(index);
    const preset = calmLofiPresets[index];

    // Distribute lines nicely from 5s to 200s
    const startTime = 5.0;
    const endTime = 200.0;
    const step = (endTime - startTime) / Math.max(1, preset.lines.length - 1 || 1);

    const presetLines: LyricLine[] = preset.lines.map((text, idx) => ({
      id: 3000 + idx,
      text,
      time: parseFloat((startTime + idx * step).toFixed(1)),
      duration: parseFloat(Math.max(2.5, step - 0.5).toFixed(1)),
      section: idx === 0 ? "Intro" : idx < 5 ? "Verse 1" : idx < 12 ? "Chorus" : idx < 17 ? "Verse 2" : "Outro"
    }));

    setActiveLyrics(presetLines);
    setActiveSongTitle(preset.name);
    setActiveArtistName("Synthesized Chill Pack");
    
    // Save to recents list
    saveToRecents(preset.name, {
      vibe: preset.vibe,
      rainVolume: rainVolume,
      oceanVolume: oceanVolume,
      vinylVolume: vinylVolume,
      isBinauralActive: isBinauralActive,
      binauralOffset: binauralOffset,
      bpm: activeBpm,
      activeChannels: { ...natureSoundboardState.activeChannels },
      songTitle: preset.name,
      artistName: "Synthesized Chill Pack"
    });

    // Seek to top
    setCurrentTime(0);
    if (synthRef.current) {
      synthRef.current.seek(0);
    }
    setActiveCenterTab("karaoke"); // Jump right back to streaming player
    speakText(`Loaded chill pack: ${preset.name}. Take a moment to breathe and relax.`);
  };

  // Compiles and synchronizes user submitted custom lyrics
  const handleCompileCustomLyrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLyricsText.trim()) return;

    // Parse lines
    const parsedLines = customLyricsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (parsedLines.length === 0) return;

    const startTime = 5.0;
    const endTime = 200.0;
    const step = (endTime - startTime) / Math.max(1, parsedLines.length - 1 || 1);

    const customLines: LyricLine[] = parsedLines.map((text, idx) => ({
      id: 5000 + idx,
      text,
      time: parseFloat((startTime + idx * step).toFixed(1)),
      duration: parseFloat(Math.max(2.5, step - 0.5).toFixed(1)),
      section: idx === 0 ? "Intro" : idx < parsedLines.length / 3 ? "Verse" : idx < (parsedLines.length * 2) / 3 ? "Chorus" : "Outro"
    }));

    setActiveLyrics(customLines);
    
    const finalTitle = customTitleInput.trim() || "My Personal Oasis";
    const finalArtist = customArtistInput.trim() || "Independent Creator";
    setActiveSongTitle(finalTitle);
    setActiveArtistName(finalArtist);

    // Seek to top
    setCurrentTime(0);
    if (synthRef.current) {
      synthRef.current.seek(0);
    }
    setActiveCenterTab("karaoke"); // Jump back to player
    speakText(`Synchronized your custom song: ${finalTitle}. Ready to play.`);
  };

  // Submits message to server side proxy Gemini endpoint to echo poetry responses back
  const handleSendEchoMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsentMessageInput.trim() || isSendingEcho) return;

    const messageToSend = unsentMessageInput.trim();
    setUnsentMessageInput("");
    setIsSendingEcho(true);

    try {
      const response = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          vibe: currentVibe
        })
      });

      if (!response.ok) {
        throw new Error("Frequency response failed to compile.");
      }

      const data = await response.json();
      if (data.success) {
        const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newEchoItem: EchoItem = {
          id: String(Date.now()),
          userMessage: messageToSend,
          reply: data.reply,
          verse: data.verse,
          vibe: currentVibe,
          timestamp: timestampStr
        };

        // Update local logs list
        setEchoHistory((prev) => [newEchoItem, ...prev]);
        setActiveEchoTab("history");

        // Float user's unsent secret directly in starry signal canvas!
        addLocalSignal(messageToSend, currentVibe);

        // Float AI response in canvas shortly after
        setTimeout(() => {
          addLocalSignal(`Reply: ${data.reply.slice(0, 32)}...`, currentVibe);
        }, 1200);

      } else {
        alert(data.error || "Broadcast error.");
      }
    } catch (err: any) {
      console.error(err);
      // Fail gracefully with pretty mock node response so local sandbox keeps fully styled operational flow
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackItem: EchoItem = {
        id: String(Date.now()),
        userMessage: messageToSend,
        reply: "Your signal slipped through the static. Somewhere in Sector 7, a glowing star hummed back with faint waves.",
        verse: "Streetlights paint the silver lines,\nSearching for the hidden signs,\nEven if our notes collide,\nYou are resting by my side.",
        vibe: currentVibe,
        timestamp: timestampStr
      };
      setEchoHistory((prev) => [fallbackItem, ...prev]);
      setActiveEchoTab("history");
      addLocalSignal(messageToSend, currentVibe);
    } finally {
      setIsSendingEcho(false);
    }
  };

  // Formats seconds into digital timer display strings
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const activeTheme = themeCustomizations[currentVibe];

  // Dynamic programmatic SEO page parser
  let matchedSEOPage = SEO_PAGES.find((p) => p.path === currentPath);
  
  if (!matchedSEOPage && currentPath) {
    const combos = [
      { path: "/ocean-waves-and-rain", headline: "Ocean Waves & Soft Rain", vibe: "dreamy" as const, basePreset: SEO_PAGES[0] },
      { path: "/ocean-waves-and-crickets", headline: "Waves & Field Crickets", vibe: "dreamy" as const, basePreset: SEO_PAGES[0] },
      { path: "/ocean-waves-and-owl-sounds", headline: "Waves & Woodland Owls", vibe: "melancholy" as const, basePreset: SEO_PAGES[4] },
      { path: "/songbirds-and-forest-breeze", headline: "Songbirds & Forest Breeze", vibe: "hopeful" as const, basePreset: SEO_PAGES[1] },
      { path: "/rain-and-vinyl-crackles", headline: "Soft Rain & Cozy Vinyl", vibe: "neon" as const, basePreset: SEO_PAGES[2] },
      { path: "/neon-lofi-and-ocean-sounds", headline: "Neon Lo-Fi & Ocean Surf", vibe: "neon" as const, basePreset: SEO_PAGES[2] }
    ];
    
    const matchedCombo = combos.find((c) => c.path === currentPath);
    if (matchedCombo) {
      matchedSEOPage = {
        ...matchedCombo.basePreset,
        path: matchedCombo.path,
        vibe: matchedCombo.vibe,
        headline: `${matchedCombo.headline} Soundboard Mixer`,
        subheading: `Dynamic online acoustic generator blending ${matchedCombo.headline.toLowerCase()} for deep focus, sleep, and physical comfort.`,
        title: `${matchedCombo.headline} | Custom Lofi Radio Mixer & Nature Sounds`,
        metaDescription: `Play our automatic relaxation preset blending ${matchedCombo.headline.toLowerCase()} with generative synths. Clean browser-synthesized focus audio.`,
        introText: `Welcome to the custom ${matchedCombo.headline.toLowerCase()} generator. This programmatic landing page features curated atmospheric waveforms and natural soundscapes designed to calm the mammalian nervous system. Dive in, read the clinical benefits, and trigger our custom synchronized preset station in one click.`,
        sections: [
          {
            title: `The Science of Blending ${matchedCombo.headline.split(' & ')[0]} and ${matchedCombo.headline.split(' & ')[1] || 'Ambient Audio'}`,
            paragraphs: [
              `When you combine active soundscapes like ${matchedCombo.headline.toLowerCase()}, you create a multi-layered auditory environment. Each layer targets a different cognitive wavelength: low-frequency rumbles mask harsh household impacts, while soft high-frequency highlights provide pleasant natural fascinations. This dual acoustic layout provides maximum anxiety and fatigue relief.`,
              `Midnight Signals synthesizes these exact waveforms right inside your physical device browser. Highly compliant with sleep-hygiene protocols, our real-time mixer runs continuous code blocks that never stutter or repeat, giving you reliable tranquility.`
            ]
          },
          {
            title: "Tuning Instructions and Customization Access",
            paragraphs: [
              "We recommend adjusting speaker volume levels to around 35 decibels to approximate natural environmental levels. Tap 'Launch Curated Preset Station' below to instantly set up your sound tracks, or tweak individual volumes using our main dashboard soundboard to build a personal masterpiece."
            ]
          }
        ],
        faqs: [
          {
            question: `Is this ${matchedCombo.headline.toLowerCase()} generator completely free?`,
            answer: "Yes! Every single feature including high-fidelity brainwave frequencies, complete holographic bird preset catalogs, generative AI poetry, and audio exporting works entirely free with no pro upgrade required."
          }
        ]
      };
    }
  }

  // Quick navigation blocks
  const lyricSections = [
    { name: "Intro", time: 1.0 },
    { name: "Verse 1", time: 16.0 },
    { name: "Pre-Chorus", time: 36.5 },
    { name: "Chorus", time: 51.0 },
    { name: "Verse 2 (Rap)", time: 91.0 },
    { name: "Bridge", time: 155.0 },
    { name: "Outro", time: 192.0 }
  ];

  const visualLayersConfig = [
    {
      id: "birds",
      active: natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.birds,
      src: "https://images.openai.com/static-rsc-4/Yr6MBeZLSDeBGWe920E_-TTje_ZhxECvq9QUkHQnyvKQQDRBuSgdoWK4WM5EThGUYIBqJ5KgPqRDGlaSdCaqNMkZlPjp_HCI8IB-MnTkBOKPuBFNEB4-toob8c1evp1LUaa8I3AaVVJOPW2Nu_X3111TQuoS-gIwM8nM74p3maV8ca9d4PfLiS8qogfCoX-T?purpose=fullsize",
      alt: "Songbirds flying, forest canopy",
      animClass: "animate-ambient-zoom-pan"
    },
    {
      id: "rain",
      active: isPlaying && rainVolume > 0,
      src: "https://images.openai.com/static-rsc-4/4bp300oSaVMb_TamCyztij8wYR5rNdy5Tukouh5k11j9JpS7rWG4CnuM7MCGRlsX2YhT6g-tB0y_lCaP_IqlZsVfdLh8A--wcCq8IjkKLVdrDJTqT6i6mt8yOIdo10ymA6HjfWgZ9ADrNgjlYk7q9l3xXWprAmMd6uU_GsvsYEaeVlG9d-VhXYCfJ81p3vk4?purpose=fullsize",
      alt: "Rain on windows, city rain",
      animClass: "animate-ambient-float"
    },
    {
      id: "ocean",
      active: (natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.ocean) || (isPlaying && oceanVolume > 0),
      src: "https://images.openai.com/static-rsc-4/qM-HYJiNmwJMrVTEWKKFiPFAikBadAzkkp5_kBjDXB0er6QCt001wkEt-71hhnaCMEmljBWsUenek1ACi-PEvPx00Gx10FJocS9RHl1bf4HqJ0clW0Ch09QqG5tHPnoM0ie9zNCAM5uiwkHjbP9zeuA08YlNI3VIlgPSaPXkwrjYTIQkjejSuIFANZqW-rTt?purpose=fullsize",
      alt: "Ocean beach shores, rolling waves",
      animClass: "animate-ambient-sway"
    },
    {
      id: "trees",
      active: natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.trees,
      src: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80",
      alt: "Mystical pine forest, branches swaying",
      animClass: "animate-ambient-zoom-pan"
    },
    {
      id: "crickets",
      active: natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.crickets,
      src: "https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&w=1600&q=80",
      alt: "Moonlit grass, night meadow",
      animClass: "animate-ambient-float"
    },
    {
      id: "owl",
      active: natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.owl,
      src: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=80",
      alt: "Night stars silhouette owl presence",
      animClass: "animate-ambient-sway"
    },
    {
      id: "vinyl",
      active: isPlaying && vinylVolume > 0,
      src: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80",
      alt: "Vintage record player close-up",
      animClass: "animate-ambient-zoom-pan"
    },
    {
      id: "campfire",
      active: (isPlaying && activeSongTitle.toLowerCase().includes("campfire")) || manualCampfire,
      src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80",
      alt: "Embers crackling, cabin forest",
      animClass: "animate-ambient-float"
    },
    {
      id: "train",
      active: (isPlaying && activeSongTitle.toLowerCase().includes("train")) || manualTrain,
      src: "https://images.unsplash.com/photo-1474487548417-781f71495f3b?auto=format&fit=crop&w=1600&q=80",
      alt: "Moving train railway scenic landscapes",
      animClass: "animate-ambient-sway"
    }
  ];

  const activeVisualLayers = visualLayersConfig.filter(l => l.active);

  return (
    <div
      className="midnight-station min-h-screen font-sans antialiased relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white"
    >
      {/* Immersive background lighting Atmosphere config */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0 opacity-60"
        style={{ background: activeTheme.radialBg }}
      />

      {/* Dynamic Ambient Visual Layer - Living Wallpaper */}
      {visualMode !== "off" && activeVisualLayers.length > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-1000">
          {visualLayersConfig.map((layer) => (
            <div
              key={layer.id}
              className={`absolute inset-0 transition-all duration-[800ms] ease-in-out ${
                layer.active 
                  ? "opacity-25" 
                  : "opacity-0 scale-95 blur-md"
              }`}
            >
              <img
                src={layer.src}
                alt={layer.alt}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover select-none ${
                  visualMode === "animated" && layer.active ? layer.animClass : ""
                }`}
              />
            </div>
          ))}
          {/* Readability dimming overlay & backdrop-blur */}
          <div className="absolute inset-0 bg-[#050505]/75 backdrop-blur-[2px] transition-all duration-[800ms]" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10 flex flex-col min-h-screen justify-between gap-8 pb-12">
        
        {/* COMPREHENSIVE FLOATING SCRUBBER FOOTER CONTROLLER + TUNER WRAPPER */}
        <div className="sticky top-4 z-45 w-full flex flex-col gap-3">
          
          <footer 
            className="bg-zinc-950/95 border border-white/10 backdrop-blur-xl p-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative transition-all duration-500 ease-in-out w-full"
            style={{
              borderColor: isPlaying ? `${activeTheme.accent}33` : "rgba(255,255,255,0.1)",
              boxShadow: isPlaying ? `0 20px 40px -15px ${activeTheme.accent}15, inset 0 1px 0 0 rgba(255,255,255,0.1)` : "none"
            }}
          >
          
          {/* Row 1: Player buttons, playing info, and radio tuner index trigger for mobile */}
          <div className="flex items-center justify-between gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 select-none">
                {isPlaying && (
                  <span 
                    className="absolute inset-0 rounded-full animate-ping opacity-25" 
                    style={{ backgroundColor: activeTheme.accent }}
                  />
                )}
                <button
                  id="midnight-playback-main-btn"
                  onClick={handleTogglePlayback}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border text-white flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative z-10 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: isPlaying ? activeTheme.accent : "rgba(255, 255, 255, 0.3)",
                    backgroundColor: isPlaying ? `${activeTheme.accent}15` : "rgba(255, 255, 255, 0.03)",
                    boxShadow: isPlaying ? `0 0 12px ${activeTheme.glowColor}40` : "none"
                  }}
                  title={isPlaying ? "Pause track" : "Play track"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" style={{ fill: activeTheme.accent }} />
                  ) : (
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white translate-x-[1px]" />
                  )}
                </button>
              </div>
              
              <div className="text-left font-sans max-w-[140px] sm:max-w-[220px]">
                <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] opacity-50 block">// Station Active</span>
                <h4 className="text-2xs md:text-xs font-bold text-white tracking-wide truncate" style={{ color: isPlaying ? activeTheme.accent : "#ffffff" }}>{activeSongTitle}</h4>
                <p className="text-[8px] md:text-[9px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                  <span className={`inline-block w-1 h-1 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  {isPlaying ? "RECEIVING" : "STANDBY"}
                </p>
              </div>
            </div>

            {/* Quick interactive tuner triggers & vibe indicator specific to mobile layout */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:hidden">
              <button
                type="button"
                onClick={() => setShowTuner(!showTuner)}
                className={`py-1.5 px-2 rounded-lg border uppercase text-[7px] font-bold select-none cursor-pointer duration-300 transition-all ${
                  showTuner 
                    ? "border-sky-500 bg-sky-500/10 text-sky-400" 
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                📡 {showTuner ? "Tuner" : "Tune"}
              </button>
              <button
                type="button"
                onClick={() => setShowSoundConsole(!showSoundConsole)}
                className={`py-1.5 px-2 rounded-lg border uppercase text-[7px] font-bold select-none cursor-pointer duration-300 transition-all ${
                  showSoundConsole
                    ? "border-purple-500 bg-purple-500/10 text-purple-450"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                🎛️ Console
              </button>
              <button
                type="button"
                onClick={() => setShowEchoTerminal(!showEchoTerminal)}
                className={`py-1.5 px-2 rounded-lg border uppercase text-[7px] font-bold select-none cursor-pointer duration-300 transition-all ${
                  showEchoTerminal
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                📟 Signal
              </button>
              <div 
                className="hidden sm:block px-2 py-1.5 rounded-lg border uppercase tracking-wider text-[7px] font-bold select-none"
                style={{
                  borderColor: `${activeTheme.accent}33`,
                  backgroundColor: `${activeTheme.accent}0a`,
                  color: activeTheme.accent
                }}
              >
                <span>{currentVibe}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Seeker progress slider */}
          <div className="flex-grow w-full md:flex-1 flex items-center gap-3">
            <span className="font-mono text-[9px] md:text-[10px] text-zinc-400 select-none">
              {formatTime(currentTime)}
            </span>

            <div
              id="lyrics-play-bar-scrubber"
              onClick={handleSeek}
              className="progress-track flex-grow h-1.5 md:h-2 rounded-full bg-zinc-900/80 border border-white/5 relative cursor-pointer group transition-all"
            >
              {/* Audio visual progress fill node */}
              <div
                className="progress-fill absolute left-0 top-0 h-full rounded-full transition-all duration-75"
                style={{
                  width: `${(currentTime / totalDuration) * 100}%`,
                  background: `linear-gradient(to right, ${activeTheme.accent}, #00D1FF)`,
                  boxShadow: `0 0 8px ${activeTheme.glowColor}`
                }}
              >
                {/* Micro pointer handler on timeline drag */}
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-950 shadow-md transform translate-x-1.5"
                  style={{ backgroundColor: activeTheme.accent }}
                />
              </div>
            </div>

            <span className="font-mono text-[9px] md:text-[10px] text-zinc-500 select-none">
              -{formatTime(Math.max(0, totalDuration - currentTime))}
            </span>
          </div>

          {/* Row 3: Expanded metadata and instructions shown strictly on wider screens */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-zinc-400 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-white/5 py-1.5 px-3 rounded-xl select-none">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px]">TOTAL LNT: {formatTime(totalDuration)}</span>
            </div>
            
            {/* Vibe badge helper */}
            <div 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border uppercase tracking-wider text-[8.5px] font-bold select-none"
              style={{
                borderColor: `${activeTheme.accent}33`,
                backgroundColor: `${activeTheme.accent}0a`,
                color: activeTheme.accent
              }}
            >
              <span>{currentVibe} Mode</span>
            </div>
          </div>

        </footer>

        {/* DYNAMIC STATION FREQUENCY TUNER NAVIGATION (MOVED TO TOP OF HEADER) */}
        <div className={`w-full max-w-7xl mx-auto z-20 relative text-left bg-zinc-950/25 p-3 rounded-2xl border border-white/5 backdrop-blur-md transition-all duration-300 ${showTuner ? "block animate-fadeIn" : "hidden md:block"}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 font-mono text-[9px] text-[#00D1FF] uppercase tracking-widest font-extrabold select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D1FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D1FF]"></span>
              </span>
              <span>Cozy Station Tuner & Frequency Index</span>
            </div>
            {currentPath && (
              <button
                type="button"
                onClick={() => {
                  setCurrentPath("");
                  window.history.pushState({}, "", "/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[9px] font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer"
              >
                🏠 Return to Main Station
              </button>
            )}
          </div>
          
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
            {SEO_PAGES.map((page) => {
              const isSelected = currentPath === page.path;
              return (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => {
                    setCurrentPath(page.path);
                    window.history.pushState({}, "", page.path);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex-shrink-0 snap-start p-2 px-3 rounded-xl border text-left transition-all active:scale-97 cursor-pointer group flex items-center gap-2 ${
                    isSelected 
                      ? "border-sky-500 bg-sky-500/10 text-white" 
                      : "bg-zinc-900 border-white/5 hover:border-indigo-500/30 hover:bg-indigo-950/20 text-zinc-300"
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-sky-400 animate-pulse" : "bg-zinc-650 group-hover:bg-zinc-450"}`} />
                  <div>
                    <span className="font-mono text-[6.5px] uppercase tracking-wider text-zinc-500 block">
                      {page.vibe} frequency
                    </span>
                    <span className="font-sans text-[9.5px] font-bold block whitespace-nowrap">
                      {page.headline.replace(" Generator", "").replace(" & Deep Relaxation", "")}
                    </span>
                  </div>
                </button>
              );
            })}
            
            {/* Programmatic combos */}
            {[
              { path: "/ocean-waves-and-rain", headline: "Ocean Waves & Soft Rain", vibe: "dreamy" },
              { path: "/ocean-waves-and-crickets", headline: "Waves & Field Crickets", vibe: "dreamy" },
              { path: "/ocean-waves-and-owl-sounds", headline: "Waves & Woodland Owls", vibe: "melancholy" },
              { path: "/songbirds-and-forest-breeze", headline: "Songbirds & Forest Breeze", vibe: "hopeful" },
              { path: "/rain-and-vinyl-crackles", headline: "Soft Rain & Cozy Vinyl", vibe: "neon" },
              { path: "/neon-lofi-and-ocean-sounds", headline: "Neon Lo-Fi & Ocean Surf", vibe: "neon" }
            ].map((combo) => {
              const isSelected = currentPath === combo.path;
              return (
                <button
                  key={combo.path}
                  type="button"
                  onClick={() => {
                    setCurrentPath(combo.path);
                    window.history.pushState({}, "", combo.path);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex-shrink-0 snap-start p-2 px-3 rounded-xl border text-left transition-all active:scale-97 cursor-pointer group flex items-center gap-2 ${
                    isSelected 
                      ? "border-rose-500 bg-rose-500/10 text-white" 
                      : "bg-zinc-900 border-white/5 hover:border-rose-500/30 hover:bg-rose-950/20 text-zinc-300"
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-rose-400 animate-pulse" : "bg-zinc-650 group-hover:bg-zinc-450"}`} />
                  <div>
                    <span className="font-mono text-[6.5px] uppercase tracking-wider text-zinc-500 block">
                      Preset frequency
                    </span>
                    <span className="font-sans text-[9.5px] font-bold block whitespace-nowrap">
                      {combo.headline}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        </div> {/* Close COMPREHENSIVE FLOATING SCRUBBER + TUNER STICKY WRAPPER */}

        {/* HEADER BLOCK */}
        <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 relative group">
          <div className="title-block text-left">
            <div className="text-[10px] uppercase tracking-[0.25em] font-mono flex items-center gap-2" style={{ color: activeTheme.accent }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.accent }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeTheme.accent }}></span>
              </span>
              Now Receiving Midnight Signals
            </div>
            <h1 className="font-serif italic text-4xl md:text-5xl font-black text-white hover:text-indigo-200 transition-colors tracking-tight mt-2.5">
              {activeSongTitle}
            </h1>
          </div>
          
          <div className="text-left md:text-right font-mono text-zinc-500 text-xs w-full md:w-auto border-l md:border-l-0 md:border-r border-white/10 pl-4 md:pl-0 md:pr-4 py-1 flex flex-col md:items-end gap-3">
            <div>
              <div className="text-zinc-300 font-serif italic text-lg font-bold">
                {activeArtistName}
              </div>
              <div className="text-[10px] tracking-wider uppercase mt-1.5 flex items-center md:justify-end gap-2 text-zinc-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Station Code: CLOUD_RUN
                <span className="text-zinc-650">•</span>
                <span className="text-zinc-500">Live Feedback</span>
              </div>
            </div>

            {/* QUICK-PRESET BAR */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-sm self-start md:self-auto">
              <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono px-1.5 font-bold">Presets:</span>
              
              <button
                id="qp-deep-focus"
                onClick={() => handleQuickPreset("focus")}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 flex items-center gap-1 cursor-pointer select-none ${
                  activeQuickPreset === "focus"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-[0_0_8px_rgba(56,189,248,0.2)] font-semibold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:bg-white/5 hover:scale-102"
                }`}
              >
                🎯 Focus
              </button>

              <button
                id="qp-sleep"
                onClick={() => handleQuickPreset("sleep")}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 flex items-center gap-1 cursor-pointer select-none ${
                  activeQuickPreset === "sleep"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-[0_0_8px_rgba(168,85,247,0.2)] font-semibold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:bg-white/5 hover:scale-102"
                }`}
              >
                🌙 Sleep
              </button>

              <button
                id="qp-creative-flow"
                onClick={() => handleQuickPreset("flow")}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 flex items-center gap-1 cursor-pointer select-none ${
                  activeQuickPreset === "flow"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)] font-semibold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:bg-white/5 hover:scale-102"
                }`}
              >
                ✨ Flow
              </button>
            </div>
          </div>
        </header>


        {/* MAIN STRUCTURAL RESPONSIVE GRID OR DYNAMIC SEO LANDING VIEW */}
        {currentPath && !matchedSEOPage ? (
          <div className="relative z-20 max-w-2xl mx-auto py-16 px-6 font-sans animate-fadeIn text-center bg-zinc-950/80 p-8 md:p-12 rounded-3xl border border-rose-500/10 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full scale-110 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full border border-rose-500/30 bg-rose-500/5 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Radio className="w-10 h-10 stroke-[1.5]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-zinc-950 flex items-center justify-center text-[8px] font-mono font-bold text-zinc-950">!</span>
              </span>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-rose-400 font-bold select-none">
                [ TRANSMISSION ERROR: 404 ]
              </div>
              <h2 className="text-3xl font-serif italic text-white font-black leading-tight tracking-tight">
                Signal Not Found
              </h2>
              <p className="text-zinc-400 text-xs font-mono leading-relaxed mt-2 p-3 bg-zinc-900/50 rounded-2xl border border-white/5">
                The frequency node at <span className="text-rose-400 font-bold break-all select-all">{currentPath}</span> does not exist or has decayed into random physical cosmic static.
              </p>
            </div>

            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider select-none">
              Station Status: Standby // Retuning Recommended
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPath("");
                window.history.pushState({}, "", "/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 text-[#00D1FF] border border-[#00D1FF]/30 hover:border-[#00D1FF]/50 px-6 py-3.5 rounded-2xl text-xs font-mono font-bold cursor-pointer transition-all duration-300 flex items-center gap-2 tracking-wide shadow-lg hover:scale-[1.02] active:scale-95"
            >
              ← Return to Station
            </button>
          </div>
        ) : matchedSEOPage ? (
          <div className="relative z-20 max-w-4xl mx-auto py-8 md:py-12 px-4 font-sans animate-fadeIn text-left bg-zinc-950/45 p-6 md:p-10 rounded-3xl border border-white/5 backdrop-blur-xl">
            {/* Dynamic JSON-LD Structured FAQ Schema to inject on page for perfect Google organic crawler visibility */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": matchedSEOPage.faqs.map((f) => ({
                  "@type": "Question",
                  "name": f.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.answer
                  }
                }))
              })}
            </script>

            {/* Floating back to station button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentPath("");
                  window.history.pushState({}, "", "/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-2 hover:gap-3 transition-all cursor-pointer bg-zinc-900 border border-white/5 px-4 py-2.5 rounded-2xl select-none"
              >
                ← Return to Midnight Main Station
              </button>
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 tracking-wider font-extrabold select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400"></span>
                </span>
                <span>CURATED SEO STATION ARCHIVE</span>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#00D1FF] block font-black">
                  🌌 MEDITATIVE LATE-NIGHT FREQUENCY
                </span>
                <h2 className={`text-3xl md:text-5xl font-serif italic font-black bg-gradient-to-r ${matchedSEOPage.accentColor} bg-clip-text text-transparent leading-tight tracking-tight`}>
                  {matchedSEOPage.headline}
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed tracking-wide max-w-2xl font-light">
                  {matchedSEOPage.subheading}
                </p>
              </div>

              {/* HIGH-IMPACT DYNAMIC Presets CTA Control Card */}
              <div className="p-6 md:p-8 rounded-2xl bg-zinc-950 border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-stretch gap-6 group">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="space-y-4 flex-1">
                  <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold tracking-widest">
                    ACTIVE PRESETS ROUTER
                  </span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {matchedSEOPage.presetConfig.customTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md font-sans">
                    Tap to instantly boot our online browser synthesizer with optimized spatial nature tracks: 
                    {Object.keys(matchedSEOPage.presetConfig.activeChannels)
                      .filter((ch) => matchedSEOPage.presetConfig.activeChannels[ch as keyof typeof matchedSEOPage.presetConfig.activeChannels])
                      .map((ch) => ` ${ch} [${Math.round(matchedSEOPage.presetConfig.channelVolumes[ch as keyof typeof matchedSEOPage.presetConfig.channelVolumes] * 100)}%]`)
                      .join(",")}.
                  </p>
                  
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 max-w-sm">
                    <span className="font-mono text-[8px] text-zinc-500 uppercase block mb-1">Target Lyric Hook</span>
                    <p className="text-[10px] text-zinc-300 italic line-clamp-2">
                      "{matchedSEOPage.presetConfig.customLyrics.replace(/\n/g, " ")}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLaunchSEOPreset(matchedSEOPage!)}
                    className="w-full md:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:opacity-90 active:scale-95 transition-all text-black font-extrabold font-mono text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-500/10 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-sm">⚡</span>
                    <span>LAUNCH STATION PRESET</span>
                  </button>
                </div>
              </div>

              {/* Dense SEO content (1000-1500 words) */}
              <div className="space-y-6 text-zinc-300 text-xs leading-relaxed max-w-3xl border-t border-white/5 pt-8 font-sans">
                <p className="text-xs md:text-sm text-zinc-400 italic">
                  {matchedSEOPage.introText}
                </p>

                {matchedSEOPage.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                      {sec.title}
                    </h4>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-zinc-450 font-light font-sans text-[11px]">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Dynamic FAQ Accordions */}
              <div className="space-y-4 border-t border-white/5 pt-8 max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-white font-bold">
                    Frequently Asked Questions (FAQ)
                  </h3>
                </div>

                <div className="space-y-3">
                  {matchedSEOPage.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2 text-left">
                      <h5 className="font-semibold text-xs text-white uppercase font-mono tracking-wide">
                        Q: {faq.question}
                      </h5>
                      <p className="text-zinc-400 font-light text-[11px]">
                        A: {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 w-full">
          
          {/* LEFT SIDEBAR: Sound Console & Signal Gauges */}
          <section className={`
            lg:col-span-3 flex-col gap-6 w-full h-full lg:sticky lg:top-8 lg:order-none lg:flex
            ${showSoundConsole 
              ? "fixed inset-y-0 left-0 z-50 w-[85%] sm:w-full sm:max-w-xs bg-[#09090e]/98 border-r border-white/10 p-5 md:p-6 overflow-y-auto shadow-2xl flex" 
              : "hidden"
            }
          `}>
            {/* Draw Mobile Header / Close Button */}
            <div className="flex items-center justify-between lg:hidden mb-2">
              <span className="text-[10px] uppercase font-mono text-zinc-550 font-bold tracking-widest">// Signal Console</span>
              <button 
                onClick={() => setShowSoundConsole(false)}
                className="py-1 px-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-[9px] font-mono text-zinc-450 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Close ×
              </button>
            </div>
            
            {/* DIAGNOSTIC METRIC BOXES - MULTIPLEX TRANSMISSION PANEL */}
            <div className="bg-zinc-950/60 p-5 rounded-3xl border border-white/5 backdrop-blur-lg">
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-550 mb-3 font-mono">Signal Multiplex Logs</h3>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Air Frequency</div>
                  <div className="text-xs font-mono text-[#00D1FF] font-bold mt-0.5">
                    {activeTheme.activeLabel.split(" ")[0]}
                  </div>
                </div>
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Signal Integrity</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                    {activeTheme.statIntegrity}
                  </div>
                </div>
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Active Wave</div>
                  <div className="text-xs font-mono text-indigo-400 font-bold mt-0.5 capitalize">
                    {synthWaveform}
                  </div>
                </div>
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Tempo Pace</div>
                  <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">
                    {activeBpm} BPM
                  </div>
                </div>
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Verse Lines</div>
                  <div className="text-xs font-mono text-rose-400 font-bold mt-0.5">
                    {activeLyrics.length} Lines
                  </div>
                </div>
                <div className="border-l border-white/10 pl-2 py-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">Est. Word Count</div>
                  <div className="text-xs font-mono text-neutral-350 font-semibold mt-0.5 block truncate">
                    {activeLyrics.reduce((count, line) => count + (line.text ? line.text.split(" ").filter(Boolean).length : 0), 0)} Words
                  </div>
                </div>
              </div>
            </div>

            {/* SOUND MODE CONTROLS */}
            <div className="bg-zinc-950/60 p-6 rounded-3xl border border-white/5 backdrop-blur-lg flex flex-col gap-6">
              
              {/* Category 1: Ambient Vibe Selectors */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#00D1FF] font-semibold mb-3 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3 h-3" />
                    1. Channel Atmosphere
                  </span>
                  <span className="text-[8px] opacity-60 font-mono bg-[#00D1FF]/10 text-[#00D1FF] px-1.5 py-0.5 rounded uppercase">Analog</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {(["dreamy", "melancholy", "hopeful", "neon"] as VibeType[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleVibeChange(v)}
                      className={`text-2xs font-semibold py-2 px-1 text-center rounded-xl border transition-all cursor-pointer capitalize ${
                        currentVibe === v
                          ? "bg-zinc-900 border-white/20 text-white shadow-md font-bold"
                          : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                      }`}
                      style={currentVibe === v ? { color: themeCustomizations[v].accent, textShadow: `0 0 10px ${themeCustomizations[v].glowColor}` } : {}}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                {/* Accent Color Customizer Picker */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center bg-transparent">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Custom Channel Tone</span>
                    <span className="text-[9px] font-mono capitalize" style={{ color: activeTheme.accent }}>
                      {currentVibe}: {activeTheme.accent}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-transparent">
                    <input
                      type="color"
                      aria-label={`${currentVibe} Palette Tone Color Picker`}
                      value={activeTheme.accent}
                      onChange={(e) => handleAccentColorChange(currentVibe, e.target.value)}
                      className="w-10 h-7 border-0 p-0 rounded-lg cursor-pointer bg-transparent"
                    />
                    <div className="flex flex-wrap gap-1 flex-1 justify-end">
                      {["#a855f7", "#3b82f6", "#10b981", "#f43f5e", "#f97316", "#eab308", "#00D1FF", "#ec4899"].map((presetColor) => (
                        <button
                          key={presetColor}
                          type="button"
                          onClick={() => handleAccentColorChange(currentVibe, presetColor)}
                          className="w-3.5 h-3.5 rounded-full border border-white/10 transition-transform active:scale-90 cursor-pointer"
                          style={{ backgroundColor: presetColor }}
                          title={`Preset ${presetColor}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2: Synth Customizers */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-indigo-400" />
                    2. Synth Properties
                  </span>
                </h3>

                {/* Oscillator Waves Choice */}
                <div>
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Core Waveform Shape</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["sine", "triangle", "square", "sawtooth"] as OscillatorType[]).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setSynthWaveform(shape)}
                        className={`py-1 text-[8px] font-mono rounded-lg border transition-all cursor-pointer capitalize ${
                          synthWaveform === shape
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-bold"
                            : "bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM Custom Tempo Slider */}
                <div>
                  <div className="flex justify-between text-2xs font-mono text-zinc-400 mb-1">
                    <span>Synthesizer Tempo</span>
                    <span className="text-zinc-300 font-bold">{activeBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="115"
                    step="1"
                    value={activeBpm}
                    aria-label="Synthesizer Tempo"
                    onChange={(e) => setActiveBpm(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 hover:accent-indigo-400 h-1 rounded-lg bg-zinc-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category 3: Sound overlays mixer */}
              <div className="border-t border-white/5 pt-4 space-y-3.5">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-mono flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  3. Decibel Sound Mixer
                </h3>

                {/* Synth Master level */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-450 mb-1">
                    <span>Acoustic Melody Synth</span>
                    <span>{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    aria-label="Synth Master Volume"
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-zinc-900 cursor-pointer"
                  />
                </div>

                {/* Rain ambient static level */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-450 mb-1">
                    <span>Rain Tape Hiss</span>
                    <span>{Math.round(rainVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={rainVolume}
                    aria-label="Rain Tape Hiss"
                    onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-zinc-900 cursor-pointer"
                  />
                </div>

                {/* Ocean Wind static level */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-450 mb-1">
                    <span>Ocean Shore Breeze</span>
                    <span>{Math.round(oceanVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={oceanVolume}
                    aria-label="Ocean Shore Breeze Volume"
                    onChange={(e) => setOceanVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-zinc-900 cursor-pointer"
                  />
                </div>

                {/* Vinyl Crackle static level */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-450 mb-1">
                    <span>Analog Vinyl Crackles</span>
                    <span>{Math.round(vinylVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={vinylVolume}
                    aria-label="Analog Vinyl Crackles Volume"
                    onChange={(e) => setVinylVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-zinc-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category 4: Binaural Cognitive Waves Deck */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-mono flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-rose-400" />
                    4. Binaural Beats Focus
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const finalActive = !isBinauralActive;
                      setIsBinauralActive(finalActive);
                      speakText(finalActive ? "Binaural mental focus wave is now activated." : "Binaural beat is deactivated.");
                    }}
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-lg border cursor-pointer transition-all ${
                      isBinauralActive
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]"
                        : "bg-zinc-900/40 border-white/5 text-zinc-500"
                    }`}
                  >
                    {isBinauralActive ? "Active" : "Off"}
                  </button>
                </div>

                {isBinauralActive && (
                  <div className="space-y-2.5 bg-zinc-950/40 p-2.5 rounded-2xl border border-white/5 animate-fadeIn">
                    {/* Choose cognitive state offset hz */}
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "Sleep", val: 4, desc: "4Hz (Delta)" },
                        { label: "Calm", val: 6, desc: "6Hz (Theta)" },
                        { label: "Learn", val: 10, desc: "10Hz (Alpha)" },
                        { label: "Focus", val: 15, desc: "15Hz (Beta)" }
                      ].map((preset) => (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => {
                            setBinauralOffset(preset.val);
                            speakText(`Tuned to ${preset.desc} wave.`);
                          }}
                          className={`py-1 rounded text-[8px] font-mono cursor-pointer border ${
                            binauralOffset === preset.val
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-300 font-semibold"
                              : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={preset.desc}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Binaural Vol control */}
                    <div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mb-0.5">
                        <span>Cognitive Signal Intensity</span>
                        <span>{Math.round(binauralVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={binauralVolume}
                        aria-label="Binaural Level"
                        onChange={(e) => setBinauralVolume(parseFloat(e.target.value))}
                        className="w-full accent-rose-500 h-1 rounded bg-zinc-900 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category 5: Sleep Auto-Shutdown countdown */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    5. Sleep Auto-Shutdown
                  </span>
                  {sleepSecondsLeft > 0 && (
                    <span className="text-[9px] text-[#00D1FF] font-bold animate-pulse bg-[#00D1FF]/5 border border-[#00D1FF]/10 px-1.5 py-0.5 rounded">
                      {Math.floor(sleepSecondsLeft / 60)}m {sleepSecondsLeft % 60}s left
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={sleepMinutes}
                    aria-label="Sleep Timer Selector"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSleepMinutes(val);
                      if (val > 0) {
                        speakText(`Set sleep timer to shut off playing in ${val} minutes.`);
                      } else {
                        speakText("Sleep shutdown timer disabled.");
                      }
                    }}
                    className="w-full bg-zinc-900 border border-white/5 text-xs text-zinc-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono cursor-pointer"
                  >
                    <option value={0}>Disabled (Continuous Streams)</option>
                    <option value={5}>5 Minutes Shutdown</option>
                    <option value={15}>15 Minutes Shutdown</option>
                    <option value={30}>30 Minutes Shutdown</option>
                    <option value={45}>45 Minutes Shutdown</option>
                    <option value={60}>60 Minutes (1 Hour Max)</option>
                  </select>
                </div>
              </div>

              {/* Category 6: Interactive Background Atmosphere Visuals */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#00D1FF] font-semibold font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    6. Ambient Visual Canvas
                  </span>
                  <span className="text-[8px] opacity-60 font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded uppercase">HQ Layer</span>
                </h3>
                
                {/* Visual state picker */}
                <div>
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Background Mode</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "off", label: "Off" },
                      { id: "static", label: "Static" },
                      { id: "animated", label: "Lively Zoom" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setVisualMode(mode.id as any);
                          speakText(`Atmospheric background set to ${mode.label} mode.`);
                        }}
                        className={`py-1 text-[9px] font-mono rounded-lg border transition-all cursor-pointer text-center ${
                          visualMode === mode.id
                            ? "bg-[#00D1FF]/10 border-[#00D1FF]/30 text-[#00D1FF] font-bold"
                            : "bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct tactile layer overwrites as requested for premium mood integrations */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Toggle Premium Visual Packs</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const val = !manualCampfire;
                        setManualCampfire(val);
                        speakText(val ? "Campfire cozy visual override activated." : "Campfire overlay deactivated.");
                      }}
                      className={`py-1.5 px-2 text-[9px] font-mono rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        manualCampfire
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold"
                          : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      <span className="text-2xs">🔥</span>
                      <span>Campfire Cozy {manualCampfire ? "On" : "Add"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !manualTrain;
                        setManualTrain(val);
                        speakText(val ? "Train ride scenic visual override activated." : "Train ride overlay deactivated.");
                      }}
                      className={`py-1.5 px-2 text-[9px] font-mono rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        manualTrain
                          ? "bg-[#00D1FF]/10 border-[#00D1FF]/30 text-[#00D1FF] font-semibold"
                          : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      <span className="text-2xs">🚂</span>
                      <span>Train Scenic {manualTrain ? "On" : "Add"}</span>
                    </button>
                  </div>
                </div>

                {/* Active Layer Indicators HUD display */}
                {visualMode !== "off" && (
                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Active Atmosphere Layers ({activeVisualLayers.length})</span>
                    {activeVisualLayers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {activeVisualLayers.map((l) => (
                          <span key={l.id} className="text-[8px] font-mono bg-zinc-900 border border-white/10 text-zinc-350 px-1.5 py-0.5 rounded capitalize flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            {l.id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[8px] font-mono text-zinc-650 block italic">Choose tracks, adjust mixer, or tap overlays above to launch scenery.</span>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* INDIAN VOCAL NARRATOR & GUIDE CONTROLS */}
            <div className="bg-zinc-950/60 p-5 rounded-3xl border border-white/5 backdrop-blur-lg flex flex-col gap-4">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#00D1FF] font-semibold mb-2 font-mono flex items-center gap-2">
                  <span className="text-sm">🇮🇳</span>
                  Vocal Signal Narrator
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-3">
                  Read live lyrics using high-fidelity Indian human narration synthesis.
                </p>

                {/* Vocal Guide Master Switch */}
                <button
                  type="button"
                  onClick={handleToggleVocalGuide}
                  className={`w-full py-2.5 px-3 rounded-xl border transition-all text-xs font-mono font-medium flex items-center justify-between cursor-pointer ${
                    isVocalGuideActive
                      ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isVocalGuideActive ? "bg-indigo-400 animate-pulse" : "bg-zinc-600"}`} />
                    Lyric Reader Mode
                  </span>
                  <span className="text-[10px] uppercase tracking-wider">
                    {isVocalGuideActive ? "Active" : "Disabled"}
                  </span>
                </button>
              </div>

              {/* Voice Choice & Pitch Tuning */}
              <div className="space-y-3 pt-1">
                <div>
                  <label htmlFor="voice-select" className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Indian Voice Accent
                  </label>
                  {voices.length > 0 ? (
                    <div className="relative">
                      <select
                        id="voice-select"
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      >
                        {voices.map((v) => (
                          <option key={v.name} value={v.name} className="bg-zinc-950 font-mono">
                            {v.name.replace(/Microsoft|Google|Apple|Natural/g, "").trim()} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-amber-500/85 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                        No built-in Indian voices registered. Using native system fallback. Try selecting an alternative voice below:
                      </div>
                      <select
                        id="fallback-voice-select"
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/11 text-xs text-zinc-350 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      >
                        {typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.getVoices().map((v) => (
                          <option key={v.name} value={v.name} className="bg-zinc-950 font-mono">
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quick Test Voice Audio trigger */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => speakText("Namaste. This is Midnight Signals. Listening to authentic Indian voice guiding signals.")}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-xs py-2 px-3 text-zinc-300 hover:text-white transition-all font-mono text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="text-2xs">🔊</span> Test Indian Accent
                  </button>
                  {isVocalGuideActive && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined" && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 p-2 text-2xs font-mono cursor-pointer"
                      title="Mute Speech"
                    >
                      Mute
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* QUICK SECTION JUMP BUTTONS */}
            <div className="hidden lg:flex flex-col bg-zinc-950/40 border border-white/5 rounded-2xl p-4">
              <h4 className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider mb-2">Lyric Sections</h4>
              <div className="grid grid-cols-1 gap-1">
                {lyricSections.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleLyricLineClick(s.time)}
                    className="text-left text-xs font-mono py-1 px-2 rounded hover:bg-white/5 transition-all text-zinc-400 hover:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{s.name}</span>
                    <span className="text-[9px] text-[#00D1FF]">{formatTime(s.time)}</span>
                  </button>
                ))}
              </div>
            </div>

          </section>

          {/* CENTER PANEL: Sky Canvas, Karaoke Lyric Display & Quick Seek Scrubber */}
          <section className="lg:col-span-6 flex flex-col gap-6 w-full order-1 lg:order-none">
            
            {/* STARRY COORDINATE CANVAS VISUALIZER */}
            <div className="bg-zinc-950/80 rounded-3xl border border-white/5 p-4 md:p-6 relative shadow-2xl overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#00D1FF] font-semibold font-mono flex items-center gap-1.5">
                    🛰️ Space Multiplex Visualizer
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Real-time orbit projection of signal coordinates & atmospheric frequency.
                  </p>
                </div>
              </div>
              <div className="w-full relative h-[140px] sm:h-[180px] md:h-[220px] rounded-2xl overflow-hidden bg-zinc-950 border border-white/5">
                <SignalCanvas
                  vibe={currentVibe}
                  currentTime={currentTime}
                  pulseTrigger={pulseEvent}
                  floatingSignals={floatingSignals}
                  addLocalSignal={addLocalSignal}
                  activeBpm={activeBpm}
                  isPlaying={isPlaying}
                  rainVolume={rainVolume}
                  isBirdsActive={natureSoundboardState.isPlaying && natureSoundboardState.activeChannels.birds}
                />
              </div>
            </div>

            {/* DYNAMIC SCROLLING LYRICS VIEWPORT OR CREATIVE LAB DASHBOARD */}
            <div className="bg-zinc-950/80 rounded-3xl border border-white/5 p-6 md:p-8 relative shadow-2xl flex flex-col gap-6">
              
              {/* Central control navigation tab layout */}
              <div className="flex border-b border-white/5 bg-zinc-950/30 p-1 rounded-2xl gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCenterTab("karaoke")}
                  className={`flex-1 py-2 text-2xs font-mono tracking-wider sm:tracking-widest uppercase text-center rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeCenterTab === "karaoke"
                      ? "text-white bg-zinc-900 border border-white/10 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Music className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00D1FF]" />
                  <span>Karaoke<span className="hidden sm:inline"> Scroller</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCenterTab("presets")}
                  className={`flex-1 py-2 text-2xs font-mono tracking-wider sm:tracking-widest uppercase text-center rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeCenterTab === "presets"
                      ? "text-white bg-zinc-900 border border-white/10 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00D1FF]" />
                  <span><span className="hidden sm:inline">Calm </span>Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCenterTab("submit")}
                  className={`flex-1 py-1 px-1 text-2xs font-mono tracking-wider sm:tracking-widest uppercase text-center rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeCenterTab === "submit"
                      ? "text-white bg-zinc-900 border border-white/10 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <RefreshCw className="w-3 h-3 text-[#00D1FF]" />
                  <span>Submit<span className="hidden sm:inline"> Song</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCenterTab("nature")}
                  className={`flex-1 py-1 px-1 text-2xs font-mono tracking-wider sm:tracking-widest uppercase text-center rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeCenterTab === "nature"
                      ? "text-white bg-zinc-900 border border-white/10 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Bird className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00D1FF]" />
                  <span>Nature<span className="hidden sm:inline"> Deck</span></span>
                </button>
              </div>

              {/* Tab 1: KARAOKE SCROLLER */}
              {activeCenterTab === "karaoke" && (
                <div className="space-y-4">
                  {/* Lyrics viewport header */}
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      Sync Stream // Playing: {activeSongTitle}
                    </span>
                    <label htmlFor="autoscroll-toggle" className="flex items-center gap-1.5 text-2xs font-mono text-zinc-400 cursor-pointer select-none">
                      <input
                        id="autoscroll-toggle"
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-700 accent-indigo-500 h-3 w-3 cursor-pointer"
                      />
                      Auto-Scroll Tracker
                    </label>
                  </div>

                  {/* Viewport content area */}
                  <div
                    ref={lyricsContainerRef}
                    className="lyrics-viewport relative h-[280px] md:h-[320px] overflow-y-auto overflow-x-hidden border border-zinc-900/60 rounded-2xl bg-zinc-950/40 p-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex flex-col items-center select-none"
                    style={{
                      maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
                    }}
                  >
                    <div className="h-[90px] shrink-0" />

                    {activeLyrics.map((line) => {
                      const isActive = activeLineId === line.id;
                      return (
                        <button
                          type="button"
                          key={line.id}
                          id={`lyric-line-${line.id}`}
                          onClick={() => handleLyricLineClick(line.time)}
                          className={`lyric-line font-serif py-3 text-center cursor-pointer transition-all duration-300 w-full px-4 rounded-xl hover:bg-white/5 leading-relaxed break-words outline-none select-none ${
                            isActive
                              ? "active text-white font-extrabold text-lg md:text-xl md:py-4 scale-[1.03] lyric-active-anim"
                              : "text-zinc-500 hover:text-zinc-300 text-sm md:text-base opacity-40 hover:opacity-80"
                          }`}
                          style={isActive ? {
                            color: "#ffffff",
                            textShadow: `0 0 15px ${activeTheme.accent}, 0 0 5px rgba(255,255,255,0.7)`
                          } : {}}
                        >
                          {line.text}
                          {isActive && (
                            <div className="text-[9px] font-mono tracking-widest text-[#00D1FF] uppercase font-medium mt-1 select-none pointer-events-none">
                              // SECTION: {line.section}
                            </div>
                          )}
                        </button>
                      );
                    })}

                    <div className="h-[100px] shrink-0" />
                  </div>

                  <div className="text-center text-[10px] font-mono text-zinc-500">
                    Tip: Click any lyric line to jump the lo-fi synthesizer directly to that moment.
                  </div>
                </div>
              )}

              {/* Tab 2: 100 CALM PRESETS EXPLORER */}
              {activeCenterTab === "presets" && (
                <div className="space-y-4 text-left">
                  <div className="pb-2 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#00D1FF] font-semibold block">
                        Atmospheric Presets & Signals
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">
                        Load sound mixes, save locally, or generate custom share links.
                      </span>
                    </div>

                    {/* Sub tabs: Curated, Favorites, Recents, Share */}
                    <div className="flex bg-zinc-950/50 p-1 rounded-xl gap-0.5 border border-white/5 self-start md:self-auto shrink-0 select-none">
                      {[
                        { id: "all", label: "Curated" },
                        { id: "favorites", label: "Favorites" },
                        { id: "recents", label: "Recents" },
                        { id: "share", label: "Share Mix" }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setPresetsSubTab(sub.id as any)}
                          className={`px-2.5 py-1 text-[8.5px] font-mono uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                            presetsSubTab === sub.id
                              ? "bg-indigo-500/10 text-[#00D1FF] border border-[#00D1FF]/25 font-bold"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-tab: ALL CURATED PRESETS */}
                  {presetsSubTab === "all" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto scrollbar-thin p-1">
                      {calmLofiPresets.map((preset, index) => {
                        const isSelected = selectedPresetIndex === index;
                        return (
                          <div
                            key={preset.name}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 text-left ${
                              isSelected
                                ? "bg-[#00D1FF]/5 border-[#00D1FF]/40 shadow-[0_0_15px_rgba(0,209,255,0.05)]"
                                : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white font-serif">{preset.name}</h4>
                                <span
                                  className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                                  style={{
                                    background: `rgba(0, 209, 255, 0.1)`,
                                    color: "#00D1FF"
                                  }}
                                >
                                  {preset.vibe}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-sans">
                                {preset.description}
                              </p>
                              
                              {/* Preview area of first 3 lyrics */}
                              <div className="mt-2.5 text-[10px] text-zinc-500 font-serif italic border-l border-white/5 pl-2.5 space-y-0.5 max-h-[52px] overflow-hidden">
                                {preset.lines.slice(0, 3).map((l, lIdx) => (
                                  <div key={lIdx} className="truncate">&ldquo;{l}&rdquo;</div>
                                ))}
                                {preset.lines.length > 3 && <div className="text-[8px] font-mono text-zinc-650 mt-1">// + {preset.lines.length - 3} more relaxed lines</div>}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => loadPresetLyrics(index)}
                              className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-mono py-2 hover:text-white transition-all text-center cursor-pointer font-semibold block"
                            >
                              Activate Preset ({preset.lines.length} lines)
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tab: MY LOCAL FAVORITES */}
                  {presetsSubTab === "favorites" && (
                    <div className="space-y-4">
                      {/* Save current atmosphere card controller */}
                      <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-left space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-serif">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            Save Current Ambiance
                          </h4>
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                            Saves all your current volumes, BPM, vibe aesthetic, active nature sounds, and custom lyrics locally.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Dreamy Rain & Ocean Waves"
                            value={favoriteNameInput}
                            onChange={(e) => setFavoriteNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveToFavorites(favoriteNameInput);
                              }
                            }}
                            className="flex-1 bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => saveToFavorites(favoriteNameInput)}
                            className="bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30 hover:border-[#00D1FF]/50 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      </div>

                      {/* Favorites List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto scrollbar-thin p-1">
                        {favorites.length > 0 ? (
                          favorites.map((fav) => {
                            const shareUrl = generateShareUrl(fav.name);
                            return (
                              <div
                                key={fav.id}
                                className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:border-white/10 transition-all"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className="text-xs font-bold text-white truncate max-w-[80%] font-serif">
                                      {fav.name}
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={(e) => deleteFavorite(fav.id, e)}
                                      className="text-zinc-650 hover:text-rose-400 p-1 rounded-lg transition-all cursor-pointer"
                                      title="Delete favorite"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded capitalize">
                                      {fav.config.vibe}
                                    </span>
                                    <span className="text-[8px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded">
                                      {fav.config.bpm} BPM
                                    </span>
                                    {fav.config.isBinauralActive && (
                                      <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                                        🧠 Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-zinc-500 truncate mt-1">
                                    Track: {fav.config.songTitle} • Rain {Math.round(fav.config.rainVolume*100)}%
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => loadSavedPreset(fav.config)}
                                    className="bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-lg text-[9px] font-mono py-1.5 cursor-pointer text-center transition-all font-semibold"
                                  >
                                    Load Mix
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(shareUrl, `Share link for '${fav.name}' copied!`)}
                                    className="bg-indigo-500/5 hover:bg-indigo-500/10 border border-[#00D1FF]/10 text-[#00D1FF] rounded-lg text-[9px] font-mono py-1.5 cursor-pointer text-center transition-all flex items-center justify-center gap-1"
                                  >
                                    <Share2 className="w-2.5 h-2.5" />
                                    Share Link
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-1 md:col-span-2 py-8 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-zinc-950/20">
                            <Heart className="w-5 h-5 text-zinc-650 animate-pulse animate-subtle-breathing" />
                            <span className="text-xs font-mono">No favorites yet</span>
                            <span className="text-[9px] text-zinc-650 max-w-[80%] mx-auto block leading-relaxed">
                              Dial inside the sliders & nature boards, then insert a name above to bookmark your setup!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab: RECENTS */}
                  {presetsSubTab === "recents" && (
                    <div className="space-y-3">
                      <div className="text-left text-zinc-500 font-mono text-[9px]">
                        Last 5 sound sessions played, saved automatically to your local browser storage.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto scrollbar-thin p-1">
                        {recents.length > 0 ? (
                          recents.map((rec) => {
                            const dateStr = new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                              <div
                                key={rec.id}
                                className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col justify-between gap-2.5 text-left hover:border-white/10 transition-all cursor-pointer"
                                onClick={() => loadSavedPreset(rec.config)}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-indigo-300 truncate max-w-[70%] font-serif">{rec.name}</h5>
                                    <span className="text-[7.5px] text-zinc-600 font-mono italic">{dateStr}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-[8px] font-mono bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded capitalize">
                                      {rec.config.vibe}
                                    </span>
                                    <span className="text-[8px] font-mono bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded">
                                      Rain {Math.round(rec.config.rainVolume*100)}%
                                    </span>
                                    {rec.config.isBinauralActive && (
                                      <span className="text-[8px] font-mono bg-teal-500/5 text-teal-400 px-1 rounded animate-pulse">
                                        Binaural
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-[9px] font-mono py-1 cursor-pointer font-medium transition-all"
                                >
                                  Instantly Re-Tune Ambiance
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-1 md:col-span-2 py-8 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 bg-zinc-950/20">
                            <Clock className="w-5 h-5 text-zinc-650" />
                            <span className="text-xs font-mono">No recent signals recorded</span>
                            <span className="text-[9px] text-zinc-650 max-w-[80%] block leading-relaxed">
                              Any soundscape preset or custom loaded shared state will automatically check-in here.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab: SHARE PORTABLE MIX */}
                  {presetsSubTab === "share" && (
                    <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl text-left space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-serif">
                          <Share2 className="w-3.5 h-3.5 text-[#00D1FF]" />
                          Create Permanent Share Link
                        </h4>
                        <p className="text-[9.5px] text-zinc-400 mt-1 leading-relaxed">
                          No databases or login required. Generate a custom URL for your friends. When they load it, their local browser synthesizer matches your current levels, tempo, and nature tracks automatically!
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                        <div className="text-[10px] text-indigo-300 font-mono truncate select-all flex-1 pr-2">
                          {generateShareUrl()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(generateShareUrl(), "General share link copied!")}
                          className={`px-3 py-1.5 rounded-lg text-[9.5px] font-mono font-bold cursor-pointer transition-all duration-300 flex items-center gap-1 shrink-0 ${
                            copySuccess
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/30 hover:bg-[#00D1FF]/20"
                          }`}
                        >
                          <Clipboard className="w-3 h-3" />
                          {copySuccess ? "Copied!" : "Copy URL"}
                        </button>
                      </div>

                      {/* Display of current settings included in links */}
                      <div className="text-[8.5px] font-mono text-zinc-550 border-t border-white/5 pt-3.5 space-y-1">
                        <div className="uppercase tracking-widest text-zinc-500 mb-1 font-bold">Metadata Packet included:</div>
                        <div>• Active Vibe Mode: <span className="text-zinc-450 uppercase">{currentVibe}</span></div>
                        <div>• Sliders: <span className="text-zinc-450">Rain {Math.round(rainVolume*100)}% | Ocean {Math.round(oceanVolume*100)}% | Vinyl {Math.round(vinylVolume*100)}%</span></div>
                        <div>• Pitch / Cognitive waves: <span className="text-zinc-450">{isBinauralActive ? `Active (${binauralOffset}Hz offset)` : "Off"}</span></div>
                        <div>• Nature soundboard: <span className="text-zinc-450">
                          {Object.keys(natureSoundboardState.activeChannels)
                            .filter(ch => natureSoundboardState.activeChannels[ch as keyof typeof natureSoundboardState.activeChannels])
                            .join(", ") || "None"}
                        </span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: SUBMIT CUSTOM SONG WRITER */}
              {activeCenterTab === "submit" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/5 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00D1FF] font-semibold block">
                      Submit Your Own Lyrics
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">
                      Write or paste your custom song. We will space lines perfectly across the track's duration.
                    </span>
                  </div>

                  <form onSubmit={handleCompileCustomLyrics} className="space-y-3.5 text-left">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="custom-title-input" className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                          Song Title
                        </label>
                        <input
                          id="custom-title-input"
                          type="text"
                          required
                          placeholder="e.g., Autumn Rain"
                          value={customTitleInput}
                          onChange={(e) => setCustomTitleInput(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor="custom-artist-input" className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                          Artist Name / Vibe
                        </label>
                        <input
                          id="custom-artist-input"
                          type="text"
                          required
                          placeholder="e.g., Chill Traveler"
                          value={customArtistInput}
                          onChange={(e) => setCustomArtistInput(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="custom-lyrics-textarea" className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        Song Lyric Lines (One line per verse)
                      </label>
                      <textarea
                        id="custom-lyrics-textarea"
                        required
                        rows={5}
                        placeholder={`Breathe in the evening breeze&#10;Underneath the greenwood trees&#10;Letting go of stressful thoughts&#10;Finding peace in secret spots...`}
                        value={customLyricsText}
                        onChange={(e) => setCustomLyricsText(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 text-xs text-zinc-100 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-sans placeholder-zinc-650 resize-none h-[110px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!customLyricsText.trim()}
                      className="w-full bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20 border border-[#00D1FF]/20 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 py-2.5 rounded-xl text-xs font-mono font-bold transition-all hover:shadow-[0_0_15px_rgba(0,209,255,0.1)] cursor-pointer"
                    >
                      Publish & Sync Lyrics
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: NATURE SOUNDBOARD */}
              {activeCenterTab === "nature" && (
                <div className="animate-fadeIn">
                  <NatureSoundboard />
                </div>
              )}

            </div>

          </section>

          {/* RIGHT SIDEBAR: Spectrum indicator and AI Echo terminal logs */}
          <section className={`
            lg:col-span-3 flex-col gap-6 w-full lg:order-none lg:flex
            ${showEchoTerminal 
              ? "fixed inset-y-0 right-0 z-50 w-[85%] sm:w-full sm:max-w-xs bg-[#09090e]/98 border-l border-white/10 p-5 md:p-6 overflow-y-auto shadow-2xl flex" 
              : "hidden"
            }
          `}>
            {/* Draw Mobile Header / Close Button */}
            <div className="flex items-center justify-between lg:hidden mb-2">
              <span className="text-[10px] uppercase font-mono text-zinc-550 font-bold tracking-widest">// Signal Echo Terminal</span>
              <button 
                onClick={() => setShowEchoTerminal(false)}
                className="py-1 px-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-[9px] font-mono text-zinc-450 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Close ×
              </button>
            </div>
            
            {/* SPECTRAL WAVEFORM METERS */}
            <div className="bg-zinc-950/60 p-5 rounded-3xl border border-white/5 backdrop-blur-lg flex flex-col justify-between">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 font-mono">React Waveform</dt>
                
                <div className="visualizer flex items-end justify-between h-[80px] w-full px-2 gap-1.5">
                  {visualizerHeights.map((h, i) => (
                    <div
                      key={i}
                      className="bar active flex-1 rounded-t-md transition-all duration-75"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgba(99, 102, 241, 0.25), ${activeTheme.accent})`,
                        boxShadow: `0 0 12px ${activeTheme.glowColor}`
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-4 pt-4 border-t border-white/5">
                <span>Sector 7 / Neon</span>
                <span className="text-[#00D1FF]">Pulse Rate: BPM-{synthRef.current ? "75" : "00"}</span>
              </div>
            </div>

            {/* MIDNIGHT ECHO TERMINAL */}
            <div className="bg-zinc-950/80 rounded-3xl border border-white/5 overflow-hidden flex flex-col">
              
              {/* Tab Header */}
              <div className="flex border-b border-white/5 bg-zinc-950/40">
                <button
                  onClick={() => setActiveEchoTab("compose")}
                  className={`flex-1 py-3 text-2xs font-mono tracking-widest uppercase text-center border-r border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeEchoTab === "compose"
                      ? "text-white bg-zinc-900 border-b-2 border-indigo-500"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Send Echo
                </button>
                <button
                  onClick={() => setActiveEchoTab("history")}
                  className={`flex-1 py-3 text-2xs font-mono tracking-widest uppercase text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeEchoTab === "history"
                      ? "text-white bg-zinc-900 border-b-2 border-indigo-500"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <History className="w-3 h-3" />
                  Echo Log ({echoHistory.length})
                </button>
              </div>

              {/* Compose message tab */}
              {activeEchoTab === "compose" && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-white tracking-wide">
                      Unsent Thoughts Signal Echo
                    </h3>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Compose an unsent text or nostalgic message. Submit to launch a wave through our station to the Gemini receiver.
                    </p>
                  </div>

                  <form onSubmit={handleSendEchoMessage} className="space-y-3">
                    <textarea
                      id="unsent-secret-textarea"
                      placeholder="e.g., I still look for your car at the midnight red light..."
                      value={unsentMessageInput}
                      onChange={(e) => setUnsentMessageInput(e.target.value)}
                      maxLength={180}
                      rows={3}
                      className="w-full bg-zinc-900/60 text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-all font-sans placeholder-zinc-500 resize-none"
                    />
                    
                    <button
                      id="submit-echo-btn"
                      type="submit"
                      disabled={isSendingEcho || !unsentMessageInput.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSendingEcho ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Phasing Signals...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Transmit Unsent Message
                        </>
                      )}
                    </button>
                  </form>
                  
                  {/* Signal Exporter and downloadable postcard studio for poets */}
                  <SignalExporter 
                    currentSignalText={echoHistory.length > 0 ? echoHistory[0].userMessage : ""}
                    currentResponseText={echoHistory.length > 0 ? echoHistory[0].reply : ""}
                  />

                  {/* Signal Gallery Feed for trending broadcasts */}
                  <div className="border-t border-white/5 pt-3.5 space-y-1">
                    <SignalGallery onTuneIn={(text, response, vibe) => {
                      setUnsentMessageInput(text);
                      setCurrentVibe(vibe);
                      
                      const tunedEcho: EchoItem = {
                        id: `gal-tune-${Date.now()}`,
                        userMessage: text,
                        reply: response,
                        verse: "Transmitted across public stellar channels.",
                        vibe: vibe,
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setEchoHistory(prev => [tunedEcho, ...prev]);
                      speakText(`Tuned in to global signal broadcast: ${response}`);
                    }} />
                  </div>
                </div>
              )}

              {/* Echo History logs tab */}
              {activeEchoTab === "history" && (
                <div className="p-4 flex flex-col gap-3.5">
                  
                  {/* SEARCH CONTROL BAR WITH DEEPER FILTERS */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter logs by keywords, dates, or vibes..."
                      value={echoSearchQuery}
                      onChange={(e) => setEchoSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-white/5 text-2xs text-zinc-150 placeholder-zinc-500 pl-8 pr-12 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
                    {echoSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEchoSearchQuery("")}
                        className="absolute right-2.5 top-1.5 px-1.5 py-0.5 text-[9px] font-mono hover:text-[#00D1FF] text-zinc-400 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all cursor-pointer"
                        title="Clear filters"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {(() => {
                      const query = echoSearchQuery.toLowerCase().trim();
                      const filtered = echoHistory.filter((item) => {
                        if (!query) return true;
                        return (
                          item.userMessage.toLowerCase().includes(query) ||
                          item.reply.toLowerCase().includes(query) ||
                          item.verse.toLowerCase().includes(query) ||
                          item.vibe.toLowerCase().includes(query) ||
                          item.timestamp.toLowerCase().includes(query)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-8 text-zinc-500 font-mono text-2xs uppercase">
                            No signals matched &quot;{echoSearchQuery}&quot;
                          </div>
                        );
                      }

                      return filtered.map((item) => (
                        <div
                          key={item.id}
                          className="bg-zinc-950 p-4 rounded-2xl border border-white/5 relative flex flex-col gap-3 font-sans animate-fadeIn"
                        >
                          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                            <span className="capitalize" style={{ color: themeCustomizations[item.vibe as VibeType]?.accent || "#a855f7" }}>{item.vibe} Signal</span>
                            <span>{item.timestamp}</span>
                          </div>

                          <div>
                            <p className="text-[9px] text-zinc-400 italic font-mono mb-1">
                              Your Signal:
                            </p>
                            <p className="text-zinc-300 text-xs pl-2 border-l border-white/10 leading-relaxed font-sans mb-3">
                              &ldquo;{item.userMessage}&rdquo;
                            </p>
                          </div>

                          <div className="bg-zinc-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-zinc-950/40 px-2.5 py-1.5 rounded-lg border border-white/5 mb-1.5">
                              <div className="flex items-center gap-1 bg-transparent">
                                <Sparkles className="w-2.5 h-2.5 text-[#00D1FF] animate-pulse" />
                                <span className="text-[9px] font-mono text-[#00D1FF] uppercase tracking-wider">
                                  Echo From Another Star
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => speakText(`${item.reply}. Here is the custom verse: ${item.verse}`)}
                                className="text-[9px] font-mono text-[#00D1FF] hover:text-[#00D1FF]/80 transition-all font-semibold cursor-pointer py-0.5 px-2 rounded bg-[#00D1FF]/5 hover:bg-[#00D1FF]/10 flex items-center gap-1"
                                title="Listen inside Indian voice narration"
                              >
                                🔊 Narrate Echo
                              </button>
                            </div>
                            <p className="text-zinc-200 text-2xs leading-relaxed font-sans px-1">
                              {item.reply}
                            </p>
                            
                            <div className="mt-2.5 pt-2.5 border-t border-white/5">
                              <p className="text-[9px] font-mono text-zinc-500 uppercase mb-1">
                                Synthesized Custom Verse:
                              </p>
                              <p className="text-white text-3xs font-serif leading-normal italic whitespace-pre-line tracking-tight px-1 py-0.5 rounded">
                                {item.verse}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

            </div>

          </section>

        </main>
        )}



        {/* Visualizer moved to center body per user request */}

        {/* REGULATORY ADMINISTRATIVE & HIGH-IMPACT SEO LINKS BAR */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4 pb-12 text-3xs font-mono uppercase tracking-widest text-zinc-500 z-25 relative border-t border-white/5 pt-5 max-w-4xl mx-auto">
          <button type="button" onClick={() => setActiveLegalTab("about")} className="hover:text-white transition-colors cursor-pointer outline-none">
            ℹ️ About Us
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("privacy")} className="hover:text-white transition-colors cursor-pointer outline-none">
            🛡️ Privacy Policy
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("cookie")} className="hover:text-white transition-colors cursor-pointer outline-none">
            🍪 Cookie Policy
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("terms")} className="hover:text-white transition-colors cursor-pointer outline-none">
            ⚖️ Terms of Service
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("contact")} className="hover:text-white transition-colors cursor-pointer outline-none">
            📨 Contact & Support
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("disclaimer")} className="hover:text-white transition-colors cursor-pointer outline-none">
            ⚠️ Disclaimers
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("dmca")} className="hover:text-white transition-colors cursor-pointer outline-none">
            ⚖️ DMCA Copyright
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("accessibility")} className="hover:text-white transition-colors cursor-pointer outline-none">
            ♿ Accessibility
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("security")} className="hover:text-white transition-colors cursor-pointer outline-none">
            🔒 Security
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => setActiveLegalTab("founder")} className="hover:text-amber-400 font-bold text-amber-400/80 transition-colors cursor-pointer outline-none">
            🧢 Founder Ajim Patel
          </button>
          <span className="text-zinc-800 select-none">•</span>
          <button type="button" onClick={() => { setActiveLegalTab("pro"); setActivePolicyTab("pro"); }} className="hover:text-[#00D1FF] text-xs font-bold text-[#00D1FF]/90 transition-colors cursor-pointer outline-none flex items-center gap-1">
            ✨ Cosmic Features (Free)
          </button>
        </div>

        {/* COMPREHENSIVE REGULATORY MODAL DRAWER FOR MONETIZATION & SEO COMPLIANCE */}
        {activeLegalTab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0c0c10] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Modal Header */}
              <div className="border-b border-white/10 px-6 py-4.5 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">🛡️</span>
                  <h3 className="text-xs font-mono tracking-wider uppercase text-white font-black">
                    Midnight Signals // Trust, Legal & License Portal
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLegalTab(null)}
                  className="text-2xs font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/5"
                >
                  ESC [X]
                </button>
              </div>

              {/* Multi-Tab Sidebar Grid Layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Horizontal / Sidebar Tabs list */}
                <div className="w-full md:w-56 bg-zinc-950 border-r border-white/5 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto scrollbar-none p-2.5 gap-1 shrink-0">
                  <p className="hidden md:block text-[8px] uppercase tracking-widest text-zinc-600 font-mono pl-3 py-1.5 font-bold">Main Portals</p>
                  
                  {[
                    { id: "about", label: "ℹ️ About & Hardware", desc: "How it works" },
                    { id: "privacy", label: "🛡️ Privacy Policies", desc: "Sovereignty" },
                    { id: "cookie", label: "🍪 Cookie Policy", desc: "GDPR compliance" },
                    { id: "terms", label: "⚖️ Terms of License", desc: "Royalty rules" },
                    { id: "contact", label: "📨 Support Hub", desc: "Direct support email" },
                    { id: "founder", label: "🧢 Founder Profile", desc: "Meet Ajim Patel" },
                    { id: "pro", label: "✨ Unlocked Pro", desc: "100% Free premium features" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveLegalTab(tab.id);
                        if (tab.id === "cookie" || tab.id === "pro") {
                          setActivePolicyTab(tab.id === "cookie" ? "cookie-policy" : "pro");
                        }
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-0.5 shrink-0 select-none ${
                        activeLegalTab === tab.id
                          ? "bg-indigo-500/10 border border-indigo-400/35 text-indigo-300 font-bold"
                          : "bg-transparent border border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-[10px] font-mono whitespace-nowrap">{tab.label}</span>
                      <span className="hidden md:block text-[8px] text-zinc-500 font-sans tracking-normal font-normal">{tab.desc}</span>
                    </button>
                  ))}

                  <p className="hidden md:block text-[8px] uppercase tracking-widest text-zinc-600 font-mono pl-3 py-1.5 font-bold mt-2">Compliance Nodes</p>
                  {[
                    { id: "disclaimer", label: "⚠️ Disclaimers", desc: "Clinical advice" },
                    { id: "dmca", label: "⚖️ DMCA Takedowns", desc: "Lyric reporting" },
                    { id: "accessibility", label: "♿ Special Accessibility", desc: "Contrast & size" },
                    { id: "security", label: "🔒 Encryption Details", desc: "SHA-256 vaulting" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveLegalTab(tab.id);
                        if (tab.id === "disclaimer") setActivePolicyTab("disclaimer");
                        if (tab.id === "dmca") setActivePolicyTab("dmca");
                        if (tab.id === "accessibility") setActivePolicyTab("accessibility");
                        if (tab.id === "security") setActivePolicyTab("security-audit");
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-0.5 shrink-0 select-none ${
                        activeLegalTab === tab.id
                          ? "bg-indigo-500/10 border border-indigo-400/35 text-indigo-300 font-bold"
                          : "bg-transparent border border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-[10px] font-mono whitespace-nowrap">{tab.label}</span>
                      <span className="hidden md:block text-[8px] text-zinc-500 font-sans tracking-normal font-normal">{tab.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Context Container */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin text-zinc-300 font-sans text-xs space-y-4">
                  
                  {/* ABOUT COMPONENT */}
                  {activeLegalTab === "about" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">ℹ️ Station Infrastructure & Mechanics</h4>
                      <p>
                        Midnight Signals is a high-grade meditative dark ambient lo-fi music synthesizer and live lyrics synchronizer designed by software engineer <b>Ajim Patel</b>.
                      </p>
                      <p>
                        Whether you are a deep-session developer routing logs, a creative author drafting late-night novels, or a restless soul searcher listening to the rain static, our platform provides immersive acoustic backdrops completely offline-first.
                      </p>
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 font-mono text-[10px] space-y-2.5">
                        <span className="text-[#00D1FF] font-bold block uppercase tracking-widest">⚙️ AIRFLOW CORE ENGINEERING VECTORS</span>
                        <p>• Procedural Waveforms: Standard Web Audio oscillators prevent server load while producing pristine non-looped melodic paths.</p>
                        <p>• Graphic Coordinate Echoes: 2D Canvas monitors client interaction coordinates live to drive responsive reactive starlight visualizers.</p>
                        <p>• Dialect Vocal Guides: Interactive synthesis interfaces with local speech synthesizers to vocalize lyrics on focus cue.</p>
                      </div>

                      {/* Donation section directly linked */}
                      <DonationSection />
                    </div>
                  )}

                  {/* PRIVACY POLICY */}
                  {activeLegalTab === "privacy" && (
                    <div className="space-y-4 text-left">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">🛡️ Privacy Policy & GDPR Integrity Statements</h4>
                      <p className="text-zinc-550 italic font-mono text-[9px]">Document Reference: MS-2026-GDPR-V1 • Updated May 31, 2026</p>
                      <p>
                        Your cognitive privacy remains completely safe. Unlike contemporary marketing applications, we do not deploy data-hungry telemetry trackers, cookie bridges or remote analytic scraping nodes.
                      </p>
                      <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-2 text-[11px]">
                        <p className="font-bold text-white font-mono text-[10px] uppercase">🔓 DATA EXPOSURE COEFFICIENT: 0.0%</p>
                        <p>• We do not upload your custom songwriter lyrics, custom titles, or sleep session histories and static timer controls.</p>
                        <p>• All text-to-speech rendering, interactive oscillator notes, and floating starry coordinates are compiled inside the sandbox scope of your browser's processor.</p>
                      </div>
                      <p>
                        Under GDPR and California Consumer Protections, you hold absolute sovereignty. Clearing site memories and cookie storages completely purges any local presets.
                      </p>
                    </div>
                  )}

                  {/* SEPARATE COOKIE POLICY TABS */}
                  {activeLegalTab === "cookie" && (
                    <AdditionalPolicies activePolicyTab="cookie-policy" setActivePolicyTab={setActivePolicyTab} />
                  )}

                  {/* TERMS OF LICENSE */}
                  {activeLegalTab === "terms" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">⚖️ License Agreement & Content Rights</h4>
                      <p>
                        By launching the Midnight Signals application, you accept our royalty rights and creative licensing conditions:
                      </p>
                      <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl font-mono text-[10px] space-y-2.5">
                        <span className="text-emerald-400 font-bold block">🎵 100% ROYALTY-FREE ACOUSTIC CLEARANCE</span>
                        <p>All real-time procedural synthesizers, lofi tracks, binaural focus pulses, and interactive bird chirps are completely royalty-free.</p>
                        <p>You are authorized to broadcast, record, reuse, or sync the synthesized sound streams for your YouTube relax feeds, Spotify background playlists, podcast stems, or developer livestreams without attribution requirements.</p>
                      </div>
                      <p>
                        Please treat other listeners with respect. Typed lyrics or coordinates signals submitted to our canvas must remain lawful.
                      </p>
                    </div>
                  )}

                  {/* CONTACT US FEED */}
                  {activeLegalTab === "contact" && (
                    <ContactHub />
                  )}

                  {/* FOUNDER PROFILE PROFILE CARD */}
                  {activeLegalTab === "founder" && (
                    <FounderCard />
                  )}

                  {/* PRO PREMIUM MEMBERSHIP AND BILLING */}
                  {activeLegalTab === "pro" && (
                    <PremiumUpgrade 
                      userTier={activeAccount ? activeAccount.tier : "Unlimited Free"}
                      onUpgrade={(plan) => {
                        const updatedAcc: ClientAccount = {
                          username: activeAccount ? activeAccount.username : "Guest Listener",
                          email: activeAccount ? activeAccount.email : "guest@midnight.com",
                          tier: plan === "pro" ? "Midnight Signals Pro 🚀" : "Unlimited Free",
                          savedCount: activeAccount ? activeAccount.savedCount + 1 : 10,
                          presetsSelected: activeAccount ? activeAccount.presetsSelected + 1 : 4
                        };
                        setActiveAccount(updatedAcc);
                        localStorage.setItem("midnight-signals-user", JSON.stringify(updatedAcc));
                        speakText("Congratulations! Your Midnight Signals Pro Sandbox License is now active!");
                      }}
                    />
                  )}

                  {/* COMPLIANCE PAGES AND DYNAMIC ACCESSIBILITY PANELS */}
                  {["disclaimer", "dmca", "accessibility", "security"].includes(activeLegalTab) && (
                    <AdditionalPolicies activePolicyTab={activePolicyTab} setActivePolicyTab={setActivePolicyTab} />
                  )}

                </div>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between bg-zinc-950 font-mono text-[9px] text-zinc-550">
                <span className="uppercase">Platform Auth: Ajim Patel verified</span>
                <button
                  type="button"
                  onClick={() => setActiveLegalTab(null)}
                  className="px-4 py-1.5 rounded-xl text-xs bg-zinc-900 border border-white/15 text-white hover:bg-zinc-800 transition-colors cursor-pointer outline-none font-sans font-bold"
                >
                  Close Portal
                </button>
              </div>

            </div>
          </div>
        )}

        {/* COOKIE PRIVACY CONSENT BANNER */}
        <CookieConsent onSave={(prefs) => console.log("Cookies preferences loaded:", prefs)} />

        {/* Mobile Sidebar backdrop */}
        {(showSoundConsole || showEchoTerminal) && (
          <div 
            className="fixed inset-0 z-45 bg-black/60 backdrop-blur-[2px] lg:hidden"
            onClick={() => {
              setShowSoundConsole(false);
              setShowEchoTerminal(false);
            }}
          />
        )}

      </div>
    </div>
  );
}
