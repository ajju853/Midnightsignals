import React, { useState } from "react";

interface SoundscapeSelectProps {
  onNavigate: (path: string) => void;
}

const STORAGE_KEY = "midnight_soundscape_config";

const NATURE_LAYERS = [
  { id: "rain", label: "Rain", emoji: "🌧️", defaultVol: 45 },
  { id: "wind", label: "Wind", emoji: "💨", defaultVol: 30 },
  { id: "brook", label: "Brook", emoji: "💧", defaultVol: 35 },
];

const LOFI_STYLES = [
  { id: "chillhop", label: "Chillhop", emoji: "☕" },
  { id: "jazzy", label: "Jazzy", emoji: "🎷" },
  { id: "ambient", label: "Ambient", emoji: "🌌" },
  { id: "studybpm", label: "Study BPM", emoji: "📚" },
  { id: "lofihiphop", label: "Lo-fi Hip Hop", emoji: "🎧" },
];

const SoundscapeSelect: React.FC<SoundscapeSelectProps> = ({ onNavigate }) => {
  const [layers, setLayers] = useState<{ id: string; active: boolean; vol: number }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const cfg = JSON.parse(saved);
        return NATURE_LAYERS.map((n) => ({ id: n.id, active: cfg[n.id]?.active ?? true, vol: cfg[n.id]?.vol ?? n.defaultVol }));
      }
    } catch {}
    return NATURE_LAYERS.map((n) => ({ id: n.id, active: true, vol: n.defaultVol }));
  });
  const [bpm, setBpm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).bpm ?? 75;
    } catch {}
    return 75;
  });
  const [binaural, setBinaural] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).binaural ?? false;
    } catch {}
    return false;
  });
  const [lofiStyle, setLofiStyle] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).lofiStyle ?? "chillhop";
    } catch {}
    return "chillhop";
  });

  const updateLayer = (id: string, key: "active" | "vol", val: boolean | number) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: val } : l)));
  };

  const handleUse = () => {
    const config: Record<string, unknown> = { bpm, binaural, lofiStyle };
    for (const l of layers) config[l.id] = { active: l.active, vol: l.vol };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    const vols = btoa(JSON.stringify(Object.fromEntries(layers.map((l) => [l.id, { active: l.active, vol: l.vol }]))));
    onNavigate(`/?soundscape=${encodeURIComponent(lofiStyle)}&bpm=${bpm}&binaural=${binaural ? "1" : "0"}&layerVols=${encodeURIComponent(vols)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Design Your Soundscape</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Nature layers, style & tempo</p>
          </div>
          <button onClick={() => onNavigate("/")} className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">← Back to Station</button>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 font-bold">🌿 Nature Layers</h2>
            <div className="space-y-2">
              {layers.map((l) => {
                const n = NATURE_LAYERS.find((x) => x.id === l.id);
                return (
                  <div key={l.id} className="bg-zinc-900 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{n?.emoji}</span>
                        <span className="text-sm font-bold">{n?.label}</span>
                      </div>
                      <button onClick={() => updateLayer(l.id, "active", !l.active)} className={`w-8 h-5 rounded-full transition-colors ${l.active ? "bg-indigo-500" : "bg-zinc-700"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${l.active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    {l.active && (
                      <div className="mt-2 pl-6">
                        <input type="range" min="0" max="100" value={l.vol} onChange={(e) => updateLayer(l.id, "vol", parseInt(e.target.value))} className="w-full accent-indigo-500" />
                        <div className="text-[8px] font-mono text-zinc-600 mt-0.5">Volume: {l.vol}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 font-bold">🎵 Lo-fi Style</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {LOFI_STYLES.map((s) => (
                <button key={s.id} onClick={() => setLofiStyle(s.id)} className={`p-3 rounded-xl text-center border cursor-pointer transition-all ${lofiStyle === s.id ? "bg-indigo-500/10 border-indigo-400/30" : "bg-zinc-900 border-white/5 hover:border-white/20"}`}>
                  <div className="text-lg mb-0.5">{s.emoji}</div>
                  <div className="text-[9px] font-mono font-bold">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Tempo: {bpm} BPM</label>
              <input type="range" min="40" max="140" step="1" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-0.5"><span>⏳ 40</span><span>⚡ 140</span></div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Binaural Beats</label>
              <div className="flex items-center gap-3 h-[36px]">
                <button onClick={() => setBinaural(false)} className={`px-4 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${!binaural ? "bg-zinc-900 border-white/20 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-600 hover:border-white/10"}`}>Off</button>
                <button onClick={() => setBinaural(true)} className={`px-4 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${binaural ? "bg-indigo-500/10 border-indigo-400/30 text-indigo-300" : "bg-zinc-900/50 border-white/5 text-zinc-600 hover:border-white/10"}`}>On</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 flex justify-end">
          <button onClick={handleUse} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer">Use in Mixer →</button>
        </div>
      </div>
    </div>
  );
};

export default SoundscapeSelect;
