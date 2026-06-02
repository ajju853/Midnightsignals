// Simple fully interactive Web Audio API synthesizer for late night lofi signals
import { VibeType } from "../types";

export class MidnightSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private chordOscs: OscillatorNode[] = [];
  private chordGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayGain: GainNode | null = null;

  // New multi-channel sound overlays
  private oceanFilter: BiquadFilterNode | null = null;
  private oceanGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private binauralLeft: OscillatorNode | null = null;
  private binauralRight: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;

  // User configurables
  private oscShape: OscillatorType = "triangle";
  private isBinauralActive = false;
  private binauralVolume = 1.1; // multiplier
  private binauralBaseHz = 110;  // Carrier frequency in Hz
  private binauralOffsetHz = 6;  // Theta wave offset (e.g. 6Hz)

  // Beat loop variables
  private beatIntervalId: any = null;
  private beatIndex = 0;
  private bpm = 75;

  // Active status
  public isPlaying = false;
  public currentTime = 0; // seconds
  private lastTickTime = 0;
  private timeUpdateIntervalId: any = null;

  // Callbacks
  private onTimeUpdateCallback: (secs: number) => void = () => {};
  private onNoteTriggerCallback: (freq: number, type: "kick" | "snare" | "chord" | "melody") => void = () => {};

  constructor() {
    // AudioContext will be lazy-initialized on startup to satisfy browser sandbox rules
  }

  public registerCallbacks(
    onTimeUpdate: (secs: number) => void,
    onNoteTrigger: (freq: number, type: "kick" | "snare" | "chord" | "melody") => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onNoteTriggerCallback = onNoteTrigger;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxConstructor();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create Rain effect background
      this.initRain();

      // Create Ocean wave simulator
      this.initOceanSwell();

      // Create Vinyl crackle simulation
      this.initVinylRumble();

      // Create Binaural brain focus layer
      this.initBinauralBeats();
      
      // Setup delay node for plucks
      this.delayNode = this.ctx.createDelay(1.5);
      this.delayFeedback = this.ctx.createGain();
      this.delayGain = this.ctx.createGain();

      this.delayNode.delayTime.setValueAtTime(0.45, this.ctx.currentTime); // Lofi Echo timing
      this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime); // feedback amount
      this.delayGain.gain.setValueAtTime(0.25, this.ctx.currentTime); // feed to master

      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode); // feedback loop
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.masterGain);

      // Setup chord gain
      this.chordGain = this.ctx.createGain();
      this.chordGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.chordGain.connect(this.masterGain);

    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private initRain() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = "bandpass";
    this.rainFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.rainFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Quiet crackling/rain background (muted by default)

    whiteNoise.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    whiteNoise.start();
  }

  // Feature 6: Synthesized Ocean wind generator (brownian filtered static)
  private initOceanSwell() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    // Simple filter coefficients for a warm brown noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 4.5; // Gain boost
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    this.oceanFilter = this.ctx.createBiquadFilter();
    this.oceanFilter.type = "lowpass";
    this.oceanFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Controlled by slider

    brownNoise.connect(this.oceanFilter);
    this.oceanFilter.connect(this.oceanGain);
    this.oceanGain.connect(this.masterGain);

    brownNoise.start();

    // Dynamically modulate the filter to simulate gentle ocean wave swells (7s intervals)
    const modulate = () => {
      if (!this.ctx || !this.isPlaying || !this.oceanFilter) return;
      const t = this.ctx.currentTime;
      const targetFrequency = 180 + Math.sin(t * 0.45) * 120;
      this.oceanFilter.frequency.exponentialRampToValueAtTime(Math.max(60, targetFrequency), t + 1.2);
    };
    setInterval(modulate, 1400);
  }

  // Feature 7: Vinyl record crackle sound overlay simulation
  private initVinylRumble() {
    if (!this.ctx || !this.masterGain) return;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Controlled by slider
    this.vinylGain.connect(this.masterGain);

    // Periodically trigger transient 'clicks' or 'pops' characteristic of older record needles
    setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.vinylGain) return;
      const currentVinylVol = this.vinylGain.gain.value;
      if (currentVinylVol < 0.01) return;

      // Random transient pop
      if (Math.random() > 0.5) {
        const osc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        const bpf = this.ctx.createBiquadFilter();

        osc.connect(bpf);
        bpf.connect(popGain);
        popGain.connect(this.vinylGain);

        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.04);
        
        bpf.type = "bandpass";
        bpf.frequency.setValueAtTime(800, this.ctx.currentTime);
        bpf.Q.setValueAtTime(2.0, this.ctx.currentTime);

        popGain.gain.setValueAtTime(currentVinylVol * 0.45, this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 1800);
  }

  // Feature 8: Binaural beat tone focuses on Left vs Right ear wave differences
  private initBinauralBeats() {
    if (!this.ctx || !this.masterGain) return;

    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.binauralGain.connect(this.masterGain);
  }

  public toggleBinaural(active: boolean) {
    this.isBinauralActive = active;
    this.syncBinauralNodes();
  }

  public setBinauralFrequency(offsetHz: number) {
    this.binauralOffsetHz = offsetHz;
    if (this.binauralLeft && this.binauralRight && this.ctx) {
      const now = this.ctx.currentTime;
      this.binauralLeft.frequency.setValueAtTime(this.binauralBaseHz, now);
      this.binauralRight.frequency.setValueAtTime(this.binauralBaseHz + offsetHz, now);
    }
  }

  private syncBinauralNodes() {
    if (!this.ctx || !this.binauralGain) return;

    if (this.isBinauralActive && this.isPlaying) {
      if (this.binauralLeft) return; // already playing

      const splitter = this.ctx.createChannelMerger(2);
      
      this.binauralLeft = this.ctx.createOscillator();
      this.binauralLeft.type = "sine";
      this.binauralLeft.frequency.setValueAtTime(this.binauralBaseHz, this.ctx.currentTime);

      this.binauralRight = this.ctx.createOscillator();
      this.binauralRight.type = "sine";
      this.binauralRight.frequency.setValueAtTime(this.binauralBaseHz + this.binauralOffsetHz, this.ctx.currentTime);

      const gainL = this.ctx.createGain();
      const gainR = this.ctx.createGain();
      gainL.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gainR.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.binauralLeft.connect(gainL);
      this.binauralRight.connect(gainR);

      // Connect left oscillator to channel 0, right to channel 1
      gainL.connect(splitter, 0, 0);
      gainR.connect(splitter, 0, 1);

      splitter.connect(this.binauralGain);
      
      this.binauralLeft.start();
      this.binauralRight.start();
    } else {
      if (this.binauralLeft) {
        try { this.binauralLeft.stop(); } catch(e){}
        this.binauralLeft = null;
      }
      if (this.binauralRight) {
        try { this.binauralRight.stop(); } catch(e){}
        this.binauralRight = null;
      }
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  public setRainVolume(vol: number) {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.linearRampToValueAtTime(vol * 0.04, this.ctx.currentTime + 0.15);
    }
  }

  public setOceanVolume(vol: number) {
    if (this.oceanGain && this.ctx) {
      this.oceanGain.gain.linearRampToValueAtTime(vol * 0.03, this.ctx.currentTime + 0.2);
    }
  }

  public setVinylVolume(vol: number) {
    if (this.vinylGain && this.ctx) {
      this.vinylGain.gain.linearRampToValueAtTime(vol * 0.022, this.ctx.currentTime + 0.1);
    }
  }

  public setBinauralVolume(vol: number) {
    this.binauralVolume = vol;
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.linearRampToValueAtTime(vol * 0.08, this.ctx.currentTime + 0.15);
    }
  }

  public setBPM(newBpm: number) {
    this.bpm = Math.min(120, Math.max(50, newBpm));
    if (this.isPlaying) {
      // Re-trigger pacing intervals seamlessly
      this.pauseIntervalsOnly();
      this.startIntervalsOnly();
    }
  }

  public setWaveform(shape: OscillatorType) {
    this.oscShape = shape;
    if (this.isPlaying) {
      this.stopChords();
      this.triggerChordForTime(this.currentTime);
    }
  }

  public start(startTimeSeconds = 0) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentTime = startTimeSeconds;
    this.lastTickTime = this.ctx.currentTime;

    this.startIntervalsOnly();
    this.syncBinauralNodes();
  }

  private startIntervalsOnly() {
    if (!this.ctx) return;
    const stepTime = 60 / this.bpm / 2; // eighth notes
    this.beatIndex = Math.floor(this.currentTime / stepTime) % 16;

    this.beatIntervalId = setInterval(() => {
      this.tickBeat();
    }, stepTime * 1000);

    this.timeUpdateIntervalId = setInterval(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const diff = now - this.lastTickTime;
      this.lastTickTime = now;
      this.currentTime += diff;
      this.onTimeUpdateCallback(this.currentTime);
    }, 100);
  }

  private pauseIntervalsOnly() {
    if (this.beatIntervalId) {
      clearInterval(this.beatIntervalId);
      this.beatIntervalId = null;
    }
    if (this.timeUpdateIntervalId) {
      clearInterval(this.timeUpdateIntervalId);
      this.timeUpdateIntervalId = null;
    }
  }

  public pause() {
    this.isPlaying = false;
    this.pauseIntervalsOnly();
    this.stopChords();
    this.syncBinauralNodes();
  }

  public seek(seconds: number) {
    this.currentTime = seconds;
    this.onTimeUpdateCallback(seconds);
    if (this.ctx) {
      this.lastTickTime = this.ctx.currentTime;
    }
    if (this.isPlaying) {
      this.stopChords();
      this.triggerChordForTime(seconds);
    }
  }

  private stopChords() {
    this.chordOscs.forEach(o => {
      try { o.stop(); } catch(e){}
    });
    this.chordOscs = [];
  }

  private getPluckFrequency(index: number): number {
    const scale = [220, 246.94, 277.18, 329.63, 392.00, 440, 493.88, 554.37, 659.25, 783.99, 880];
    return scale[index % scale.length];
  }

  private triggerChordForTime(seconds: number) {
    if (!this.ctx || !this.chordGain) return;

    const chordIndex = Math.floor(seconds / 8) % 4;
    const progressions = [
      [110, 130.81, 146.83, 164.81],
      [87.31, 130.81, 174.61, 220.00],
      [130.81, 164.81, 196.00, 261.63],
      [97.99, 146.83, 196.00, 246.94]
    ];

    const freqs = progressions[chordIndex];
    this.stopChords();

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.chordGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = this.oscShape;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320 + (idx * 50), this.ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(this.chordGain);
      
      osc.start();
      this.chordOscs.push(osc);
      this.onNoteTriggerCallback(freq, "chord");
    });
  }

  private tickBeat() {
    if (!this.ctx || !this.isPlaying) return;

    if (this.beatIndex % 4 === 0) {
      this.playKick();
    }

    if (this.beatIndex === 4 || this.beatIndex === 12) {
      this.playLofiSnare();
    }

    if ([2, 5, 8, 11, 13, 15].includes(this.beatIndex) && Math.random() > 0.3) {
      this.playPluckNote();
    }

    if (this.beatIndex % 8 === 0) {
      this.triggerChordForTime(this.currentTime);
    }

    this.beatIndex = (this.beatIndex + 1) % 16;
  }

  private playKick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);

    this.onNoteTriggerCallback(55, "kick");
  }

  private playLofiSnare() {
    if (!this.ctx || !this.masterGain) return;
    
    const bufferSize = this.ctx.sampleRate * 0.1;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const nSource = this.ctx.createBufferSource();
    nSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    nSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    nSource.start();
    this.onNoteTriggerCallback(950, "snare");
  }

  private playPluckNote() {
    if (!this.ctx || !this.delayNode) return;

    const notePos = Math.floor(Math.random() * 8) + 3;
    const freq = this.getPluckFrequency(notePos);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.delayNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);

    this.onNoteTriggerCallback(freq, "melody");
  }

  public setVibe(vibe: VibeType) {
    if (!this.ctx) return;
    
    switch (vibe) {
      case "dreamy":
        this.bpm = 70;
        if (this.delayNode) {
          this.delayNode.delayTime.setValueAtTime(0.6, this.ctx.currentTime);
        }
        break;
      case "melancholy":
        this.bpm = 65;
        if (this.delayNode) {
          this.delayNode.delayTime.setValueAtTime(0.8, this.ctx.currentTime);
        }
        break;
      case "hopeful":
        this.bpm = 82;
        if (this.delayNode) {
          this.delayNode.delayTime.setValueAtTime(0.4, this.ctx.currentTime);
        }
        break;
      case "neon":
        this.bpm = 90;
        if (this.delayNode) {
          this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime);
        }
        break;
    }
  }

  public shutdown() {
    this.pause();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
