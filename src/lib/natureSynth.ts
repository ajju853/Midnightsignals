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
  
  private mountainWindGain: GainNode | null = null;
  private brookGain: GainNode | null = null;
  private desertBreezeGain: GainNode | null = null;
  private morningMistGain: GainNode | null = null;
  private caveEchoesGain: GainNode | null = null;
  
  // Regional Indian & Southeast Asian Channels
  private monsoonRainGain: GainNode | null = null;
  private templeBellsGain: GainNode | null = null;
  private peacockCallsGain: GainNode | null = null;
  private nightMarketsGain: GainNode | null = null;
  private tropicalRainforestGain: GainNode | null = null;
  private cicadaChorusGain: GainNode | null = null;
  private mangroveWavesGain: GainNode | null = null;
  private hongKongKitesGain: GainNode | null = null;
  private victoriaHarbourGain: GainNode | null = null;

  // Belgian Ardennes Channels
  private ardennesWindGain: GainNode | null = null;
  private ardennesBrookGain: GainNode | null = null;

  // LFO & Constant source nodes for sweeps
  private treesNoiseSource: AudioBufferSourceNode | null = null;
  private treesFilter: BiquadFilterNode | null = null;

  private oceanNoiseSource: AudioBufferSourceNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;

  private cricketsNoiseSource: AudioBufferSourceNode | null = null;
  private cricketsFilter: BiquadFilterNode | null = null;

  private mountainWindNoiseSource: AudioBufferSourceNode | null = null;
  private mountainWindFilter: BiquadFilterNode | null = null;

  private desertBreezeNoiseSource: AudioBufferSourceNode | null = null;
  private desertBreezeFilter: BiquadFilterNode | null = null;

  private morningMistNoiseSource: AudioBufferSourceNode | null = null;
  private morningMistFilter: BiquadFilterNode | null = null;

  private brookNoiseSource: AudioBufferSourceNode | null = null;
  private brookFilter: BiquadFilterNode | null = null;

  // Regional sweeping noise processes
  private monsoonRainNoiseSource: AudioBufferSourceNode | null = null;
  private monsoonRainFilter: BiquadFilterNode | null = null;

  private nightMarketsNoiseSource: AudioBufferSourceNode | null = null;
  private nightMarketsFilter: BiquadFilterNode | null = null;

  private tropicalRainforestNoiseSource: AudioBufferSourceNode | null = null;
  private tropicalRainforestFilter: BiquadFilterNode | null = null;

  private cicadaChorusNoiseSource: AudioBufferSourceNode | null = null;
  private cicadaChorusFilter: BiquadFilterNode | null = null;

  private mangroveWavesNoiseSource: AudioBufferSourceNode | null = null;
  private mangroveWavesFilter: BiquadFilterNode | null = null;

  private victoriaHarbourNoiseSource: AudioBufferSourceNode | null = null;
  private victoriaHarbourFilter: BiquadFilterNode | null = null;

  // Belgian sweeping noise processes
  private ardennesWindNoiseSource: AudioBufferSourceNode | null = null;
  private ardennesWindFilter: BiquadFilterNode | null = null;

  private ardennesBrookNoiseSource: AudioBufferSourceNode | null = null;
  private ardennesBrookFilter: BiquadFilterNode | null = null;

  // Active volume levels
  private volumes: { [key: string]: number } = {
    birds: 0.4,
    owl: 0.35,
    trees: 0.25,
    ocean: 0.2,
    crickets: 0.15,
    mountainWind: 0.35,
    brook: 0.4,
    desertBreeze: 0.3,
    morningMist: 0.25,
    caveEchoes: 0.35,
    monsoonRain: 0.45,
    templeBells: 0.3,
    peacockCalls: 0.35,
    nightMarkets: 0.25,
    tropicalRainforest: 0.35,
    cicadaChorus: 0.2,
    mangroveWaves: 0.3,
    hongKongKites: 0.45,
    victoriaHarbour: 0.4,
    ardennesWind: 0.35,
    ardennesBrook: 0.4,
  };

  // Active status toggles
  private activeStates: { [key: string]: boolean } = {
    birds: false,
    owl: false,
    trees: false,
    ocean: false,
    crickets: false,
    mountainWind: false,
    brook: false,
    desertBreeze: false,
    morningMist: false,
    caveEchoes: false,
    monsoonRain: false,
    templeBells: false,
    peacockCalls: false,
    nightMarkets: false,
    tropicalRainforest: false,
    cicadaChorus: false,
    mangroveWaves: false,
    hongKongKites: false,
    victoriaHarbour: false,
    ardennesWind: false,
    ardennesBrook: false,
  };

  // Keep track of periodic interval loops
  private birdLoopId: any = null;
  private owlLoopId: any = null;
  private cricketsLoopId: any = null;
  private caveEchoesLoopId: any = null;
  private brookBubbleLoopId: any = null;
  private templeBellsLoopId: any = null;
  private peacockCallsLoopId: any = null;
  private tropicalRainforestLoopId: any = null;
  private hongKongKitesLoopId: any = null;
  private victoriaHarbourLoopId: any = null;
  private ardennesBrookBubbleLoopId: any = null;

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

      this.mountainWindGain = this.ctx.createGain();
      this.mountainWindGain.gain.setValueAtTime(this.activeStates.mountainWind ? this.volumes.mountainWind : 0.0, this.ctx.currentTime);
      this.mountainWindGain.connect(this.masterGain);

      this.brookGain = this.ctx.createGain();
      this.brookGain.gain.setValueAtTime(this.activeStates.brook ? this.volumes.brook : 0.0, this.ctx.currentTime);
      this.brookGain.connect(this.masterGain);

      this.desertBreezeGain = this.ctx.createGain();
      this.desertBreezeGain.gain.setValueAtTime(this.activeStates.desertBreeze ? this.volumes.desertBreeze : 0.0, this.ctx.currentTime);
      this.desertBreezeGain.connect(this.masterGain);

      this.morningMistGain = this.ctx.createGain();
      this.morningMistGain.gain.setValueAtTime(this.activeStates.morningMist ? this.volumes.morningMist : 0.0, this.ctx.currentTime);
      this.morningMistGain.connect(this.masterGain);

      this.caveEchoesGain = this.ctx.createGain();
      this.caveEchoesGain.gain.setValueAtTime(this.activeStates.caveEchoes ? this.volumes.caveEchoes : 0.0, this.ctx.currentTime);
      this.caveEchoesGain.connect(this.masterGain);

      // Create new regional Indian & Southeast Asian gain nodes
      this.monsoonRainGain = this.ctx.createGain();
      this.monsoonRainGain.gain.setValueAtTime(this.activeStates.monsoonRain ? this.volumes.monsoonRain : 0.0, this.ctx.currentTime);
      this.monsoonRainGain.connect(this.masterGain);

      this.templeBellsGain = this.ctx.createGain();
      this.templeBellsGain.gain.setValueAtTime(this.activeStates.templeBells ? this.volumes.templeBells : 0.0, this.ctx.currentTime);
      this.templeBellsGain.connect(this.masterGain);

      this.peacockCallsGain = this.ctx.createGain();
      this.peacockCallsGain.gain.setValueAtTime(this.activeStates.peacockCalls ? this.volumes.peacockCalls : 0.0, this.ctx.currentTime);
      this.peacockCallsGain.connect(this.masterGain);

      this.nightMarketsGain = this.ctx.createGain();
      this.nightMarketsGain.gain.setValueAtTime(this.activeStates.nightMarkets ? this.volumes.nightMarkets : 0.0, this.ctx.currentTime);
      this.nightMarketsGain.connect(this.masterGain);

      this.tropicalRainforestGain = this.ctx.createGain();
      this.tropicalRainforestGain.gain.setValueAtTime(this.activeStates.tropicalRainforest ? this.volumes.tropicalRainforest : 0.0, this.ctx.currentTime);
      this.tropicalRainforestGain.connect(this.masterGain);

      this.cicadaChorusGain = this.ctx.createGain();
      this.cicadaChorusGain.gain.setValueAtTime(this.activeStates.cicadaChorus ? this.volumes.cicadaChorus : 0.0, this.ctx.currentTime);
      this.cicadaChorusGain.connect(this.masterGain);

      this.mangroveWavesGain = this.ctx.createGain();
      this.mangroveWavesGain.gain.setValueAtTime(this.activeStates.mangroveWaves ? this.volumes.mangroveWaves : 0.0, this.ctx.currentTime);
      this.mangroveWavesGain.connect(this.masterGain);

      this.hongKongKitesGain = this.ctx.createGain();
      this.hongKongKitesGain.gain.setValueAtTime(this.activeStates.hongKongKites ? this.volumes.hongKongKites : 0.0, this.ctx.currentTime);
      this.hongKongKitesGain.connect(this.masterGain);

      this.victoriaHarbourGain = this.ctx.createGain();
      this.victoriaHarbourGain.gain.setValueAtTime(this.activeStates.victoriaHarbour ? this.volumes.victoriaHarbour : 0.0, this.ctx.currentTime);
      this.victoriaHarbourGain.connect(this.masterGain);

      this.ardennesWindGain = this.ctx.createGain();
      this.ardennesWindGain.gain.setValueAtTime(this.activeStates.ardennesWind ? this.volumes.ardennesWind : 0.0, this.ctx.currentTime);
      this.ardennesWindGain.connect(this.masterGain);

      this.ardennesBrookGain = this.ctx.createGain();
      this.ardennesBrookGain.gain.setValueAtTime(this.activeStates.ardennesBrook ? this.volumes.ardennesBrook : 0.0, this.ctx.currentTime);
      this.ardennesBrookGain.connect(this.masterGain);

      // Start continuous atmospheric noise loops
      this.setupTreesGenerator();
      this.setupOceanGenerator();
      this.setupCricketsGenerator();
      this.setupMountainWindGenerator();
      this.setupBrookGenerator();
      this.setupDesertBreezeGenerator();
      this.setupMorningMistGenerator();

      // Setup continuous regional soundscapes
      this.setupMonsoonRainGenerator();
      this.setupNightMarketsGenerator();
      this.setupTropicalRainforestGenerator();
      this.setupCicadaChorusGenerator();
      this.setupMangroveWavesGenerator();
      this.setupVictoriaHarbourGenerator();
      this.setupArdennesWindGenerator();
      this.setupArdennesBrookGenerator();

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

  private setupMountainWindGenerator() {
    if (!this.ctx || !this.mountainWindGain) return;

    const buffer = this.createNoiseBuffer("brown");
    this.mountainWindNoiseSource = this.ctx.createBufferSource();
    this.mountainWindNoiseSource.buffer = buffer;
    this.mountainWindNoiseSource.loop = true;

    this.mountainWindFilter = this.ctx.createBiquadFilter();
    this.mountainWindFilter.type = "bandpass";
    this.mountainWindFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.mountainWindFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.mountainWindNoiseSource.connect(this.mountainWindFilter);
    this.mountainWindFilter.connect(this.mountainWindGain);
    this.mountainWindNoiseSource.start();

    // Whistling alpine wind modulation (slow sweeping)
    const modulateMountainWind = () => {
      if (!this.ctx || !this.isPlaying || !this.mountainWindFilter || !this.activeStates.mountainWind) return;
      const now = this.ctx.currentTime;
      const windSwell = Math.sin(now * 0.15) * 110 + 200;
      this.mountainWindFilter.frequency.exponentialRampToValueAtTime(Math.max(80, windSwell), now + 1.2);
    };
    setInterval(modulateMountainWind, 1300);
  }

  private setupBrookGenerator() {
    if (!this.ctx || !this.brookGain) return;

    // Use pink noise for continuous background streaming water
    const buffer = this.createNoiseBuffer("pink");
    this.brookNoiseSource = this.ctx.createBufferSource();
    this.brookNoiseSource.buffer = buffer;
    this.brookNoiseSource.loop = true;

    this.brookFilter = this.ctx.createBiquadFilter();
    this.brookFilter.type = "lowpass";
    this.brookFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.brookNoiseSource.connect(this.brookFilter);
    this.brookFilter.connect(this.brookGain);
    this.brookNoiseSource.start();
  }

  private setupDesertBreezeGenerator() {
    if (!this.ctx || !this.desertBreezeGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.desertBreezeNoiseSource = this.ctx.createBufferSource();
    this.desertBreezeNoiseSource.buffer = buffer;
    this.desertBreezeNoiseSource.loop = true;

    this.desertBreezeFilter = this.ctx.createBiquadFilter();
    this.desertBreezeFilter.type = "bandpass";
    this.desertBreezeFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.desertBreezeFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.desertBreezeNoiseSource.connect(this.desertBreezeFilter);
    this.desertBreezeFilter.connect(this.desertBreezeGain);
    this.desertBreezeNoiseSource.start();

    // Desert sand gusts modulator (whistling wind drafts)
    const modulateDesertBreeze = () => {
      if (!this.ctx || !this.isPlaying || !this.desertBreezeFilter || !this.activeStates.desertBreeze) return;
      const now = this.ctx.currentTime;
      const sandGust = 900 + Math.sin(now * 0.28) * 350 + Math.cos(now * 0.44) * 150;
      this.desertBreezeFilter.frequency.exponentialRampToValueAtTime(Math.max(400, sandGust), now + 1.0);
    };
    setInterval(modulateDesertBreeze, 1100);
  }

  private setupMorningMistGenerator() {
    if (!this.ctx || !this.morningMistGain) return;

    const buffer = this.createNoiseBuffer("white");
    this.morningMistNoiseSource = this.ctx.createBufferSource();
    this.morningMistNoiseSource.buffer = buffer;
    this.morningMistNoiseSource.loop = true;

    this.morningMistFilter = this.ctx.createBiquadFilter();
    this.morningMistFilter.type = "lowpass";
    this.morningMistFilter.frequency.setValueAtTime(2500, this.ctx.currentTime);

    const softVolumeGate = this.ctx.createGain();
    softVolumeGate.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.morningMistNoiseSource.connect(this.morningMistFilter);
    this.morningMistFilter.connect(softVolumeGate);
    softVolumeGate.connect(this.morningMistGain);
    this.morningMistNoiseSource.start();
  }

  // --- NEW REGIONAL PROCEDURAL GENERATORS (INDIA & SOUTHEAST ASIA) ---

  private setupMonsoonRainGenerator() {
    if (!this.ctx || !this.monsoonRainGain) return;

    // Deep heavy tropical rain stream underlay
    const buffer = this.createNoiseBuffer("brown");
    this.monsoonRainNoiseSource = this.ctx.createBufferSource();
    this.monsoonRainNoiseSource.buffer = buffer;
    this.monsoonRainNoiseSource.loop = true;

    this.monsoonRainFilter = this.ctx.createBiquadFilter();
    this.monsoonRainFilter.type = "lowpass";
    this.monsoonRainFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const softVolumeGate = this.ctx.createGain();
    softVolumeGate.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.monsoonRainNoiseSource.connect(this.monsoonRainFilter);
    this.monsoonRainFilter.connect(softVolumeGate);
    softVolumeGate.connect(this.monsoonRainGain);
    this.monsoonRainNoiseSource.start();

    // Rumbles of thunder periodically simulated inside monsoon filter
    const simulateMonsoonThunder = () => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.monsoonRain || !this.monsoonRainFilter) return;
      const now = this.ctx.currentTime;
      if (Math.random() > 0.65) {
        // Deep rumble base frequency modulation
        this.monsoonRainFilter.frequency.setValueAtTime(140, now);
        this.monsoonRainFilter.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        this.monsoonRainFilter.frequency.exponentialRampToValueAtTime(60, now + 3.5);
        this.onVoiceTriggerCallback("Monsoon Thunder", "⚡", "Distant thunder rolling deep through dark rain clouds");
      }
    };
    setInterval(simulateMonsoonThunder, 8000);
  }

  private setupNightMarketsGenerator() {
    if (!this.ctx || !this.nightMarketsGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.nightMarketsNoiseSource = this.ctx.createBufferSource();
    this.nightMarketsNoiseSource.buffer = buffer;
    this.nightMarketsNoiseSource.loop = true;

    this.nightMarketsFilter = this.ctx.createBiquadFilter();
    this.nightMarketsFilter.type = "bandpass";
    this.nightMarketsFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.nightMarketsFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.nightMarketsNoiseSource.connect(this.nightMarketsFilter);
    this.nightMarketsFilter.connect(gate);
    gate.connect(this.nightMarketsGain);
    this.nightMarketsNoiseSource.start();

    // Rhythmic night-market chatter and street vendor echoes
    const modulateMarketAtmosphere = () => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.nightMarkets || !gate) return;
      const now = this.ctx.currentTime;
      const chatterSwell = 0.04 + Math.sin(now * 0.43) * 0.02 + Math.cos(now * 0.72) * 0.012;
      gate.gain.linearRampToValueAtTime(chatterSwell, now + 0.8);
    };
    setInterval(modulateMarketAtmosphere, 1000);
  }

  private setupTropicalRainforestGenerator() {
    if (!this.ctx || !this.tropicalRainforestGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.tropicalRainforestNoiseSource = this.ctx.createBufferSource();
    this.tropicalRainforestNoiseSource.buffer = buffer;
    this.tropicalRainforestNoiseSource.loop = true;

    this.tropicalRainforestFilter = this.ctx.createBiquadFilter();
    this.tropicalRainforestFilter.type = "lowpass";
    this.tropicalRainforestFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.tropicalRainforestNoiseSource.connect(this.tropicalRainforestFilter);
    this.tropicalRainforestFilter.connect(gate);
    gate.connect(this.tropicalRainforestGain);
    this.tropicalRainforestNoiseSource.start();
  }

  private setupCicadaChorusGenerator() {
    if (!this.ctx || !this.cicadaChorusGain) return;

    const buffer = this.createNoiseBuffer("white");
    this.cicadaChorusNoiseSource = this.ctx.createBufferSource();
    this.cicadaChorusNoiseSource.buffer = buffer;
    this.cicadaChorusNoiseSource.loop = true;

    this.cicadaChorusFilter = this.ctx.createBiquadFilter();
    this.cicadaChorusFilter.type = "bandpass";
    this.cicadaChorusFilter.frequency.setValueAtTime(5200, this.ctx.currentTime);
    this.cicadaChorusFilter.Q.setValueAtTime(55.0, this.ctx.currentTime); // High-frequency resonant ringing cicada pitch

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.005, this.ctx.currentTime);

    this.cicadaChorusNoiseSource.connect(this.cicadaChorusFilter);
    this.cicadaChorusFilter.connect(gate);
    gate.connect(this.cicadaChorusGain);
    this.cicadaChorusNoiseSource.start();

    // Tropical cicada pulsing chorus waves ("breathe in... breathe out...")
    const modulateCicadas = () => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.cicadaChorus || !gate) return;
      const now = this.ctx.currentTime;
      // Oscillate between 0.001 and 0.022 volume every 2.4s
      const intensity = 0.01 + Math.sin(now * 2.6) * 0.01;
      gate.gain.linearRampToValueAtTime(Math.max(0.001, intensity), now + 0.15);
    };
    setInterval(modulateCicadas, 200);
  }

  private setupMangroveWavesGenerator() {
    if (!this.ctx || !this.mangroveWavesGain) return;

    const buffer = this.createNoiseBuffer("brown");
    this.mangroveWavesNoiseSource = this.ctx.createBufferSource();
    this.mangroveWavesNoiseSource.buffer = buffer;
    this.mangroveWavesNoiseSource.loop = true;

    this.mangroveWavesFilter = this.ctx.createBiquadFilter();
    this.mangroveWavesFilter.type = "lowpass";
    this.mangroveWavesFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.mangroveWavesNoiseSource.connect(this.mangroveWavesFilter);
    this.mangroveWavesFilter.connect(gate);
    gate.connect(this.mangroveWavesGain);
    this.mangroveWavesNoiseSource.start();

    // Rhythmic slushing wave mud-root lapping sweeps (4.8s cycle)
    const modulateMangroveLapping = () => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.mangroveWaves || !gate || !this.mangroveWavesFilter) return;
      const now = this.ctx.currentTime;
      const activeSwell = 0.02 + Math.max(0, Math.sin(now * 1.3)) * 0.22;
      gate.gain.linearRampToValueAtTime(activeSwell, now + 1.2);
      this.mangroveWavesFilter.frequency.setValueAtTime(90 + Math.sin(now * 1.3) * 50, now);
    };
    setInterval(modulateMangroveLapping, 800);
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

    // Cave echoes scheduler
    this.caveEchoesLoopId = setInterval(() => {
      if (!this.activeStates.caveEchoes || !this.isPlaying) return;
      this.triggerProceduralCaveEcho();
    }, 4500);

    // Brook bubbling scheduler
    this.brookBubbleLoopId = setInterval(() => {
      if (!this.activeStates.brook || !this.isPlaying) return;
      // Trigger multiple tiny bubbles!
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.triggerProceduralBrookBubble();
        }, i * (80 + Math.random() * 120));
      }
    }, 550);

    // Temple bells ringing random scheduler
    this.templeBellsLoopId = setInterval(() => {
      if (!this.activeStates.templeBells || !this.isPlaying) return;
      this.triggerTempleBells();
    }, 9000);

    // Peacock wild calls scheduler
    this.peacockCallsLoopId = setInterval(() => {
      if (!this.activeStates.peacockCalls || !this.isPlaying) return;
      this.triggerPeacockCall();
    }, 14000);

    // Southeast Asian rainforest random jungle events scheduler
    this.tropicalRainforestLoopId = setInterval(() => {
      if (!this.activeStates.tropicalRainforest || !this.isPlaying) return;
      this.triggerTropicalRainforestEvent();
    }, 7500);

    // Hong Kong Black Kites random scheduler
    this.hongKongKitesLoopId = setInterval(() => {
      if (!this.activeStates.hongKongKites || !this.isPlaying) return;
      this.triggerHongKongKiteCall();
    }, 11000);

    // Victoria Harbour Ferry horns random scheduler
    this.victoriaHarbourLoopId = setInterval(() => {
      if (!this.activeStates.victoriaHarbour || !this.isPlaying) return;
      this.triggerStarFerryHorn();
    }, 15000);

    // Ardennes brook bubbling scheduler
    this.ardennesBrookBubbleLoopId = setInterval(() => {
      if (!this.activeStates.ardennesBrook || !this.isPlaying) return;
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.triggerProceduralArdennesBrookBubble();
        }, i * (90 + Math.random() * 110));
      }
    }, 600);
  }

  private stopLoopingSchedules() {
    if (this.birdLoopId) clearInterval(this.birdLoopId);
    if (this.owlLoopId) clearInterval(this.owlLoopId);
    if (this.caveEchoesLoopId) clearInterval(this.caveEchoesLoopId);
    if (this.brookBubbleLoopId) clearInterval(this.brookBubbleLoopId);
    if (this.templeBellsLoopId) clearInterval(this.templeBellsLoopId);
    if (this.peacockCallsLoopId) clearInterval(this.peacockCallsLoopId);
    if (this.tropicalRainforestLoopId) clearInterval(this.tropicalRainforestLoopId);
    if (this.hongKongKitesLoopId) clearInterval(this.hongKongKitesLoopId);
    if (this.victoriaHarbourLoopId) clearInterval(this.victoriaHarbourLoopId);
    if (this.ardennesBrookBubbleLoopId) clearInterval(this.ardennesBrookBubbleLoopId);
    this.birdLoopId = null;
    this.owlLoopId = null;
    this.caveEchoesLoopId = null;
    this.brookBubbleLoopId = null;
    this.templeBellsLoopId = null;
    this.peacockCallsLoopId = null;
    this.tropicalRainforestLoopId = null;
    this.hongKongKitesLoopId = null;
    this.victoriaHarbourLoopId = null;
    this.ardennesBrookBubbleLoopId = null;
  }

  public triggerTempleBells() {
    if (!this.ctx || !this.templeBellsGain || !this.isPlaying || !this.activeStates.templeBells) return;
    const now = this.ctx.currentTime;
    
    // Pristine physical brass temple bells overtone synthesis
    const frequencies = [220, 276.5, 330, 440, 554.4, 660, 880];
    const decayParams = [2.5, 2.0, 1.8, 1.4, 1.2, 0.9, 0.6];
    
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const amp = this.ctx!.createGain();
      
      osc.connect(amp);
      amp.connect(this.templeBellsGain!);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.linearRampToValueAtTime(0.08 * (freq > 500 ? 0.35 : 0.9), now + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + decayParams[idx]);
      
      osc.start(now);
      osc.stop(now + decayParams[idx] + 0.1);
    });
    
    this.onVoiceTriggerCallback("Temple Bells", "🔔", "Resounding pristine brass dome bells echoing tranquil energy");
  }

  public triggerPeacockCall() {
    if (!this.ctx || !this.peacockCallsGain || !this.isPlaying || !this.activeStates.peacockCalls) return;
    const now = this.ctx.currentTime;
    
    // Peacock high-pitched exotic screech "may-aawww" frequency-shifter
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    
    osc.connect(amp);
    amp.connect(this.peacockCallsGain);
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.65);
    
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.09, now + 0.06);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    
    osc.start(now);
    osc.stop(now + 0.8);
    
    this.onVoiceTriggerCallback("Indian Peacock", "🦚", "Exotic peacock calling out across the dense twilight grove");
  }

  public triggerTropicalRainforestEvent() {
    if (!this.ctx || !this.tropicalRainforestGain || !this.isPlaying || !this.activeStates.tropicalRainforest) return;
    const now = this.ctx.currentTime;
    
    // Choose randomly between a Malaysian Cicada chirp or a Tropical Hornbill call
    const isCicada = Math.random() > 0.5;

    if (isCicada) {
      // Rapid tree cricket rhythm click
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      
      osc.connect(amp);
      amp.connect(this.tropicalRainforestGain);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2800, now);
      
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.linearRampToValueAtTime(0.04, now + 0.05);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      
      osc.start(now);
      osc.stop(now + 0.5);
      
      this.onVoiceTriggerCallback("Rainforest Drongo", "🐦", "Malaysian racket-tailed drongo mimicking insect buzzes");
    } else {
      // Tropical bird melodic sliding call
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      
      osc.connect(amp);
      amp.connect(this.tropicalRainforestGain);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.28);
      
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.linearRampToValueAtTime(0.06, now + 0.03);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.35);
      
      this.onVoiceTriggerCallback("Tropical Hornbill", "🦜", "Singapore Great Hornbill singing across the mangrove tree canopy");
    }
  }

  public triggerProceduralCaveEcho() {
    if (!this.ctx || !this.caveEchoesGain || !this.isPlaying || !this.activeStates.caveEchoes) return;

    const now = this.ctx.currentTime;
    
    //stalactites dripping!
    const baseFreq = 800 + Math.random() * 800; 
    const duration = 0.12 + Math.random() * 0.15;

    // Trigger standard drip
    this.createDripNode(baseFreq, duration, now, 0.22);

    // Cavern reflection echo 1 (slightly lower pitch, delayed)
    const delay1 = 0.18 + Math.random() * 0.1;
    this.createDripNode(baseFreq * 0.95, duration * 0.9, now + delay1, 0.08);

    // Cavern reflection echo 2 (much fainter, deep echo)
    const delay2 = delay1 + 0.22 + Math.random() * 0.12;
    this.createDripNode(baseFreq * 0.9, duration * 0.8, now + delay2, 0.03);

    this.onVoiceTriggerCallback("Ancient Cavern Echo", "💧", "Crystal water droplets echoing in caves");
  }

  private createDripNode(frequency: number, duration: number, startTime: number, volume: number) {
    if (!this.ctx || !this.caveEchoesGain) return;

    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    
    osc.connect(amp);
    amp.connect(this.caveEchoesGain);
    
    osc.type = "sine";
    
    osc.frequency.setValueAtTime(frequency, startTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, startTime + duration);

    amp.gain.setValueAtTime(0.001, startTime);
    amp.gain.linearRampToValueAtTime(volume, startTime + duration * 0.1);
    amp.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  public triggerProceduralBrookBubble() {
    if (!this.ctx || !this.brookGain || !this.isPlaying || !this.activeStates.brook) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();

    osc.connect(amp);
    amp.connect(this.brookGain);

    osc.type = "sine";

    // Bubbling sound character
    const baseFreq = 250 + Math.random() * 400;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + 0.06);

    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.06, now + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public triggerProceduralArdennesBrookBubble() {
    if (!this.ctx || !this.ardennesBrookGain || !this.isPlaying || !this.activeStates.ardennesBrook) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();

    osc.connect(amp);
    amp.connect(this.ardennesBrookGain);

    osc.type = "sine";

    // High frequency crisp bubbles popping over rocky slate beds
    const baseFreq = 400 + Math.random() * 700;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.3, now + 0.05);

    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.05, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.start(now);
    osc.stop(now + 0.07);
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
      this.mountainWindGain?.gain.setValueAtTime(0, now);
      this.brookGain?.gain.setValueAtTime(0, now);
      this.desertBreezeGain?.gain.setValueAtTime(0, now);
      this.morningMistGain?.gain.setValueAtTime(0, now);
      this.caveEchoesGain?.gain.setValueAtTime(0, now);
      this.monsoonRainGain?.gain.setValueAtTime(0, now);
      this.templeBellsGain?.gain.setValueAtTime(0, now);
      this.peacockCallsGain?.gain.setValueAtTime(0, now);
      this.nightMarketsGain?.gain.setValueAtTime(0, now);
      this.tropicalRainforestGain?.gain.setValueAtTime(0, now);
      this.cicadaChorusGain?.gain.setValueAtTime(0, now);
      this.mangroveWavesGain?.gain.setValueAtTime(0, now);
      this.hongKongKitesGain?.gain.setValueAtTime(0, now);
      this.victoriaHarbourGain?.gain.setValueAtTime(0, now);
      this.ardennesWindGain?.gain.setValueAtTime(0, now);
      this.ardennesBrookGain?.gain.setValueAtTime(0, now);
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
    if (channel === "mountainWind") return this.mountainWindGain;
    if (channel === "brook") return this.brookGain;
    if (channel === "desertBreeze") return this.desertBreezeGain;
    if (channel === "morningMist") return this.morningMistGain;
    if (channel === "caveEchoes") return this.caveEchoesGain;
    if (channel === "monsoonRain") return this.monsoonRainGain;
    if (channel === "templeBells") return this.templeBellsGain;
    if (channel === "peacockCalls") return this.peacockCallsGain;
    if (channel === "nightMarkets") return this.nightMarketsGain;
    if (channel === "tropicalRainforest") return this.tropicalRainforestGain;
    if (channel === "cicadaChorus") return this.cicadaChorusGain;
    if (channel === "mangroveWaves") return this.mangroveWavesGain;
    if (channel === "hongKongKites") return this.hongKongKitesGain;
    if (channel === "victoriaHarbour") return this.victoriaHarbourGain;
    if (channel === "ardennesWind") return this.ardennesWindGain;
    if (channel === "ardennesBrook") return this.ardennesBrookGain;
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
    this.mountainWindGain?.gain.setValueAtTime(this.activeStates.mountainWind ? this.volumes.mountainWind : 0.0, now);
    this.brookGain?.gain.setValueAtTime(this.activeStates.brook ? this.volumes.brook : 0.0, now);
    this.desertBreezeGain?.gain.setValueAtTime(this.activeStates.desertBreeze ? this.volumes.desertBreeze : 0.0, now);
    this.morningMistGain?.gain.setValueAtTime(this.activeStates.morningMist ? this.volumes.morningMist : 0.0, now);
    this.caveEchoesGain?.gain.setValueAtTime(this.activeStates.caveEchoes ? this.volumes.caveEchoes : 0.0, now);
    this.monsoonRainGain?.gain.setValueAtTime(this.activeStates.monsoonRain ? this.volumes.monsoonRain : 0.0, now);
    this.templeBellsGain?.gain.setValueAtTime(this.activeStates.templeBells ? this.volumes.templeBells : 0.0, now);
    this.peacockCallsGain?.gain.setValueAtTime(this.activeStates.peacockCalls ? this.volumes.peacockCalls : 0.0, now);
    this.nightMarketsGain?.gain.setValueAtTime(this.activeStates.nightMarkets ? this.volumes.nightMarkets : 0.0, now);
    this.tropicalRainforestGain?.gain.setValueAtTime(this.activeStates.tropicalRainforest ? this.volumes.tropicalRainforest : 0.0, now);
    this.cicadaChorusGain?.gain.setValueAtTime(this.activeStates.cicadaChorus ? this.volumes.cicadaChorus : 0.0, now);
    this.mangroveWavesGain?.gain.setValueAtTime(this.activeStates.mangroveWaves ? this.volumes.mangroveWaves : 0.0, now);
    this.hongKongKitesGain?.gain.setValueAtTime(this.activeStates.hongKongKites ? this.volumes.hongKongKites : 0.0, now);
    this.victoriaHarbourGain?.gain.setValueAtTime(this.activeStates.victoriaHarbour ? this.volumes.victoriaHarbour : 0.0, now);
    this.ardennesWindGain?.gain.setValueAtTime(this.activeStates.ardennesWind ? this.volumes.ardennesWind : 0.0, now);
    this.ardennesBrookGain?.gain.setValueAtTime(this.activeStates.ardennesBrook ? this.volumes.ardennesBrook : 0.0, now);
  }

  public getChannelVolume(channel: string): number {
    return this.volumes[channel] || 0;
  }

  public getChannelActive(channel: string): boolean {
    return this.activeStates[channel] || false;
  }

  private setupVictoriaHarbourGenerator() {
    if (!this.ctx || !this.victoriaHarbourGain) return;

    const buffer = this.createNoiseBuffer("brown");
    this.victoriaHarbourNoiseSource = this.ctx.createBufferSource();
    this.victoriaHarbourNoiseSource.buffer = buffer;
    this.victoriaHarbourNoiseSource.loop = true;

    this.victoriaHarbourFilter = this.ctx.createBiquadFilter();
    this.victoriaHarbourFilter.type = "lowpass";
    this.victoriaHarbourFilter.frequency.setValueAtTime(100, this.ctx.currentTime);

    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.victoriaHarbourNoiseSource.connect(this.victoriaHarbourFilter);
    this.victoriaHarbourFilter.connect(gate);
    gate.connect(this.victoriaHarbourGain);
    this.victoriaHarbourNoiseSource.start();

    // Rhythmic swaying harbour ship wakes and waves (5.2s cycle)
    const modulateHarbourWaves = () => {
      if (!this.ctx || !this.isPlaying || !this.activeStates.victoriaHarbour || !gate || !this.victoriaHarbourFilter) return;
      const now = this.ctx.currentTime;
      const activeSwell = 0.015 + Math.max(0, Math.sin(now * 1.2)) * 0.18;
      gate.gain.linearRampToValueAtTime(activeSwell, now + 1.5);
      this.victoriaHarbourFilter.frequency.setValueAtTime(80 + Math.sin(now * 1.2) * 40, now);
    };
    setInterval(modulateHarbourWaves, 1000);
  }

  private setupArdennesWindGenerator() {
    if (!this.ctx || !this.ardennesWindGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.ardennesWindNoiseSource = this.ctx.createBufferSource();
    this.ardennesWindNoiseSource.buffer = buffer;
    this.ardennesWindNoiseSource.loop = true;

    this.ardennesWindFilter = this.ctx.createBiquadFilter();
    this.ardennesWindFilter.type = "bandpass";
    this.ardennesWindFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.ardennesWindFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

    this.ardennesWindNoiseSource.connect(this.ardennesWindFilter);
    this.ardennesWindFilter.connect(this.ardennesWindGain);
    this.ardennesWindNoiseSource.start();

    const modulateArdennesWind = () => {
      if (!this.ctx || !this.isPlaying || !this.ardennesWindFilter || !this.activeStates.ardennesWind) return;
      const now = this.ctx.currentTime;
      const breezeFreq = Math.sin(now * 0.35) * 180 + 430;
      this.ardennesWindFilter.frequency.exponentialRampToValueAtTime(Math.max(220, breezeFreq), now + 1.1);
    };
    setInterval(modulateArdennesWind, 1000);
  }

  private setupArdennesBrookGenerator() {
    if (!this.ctx || !this.ardennesBrookGain) return;

    const buffer = this.createNoiseBuffer("pink");
    this.ardennesBrookNoiseSource = this.ctx.createBufferSource();
    this.ardennesBrookNoiseSource.buffer = buffer;
    this.ardennesBrookNoiseSource.loop = true;

    this.ardennesBrookFilter = this.ctx.createBiquadFilter();
    this.ardennesBrookFilter.type = "lowpass";
    this.ardennesBrookFilter.frequency.setValueAtTime(550, this.ctx.currentTime);

    this.ardennesBrookNoiseSource.connect(this.ardennesBrookFilter);
    this.ardennesBrookFilter.connect(this.ardennesBrookGain);
    this.ardennesBrookNoiseSource.start();
  }

  public triggerHongKongKiteCall() {
    if (!this.ctx || !this.hongKongKitesGain || !this.isPlaying || !this.activeStates.hongKongKites) return;
    const now = this.ctx.currentTime;
    
    // Black Kite call is a series of rapid high-pitch trilling whistles then a long descending sweep
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.connect(amp);
    amp.connect(this.hongKongKitesGain);
    osc.type = "sine";
    
    osc.frequency.setValueAtTime(2700, now);
    // Rapid pitch vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(15, now);
    lfoGain.gain.setValueAtTime(220, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.06, now + 0.1);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    lfo.start(now);
    osc.start(now);
    
    lfo.stop(now + 0.55);
    osc.stop(now + 0.6);
    
    // Long descending sweep
    setTimeout(() => {
      if (!this.ctx || !this.hongKongKitesGain || !this.isPlaying || !this.activeStates.hongKongKites) return;
      const now2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const amp2 = this.ctx.createGain();
      osc2.connect(amp2);
      amp2.connect(this.hongKongKitesGain);
      osc2.type = "sine";
      
      osc2.frequency.setValueAtTime(3100, now2);
      osc2.frequency.exponentialRampToValueAtTime(1400, now2 + 0.85);
      
      amp2.gain.setValueAtTime(0.001, now2);
      amp2.gain.linearRampToValueAtTime(0.05, now2 + 0.15);
      amp2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.85);
      
      osc2.start(now2);
      osc2.stop(now2 + 0.9);
    }, 600);
    
    this.onVoiceTriggerCallback("Hong Kong Black Kite", "🦅", "Screaming whistling call of a Black Kite soaring over Victoria Peak");
  }

  public triggerStarFerryHorn() {
    if (!this.ctx || !this.victoriaHarbourGain || !this.isPlaying || !this.activeStates.victoriaHarbour) return;
    const now = this.ctx.currentTime;
    
    // Iconic double-tone deep Star Ferry brass fog horn
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const lowpass = this.ctx.createBiquadFilter();
    
    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(260, now);
    
    osc1.frequency.setValueAtTime(135, now);
    osc2.frequency.setValueAtTime(175, now);
    
    osc1.connect(lowpass);
    osc2.connect(lowpass);
    lowpass.connect(amp);
    amp.connect(this.victoriaHarbourGain);
    
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.12, now + 0.15);
    amp.gain.linearRampToValueAtTime(0.12, now + 1.1);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.45);
    osc2.stop(now + 1.45);
    
    this.onVoiceTriggerCallback("Star Ferry Horn", "🚢", "Resonant double-tone brass Star Ferry foghorn echoing from Kowloon");
  }

  public shutdown() {
    this.pause();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
