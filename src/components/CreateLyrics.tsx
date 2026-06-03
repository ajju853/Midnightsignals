import React, { useState, useEffect } from "react";
import { MixLyrics } from "../types";

const STORAGE_KEY = "midnight_mix_lyrics_draft";

interface CreateLyricsProps {
  onNavigate: (path: string) => void;
}

const defaultLyrics: MixLyrics = {
  title: "",
  verse1: "",
  chorus: "",
  verse2: "",
  bridge: "",
  outro: "",
};

const CreateLyrics: React.FC<CreateLyricsProps> = ({ onNavigate }) => {
  const [lyrics, setLyrics] = useState<MixLyrics>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultLyrics;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lyrics));
    setSaved(false);
  }, [lyrics]);

  const totalChars = (Object.values(lyrics) as string[]).reduce((sum, v) => sum + v.length, 0);

  const update = (field: keyof MixLyrics, value: string) => {
    setLyrics((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lyrics));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lyrics));
    onNavigate("/?loadLyrics=" + encodeURIComponent(lyrics.title || "untitled"));
  };

  const fields: { key: keyof MixLyrics; label: string; rows: number; placeholder: string }[] = [
    { key: "title", label: "Title", rows: 1, placeholder: "My Sad Night" },
    { key: "verse1", label: "Verse 1", rows: 4, placeholder: "The rain keeps falling..." },
    { key: "chorus", label: "Chorus", rows: 4, placeholder: "I'm waiting for the light..." },
    { key: "verse2", label: "Verse 2", rows: 4, placeholder: "The birds have gone silent..." },
    { key: "bridge", label: "Bridge", rows: 3, placeholder: "But somewhere in the distance..." },
    { key: "outro", label: "Outro", rows: 2, placeholder: "A single star appears..." },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Create Your Lyric</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Write your own words — no AI, just you</p>
          </div>
          <button
            onClick={() => onNavigate("/")}
            className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            ← Back to Station
          </button>
        </div>

        <div className="space-y-5">
          {fields.map(({ key, label, rows, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5 font-bold">
                {label}
                <span className="text-zinc-700 ml-1">({lyrics[key].length})</span>
              </label>
              {rows === 1 ? (
                <input
                  type="text"
                  value={lyrics[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              ) : (
                <textarea
                  value={lyrics[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="text-[10px] font-mono text-zinc-600">
            {totalChars} characters
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer"
            >
              {saved ? "✓ Saved" : "Save Draft"}
            </button>
            <button
              onClick={handlePreview}
              className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer"
            >
              Use in Mixer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLyrics;
