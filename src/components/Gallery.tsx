import React, { useEffect, useState } from "react";

interface GalleryMix {
  id: string;
  name: string;
  voice: string;
  birds: number;
  vibe: string;
  plays: number;
  createdAt: number;
}

interface GalleryProps {
  onNavigate: (path: string) => void;
}

const VIBE_EMOJI: Record<string, string> = { dreamy: "🌙", dark: "🌑", ethereal: "🌌", rainy: "🌧️", cozy: "☕" };

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const [mixes, setMixes] = useState<GalleryMix[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterVibe, setFilterVibe] = useState("");
  const [sort, setSort] = useState<"newest" | "popular">("newest");

  const fetchMixes = (s: "newest" | "popular") => {
    setLoading(true);
    fetch(`/api/mix/list?sort=${s}`)
      .then((r) => r.json())
      .then((data) => { setMixes(data.mixes || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMixes(sort); }, [sort]);

  const handleSort = (s: "newest" | "popular") => { setSort(s); setFilterVibe(""); };

  const filtered = filterVibe ? mixes.filter((m) => m.vibe === filterVibe) : mixes;
  const vibes: string[] = [...new Set(mixes.map((m) => m.vibe).filter(Boolean) as string[])];
  const totalPlays = mixes.reduce((sum, m) => sum + (m.plays || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Mix Gallery</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">{total} mix{total !== 1 ? "es" : ""} · 🎧 {totalPlays} play{totalPlays !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => onNavigate("/")} className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">← Back to Station</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button onClick={() => handleSort("newest")} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${sort === "newest" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>Newest</button>
          <button onClick={() => handleSort("popular")} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${sort === "popular" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>Most Played</button>
          <span className="text-zinc-800 mx-0.5">|</span>
          <button onClick={() => setFilterVibe("")} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${!filterVibe ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>All</button>
          {vibes.map((v) => (
            <button key={v} onClick={() => setFilterVibe(v)} className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${filterVibe === v ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"}`}>{VIBE_EMOJI[v] || "🎵"} {v}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-600 text-xs font-mono">Loading gallery...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🎵</div>
            <p className="text-zinc-500 text-sm font-mono">No mixes {filterVibe ? `with vibe "${filterVibe}"` : "yet"}.</p>
            <button onClick={() => onNavigate("/create/mix")} className="mt-4 px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer">Create the First Mix</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((mix) => (
              <button key={mix.id} onClick={() => onNavigate(`/mix/${mix.id}`)} className="bg-zinc-900 border border-white/5 hover:border-indigo-400/30 rounded-2xl p-5 text-left transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{VIBE_EMOJI[mix.vibe] || "🎵"}</div>
                  <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-600">
                    <span>{new Date(mix.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>🎧 {mix.plays || 0}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold truncate group-hover:text-indigo-300 transition-colors">{mix.name || "Untitled Mix"}</h3>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-zinc-500">
                  {mix.voice && <span>🎙️ {mix.voice.split(" ").slice(0, 2).join(" ")}</span>}
                  {mix.birds > 0 && <span>🐦 {mix.birds} bird{mix.birds !== 1 ? "s" : ""}</span>}
                  {mix.vibe && <span>{VIBE_EMOJI[mix.vibe]} {mix.vibe}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
