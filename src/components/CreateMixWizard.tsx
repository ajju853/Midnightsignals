import React, { useState, useEffect, useCallback } from "react";

interface CreateMixWizardProps {
  onNavigate: (path: string) => void;
}

const WIZARD_KEY = "midnight_mix_wizard_step";

const STEPS = [
  { id: "lyrics", label: "Lyrics", emoji: "✍️" },
  { id: "voice", label: "Voice", emoji: "🎙️" },
  { id: "birds", label: "Birds", emoji: "🐦" },
  { id: "soundscape", label: "Soundscape", emoji: "🌿" },
  { id: "review", label: "Review & Share", emoji: "🚀" },
];

interface LyricsState { title: string; verse1: string; chorus: string; verse2: string; bridge: string; outro: string; }
interface VoiceState { name: string; speed: number; pitch: number; }
interface BirdSelection { id: string; volume: number; }
interface LayerConfig { active: boolean; vol: number; }
interface SoundscapeState { layers: Record<string, LayerConfig>; lofiStyle: string; bpm: number; binaural: boolean; }

const LOFI_STYLES = [
  { id: "chillhop", label: "Chillhop", emoji: "☕" },
  { id: "jazzy", label: "Jazzy", emoji: "🎷" },
  { id: "ambient", label: "Ambient", emoji: "🌌" },
  { id: "studybpm", label: "Study BPM", emoji: "📚" },
  { id: "lofihiphop", label: "Lo-fi Hip Hop", emoji: "🎧" },
];

const NATURE_LAYERS = [
  { id: "rain", label: "Rain", emoji: "🌧️" },
  { id: "wind", label: "Wind", emoji: "💨" },
  { id: "brook", label: "Brook", emoji: "💧" },
];

