import React, { useState, useEffect, useRef } from "react";
import { 
  Bird, 
  Trees, 
  Waves, 
  Timer, 
  Sparkles, 
  Volume2, 
  Moon, 
  VolumeX, 
  HelpCircle,
  Play,
  Pause,
  CloudRain,
  Compass
} from "lucide-react";
import { NatureSynth } from "../lib/natureSynth";
import { BIRD_CATEGORIES, BIRD_PRESETS, BirdPreset } from "../lib/birdPresets";

interface SoundboardNotifier {
  id: string;
  senderName: string;
  icon: string;
  text: string;
  time: string;
}

export default function NatureSoundboard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuide, setShowGuide] = useState<boolean>(true); // Let it default to open so they can see this beautiful new directory right away!
  const [activeGuideTab, setActiveGuideTab] = useState<string>("mixes");
  
  // Custom states matching NatureSynth volumes and active states
  const [activeChannels, setActiveChannels] = useState<{ [key: string]: boolean }>({
    birds: true,
    owl: false,
    trees: true,
    ocean: false,
    crickets: true,
    mountainWind: false,
    brook: false,
    desertBreeze: false,
    morningMist: false,
    caveEchoes: false,
  });

  // Synchronize Nature active states to global ambient layers
  useEffect(() => {
    const soundUpdateEvent = new CustomEvent("nature-soundboard-state", {
      detail: {
        activeChannels,
        isPlaying,
      }
    });
    window.dispatchEvent(soundUpdateEvent);
  }, [activeChannels, isPlaying]);

  const [channelVolumes, setChannelVolumes] = useState<{ [key: string]: number }>({
    birds: 0.5,
    owl: 0.45,
    trees: 0.35,
    ocean: 0.3,
    crickets: 0.25,
    mountainWind: 0.4,
    brook: 0.45,
    desertBreeze: 0.35,
    morningMist: 0.3,
    caveEchoes: 0.4,
  });

  // Chosen bird sound preset for clicking the Bird Icon play buttons
  const [favBirdType, setFavBirdType] = useState<string>("nightingale");
  const [activeBirdCategory, setActiveBirdCategory] = useState<string>("lofi");
  const [birdSearchQuery, setBirdSearchQuery] = useState<string>("");

  // Sleep Loop Timer selection (minutes)
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null); // null = infinite continuous play
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number>(0);
  const [customTimerInput, setCustomTimerInput] = useState<string>("15");

  // Floating notifications logging live procedurally triggered sounds
  const [soundLogs, setSoundLogs] = useState<SoundboardNotifier[]>([]);

  // Sound Engine Instance
  const synthRef = useRef<NatureSynth | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Lazy-initialize NatureSynth safely on mount
    const synthInstance = new NatureSynth();
    synthRef.current = synthInstance;

    // Apply default loaded configurations
    Object.keys(activeChannels).forEach((ch) => {
      synthInstance.toggleChannel(ch, activeChannels[ch]);
      synthInstance.setVolume(ch, channelVolumes[ch]);
    });

    synthInstance.registerCallbacks((soundName, icon, description) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newLog: SoundboardNotifier = {
        id: Math.random().toString(36).substring(2, 9),
        senderName: soundName,
        icon: icon,
        text: description,
        time: timeString,
      };

      setSoundLogs((prev) => [newLog, ...prev.slice(0, 5)]);

      // Dispatch nature sound trigger event for the Canvas visualizer
      let category = "bird";
      if (soundName.toLowerCase().includes("owl")) {
        category = "owl";
      } else if (soundName.toLowerCase().includes("cricket")) {
        category = "cricket";
      }
      
      const soundEvent = new CustomEvent("nature-sound-trigger", {
        detail: {
          type: category,
          name: soundName,
          icon: icon,
          description: description,
          intensity: category === "owl" ? 0.95 : category === "bird" ? 0.75 : 0.5
        }
      });
      window.dispatchEvent(soundEvent);
    });

    const handleLaunchSEOPreset = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { activeChannels: presetActive, channelVolumes: presetVols } = customEvent.detail;
        
        setActiveChannels(presetActive);
        setChannelVolumes(presetVols);
        
        Object.keys(presetActive).forEach((ch) => {
          synthInstance.toggleChannel(ch, presetActive[ch]);
          synthInstance.setVolume(ch, presetVols[ch]);
        });
        
        // Start playing
        synthInstance.start();
        setIsPlaying(true);
      }
    };

    window.addEventListener("launch-seo-preset", handleLaunchSEOPreset);

    return () => {
      window.removeEventListener("launch-seo-preset", handleLaunchSEOPreset);
      synthInstance.shutdown();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Sync state modifications to the NatureSound engine
  const handleToggleChannel = (channel: string) => {
    const nextVal = !activeChannels[channel];
    setActiveChannels((prev) => ({ ...prev, [channel]: nextVal }));
    if (synthRef.current) {
      synthRef.current.toggleChannel(channel, nextVal);
    }
    
    // Auto start player if toggled active but stopped
    if (nextVal && !isPlaying) {
      handleTogglePlay();
    }
  };

  const handleVolumeChange = (channel: string, vol: number) => {
    setChannelVolumes((prev) => ({ ...prev, [channel]: vol }));
    if (synthRef.current) {
      synthRef.current.setVolume(channel, vol);
    }
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      synthRef.current.start();
      setIsPlaying(true);
      
      // Auto register active loop schedules if timer was set
      if (timerMinutes && timerMinutes > 0) {
        startSleepTimerCountdown(timerMinutes * 60);
      }
    }
  };

  // Instant trigger - customized bird play button triggers sound wave immediately!
  const triggerFavBirdSoundInstant = () => {
    if (!synthRef.current) return;
    
    // Ensure birds channel is active to hear it
    if (!activeChannels.birds) {
      handleToggleChannel("birds");
    }

    if (!isPlaying) {
      synthRef.current.start();
      setIsPlaying(true);
    }

    // Trigger instant whistle sweep!
    synthRef.current.triggerProceduralBird(favBirdType);
  };

  const triggerOwlSoundInstant = () => {
    if (!synthRef.current) return;
    
    if (!activeChannels.owl) {
      handleToggleChannel("owl");
    }

    if (!isPlaying) {
      synthRef.current.start();
      setIsPlaying(true);
    }

    synthRef.current.triggerProceduralOwl();
  };

  // Timer & Sleep Interval loops countdown code
  const startSleepTimerCountdown = (totalSecs: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setTimerRemainingSeconds(totalSecs);
    window.dispatchEvent(new CustomEvent("nature-timer-update", {
      detail: { remaining: totalSecs, total: totalSecs }
    }));

    timerIntervalRef.current = setInterval(() => {
      setTimerRemainingSeconds((prev) => {
        const next = prev - 1;
        window.dispatchEvent(new CustomEvent("nature-timer-update", {
          detail: { remaining: next, total: timerMinutes ? timerMinutes * 60 : totalSecs }
        }));

        if (prev <= 1) {
          // Timer finished! Shutdown nature voices beautifully
          if (synthRef.current) {
            synthRef.current.pause();
          }
          setIsPlaying(false);
          setTimerMinutes(null);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          
          // Trigger final visual notification
          const finishedLog: SoundboardNotifier = {
            id: "timer-done",
            senderName: "Sleep Timer",
            icon: "⏳",
            text: "Timer expired. Seamless ambient engine paused.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setSoundLogs((prev) => [finishedLog, ...prev]);

          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const selectTimerPreset = (mins: number | null) => {
    setTimerMinutes(mins);
    if (mins === null) {
      setTimerRemainingSeconds(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      window.dispatchEvent(new CustomEvent("nature-timer-update", {
        detail: { remaining: 0, total: null }
      }));
    } else {
      if (isPlaying) {
        startSleepTimerCountdown(mins * 60);
      } else {
        setTimerRemainingSeconds(mins * 60);
        window.dispatchEvent(new CustomEvent("nature-timer-update", {
          detail: { remaining: mins * 60, total: mins * 60 }
        }));
      }
    }
  };

  const handleCustomTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customTimerInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      selectTimerPreset(parsed);
    }
  };

  // Nice format for HH:MM:SS
  const formatTimeRemaining = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m ${secs}s`;
  };

  const applySoundscapeMix = (preset: {
    name: string;
    desc: string;
    channels: { [key: string]: { active: boolean; volume: number } };
    favBirdId?: string;
  }) => {
    // Ensure sound context exists
    if (!synthRef.current) return;
    
    if (!isPlaying) {
      synthRef.current.start();
      setIsPlaying(true);
    }

    const nextChannels = { ...activeChannels };
    const nextVolumes = { ...channelVolumes };

    Object.keys(preset.channels).forEach((ch) => {
      const config = preset.channels[ch];
      nextChannels[ch] = config.active;
      nextVolumes[ch] = config.volume;
      
      synthRef.current?.toggleChannel(ch, config.active);
      synthRef.current?.setVolume(ch, config.volume);
    });

    if (preset.favBirdId) {
      setFavBirdType(preset.favBirdId);
      synthRef.current?.triggerProceduralBird(preset.favBirdId);
    }

    setActiveChannels(nextChannels);
    setChannelVolumes(nextVolumes);

    // Dynamic log update
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const mixLog: SoundboardNotifier = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: `Mix Loaded: ${preset.name}`,
      icon: "🎛️",
      text: `Levels: Birds:${preset.channels.birds?.active ? 'ON' : 'OFF'}, Ocean:${preset.channels.ocean?.active ? 'ON' : 'OFF'}, Wind:${preset.channels.trees?.active ? 'ON' : 'OFF'}`,
      time: timeString
    };
    setSoundLogs((prev) => [mixLog, ...prev.slice(0, 5)]);
  };

  const soundboardLayers = [
    {
      id: "birds",
      name: "Songbirds",
      tagline: "Live Whistles",
      icon: <Bird className="w-5 h-5" />,
      activeClass: "bg-sky-500/5 border-sky-400/20 text-sky-400",
      dotColor: "#38bdf8",
      instantTrigger: () => triggerFavBirdSoundInstant(),
      title: "Click bird icon to instantly play selected songbird style!"
    },
    {
      id: "owl",
      name: "Canopy Owl",
      tagline: "Periodic Hoot",
      icon: <span className="text-lg">🦉</span>,
      activeClass: "bg-purple-500/5 border-purple-400/20 text-purple-400",
      dotColor: "#c084fc",
      instantTrigger: () => triggerOwlSoundInstant(),
      title: "Click owl icon to hear a double hoot!"
    },
    {
      id: "ocean",
      name: "Ocean Swell",
      tagline: "Tidal Water",
      icon: <Waves className="w-5 h-5" />,
      activeClass: "bg-cyan-500/5 border-cyan-400/20 text-cyan-400",
      dotColor: "#22d3ee",
      instantTrigger: () => handleToggleChannel("ocean"),
      title: "Toggle ocean waves"
    },
    {
      id: "trees",
      name: "Swaying Trees",
      tagline: "Leaf Rustle",
      icon: <Trees className="w-5 h-5" />,
      activeClass: "bg-emerald-500/5 border-emerald-400/20 text-emerald-400",
      dotColor: "#34d399",
      instantTrigger: () => handleToggleChannel("trees"),
      title: "Toggle tree breeze"
    },
    {
      id: "crickets",
      name: "Summer Crickets",
      tagline: "Chirrup Loop",
      icon: <span className="text-lg">🦗</span>,
      activeClass: "bg-amber-500/5 border-amber-400/20 text-amber-400",
      dotColor: "#fbbf24",
      instantTrigger: () => handleToggleChannel("crickets"),
      title: "Toggle cricket chirrs"
    },
    {
      id: "mountainWind",
      name: "Mountain Wind",
      tagline: "Alpine Breeze",
      icon: <span className="text-lg">💨</span>,
      activeClass: "bg-teal-500/5 border-teal-400/20 text-teal-400",
      dotColor: "#2dd4bf",
      instantTrigger: () => handleToggleChannel("mountainWind"),
      title: "Toggle distant mountain wind"
    },
    {
      id: "brook",
      name: "Brook Bubbling",
      tagline: "Flowing Cave",
      icon: <span className="text-lg">💧</span>,
      activeClass: "bg-blue-500/5 border-blue-400/20 text-blue-400",
      dotColor: "#60a5fa",
      instantTrigger: () => handleToggleChannel("brook"),
      title: "Toggle bubbling brook"
    },
    {
      id: "desertBreeze",
      name: "Desert Breeze",
      tagline: "Dry Whistle",
      icon: <span className="text-lg">🏜️</span>,
      activeClass: "bg-orange-500/5 border-orange-400/20 text-orange-400",
      dotColor: "#fb923c",
      instantTrigger: () => handleToggleChannel("desertBreeze"),
      title: "Toggle dry desert breeze"
    },
    {
      id: "morningMist",
      name: "Morning Mist",
      tagline: "Soft Dew Hiss",
      icon: <span className="text-lg">🌫️</span>,
      activeClass: "bg-slate-500/5 border-slate-400/20 text-slate-400",
      dotColor: "#94a3b8",
      instantTrigger: () => handleToggleChannel("morningMist"),
      title: "Toggle soft morning mist"
    },
    {
      id: "caveEchoes",
      name: "Cave Echoes",
      tagline: "Cavern Drips",
      icon: <span className="text-lg">🪨</span>,
      activeClass: "bg-indigo-500/5 border-indigo-400/20 text-indigo-400",
      dotColor: "#818cf8",
      instantTrigger: () => {
        if (!synthRef.current) return;
        if (!activeChannels.caveEchoes) {
          handleToggleChannel("caveEchoes");
        }
        if (!isPlaying) {
          synthRef.current.start();
          setIsPlaying(true);
        }
        synthRef.current.triggerProceduralCaveEcho();
      },
      title: "Toggle cave echoes dripping"
    }
  ];

  return (
    <div className="bg-zinc-950/80 rounded-3xl border border-white/5 overflow-hidden flex flex-col p-5 space-y-4 shadow-xl">
      
      {/* Title & Loop/Sleep Mode Header */}
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-mono flex items-center gap-1.5">
            <Bird className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            Nature Harmony Deck
          </h3>
          <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
            Procedural animal whistles & custom sleep-timer channels
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Creator Guide Toggle Button */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`px-3 py-1.5 rounded-xl text-2xs font-mono font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              showGuide
                ? "bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/25 shadow-sm"
                : "bg-zinc-800/40 text-zinc-300 hover:bg-zinc-850 border border-white/5"
            }`}
          >
            🎨 MOODS & MIXES
          </button>

          {/* Play Pause Global Toggle for nature sound board */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-xl text-2xs font-mono font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              isPlaying
                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-3 h-3" /> STOP AMBIENT
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> PLAY AMBIENT
              </>
            )}
          </button>
        </div>
      </div>

      {/* Atmospheric Sound Guide & Creator Suite Overlay */}
      {showGuide && (
        <div className="bg-zinc-950 border border-[#00D1FF]/20 rounded-2xl p-4 space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h4 className="text-xs font-mono font-bold text-[#00D1FF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Atmospheric Sound Guide & Creator Suite
              </h4>
              <p className="text-[9px] text-zinc-500 font-sans mt-0.5">
                Learn spatial nature acoustics, browse mood libraries, and active dynamic background mixes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-zinc-500 hover:text-white text-xs font-mono"
            >
              Close [x]
            </button>
          </div>

          {/* Tab Selector inside Guide */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/5">
            {[
              { id: "mixes", label: "🎛️ Creator Mixes" },
              { id: "birds", label: "🐦 Songbirds" },
              { id: "rain", label: "🌧️ Rain & Water" },
              { id: "forest", label: "🌲 Forest & Seasons" },
              { id: "misc", label: "🍃 Wind & Night" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveGuideTab(tab.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold uppercase transition-all border ${
                  activeGuideTab === tab.id
                    ? "bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/25 shadow-sm"
                    : "bg-transparent text-zinc-400 border-white/5 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 space-y-4">
            {/* TAB: CREATOR MIXES (Satisfying Nature Layers & Most Relaxing Combinations) */}
            {activeGuideTab === "mixes" && (
              <div className="space-y-3.5">
                <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide">
                  ⭐ CLICK TO INSTANTLY MIX PROCEDURAL CHANNELS:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    {
                      name: "Morning Paradise",
                      desc: "Awaken to majestic birds and deep morning ambient wind chimes with soft morning mist.",
                      color: "text-emerald-400 border-emerald-400/25 bg-emerald-500/5",
                      channels: { 
                        birds: { active: true, volume: 0.8 }, 
                        trees: { active: true, volume: 0.4 }, 
                        ocean: { active: false, volume: 0.1 }, 
                        crickets: { active: false, volume: 0.15 }, 
                        owl: { active: false, volume: 0.3 },
                        mountainWind: { active: false, volume: 0.2 },
                        brook: { active: true, volume: 0.5 },
                        desertBreeze: { active: false, volume: 0.1 },
                        morningMist: { active: true, volume: 0.6 },
                        caveEchoes: { active: false, volume: 0.2 }
                      },
                      favBirdId: "nightingale"
                    },
                    {
                      name: "Ancient Cave Whispers",
                      desc: "Cavernous water drips echoing in stone vaults, deep cold mountain wind, and bubbling springs.",
                      color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/5",
                      channels: { 
                        birds: { active: false, volume: 0.1 }, 
                        trees: { active: false, volume: 0.2 }, 
                        ocean: { active: false, volume: 0.1 }, 
                        crickets: { active: false, volume: 0.1 }, 
                        owl: { active: true, volume: 0.4 },
                        mountainWind: { active: true, volume: 0.55 },
                        brook: { active: true, volume: 0.4 },
                        desertBreeze: { active: false, volume: 0.1 },
                        morningMist: { active: false, volume: 0.2 },
                        caveEchoes: { active: true, volume: 0.8 }
                      }
                    },
                    {
                      name: "Rainy Café",
                      desc: "The cozy sound of continuous window precipitation, trees, and soft crackling.",
                      color: "text-sky-400 border-[#00D1FF]/25 bg-[#00D1FF]/5",
                      channels: { 
                        birds: { active: false, volume: 0.1 }, 
                        trees: { active: true, volume: 0.7 }, 
                        ocean: { active: true, volume: 0.3 }, 
                        crickets: { active: false, volume: 0.1 }, 
                        owl: { active: false, volume: 0.2 },
                        mountainWind: { active: true, volume: 0.3 },
                        brook: { active: false, volume: 0.2 },
                        desertBreeze: { active: false, volume: 0.1 },
                        morningMist: { active: true, volume: 0.4 },
                        caveEchoes: { active: false, volume: 0.2 }
                      }
                    },
                    {
                      name: "Desert Oasis",
                      desc: "Dry howling winds, warm sifting breeze sand gusts, and a serene hidden pool stream.",
                      color: "text-orange-400 border-orange-500/25 bg-orange-500/5",
                      channels: { 
                        birds: { active: true, volume: 0.4 }, 
                        trees: { active: false, volume: 0.2 }, 
                        ocean: { active: false, volume: 0.1 }, 
                        crickets: { active: true, volume: 0.3 }, 
                        owl: { active: false, volume: 0.2 },
                        mountainWind: { active: false, volume: 0.2 },
                        brook: { active: true, volume: 0.6 },
                        desertBreeze: { active: true, volume: 0.8 },
                        morningMist: { active: false, volume: 0.1 },
                        caveEchoes: { active: false, volume: 0.1 }
                      },
                      favBirdId: "woodthrush"
                    },
                    {
                      name: "Forest Meditation",
                      desc: "Resonant wood flutes, deep stream flows, and a wise woodland sentinel.",
                      color: "text-purple-400 border-purple-400/25 bg-purple-500/5",
                      channels: { 
                        birds: { active: true, volume: 0.75 }, 
                        trees: { active: true, volume: 0.7 }, 
                        owl: { active: true, volume: 0.5 }, 
                        ocean: { active: false, volume: 0.1 }, 
                        crickets: { active: false, volume: 0.15 },
                        mountainWind: { active: false, volume: 0.2 },
                        brook: { active: true, volume: 0.5 },
                        desertBreeze: { active: false, volume: 0.1 },
                        morningMist: { active: true, volume: 0.3 },
                        caveEchoes: { active: false, volume: 0.2 }
                      },
                      favBirdId: "woodthrush"
                    },
                    {
                      name: "Beach Sunset",
                      desc: "Tidal ocean waves washing serene black sand coasts with high wind breeze.",
                      color: "text-amber-400 border-amber-400/25 bg-amber-500/5",
                      channels: { 
                        birds: { active: true, volume: 0.3 }, 
                        trees: { active: true, volume: 0.35 }, 
                        ocean: { active: true, volume: 0.8 }, 
                        crickets: { active: false, volume: 0.1 }, 
                        owl: { active: false, volume: 0.2 },
                        mountainWind: { active: false, volume: 0.2 },
                        brook: { active: false, volume: 0.2 },
                        desertBreeze: { active: true, volume: 0.4 },
                        morningMist: { active: true, volume: 0.5 },
                        caveEchoes: { active: false, volume: 0.1 }
                      },
                      favBirdId: "tui"
                    }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applySoundscapeMix(preset)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${preset.color} hover:opacity-90 active:scale-95 cursor-pointer flex flex-col gap-1 w-full`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">{preset.name}</span>
                      <p className="text-[9px] text-zinc-400 leading-normal font-sans">{preset.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-2">
                  <h5 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Most Relaxing Sounds According to Listeners</h5>
                  <ol className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] text-zinc-400 list-decimal list-inside font-sans">
                    <li>Ocean waves</li>
                    <li>Rain on window</li>
                    <li>Forest birds at dawn</li>
                    <li>Waterfall</li>
                    <li>Wind through trees</li>
                    <li>Fireplace crackling</li>
                    <li>Mountain stream</li>
                    <li>Night crickets</li>
                    <li>Bamboo forest wind</li>
                    <li>Gentle thunder</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB: SONGBIRDS */}
            {activeGuideTab === "birds" && (
              <div className="space-y-3">
                <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
                  {[
                    "https://images.openai.com/static-rsc-4/Yr6MBeZLSDeBGWe920E_-TTje_ZhxECvq9QUkHQnyvKQQDRBuSgdoWK4WM5EThGUYIBqJ5KgPqRDGlaSdCaqNMkZlPjp_HCI8IB-MnTkBOKPuBFNEB4-toob8c1evp1LUaa8I3AaVVJOPW2Nu_X3111TQuoS-gIwM8nM74p3maV8ca9d4PfLiS8qogfCoX-T?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/Xbdd0-6mVFoQnM-bpnGU-wiaLscmStIWcaNhtsY8fDgHyC_9f4W484z5t9sACXUrAMKW8cseqGUIgMloIj1rpfZ0Z6bOQFv6_IcJ4I0FJ0TcbRbpwc05Y-lEelfd18JGlyDLiom5lQcVeH1X3KcTyp5fCEQ-6g3ptICdt4JwGjp9WHldEHVbyON75Q5phBGY?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/I_V1_lHftO6qY9iQeK75oZ6s-JQTi9hAXMoSHuoCGCcMAVLDOst8Ie0ct1Hsp-YblE4Ayz6EcAxPrBhJslQ-qnUQMD9wRM1_nE34kKqZ1WILHLKlCBex6IsuLDf_wx2_bRPM8Xdl4yiI75LC3xFIpgTgwh74wZDZf6a9U3_JRCOzvu-MMR7GTBoC0f9T7gmB?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/T0uX2ixrrq59jwQLr9vRxbpv-CUw3Hg9Xdm-XKipJmlPFWsgZxDuLNt7Sj1jyZZzoJZsikQCE1NmICAxRioftbGbiZMFKWpOcOuXk3kx0C5gwdR6jDfdjjPRiv1qdcq3IIVPsrc4M_IZGF2A-PEeRdG9Wb_p0bh82YSWWDyWVgH5lgnnJOm_jdKIwx8Rb4Sm?purpose=fullsize",
                  ].map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Melodic Songbird Scene ${idx + 1}`} 
                      className="w-[120px] h-[80px] rounded-xl object-cover border border-white/5 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-2">
                  <h5 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Birds (Peaceful & Melodic) Directory</h5>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 font-sans">
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Malabar Whistling Thrush</b> Best for mellow relaxing lo-fi beats; whistling idle tunes.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 White-rumped Shama</b> Liquid flute keys with stunning echo resonance traits.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Asian Koel</b> Beautiful tropical nights rising calling sentinel signature.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Common Nightingale</b> Romance-filled weeping piping tones tuned for deep night focus.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Oriental Magpie-Robin</b> Sharp variations, loud melodic scales with high echo feedback.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Warbler Canary</b> High frequency joyful energetic morning song whistle bursts.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Common Skylark</b> Cascade speed bird sounds that illuminate sunlit forest skies.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Wood Thrush</b> Pristine crystal chords ringing beautiful across valley meadows.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Tui Bells</b> Exotic chiming mechanical bells, drops, and clicking sounds.</p>
                    <p className="p-2 border border-white/5 rounded-xl bg-zinc-950/40"><b className="text-white block font-mono text-[10px] mb-0.5">🐦 Red-whiskered Bulbul</b> Cute chattering whistles perfect for outdoor park-vibes.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RAIN & WATER */}
            {activeGuideTab === "rain" && (
              <div className="space-y-3">
                <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
                  {[
                    "https://images.openai.com/static-rsc-4/4bp300oSaVMb_TamCyztij8wYR5rNdy5Tukouh5k11j9JpS7rWG4CnuM7MCGRlsX2YhT6g-tB0y_lCaP_IqlZsVfdLh8A--wcCq8IjkKLVdrDJTqT6i6mt8yOIdo10ymA6HjfWgZ9ADrNgjlYk7q9l3xXWprAmMd6uU_GsvsYEaeVlG9d-VhXYCfJ81p3vk4?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/k-0NdzKV3wXb6BHWCdMaZP8dUxy--Ia3Mq45qTX1kcGeLKaIvA5pfdDtxcwu9kj0m6DSscPumDJ6-N2If8fA7MRuR1X5lLAl85dPeixapUnFEmlu68WfoEl0b-garCRYPLq--UeZDSNY5RdEZzPnSo8rLGg4xUe5JsekLZkj4njooDWt807kRHeAFgCl-Eb8?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/aHK4IppM0Vvo0V9OBQhw_RPz2y6rCFdCsU0B_cRdpZAA0RdC5vwsqbWwSAZKWaybnIASpZW4G12i_32a6o2kUaaeZ8Jk6BF7d1-Duj7_9SrYDbalj94541Ia4dFLkP42hKM7kdGk93XAHl5lRi0XDa5eOa9a0nnGN0GZOVWRlEB_s7DtvXdCqVw63I4VizXS?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/qM-HYJiNmwJMrVTEWKKFiPFAikBadAzkkp5_kBjDXB0er6QCt001wkEt-71hhnaCMEmljBWsUenek1ACi-PEvPx00Gx10FJocS9RHl1bf4HqJ0clW0Ch09QqG5tHPnoM0ie9zNCAM5uiwkHjbP9zeuA08YlNI3VIlgPSaPXkwrjYTIQkjejSuIFANZqW-rTt?purpose=fullsize",
                  ].map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Rain and Water Atmosphere Scene ${idx + 1}`} 
                      className="w-[120px] h-[80px] rounded-xl object-cover border border-white/5 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">🌧️ Rain Aesthetics</h5>
                    <ul className="text-[9px] text-zinc-400 space-y-1 list-disc list-inside font-sans">
                      <li>Light drizzle</li>
                      <li>Rain on leaves</li>
                      <li>Rain on roof</li>
                      <li>Rain on tent</li>
                      <li>Rain on window</li>
                      <li>Distant thunder</li>
                      <li>Monsoon storm</li>
                      <li>Rain inside forest</li>
                      <li>Rain with songbirds</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">🌊 Ocean & Water</h5>
                    <ul className="text-[9px] text-zinc-400 space-y-1 list-disc list-inside font-sans">
                      <li>Slow rolling ocean waves</li>
                      <li>Gentle beach shore wash</li>
                      <li>Cold sea breeze swells</li>
                      <li>Tropical island beach wash</li>
                      <li>Waterfall misty background</li>
                      <li>Mountain streams & rivers</li>
                      <li>Bubbling river creek flows</li>
                      <li>Soft water droplets</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FOREST & SEASONS */}
            {activeGuideTab === "forest" && (
              <div className="space-y-3">
                <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
                  {[
                    "https://images.openai.com/static-rsc-4/Dt5kkPQc0l1zYpi55tJd5cMm-QmY9kdzSPs9c7-5c1o73OJox_4w5xB4oylflojN_-SC_6NSiafirh-JvCKz6VstvT6M2v5L-ANHpgZbfyuFUjuq559VHLpw52-BmetRI3F3i_mrpn83IDkGDKf9Eg9b-YDpyMWo89jbC-gF3T-szNkNqGbqkP1bXvEn2oYe?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/G9n3uk53wkmzFKCcLcuzC1FUhWjEz7i0_1-DBPRabGUEuQ3q_lJHQF65WRgaWqDStmpnJN9FjQKVvqcSe4i76ykQ9W1Itrl2TbBMyidXnZMh5BRfAoMhH53oTWWbXBRGe8s6fnnZzjZbT-9Zu22K209hnzLjBZ8U5Joei69ln0-jBz5H7kce7_4RebzOR6DQ?purpose=fullsize",
                    "https://images.openai.com/static-rsc-4/b8Z0BBCCBZ9ibMOcV92Bq0eoPvnhyYDipOjJ7N0E_mBTYOUsGjM391o4CNpFW4_seHBwM3fn_44Thu_BbiDYv34nXiGG5RmMmOGlEi4A3DIqsrSV2AsUq7QvbLGZUr95FWgZ2zyiEl6j0d4aojVPQqJBaVMc7Xw1wDXB6lyd24u3LsceHOLMs83EyVKlBVn_?purpose=fullsize",
                  ].map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Forest & Tree Seasons ${idx + 1}`} 
                      className="w-[120px] h-[80px] rounded-xl object-cover border border-white/5 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">🌲 Forest & Trees</h5>
                    <ul className="text-[9px] text-zinc-400 space-y-1 list-disc list-inside font-sans">
                      <li>Leaves rustling in the wind</li>
                      <li>Cold wind through pine trees</li>
                      <li>Serene bamboo forest sways</li>
                      <li>Tropical palm canopy sways</li>
                      <li>Misty morning forest chorus</li>
                      <li>Woodland wind breezes</li>
                      <li>Falling autumn leaf crunches</li>
                      <li>Oak branches bending softly</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">❄️ Cosmic Winter Sounds</h5>
                    <ul className="text-[9px] text-zinc-400 space-y-1 list-disc list-inside font-sans">
                      <li>Gentle snowfall ambiance</li>
                      <li>Icy arctic mountain wind</li>
                      <li>Fireplace warmth crackles</li>
                      <li>Cracking frozen lake ice layers</li>
                      <li>Cozy secluded wooden cabin warmth</li>
                      <li>Slow soft snow shoe footsteps</li>
                      <li>Blizzard snow drifts swirling</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WIND & NIGHT */}
            {activeGuideTab === "misc" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px] text-zinc-400 font-sans">
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">☀️ Summer Vibes</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Warm cicada waves</li>
                      <li>Meadow night crickets</li>
                      <li>Beach picnic laughter</li>
                      <li>Park children far away</li>
                      <li>Ice-cream truck chimes far away</li>
                      <li>Evening solar playground breezes</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">🌌 Night Sounds</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Warm nocturnal crickets</li>
                      <li>Layside wild frog croaks</li>
                      <li>Distant midnight owl hoot echoes</li>
                      <li>Campfire cedar crackles</li>
                      <li>Night-time breeze through tall grass</li>
                      <li>Moonlit tide washing the shore</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider">💨 Relaxing Wind</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Refreshing coastal sea breezes</li>
                      <li>Dry desert sandstorm winds</li>
                      <li>High alpine mountain breezes</li>
                      <li>Long grass field whistling sways</li>
                      <li>Wooded canyon wind echoes</li>
                      <li>Wheat field golden movement</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Bird Soundboard Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {soundboardLayers.map((layer) => (
          <div 
            key={layer.id}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 relative ${
              activeChannels[layer.id] 
                ? layer.activeClass 
                : "bg-zinc-900/40 border-white/5 grayscale"
            }`}
          >
            <button
              type="button"
              onClick={layer.instantTrigger}
              className={`w-10 h-10 rounded-full flex items-center justify-center border cursor-pointer active:scale-90 shadow transition-colors ${
                activeChannels[layer.id]
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
              }`}
              title={layer.title}
            >
              {layer.icon}
            </button>
            
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-zinc-300 block">{layer.name}</span>
              <span className="text-[9px] text-zinc-500 font-mono">{layer.tagline}</span>
            </div>

            <button
              type="button"
              onClick={() => handleToggleChannel(layer.id)}
              className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border transition-all cursor-pointer"
              style={{ 
                borderColor: activeChannels[layer.id] ? layer.dotColor : "rgba(255,255,255,0.1)",
                backgroundColor: activeChannels[layer.id] ? layer.dotColor : "transparent"
              }}
              title="Toggle Continuous Stream"
            />
          </div>
        ))}
      </div>

      {/* Sound Settings Form: Select Fav, Custom Volume Mixer Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Expanded 50+ Beautiful Bird voices Interactive catalog */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-3 col-span-1 md:col-span-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-3xs font-mono uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-1">🎵 Interactive Songbird Catalog</span>
              <span className="text-sky-400 font-bold">
                {BIRD_PRESETS.filter(b => birdSearchQuery ? (b.name.toLowerCase().includes(birdSearchQuery.toLowerCase()) || b.description.toLowerCase().includes(birdSearchQuery.toLowerCase())) : b.category === activeBirdCategory).length} Birds
              </span>
            </div>

            {/* Compact Search bar */}
            <div className="relative">
              <input
                type="text"
                value={birdSearchQuery}
                onChange={(e) => setBirdSearchQuery(e.target.value)}
                placeholder="🔍 Search 50+ bird species..."
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/35 transition-colors"
                aria-label="Search bird species"
              />
              {birdSearchQuery && (
                <button 
                  type="button" 
                  onClick={() => setBirdSearchQuery("")} 
                  className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-[9px] font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories horizontal list (only if not searching) */}
            {!birdSearchQuery && (
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {BIRD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveBirdCategory(cat.id)}
                    className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-semibold transition-all cursor-pointer border ${
                      activeBirdCategory === cat.id
                        ? "bg-sky-500/10 text-sky-400 border-sky-400/30"
                        : "bg-transparent text-zinc-400 border-white/5 hover:text-zinc-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Categorized Bird Species Grid (Compact and scrollable height) */}
            <div className="grid grid-cols-2 gap-1 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
              {BIRD_PRESETS.filter((bird) => {
                const matchesSearch = bird.name.toLowerCase().includes(birdSearchQuery.toLowerCase()) || 
                                      bird.description.toLowerCase().includes(birdSearchQuery.toLowerCase());
                if (birdSearchQuery) return matchesSearch;
                return bird.category === activeBirdCategory;
              }).map((bird) => (
                <button
                  key={bird.id}
                  type="button"
                  onClick={() => {
                    setFavBirdType(bird.id);
                    // Instant play when selecting from list
                    if (!synthRef.current) return;
                    if (!activeChannels.birds) {
                      handleToggleChannel("birds");
                    }
                    if (!isPlaying) {
                      synthRef.current.start();
                      setIsPlaying(true);
                    }
                    synthRef.current.triggerProceduralBird(bird.id);
                  }}
                  className={`px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 relative group ${
                    favBirdType === bird.id
                      ? "bg-sky-500/10 border-sky-400/40 text-white"
                      : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900 override:hover:text-zinc-250 hover:text-zinc-200"
                  }`}
                  title={bird.description}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs shrink-0">{bird.emoji}</span>
                    <span className="text-[9px] font-bold font-mono line-clamp-1">{bird.name}</span>
                  </div>
                  <span className="text-[8px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400">
                    {bird.description}
                  </span>
                </button>
              ))}
              {BIRD_PRESETS.filter((bird) => {
                const matchesSearch = bird.name.toLowerCase().includes(birdSearchQuery.toLowerCase()) || 
                                      bird.description.toLowerCase().includes(birdSearchQuery.toLowerCase());
                if (birdSearchQuery) return matchesSearch;
                return bird.category === activeBirdCategory;
              }).length === 0 && (
                <div className="col-span-2 py-6 text-center font-mono text-zinc-650 text-[9px] uppercase">
                  No matching singer found. Try different spelling.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 shrink-0">
            {/* Display active selection */}
            {(() => {
              const activeBird = BIRD_PRESETS.find((p) => p.id === favBirdType) || BIRD_PRESETS[0];
              return (
                <div className="flex items-center gap-1.5 max-w-[65%]">
                  <span className="text-base animate-pulse shrink-0">{activeBird.emoji}</span>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold font-mono text-sky-400 block tracking-tight truncate">
                      {activeBird.name}
                    </span>
                    <span className="text-[8px] text-zinc-500 italic block truncate">
                      {activeBird.description}
                    </span>
                  </div>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={triggerFavBirdSoundInstant}
              className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              ⚡ Chirp
            </button>
          </div>
        </div>

        {/* MULTI CHANNEL NATURAL VOLUME OVERLAYS */}
        <div className="bg-zinc-950 p-4.5 rounded-2xl border border-white/5 space-y-3.5 justify-center flex flex-col">
          <div className="text-3xs font-mono uppercase tracking-widest text-zinc-500 mb-0.5">
            Decibel Volume Controller
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {[
              { id: "birds", label: "🐤 Forest Songbirds", accent: "accent-sky-400" },
              { id: "trees", label: "🌲 Swaying Trees", accent: "accent-emerald-400" },
              { id: "ocean", label: "🌊 Ocean Wave Swells", accent: "accent-cyan-400" },
              { id: "crickets", label: "🦗 Summer Crickets", accent: "accent-amber-500" },
              { id: "owl", label: "🦉 Canopy Owl", accent: "accent-purple-500" },
              { id: "mountainWind", label: "💨 Mountain Wind", accent: "accent-teal-400" },
              { id: "brook", label: "💧 Brook Bubbling", accent: "accent-blue-400" },
              { id: "desertBreeze", label: "🏜️ Desert Breeze", accent: "accent-orange-400" },
              { id: "morningMist", label: "🌫️ Morning Mist", accent: "accent-slate-400" },
              { id: "caveEchoes", label: "🪨 Cave Echoes", accent: "accent-indigo-400" },
            ].map((slider) => (
              <div key={slider.id} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">{slider.label}</span>
                  <span>{Math.round((channelVolumes[slider.id] ?? 0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={channelVolumes[slider.id] ?? 0}
                  aria-label={`${slider.label} volume`}
                  onChange={(e) => handleVolumeChange(slider.id, parseFloat(e.target.value))}
                  className={`w-full ${slider.accent} h-1 bg-zinc-900 rounded-lg cursor-pointer`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Play Timer, Presets and Sleep Interval controller */}
      <div className="bg-zinc-950 p-4.5 rounded-2xl border border-white/5 space-y-3.5">
        <div className="flex justify-between items-center text-3xs font-mono uppercase tracking-widest text-zinc-500">
          <span>Active Sleep Timer Loop</span>
          <span className="text-yellow-400">PLAY TIME CONFIG</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Custom Presets */}
          {[
            { label: "Infinite Loop", value: null },
            { label: "5 Min ⏳", value: 5 },
            { label: "10 Min ⏳", value: 10 },
            { label: "1 Hour 🌙", value: 60 },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectTimerPreset(preset.value)}
              className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all cursor-pointer ${
                timerMinutes === preset.value
                  ? "bg-yellow-400/10 text-yellow-500 border-yellow-400/30"
                  : "bg-transparent border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
          
          <form onSubmit={handleCustomTimerSubmit} className="flex items-center bg-zinc-900 rounded-xl px-2 py-1 border border-white/5">
            <input
              type="number"
              min="1"
              max="240"
              value={customTimerInput}
              onChange={(e) => setCustomTimerInput(e.target.value)}
              placeholder="Min"
              className="w-10 bg-transparent text-[10px] font-mono font-bold text-center text-white focus:outline-none"
              aria-label="Custom sound timer in minutes"
            />
            <span className="text-[8px] font-mono text-zinc-500 uppercase mr-1">Min</span>
            <button
              type="submit"
              className="text-[9px] font-mono font-bold text-indigo-400 hover:text-white px-1.5 cursor-pointer"
            >
              Set
            </button>
          </form>

        </div>

        {/* Live Timer progress countdown HUD */}
        {timerMinutes !== null && isPlaying && (
          <div className="bg-zinc-900 border border-yellow-500/20 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-yellow-500 animate-pulse">
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Active Sleep Session Ending:</span>
            </div>
            <span className="text-xs font-mono font-bold font-numeric">{formatTimeRemaining(timerRemainingSeconds)}</span>
          </div>
        )}
      </div>

      {/* Procedurally Triggered Sound Log notifications */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
        <dt className="text-3xs font-mono uppercase tracking-widest text-zinc-500 shrink-0">
          Radio Transmission Journal
        </dt>

        <div className="max-h-[90px] overflow-y-auto space-y-1.5 scrollbar-thin">
          {soundLogs.length === 0 ? (
            <div className="text-zinc-650 text-[9px] font-mono uppercase text-center py-4">
              Turn on the sky voices to record active bird calls & owl echoes.
            </div>
          ) : (
            soundLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start justify-between text-[10px] font-sans text-zinc-300 py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-1 rounded animate-fadeIn transition-colors cursor-default"
              >
                <div className="flex items-start gap-1.5">
                  <span className="text-xs select-none">{log.icon}</span>
                  <div>
                    <span className="font-mono font-bold text-white block">{log.senderName}</span>
                    <span className="text-zinc-400 text-3xs line-clamp-1">{log.text}</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-zinc-650 tracking-tight self-center select-none">
                  {log.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
