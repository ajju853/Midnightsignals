// Procedural nature, forest, bird, and animal voice synthesizers using Web Audio API
import { BIRD_PRESETS, BirdPreset } from "./birdPresets";

export class NatureSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Sound channels
  private birdsGain: GainNode | null = null;
  private owlGain: GainNode | null = null;
  private treesGain: GainNode | null = null;
  private oceanGain: GainNode | null = null;
  private cricketsGain: GainNode | null = null;
  private woodlandGain: GainNode | null = null;

  // LFO & Constant source nodes for sweeps
  private treesNoiseSource: AudioBufferSourceNode | null = null;
  private treesFilter: BiquadFilterNode | null = null;

  private oceanNoiseSource: AudioBufferSourceNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;

  private cricketsNoiseSource: AudioBufferSourceNode | null = null;
  private cricketsFilter: BiquadFilterNode | null = null;

  // Active volume levels
  private volumes: { [key: string]: number } = {
    birds: 0.4,
    owl: 0.35,
    trees: 0.25,
    ocean: 0.2,
    crickets: 0.15,
  };

  // Active status toggles
  private activeStates: { [key: string]: boolean } = {
    birds: false,
    owl: false,
    trees: false,
    ocean: false,
    crickets: false,
  };

  // Keep track of periodic interval loops
  private birdLoopId: any = null;
  private owlLoopId: any = null;
  private cricketsLoopId: any = null;

  public isPlaying = false;

  // Callback to inform UI of live sound events (e.g., "Bird chirped!")
  private onVoiceTriggerCallback: (soundName: string, icon: string, description: string) => void = () => {};

  constructor() {}

  public registerCallbacks(onVoiceTrigger: (soundName: string, icon: string, description: string) => void) {
    this.onVoiceTriggerCallback = onVoiceTrigger;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxConstructor();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create individual gain nodes for clear spatial separation and leveling
      this.birdsGain = this.ctx.createGain();
      this.birdsGain.gain.setValueAtTime(this.activeStates.birds ? this.volumes.birds : 0.0, this.ctx.currentTime);
      this.birdsGain.connect(this.masterGain);

      this.owlGain = this.ctx.createGain();
      this.owlGain.gain.setValueAtTime(this.activeStates.owl ? this.volumes.owl : 0.0, this.ctx.currentTime);
      this.owlGain.connect(this.masterGain);

      this.treesGain = this.ctx.createGain();
      this.treesGain.gain.setValueAtTime(this.activeStates.trees ? this.volumes.trees : 0.0, this.ctx.currentTime);
      this.treesGain.connect(this.masterGain);

      this.oceanGain = this.ctx.createGain();
      this.oceanGain.gain.setValueAtTime(this.activeStates.ocean ? this.volumes.ocean : 0.0, this.ctx.currentTime);
      this.oceanGain.connect(this.masterGain);

      this.cricketsGain = this.ctx.createGain();
      this.cricketsGain.gain.setValueAtTime(this.activeStates.crickets ? this.volumes.crickets : 0.0, this.ctx.currentTime);
      this.cricketsGain.connect(this.masterGain);

      // Start continuous atmospheric noise loops
      this.setupTreesGenerator();
      this.setupOceanGenerator();
      this.setupCricketsGenerator();

    } catch (e) {
      console.error("Nature ambient sound AudioContext initialization failed", e);
    }
  }

  // --- WHITE/PINK/BROWN PROCEDURAL NOISE BUFFERS ---

  private createNoiseBuffer(type: "white" | "pink" | "brown"): AudioBuffer {
    const sampleRate = this.ctx?.sampleRate || 44100;
    const bufferSize = 4 * sampleRate; // 4 seconds looping buffer
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // rescale
        b6 = white * 0.115926;
      }
    } else if (type === "brown") {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain boost
      }
    }
    return buffer;
  }

  // --- PROCEDURAL GENERATORS SETUP ---

  private setupTreesGenerator() {
    if (!this.ctx || !this.treesGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.treesNoiseSource = this.ctx.createBufferSource();
    this.treesNoiseSource.buffer = buffer;
    this.treesNoiseSource.loop = true;

    this.treesFilter = this.ctx.createBiquadFilter();
    this.treesFilter.type = "bandpass";
    this.treesFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
    this.treesFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.treesNoiseSource.connect(this.treesFilter);
    this.treesFilter.connect(this.treesGain);
    this.treesNoiseSource.start();

    // Leaf Rustling LFO modulation simulation (gentle wind peaks)
    const modulateLeafWind = () => {
      if (!this.ctx || !this.isPlaying || !this.treesFilter || !this.activeStates.trees) return;
      const now = this.ctx.currentTime;
      // Slow rhythmic breeze (4.5s peak-to-trough)
      const breezeWavelength = Math.sin(now * 0.38) * 160 + 420;
      this.treesFilter.frequency.exponentialRampToValueAtTime(Math.max(120, breezeWavelength), now + 0.9);
    };
    setInterval(modulateLeafWind, 1000);
  }

  private setupOceanGenerator() {
    if (!this.ctx || !this.oceanGain) return;

    const buffer = this.createNoiseBuffer("brown");
    this.oceanNoiseSource = this.ctx.createBufferSource();
    this.oceanNoiseSource.buffer = buffer;
    this.oceanNoiseSource.loop = true;

    this.oceanFilter = this.ctx.createBiquadFilter();
    this.oceanFilter.type = "lowpass";
    this.oceanFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.oceanNoiseSource.connect(this.oceanFilter);
    this.oceanFilter.connect(this.oceanGain);
    this.oceanNoiseSource.start();

    // Heavy aquatic swell sweeping slow lowpass frequency (7s cycle)
    const modulateOceanSwell = () => {
      if (!this.ctx || !this.isPlaying || !this.oceanFilter || !this.activeStates.ocean) return;
      const now = this.ctx.currentTime;
      const targetFrequency = 130 + Math.sin(now * 0.22) * 90;
      this.oceanFilter.frequency.exponentialRampToValueAtTime(Math.max(45, targetFrequency), now + 1.6);
    };
    setInterval(modulateOceanSwell, 1200);
  }

  private setupCricketsGenerator() {
    if (!this.ctx || !this.cricketsGain) return;

    const buffer = this.createNoiseBuffer("white");
    this.cricketsNoiseSource = this.ctx.createBufferSource();
    this.cricketsNoiseSource.buffer = buffer;
    this.cricketsNoiseSource.loop = true;

    this.cricketsFilter = this.ctx.createBiquadFilter();
    this.cricketsFilter.type = "bandpass";
    this.cricketsFilter.frequency.setValueAtTime(4600, this.ctx.currentTime);
    this.cricketsFilter.Q.setValueAtTime(45.0, this.ctx.currentTime); // Highly resonant ringing cricket pitch

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.cricketsNoiseSource.connect(this.cricketsFilter);
    this.cricketsFilter.connect(gate);
    gate.connect(this.cricketsGain);
    this.cricketsNoiseSource.start();

    // Trigger cricket chirp rhythm bursts ("chirp... chirp... chirp...")
    const chirpInterval = setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.crickets) return;
      const now = this.ctx.currentTime;
      // High speed pulse bursts typical of woodland crickets in summer heat
      for (let burst = 0; burst < 3; burst++) {
        const start = now + burst * 0.085;
        gate.gain.setValueAtTime(0.001, start);
        gate.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gate.gain.exponentialRampToValueAtTime(0.001, start + 0.065);
      }
    }, 1100);
  }

  // --- ANIMAL SOUND TRIGGERS ---

  private startLoopingSchedules() {
    this.stopLoopingSchedules();

    // Procedural bird-call scheduler (triggers sweet birds singing randomly)
    this.birdLoopId = setInterval(() => {
      if (!this.activeStates.birds || !this.isPlaying) return;
      const chosen = BIRD_PRESETS[Math.floor(Math.random() * BIRD_PRESETS.length)];
      this.triggerProceduralBird(chosen.id);
    }, 6000);

    // Deep hooting owl trigger scheduler
    this.owlLoopId = setInterval(() => {
      if (!this.activeStates.owl || !this.isPlaying) return;
      this.triggerProceduralOwl();
    }, 12000);
  }

  private stopLoopingSchedules() {
    if (this.birdLoopId) clearInterval(this.birdLoopId);
    if (this.owlLoopId) clearInterval(this.owlLoopId);
    this.birdLoopId = null;
    this.owlLoopId = null;
  }

  // Sweet high-pitched synthesized bird whistles
  public triggerProceduralBird(type: string) {
    if (!this.ctx || !this.birdsGain || !this.isPlaying || !this.activeStates.birds) return;

    const now = this.ctx.currentTime;
    
    // Attempt to lookup in preset catalog
    const preset = BIRD_PRESETS.find((p) => p.id === type) || 
                   BIRD_PRESETS.find((p) => p.name.toLowerCase().includes(type.toLowerCase())) || 
                   BIRD_PRESETS[0];
    
    const soundName = preset.name;
    const description = preset.description;
    const emoji = preset.emoji;

    // Trigger sequential bird chirrups
    for (let idx = 0; idx < preset.repeatCount; idx++) {
      const tStart = now + idx * preset.interval;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      
      osc.connect(amp);
      amp.connect(this.birdsGain);
      osc.type = preset.waveType;

      const dur = preset.duration;

      // Handle custom frequency sweep types
      switch (preset.sweepType) {
        case "up":
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.exponentialRampToValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur);
          break;
        case "down":
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.exponentialRampToValueAtTime(Math.max(100, preset.baseFreq + preset.freqChange), tStart + dur);
          break;
        case "vibrato":
        case "trill": {
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.linearRampToValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur);
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(preset.lfoFreq || (preset.sweepType === "trill" ? 22 : 10), tStart);
          lfoGain.gain.setValueAtTime(preset.sweepType === "trill" ? 180 : 80, tStart);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(tStart);
          lfo.stop(tStart + dur);
          break;
        }
        case "warble": {
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          const sweepMid = preset.baseFreq + preset.freqChange;
          osc.frequency.linearRampToValueAtTime(sweepMid, tStart + dur * 0.5);
          osc.frequency.linearRampToValueAtTime(preset.baseFreq, tStart + dur);
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.type = "triangle";
          lfo.frequency.setValueAtTime(preset.lfoFreq || 6, tStart);
          lfoGain.gain.setValueAtTime(140, tStart);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(tStart);
          lfo.stop(tStart + dur);
          break;
        }
        case "cascade":
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.linearRampToValueAtTime(preset.baseFreq + (preset.freqChange * 0.3), tStart + dur * 0.33);
          osc.frequency.linearRampToValueAtTime(preset.baseFreq + (preset.freqChange * 0.6), tStart + dur * 0.66);
          osc.frequency.linearRampToValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur);
          break;
        case "double":
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.setValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur * 0.5);
          break;
        case "triplet":
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.setValueAtTime(preset.baseFreq + (preset.freqChange * 0.5), tStart + dur * 0.33);
          osc.frequency.setValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur * 0.66);
          break;
        case "bell": {
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.exponentialRampToValueAtTime(Math.max(100, preset.baseFreq + preset.freqChange), tStart + dur);
          const fmOsc = this.ctx.createOscillator();
          const fmGain = this.ctx.createGain();
          fmOsc.type = "sine";
          fmOsc.frequency.setValueAtTime(preset.baseFreq * 2.5, tStart);
          fmGain.gain.setValueAtTime(150, tStart);
          fmOsc.connect(fmGain);
          fmGain.connect(osc.frequency);
          fmOsc.start(tStart);
          fmOsc.stop(tStart + dur);
          break;
        }
        case "gurgle": {
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.exponentialRampToValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur);
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.type = "sawtooth";
          lfo.frequency.setValueAtTime(35, tStart);
          lfoGain.gain.setValueAtTime(320, tStart);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(tStart);
          lfo.stop(tStart + dur);
          break;
        }
        case "clicks":
        default:
          osc.frequency.setValueAtTime(preset.baseFreq, tStart);
          osc.frequency.setValueAtTime(preset.baseFreq + preset.freqChange, tStart + dur * 0.1);
          break;
      }

      // Smooth amplitude envelope
      amp.gain.setValueAtTime(0.001, tStart);
      amp.gain.linearRampToValueAtTime(0.18, tStart + dur * 0.15);
      amp.gain.exponentialRampToValueAtTime(0.001, tStart + dur);

      osc.start(tStart);
      osc.stop(tStart + dur + 0.05);
    }

    this.onVoiceTriggerCallback(soundName, emoji, description);
  }

  // Low gentle hooting owls
  public triggerProceduralOwl() {
    if (!this.ctx || !this.owlGain || !this.isPlaying || !this.activeStates.owl) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const bpf = this.ctx.createBiquadFilter();
    const amp = this.ctx.createGain();

    osc.connect(bpf);
    bpf.connect(amp);
    amp.connect(this.owlGain);

    osc.type = "sine";
    bpf.type = "lowpass";
    bpf.frequency.setValueAtTime(300, now);

    // Dynamic hooting sequence: double-hoot "hoo-hoo"
    const baseHz = 165;
    osc.frequency.setValueAtTime(baseHz, now);
    amp.gain.setValueAtTime(0.001, now);

    // Hoot 1
    amp.gain.linearRampToValueAtTime(0.28, now + 0.12);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    // Hoot 2 (slightly pitch-bend downward at the end of the hoot)
    const secondHootStart = now + 0.52;
    osc.frequency.setValueAtTime(baseHz - 3, secondHootStart);
    osc.frequency.exponentialRampToValueAtTime(baseHz - 18, secondHootStart + 0.5);

    amp.gain.setValueAtTime(0.001, secondHootStart);
    amp.gain.linearRampToValueAtTime(0.24, secondHootStart + 0.15);
    amp.gain.exponentialRampToValueAtTime(0.001, secondHootStart + 0.55);

    osc.start(now);
    osc.stop(now + 1.15);

    this.onVoiceTriggerCallback("Midnight Owl", "🦉", "Deep hooting echoes echoing through tree canopy");
  }

  // --- OUTSIDE CONTROLLERS ---

  public start() {
    this.isPlaying = true;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    // Refresh gains to state levels
    this.syncVolumes();
    this.startLoopingSchedules();
  }

  public pause() {
    this.isPlaying = false;
    this.stopLoopingSchedules();
    this.muteAll();
  }

  private muteAll() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (this.ctx) {
      this.birdsGain?.gain.setValueAtTime(0, now);
      this.owlGain?.gain.setValueAtTime(0, now);
      this.treesGain?.gain.setValueAtTime(0, now);
      this.oceanGain?.gain.setValueAtTime(0, now);
      this.cricketsGain?.gain.setValueAtTime(0, now);
    }
  }

  public setVolume(channel: string, vol: number) {
    this.volumes[channel] = vol;
    if (this.ctx && this.isPlaying && this.activeStates[channel]) {
      const gNode = this.getGainNodeOfChannel(channel);
      if (gNode) {
        gNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.15);
      }
    }
  }

  public toggleChannel(channel: string, active: boolean) {
    this.activeStates[channel] = active;
    if (this.ctx && this.isPlaying) {
      const gNode = this.getGainNodeOfChannel(channel);
      if (gNode) {
        const targetGain = active ? this.volumes[channel] : 0.0;
        gNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
      }
    }
  }

  private getGainNodeOfChannel(channel: string): GainNode | null {
    if (channel === "birds") return this.birdsGain;
    if (channel === "owl") return this.owlGain;
    if (channel === "trees") return this.treesGain;
    if (channel === "ocean") return this.oceanGain;
    if (channel === "crickets") return this.cricketsGain;
    return null;
  }

  public syncVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    this.birdsGain?.gain.setValueAtTime(this.activeStates.birds ? this.volumes.birds : 0.0, now);
    this.owlGain?.gain.setValueAtTime(this.activeStates.owl ? this.volumes.owl : 0.0, now);
    this.treesGain?.gain.setValueAtTime(this.activeStates.trees ? this.volumes.trees : 0.0, now);
    this.oceanGain?.gain.setValueAtTime(this.activeStates.ocean ? this.volumes.ocean : 0.0, now);
    this.cricketsGain?.gain.setValueAtTime(this.activeStates.crickets ? this.volumes.crickets : 0.0, now);
  }

  public getChannelVolume(channel: string): number {
    return this.volumes[channel] || 0;
  }

  public getChannelActive(channel: string): boolean {
    return this.activeStates[channel] || false;
  }

  public shutdown() {
    this.pause();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
