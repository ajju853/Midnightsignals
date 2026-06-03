import React, { useState, useEffect } from "react";

interface VoiceSelectProps {
  onNavigate: (path: string) => void;
}

const STORAGE_KEY = "midnight_voice_config";

const VoiceSelect: React.FC<VoiceSelectProps> = ({ onNavigate }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [testText, setTestText] = useState("Hello, I am Ravi. Your lyrics sound beautiful tonight.");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const update = () => {
      const all = window.speechSynthesis.getVoices();
      const indian = all.filter((v) =>
        v.lang.toLowerCase().includes("-in") ||
        ["india", "sangeeta", "ravi", "heera", "veena", "valluvar", "vani"].some((n) =>
          v.name.toLowerCase().includes(n)
        ) ||
        ["hi", "ta", "te", "bn", "mr", "kn", "ml", "gu"].some((l) => v.lang.toLowerCase().startsWith(l))
      );
      setVoices(indian.length > 0 ? indian : all);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const cfg = JSON.parse(saved);
          setSelectedName(cfg.name || (indian[0]?.name || all[0]?.name || ""));
          setSpeed(cfg.speed ?? 1.0);
          setPitch(cfg.pitch ?? 1.0);
          return;
        } catch {}
      }
      setSelectedName(indian[0]?.name || all[0]?.name || "");
    };
    update();
    window.speechSynthesis.onvoiceschanged = update;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[&"#$%*+\-/:<=>@[\]^_`{|}~]/g, " "));
    const v = window.speechSynthesis.getVoices().find((v) => v.name === selectedName);
    if (v) u.voice = v;
    u.rate = speed;
    u.pitch = pitch;
    window.speechSynthesis.speak(u);
  };

  const handleSave = () => {
    const config = { name: selectedName, speed, pitch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    speak("Voice saved.");
  };

  const handleUse = () => {
    const config = { name: selectedName, speed, pitch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onNavigate(`/?voice=${encodeURIComponent(selectedName)}&speed=${speed}&pitch=${pitch}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Select Your Voice</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Choose a narrator voice for your lyrics</p>
          </div>
          <button onClick={() => onNavigate("/")} className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">← Back to Station</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Voice</label>
            <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors">
              {voices.length === 0 && <option value="">No voices found</option>}
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
            <p className="text-[9px] font-mono text-zinc-600 mt-1.5">{voices.length} voice{voices.length !== 1 ? "s" : ""} available</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Speed: {speed.toFixed(1)}x</label>
              <input type="range" min="0.3" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-0.5"><span>Slow</span><span>Fast</span></div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Pitch: {pitch.toFixed(1)}</label>
              <input type="range" min="0.3" max="2.0" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-0.5"><span>Low</span><span>High</span></div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Test Phrase</label>
            <input type="text" value={testText} onChange={(e) => setTestText(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
            <button onClick={() => speak(testText)} className="mt-2 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer">
              ▶ Preview Voice
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="text-[10px] font-mono text-zinc-600">{selectedName || "No voice selected"}</div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer">Save</button>
            <button onClick={handleUse} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer">Use in Mixer →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelect;