const CreateMixWizard: React.FC<CreateMixWizardProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricsState>(() => {
    try { const s = localStorage.getItem("midnight_mix_lyrics_draft"); return s ? JSON.parse(s) : { title: "", verse1: "", chorus: "", verse2: "", bridge: "", outro: "" }; } catch { return { title: "", verse1: "", chorus: "", verse2: "", bridge: "", outro: "" }; }
  });

  // Voice state
  const [voice, setVoice] = useState<VoiceState>(() => {
    try { const s = localStorage.getItem("midnight_voice_config"); return s ? JSON.parse(s) : { name: "", speed: 1.0, pitch: 1.0 }; } catch { return { name: "", speed: 1.0, pitch: 1.0 }; }
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState("Your lyrics sound beautiful tonight.");

  // Birds state
  const [birds, setBirds] = useState<BirdSelection[]>(() => {
    try { const s = localStorage.getItem("midnight_birds_config"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Soundscape state
  const [soundscape, setSoundscape] = useState<SoundscapeState>(() => {
    try {
      const s = localStorage.getItem("midnight_soundscape_config");
      if (s) { const p = JSON.parse(s); return { layers: { rain: p.rain || { active: true, vol: 45 }, wind: p.wind || { active: true, vol: 30 }, brook: p.brook || { active: true, vol: 35 } }, lofiStyle: p.lofiStyle || "chillhop", bpm: p.bpm || 75, binaural: p.binaural ?? false }; }
    } catch {}
    return { layers: { rain: { active: true, vol: 45 }, wind: { active: true, vol: 30 }, brook: { active: true, vol: 35 } }, lofiStyle: "chillhop", bpm: 75, binaural: false };
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const update = () => {
        const all = window.speechSynthesis.getVoices();
        setVoices(all);
      };
      update();
      window.speechSynthesis.onvoiceschanged = update;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  // Save progress to localStorage on changes
  useEffect(() => { localStorage.setItem("midnight_mix_lyrics_draft", JSON.stringify(lyrics)); }, [lyrics]);
  useEffect(() => { localStorage.setItem("midnight_voice_config", JSON.stringify(voice)); }, [voice]);
  useEffect(() => { localStorage.setItem("midnight_birds_config", JSON.stringify(birds)); }, [birds]);
  useEffect(() => {
    const obj: Record<string, unknown> = { lofiStyle: soundscape.lofiStyle, bpm: soundscape.bpm, binaural: soundscape.binaural };
    for (const [k, v] of Object.entries(soundscape.layers)) obj[k] = v;
    localStorage.setItem("midnight_soundscape_config", JSON.stringify(obj));
  }, [soundscape]);

  useEffect(() => { localStorage.setItem(WIZARD_KEY, String(step)); }, [step]);
  useEffect(() => { try { const s = localStorage.getItem(WIZARD_KEY); if (s) setStep(parseInt(s, 10)); } catch {} }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[&"#$%*+\-/:<=>@[\]^_`{|}~]/g, " "));
    const v = voices.find((v) => v.name === voice.name);
    if (v) u.voice = v;
    u.rate = voice.speed;
    u.pitch = voice.pitch;
    window.speechSynthesis.speak(u);
  }, [voices, voice]);

  const handleSaveMix = async () => {
    setSaving(true);
    try {
      const payload = {
        name: lyrics.title || "Wizard Mix",
        lyrics,
        voice,
        birds: { selected: birds.map((b) => b.id), volumes: birds.map((b) => b.volume), timing: "between-verses" },
        soundscape: {
          rain: soundscape.layers.rain.active ? soundscape.layers.rain.vol / 100 : 0,
          wind: soundscape.layers.wind.active ? soundscape.layers.wind.vol / 100 : 0,
          brook: soundscape.layers.brook.active ? soundscape.layers.brook.vol / 100 : 0,
          lofi: { style: soundscape.lofiStyle, bpm: soundscape.bpm },
          binaural: soundscape.binaural ? "theta" : "none",
        },
        vibe: soundscape.lofiStyle === "chillhop" ? "dreamy" : soundscape.lofiStyle === "jazzy" ? "dark" : soundscape.lofiStyle === "ambient" ? "ethereal" : "dreamy",
        rainVolume: soundscape.layers.rain.active ? soundscape.layers.rain.vol / 100 : 0,
        oceanVolume: soundscape.layers.wind.active ? soundscape.layers.wind.vol / 100 : 0,
        vinylVolume: soundscape.layers.brook.active ? soundscape.layers.brook.vol / 100 : 0,
        activeBpm: soundscape.bpm,
      };
      const res = await fetch("/api/mix/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.url) {
        setSavedUrl(window.location.origin + data.url);
        setSaving(false);
      }
    } catch (err) {
      console.error("Failed to save mix:", err);
      setSaving(false);
    }
  };

  const updateLyrics = (field: keyof LyricsState, val: string) => setLyrics((prev) => ({ ...prev, [field]: val }));

  const updateBirdVolume = (id: string, volume: number) => setBirds((prev) => prev.map((b) => (b.id === id ? { ...b, volume } : b)));

  const toggleBird = (id: string) => setBirds((prev) => prev.find((b) => b.id === id) ? prev.filter((b) => b.id !== id) : [...prev, { id, volume: 60 }]);

  const updateLayer = (id: string, key: "active" | "vol", val: boolean | number) => setSoundscape((prev) => ({ ...prev, layers: { ...prev.layers, [id]: { ...prev.layers[id], [key]: val } } }));

  const charsLeft = (section: keyof LyricsState, max: number) => max - (lyrics[section]?.length || 0);

  const copyUrl = () => {
    if (savedUrl) { navigator.clipboard.writeText(savedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif italic font-black tracking-tight">Mix Creator</h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Step {step + 1} of {STEPS.length}</p>
          </div>
          <button onClick={() => onNavigate("/")} className="text-[10px] font-mono text-zinc-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">← Back to Station</button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${i === step ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : i < step ? "bg-green-500/10 text-green-400 border border-green-400/20" : "bg-zinc-900 text-zinc-500 border border-white/5 hover:text-zinc-300"}`}>
              <span>{i < step ? "✓" : s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          {/* Step 1: Lyrics */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">✍️ Write Your Lyrics</h2>
              {(["title", "verse1", "chorus", "verse2", "bridge", "outro"] as (keyof LyricsState)[]).map((field) => {
                const labels: Record<string, string> = { title: "Song Title", verse1: "Verse 1", chorus: "Chorus", verse2: "Verse 2", bridge: "Bridge", outro: "Outro" };
                const max = field === "title" ? 100 : 300;
                return (
                  <div key={field}>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1 font-bold">{labels[field]} <span className="text-zinc-700 font-normal">({charsLeft(field, max)} chars left)</span></label>
                    {field === "title" ? (
                      <input type="text" value={lyrics[field]} onChange={(e) => updateLyrics(field, e.target.value)} maxLength={max} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder={`Enter ${labels[field].toLowerCase()}...`} />
                    ) : (
                      <textarea value={lyrics[field]} onChange={(e) => updateLyrics(field, e.target.value)} maxLength={max} rows={2} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none" placeholder={`Write ${labels[field].toLowerCase()}...`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Voice */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">🎙️ Select Narrator Voice</h2>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Voice</label>
                <select value={voice.name} onChange={(e) => setVoice((prev) => ({ ...prev, name: e.target.value }))} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors">
                  {voices.length === 0 && <option value="">No voices found</option>}
                  {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Speed: {voice.speed.toFixed(1)}x</label>
                  <input type="range" min="0.3" max="2.0" step="0.1" value={voice.speed} onChange={(e) => setVoice((prev) => ({ ...prev, speed: parseFloat(e.target.value) }))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Pitch: {voice.pitch.toFixed(1)}</label>
                  <input type="range" min="0.3" max="2.0" step="0.1" value={voice.pitch} onChange={(e) => setVoice((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }))} className="w-full accent-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Test</label>
                <div className="flex gap-2">
                  <input type="text" value={testText} onChange={(e) => setTestText(e.target.value)} className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                  <button onClick={() => speak(testText)} className="px-4 py-2.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 transition-all cursor-pointer">Preview</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Birds */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">🐦 Select Bird Species</h2>
              <p className="text-[10px] font-mono text-zinc-600">Add bird presets to your soundscape. Tap to toggle, then adjust each volume.</p>
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {[
                  { id: "nightingale", name: "Nightingale", emoji: "🎵", description: "Rich melodic song with varied phrases" },
                  { id: "canary", name: "Canary", emoji: "🐤", description: "Bright, cheerful warbling song" },
                  { id: "robin", name: "Robin", emoji: "🐦", description: "Gentle fluting phrases at dawn" },
                  { id: "blackbird", name: "Blackbird", emoji: "🖤", description: "Rich, fluty, melodic whistles" },
                  { id: "nightjar", name: "European Nightjar", emoji: "🌙", description: "Churring, trilling continuous song" },
                  { id: "cuckoo", name: "Common Cuckoo", emoji: "🕊️", description: "Two-note call, lo-fi loopable" },
                  { id: "sparrow", name: "House Sparrow", emoji: "🐤", description: "Quick cheerful chirps" },
                  { id: "finch", name: "Finch", emoji: "🐦", description: "Rapid tinkling, bubbling song" },
                  { id: "starling", name: "Starling", emoji: "⭐", description: "Mimicry and whistles" },
                  { id: "dove", name: "Mourning Dove", emoji: "🕊️", description: "Soft soothing coos" },
                ].map((bird) => {
                      const sel = birds.find((b) => b.id === bird.id);
                      return (
                        <div key={bird.id} className={`p-3 rounded-xl border cursor-pointer transition-all ${sel ? "bg-indigo-500/10 border-indigo-400/30" : "bg-zinc-950 border-white/5 hover:border-white/20"}`}>
                          <div className="flex items-center justify-between" onClick={() => toggleBird(bird.id)}>
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
                              <input type="range" min="0" max="100" value={sel.volume} onChange={(e) => updateBirdVolume(bird.id, parseInt(e.target.value))} className="w-full accent-indigo-500" />
                              <div className="text-[8px] font-mono text-zinc-600">Volume: {sel.volume}%</div>
                            </div>
                          )}
                        </div>
                    );
                  })}
              </div>
              <p className="text-[9px] font-mono text-zinc-700">For all 500+ species, visit the <button onClick={() => onNavigate("/create/birds")} className="text-indigo-400 underline cursor-pointer">full bird selector</button>.</p>
              <p className="text-[10px] font-mono text-zinc-500">{birds.length} bird{birds.length !== 1 ? "s" : ""} selected</p>
            </div>
          )}

          {/* Step 4: Soundscape */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">🌿 Design Soundscape</h2>
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 font-bold">Nature Layers</h3>
                <div className="space-y-2">
                  {NATURE_LAYERS.map((n) => {
                    const l = soundscape.layers[n.id];
                    return (
                      <div key={n.id} className="bg-zinc-950 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{n.emoji}</span>
                            <span className="text-sm font-bold">{n.label}</span>
                          </div>
                          <button onClick={() => updateLayer(n.id, "active", !l.active)} className={`w-8 h-5 rounded-full transition-colors ${l.active ? "bg-indigo-500" : "bg-zinc-700"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${l.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                        {l.active && (
                          <div className="mt-2 pl-6">
                            <input type="range" min="0" max="100" value={l.vol} onChange={(e) => updateLayer(n.id, "vol", parseInt(e.target.value))} className="w-full accent-indigo-500" />
                            <div className="text-[8px] font-mono text-zinc-600 mt-0.5">Volume: {l.vol}%</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 font-bold">Lo-fi Style</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {LOFI_STYLES.map((s) => (
                    <button key={s.id} onClick={() => setSoundscape((prev) => ({ ...prev, lofiStyle: s.id }))} className={`p-3 rounded-xl text-center border cursor-pointer transition-all ${soundscape.lofiStyle === s.id ? "bg-indigo-500/10 border-indigo-400/30" : "bg-zinc-950 border-white/5 hover:border-white/20"}`}>
                      <div className="text-lg mb-0.5">{s.emoji}</div>
                      <div className="text-[9px] font-mono font-bold">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Tempo: {soundscape.bpm} BPM</label>
                  <input type="range" min="40" max="140" step="1" value={soundscape.bpm} onChange={(e) => setSoundscape((prev) => ({ ...prev, bpm: parseInt(e.target.value) }))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-bold">Binaural Beats</label>
                  <div className="flex items-center gap-3 h-[36px]">
                    <button onClick={() => setSoundscape((prev) => ({ ...prev, binaural: false }))} className={`px-4 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${!soundscape.binaural ? "bg-zinc-950 border-white/20 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-600"}`}>Off</button>
                    <button onClick={() => setSoundscape((prev) => ({ ...prev, binaural: true }))} className={`px-4 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${soundscape.binaural ? "bg-indigo-500/10 border-indigo-400/30 text-indigo-300" : "bg-zinc-900/50 border-white/5 text-zinc-600"}`}>On</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Share */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">🚀 Review & Share</h2>

              {savedUrl ? (
                <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-2xl p-6 text-center space-y-4">
                  <div className="text-3xl">🎉</div>
                  <h3 className="text-lg font-bold">Mix Created!</h3>
                  <p className="text-zinc-400 text-xs font-mono">Share this link — anyone can load your exact mix:</p>
                  <div className="flex items-center gap-2 bg-zinc-950 rounded-xl p-3 border border-white/5">
                    <input type="text" value={savedUrl} readOnly className="flex-1 bg-transparent text-sm text-white font-mono outline-none" />
                    <button onClick={copyUrl} className="px-4 py-2 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer">{copied ? "Copied!" : "Copy"}</button>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Listen to my lofi mix "${lyrics.title || "Untitled"}" on Midnight Signals`)}&url=${encodeURIComponent(savedUrl)}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider bg-sky-600/20 border border-sky-400/30 text-sky-300 hover:bg-sky-600/30 transition-all">Tweet</a>
                    <button onClick={() => { setSavedUrl(null); setStep(0); localStorage.setItem(WIZARD_KEY, "0"); }} className="px-5 py-2.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 transition-all cursor-pointer">Create Another</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">Your Mix Summary</h3>
                    <div className="bg-zinc-950 rounded-xl border border-white/5 p-4 space-y-3 text-xs">
                      <div><span className="text-zinc-500 font-mono">Title:</span> <span className="text-white font-bold">{lyrics.title || "Untitled"}</span></div>
                      <div><span className="text-zinc-500 font-mono">Voice:</span> <span className="text-white">{voice.name || "None selected"}</span></div>
                      <div><span className="text-zinc-500 font-mono">Birds:</span> <span className="text-white">{birds.length} selected</span></div>
                      <div><span className="text-zinc-500 font-mono">Style:</span> <span className="text-white">{soundscape.lofiStyle} · {soundscape.bpm} BPM · Binaural: {soundscape.binaural ? "On" : "Off"}</span></div>
                      <div><span className="text-zinc-500 font-mono">Layers:</span> <span className="text-white">{Object.entries(soundscape.layers).filter(([, l]: [string, LayerConfig]) => l.active).map(([id]) => id).join(", ") || "None"}</span></div>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-600">When someone opens your shared link, the mixer will load with everything you configured.</p>
                  <button onClick={handleSaveMix} disabled={saving} className="w-full py-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                    {saving ? "Creating Mix..." : "🚀 Create Mix & Share"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        {!savedUrl && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setStep((prev) => Math.max(0, prev - 1))} disabled={step === 0} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">← Back</button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))} className="px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-black transition-all cursor-pointer">Next →</button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMixWizard;
