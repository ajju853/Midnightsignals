import React, { useState } from "react";
import { BIRD_CATEGORIES, BIRD_PRESETS, BirdPreset } from "../lib/birdPresets";

interface BirdSelectProps {
  onNavigate: (path: string) => void;
}

const STORAGE_KEY = "midnight_birds_config";

interface SelectedBird {
  id: string;
  volume: number;
}

const BirdSelect: React.FC<BirdSelectProps> = ({ onNavigate }) => {
  const [selectedBirds, setSelectedBirds] = useState<SelectedBird[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [activeCategory, setActiveCategory] = useState("lofi");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = BIRD_PRESETS.filter((b) => {
    const matchCat = activeCategory === "all" || b.category === activeCategory;
    const matchSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleBird = (id: string) => {
    setSelectedBirds((prev) => {
      const exists = prev.find((b) => b.id === id);
      if (exists) return prev.filter((b) => b.id !== id);
      return [...prev, { id, volume: 60 }];
    });
  };

  const setVolume = (id: string, volume: number) => {
    setSelectedBirds((prev) => prev.map((b) => (b.id === id ? { ...b, volume } : b)));
  };

  const birdPresetMap = new Map(BIRD_PRESETS.map((b) => [b.id, b]));

  const handleUse = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBirds));
    const ids = selectedBirds.map((b) => b.id).join(",");
    onNavigate(`/?birds=${encodeURIComponent(ids)}&birdVols=${selectedBirds.map((b) => b.volume).join(",")}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Select Your Birds</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Choose bird species for your soundscape</p>
          </div>
          <button onClick={() => onNavigate("/")} className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">← Back to Station</button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <button onClick={() => setActiveCategory("all")} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === "all" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>All</button>
          {BIRD_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === cat.id ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>{cat.name}</button>
          ))}
        </div>

        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search birds..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map((bird) => {
            const sel = selectedBirds.find((b) => b.id === bird.id);
            return (
              <div key={bird.id} onClick={() => toggleBird(bird.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${sel ? "bg-indigo-500/10 border-indigo-400/30" : "bg-zinc-900 border-white/5 hover:border-white/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{bird.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{bird.name}</div>
                      <div className="text-[9px] text-zinc-500 font-mono truncate">{bird.description}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded border flex-shrink-0 ${sel ? "bg-indigo-500 border-indigo-400 flex items-center justify-center" : "border-zinc-700"}`}>{sel && <span className="text-black text-[8px] font-bold">✓</span>}</div>
                </div>
                {sel && (
                  <div className="mt-2 pl-7" onClick={(e) => e.stopPropagation()}>
                    <input type="range" min="0" max="100" value={sel.volume} onChange={(e) => setVolume(bird.id, parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-600"><span>Volume: {sel.volume}%</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="text-[10px] font-mono text-zinc-600">{selectedBirds.length} bird{selectedBirds.length !== 1 ? "s" : ""} selected</div>
          <button onClick={handleUse} disabled={selectedBirds.length === 0} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">Use in Mixer →</button>
        </div>
      </div>
    </div>
  );
};

export default BirdSelect;
