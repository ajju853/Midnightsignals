import React, { useState } from "react";
import { Copy, Check, ExternalLink, Zap, Heart, Disc, Activity, Sparkles, AlertCircle } from "lucide-react";

export default function EmbeddableInfographic({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [activeFrequency, setActiveFrequency] = useState<"alpha" | "theta" | "binaural">("theta");
  const [dbLevel, setDbLevel] = useState<number>(-12);

  const embedCode = `<iframe src="https://midnight-signals.cloud/embed/science-of-lofi" width="100%" height="780" style="border:none;border-radius:16px;background:#050507;" title="Science of Lofi and Focus Infographic"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="embeddable-lofi-infographic"
      className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 text-zinc-100 flex flex-col gap-6 shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      {/* Dynamic Ambient Background Underlays */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Infographic Main Title Header */}
      <div className="border-b border-white/5 pb-5 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-bold">
            Interactive Scientific Asset
          </span>
          <span className="text-[10px] text-zinc-550 font-mono">// Cognitive & Acoustical Engineering Docs</span>
        </div>
        <h3 className="text-xl md:text-2xl font-serif italic font-black text-white leading-tight">
          The Science of Lo-Fi &amp; Focus
        </h3>
        <p className="text-xs text-zinc-400 font-sans mt-1.5 max-w-2xl leading-relaxed">
          How acoustic sync, repetitive low-frequency beats, and ambient environmental layers coordinate to lower heart rate thresholds and prompt durable cerebral flow states.
        </p>
      </div>

      {/* CSS Grid Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
        
        {/* Grid Cell 1: BPM & Cardiovascular Entrainment (2 columns on md) */}
        <div className="md:col-span-3 bg-zinc-900/50 border border-white/5 p-5 rounded-xl flex flex-col gap-3 justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#00D1FF]">
                Cardiovascular Entrainment
              </span>
              <h4 className="text-sm font-bold font-sans text-zinc-100">
                The 60 to 70 BPM Standard
              </h4>
            </div>
            <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
          
          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Human heart rates naturally seek homeostatic sync with slow repetitive music meters. Lo-fi’s hallmark 60–78 BPM downbeat signals the autonomic nervous system to downregulate cortisol levels, reducing systemic anxiety and expanding working memory limits.
          </p>

          <div className="h-10 bg-zinc-950/80 rounded border border-white/5 flex items-center justify-between px-3 mt-1">
            <span className="font-mono text-2xs text-zinc-400">Target Rhythm Pace:</span>
            <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> 68 BPM (Cozy Mode)
            </span>
          </div>
        </div>

        {/* Grid Cell 2: Binaural Acoustical Entrainment (3 columns on md) */}
        <div className="md:col-span-3 bg-zinc-900/50 border border-white/5 p-5 rounded-xl flex flex-col gap-3 justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400">
                Acoustic Entrainment
              </span>
              <h4 className="text-sm font-bold font-sans text-zinc-100">
                Brainwave Target Simulator
              </h4>
            </div>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>

          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            By embedding custom offsetting audio frequencies into the left and right headphones, the brain computes a virtual "phantom beat" to synchronize neural signals across frontal lobes.
          </p>

          {/* Tab selectors */}
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {["alpha", "theta", "binaural"].map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setActiveFrequency(state as any)}
                className={`py-1 rounded text-[9px] font-mono capitalize border transition-all cursor-pointer ${
                  activeFrequency === state
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "bg-zinc-950/60 text-zinc-400 border-white/5 hover:text-zinc-200"
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          {/* Interactive frequency visual simulator */}
          <div className="bg-zinc-950/80 p-2.5 rounded border border-white/5 text-center">
            {activeFrequency === "alpha" && (
              <span className="text-2xs text-zinc-300 font-mono">
                🧘 Alpha (10 Hz) :: Flow &amp; Relaxation Wave
              </span>
            )}
            {activeFrequency === "theta" && (
              <span className="text-2xs text-zinc-300 font-mono">
                🧠 Theta (6 Hz) :: Deep focus &amp; Programming
              </span>
            )}
            {activeFrequency === "binaural" && (
              <span className="text-2xs text-zinc-300 font-mono">
                🛰️ Spatial Binaural :: Stereo focus matrix
              </span>
            )}
          </div>
        </div>

        {/* Grid Cell 3: Pink Noise Masking (3 columns on md) */}
        <div className="md:col-span-3 bg-zinc-900/50 border border-white/5 p-5 rounded-xl flex flex-col gap-3 justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400">
                Auditory Masking
              </span>
              <h4 className="text-sm font-bold font-sans text-zinc-100">
                Environmental Pink Noise Shield
              </h4>
            </div>
            <Disc className="w-5 h-5 text-emerald-400" />
          </div>

          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Unplanned acoustic interruptions (car horns, keyboards, speech) cause rapid prefrontal arousals. Adding biological pink noises (waterfalls, rustling leaves) masks peaks and maintains neural calmness.
          </p>

          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-2xs font-mono text-zinc-550">
              <span>Masking Level:</span>
              <span className="text-emerald-300">{dbLevel} dB (Optimal)</span>
            </div>
            <input
              type="range"
              min="-30"
              max="0"
              value={dbLevel}
              onChange={(e) => setDbLevel(Number(e.target.value))}
              className="w-full h-2.5 sm:h-1.5 rounded-lg bg-zinc-950 cursor-pointer accent-emerald-400 py-1 sm:py-0 border border-white/5"
            />
          </div>
        </div>

        {/* Grid Cell 4: Attention Restoration (3 columns on md) */}
        <div className="md:col-span-3 bg-zinc-900/50 border border-white/5 p-5 rounded-xl flex flex-col gap-3 justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400">
                Cerebral Longevity
              </span>
              <h4 className="text-sm font-bold font-sans text-zinc-100">
                Attention Restoration (ART)
              </h4>
            </div>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Directed tasks deplete finite neurotransmitters. Mapped natural birdsongs serve as "soft fascination" details—capturing automatic subconscious attention without exhausting voluntary computational tracks.
          </p>

          <div className="bg-zinc-950/85 p-3 rounded-xl border border-white/5 flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[10px] text-zinc-300 font-mono">
              Clinical study reports 24% boost in detail memory.
            </span>
          </div>
        </div>

      </div>

      {/* Blog Embed Code Generator Block (Omit if initialized as embedded iframe frame) */}
      {!isEmbedded && (
        <div id="embeddable-infographic-generator" className="border-t border-white/5 pt-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-1.5">
                📣 Free Blogger Embed &amp; Digital PR Toolkit
              </h4>
              <p className="text-2xs text-zinc-500 font-sans">
                Reviewers and focus blog operators have full permission to embed this real-time, interactive CSS Grid asset on their landing pages to educate audiences and boost authority metrics.
              </p>
            </div>

            <button
              id="embed-copy-button"
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-mono text-2xs font-bold border border-indigo-500/30 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Derived! Embed Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Infographic Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              id="embed-full-iframe-code"
              readOnly
              value={embedCode}
              rows={2}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-[10px] text-zinc-350 font-mono focus:outline-none resize-none"
            />
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-650 tracking-wider">
              [ CSS GRID • RESPONSIVE • IFRAME ]
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-zinc-500 gap-2 border-t border-white/5 pt-3">
            <span>Perfect responsive rendering inside WordPress, Wix, or custom React frameworks</span>
            <span className="flex items-center gap-1">
              Maintained by <a href="https://midnight-signals.cloud" className="text-[#00D1FF] hover:underline flex items-center gap-0.5">Midnight Signals <ExternalLink className="w-2.5 h-2.5 text-[#00D1FF]" /></a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
