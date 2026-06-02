import React, { useState } from "react";
import { Copy, Check, Sparkles, BookOpen, Brain, Shield, Info, Lightbulb, ExternalLink } from "lucide-react";

interface BrainwaveType {
  name: string;
  range: string;
  state: string;
  color: string;
  glow: string;
  description: string;
  freq: number;
}

export default function ScienceOfLofiInfographic({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [selectedWave, setSelectedWave] = useState<string>("Theta");
  const [fatigueLevel, setFatigueLevel] = useState<number>(65);
  const [copied, setCopied] = useState<boolean>(false);

  const waves: BrainwaveType[] = [
    {
      name: "Delta",
      range: "0.5 - 4 Hz",
      state: "Deep Dreamless Sleep",
      color: "border-purple-500 bg-purple-500/10 text-purple-400",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      description: "Triggered by our rolling deep ocean waves and thunder sounds to facilitate restorative physical healing.",
      freq: 2,
    },
    {
      name: "Theta",
      range: "4 - 8 Hz",
      state: "Deep Focus & Meditation",
      color: "border-sky-500 bg-sky-500/10 text-sky-400",
      glow: "shadow-[0_0_15px_rgba(14,165,233,0.3)]",
      description: "The ideal wavelength for complex programming and creative writing. Our binaural starlight synthesizers generate subtle frequency offsets to support this state.",
      freq: 6,
    },
    {
      name: "Alpha",
      range: "8 - 12 Hz",
      state: "Flow State & Relaxation",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      description: "A relaxed yet alert state that standard lo-fi minor-seventh and major-seventh chords gently promote.",
      freq: 10,
    },
    {
      name: "Beta",
      range: "12 - 30 Hz",
      state: "Active Cognitive Work",
      color: "border-rose-500 bg-rose-500/10 text-rose-400",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      description: "Associated with busy thinking, high alert, or stress-provoking deadlines. Infographics suggest calming back to Theta or Alpha to maintain brain longevity.",
      freq: 20,
    },
  ];

  const currentWave = waves.find((w) => w.name === selectedWave) || waves[1];

  const embedCode = `<iframe src="https://midnight-signals.cloud/embed/science-of-lofi" width="100%" height="720" style="border:none;border-radius:16px;background:#09090b;" title="The Science of Lofi & Focus Infographic"></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="science-lofi-infographic-root" className="w-full bg-zinc-950 border border-white/5 rounded-3xl p-6 md:p-8 text-zinc-100 flex flex-col gap-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative starry background highlights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none select-none" />

      {/* Infographic Header */}
      <div className="flex flex-col gap-3 relative z-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none">
            Neuro-Acoustic Infographic Edition
          </span>
          <span className="text-[10px] text-zinc-500 font-mono select-none">// Version 2.0</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-serif italic font-black text-white leading-tight tracking-tight">
          The Science of Lo-Fi &amp; Focus
        </h3>
        <p className="text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
          How atmospheric lo-fi chord progressions, steady rhythms, and natural pink audios coordinate physiological states to prevent burnout and trigger deep cognitive flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Interactive Column 1: Brainwave Synchronization */}
        <div id="infographic-section-brainwave" className="bg-zinc-900/40 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-100">
              1. Acoustic Entrainment (Brainwaves)
            </h4>
          </div>

          <p className="text-2xs text-zinc-400 font-sans leading-relaxed">
            Your auditory cortex naturally syncs its firing loops to strong acoustic cycles. Tap a brainwave mode below to simulate acoustic tuning:
          </p>

          {/* Interactive brainwave selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
            {waves.map((w) => (
              <button
                key={w.name}
                type="button"
                onClick={() => setSelectedWave(w.name)}
                className={`py-2 px-3 rounded-xl text-center border text-2xs cursor-pointer font-bold tracking-wide transition-all ${
                  selectedWave === w.name
                    ? `${w.color} ${w.glow} font-black scale-[1.03]`
                    : "border-white/5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div>{w.name}</div>
                <div className="text-[9px] opacity-60 font-normal font-mono mt-0.5">{w.range}</div>
              </button>
            ))}
          </div>

          {/* Interactive feedback card */}
          <div className="bg-zinc-950/80 p-4 rounded-xl border border-white/5 flex flex-col gap-2 min-h-[140px] justify-center transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono uppercase text-indigo-400 tracking-wider">
                Active Simulation Frequency:
              </span>
              <span className="text-2xs font-bold font-mono text-zinc-300">
                {currentWave.freq} Hz
              </span>
            </div>
            <div className="text-xs font-bold text-white font-serif italic">
              {currentWave.state}
            </div>
            <p className="text-2xs text-zinc-400 font-sans leading-relaxed">
              {currentWave.description}
            </p>

            {/* Simulated wave canvas render */}
            <div className="h-6 w-full bg-zinc-900/50 rounded overflow-hidden relative flex items-center mt-2 border border-white/5">
              <div className="absolute inset-0 flex justify-between px-1">
                {Array.from({ length: 32 }).map((_, i) => {
                  const animDelay = (i * 0.15).toFixed(2);
                  const animDuration = (1.5 / (currentWave.freq / 4)).toFixed(2);
                  return (
                    <div
                      key={i}
                      className="w-[1.5px] bg-[#00D1FF] rounded-full self-center"
                      style={{
                        height: `${Math.sin(i / 2) * 10 + 12}px`,
                        animation: `pulse-line ${animDuration}s ease-in-out infinite alternate`,
                        animationDelay: `${animDelay}s`,
                        backgroundColor: currentWave.name === "Delta" ? "#a855f7" : currentWave.name === "Theta" ? "#0ea5e9" : currentWave.name === "Alpha" ? "#10b981" : "#f43f5e"
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Column 2: Directed Attention Restoration */}
        <div id="infographic-section-attention" className="bg-zinc-900/40 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-100">
              2. Attention Restoration Cycle
            </h4>
          </div>

          <p className="text-2xs text-zinc-400 font-sans leading-relaxed">
            Intense focused thinking on complex parameters leads to *Directed Attention Fatigue*. Use the interactive slider below to adjust your daily mental session health:
          </p>

          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-2xs font-mono">
              <span className="text-zinc-500">Exhausted</span>
              <span className="text-zinc-500">Optimal Mindfulness</span>
            </div>
            
            <input
              id="infographic-restoration-slider"
              type="range"
              min="10"
              max="100"
              value={fatigueLevel}
              onChange={(e) => setFatigueLevel(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex items-center justify-between text-2xs mt-1">
              <span className="text-zinc-400">Current Cognitive Recharge:</span>
              <span className={`font-mono font-bold ${fatigueLevel < 40 ? 'text-red-400' : fatigueLevel < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {fatigueLevel}%
              </span>
            </div>

            <div className="text-2xs leading-relaxed text-zinc-300 font-sans bg-zinc-900/70 p-3 rounded-lg border border-white/5 mt-1">
              {fatigueLevel < 40 ? (
                <div className="flex gap-2">
                  <span className="text-base">🚨</span>
                  <div>
                    <strong className="text-red-400">Severe Focus Burnout:</strong> Your prefrontal cortex’s executive networks are overloaded. Static audio tracks with sudden vocals cause intrusive micro-arousals. We recommend 25 minutes of steady ocean tide pink noise.
                  </div>
                </div>
              ) : fatigueLevel < 75 ? (
                <div className="flex gap-2">
                  <span className="text-base">⏳</span>
                  <div>
                    <strong className="text-amber-400">Unstable Cognitive State:</strong> Focus is slipping, leading to syntax typos and slower response rates. Introduce light forest breezes and bird sounds mapped above 12,000Hz to stimulate creative brain sectors.
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <span className="text-base">🍃</span>
                  <div>
                    <strong className="text-emerald-400">Flow Restoration Level Active:</strong> Organic rhythms act as soft fascinations, catching subconscious signals cleanly while allowing your core directed analytical sectors to restore, refresh, and output continuously.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Sound Spectrum Benefits Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5 flex flex-col gap-1.5">
          <div className="text-2xs text-[#00D1FF] font-mono tracking-wider uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
            Pink Noise Masking
          </div>
          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Unlike static white noise, pink noise has perfect balanced acoustic energy across octaves, mimicking natural ocean sweeps. It effectively shields sudden city sirens, typing clicks, and slamming doors.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5 flex flex-col gap-1.5">
          <div className="text-2xs text-purple-400 font-mono tracking-wider uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Comforting Monotony
          </div>
          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Minimalist major-seventh chord sheet loops at 65-75 BPM create a predictive acoustic shelter. Your subconscious processes structures easily, keeping racing thoughts from wandering away from work tasks.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5 flex flex-col gap-1.5">
          <div className="text-2xs text-emerald-400 font-mono tracking-wider uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Biophilic Reconnection
          </div>
          <p className="text-2xs text-zinc-400 leading-relaxed font-sans">
            Woodland birdsong represents evolutionary safety signatures. Hearing sparrows and mourning doves triggers relaxing cortisol levels and alleviates urban isolation fatigue.
          </p>
        </div>
      </div>

      {/* Exporter Embed Area for Other Bloggers (Only render if NOT inside embed viewport!) */}
      {!isEmbedded && (
        <div id="saas-infographic-embed-box" className="border-t border-white/5 pt-6 flex flex-col gap-4 relative z-10 bg-zinc-950/40 p-5 rounded-2xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Want to embed this interactive infographic on your blog?
              </h4>
              <p className="text-2xs text-zinc-500 font-sans leading-relaxed">
                Copy the code below to easily display this responsive widget as a high-authority linkable asset on your website. No external dependencies required!
              </p>
            </div>
            
            <button
              id="btn-copy-embed-code"
              type="button"
              onClick={copyToClipboard}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-2xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              id="infographic-iframe-embed-code-textarea"
              readOnly
              value={embedCode}
              rows={2}
              className="w-full bg-zinc-900/90 text-[10px] font-mono p-3 rounded-xl border border-white/10 text-zinc-300 resize-none focus:outline-none"
            />
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-600 uppercase select-none">
              [ 100% Responsive HTML ]
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-3">
            <span>Dynamic sizing supported automatically</span>
            <span className="flex items-center gap-1">
              Powered by <a href="https://midnight-signals.cloud" className="text-[#00D1FF] hover:underline flex items-center gap-0.5">Midnight Signals <ExternalLink className="w-2.5 h-2.5 text-[#00D1FF]" /></a>
            </span>
          </div>
        </div>
      )}

      {/* Styled animation keyframes embedded directly in component body to ensure self-contained styled animations */}
      <style>{`
        @keyframes pulse-line {
          0% { transform: scaleY(0.7); max-height: 8px; }
          100% { transform: scaleY(1.3); max-height: 24px; }
        }
      `}</style>
    </div>
  );
}
