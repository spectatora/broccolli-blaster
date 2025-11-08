/**
 * Simple sound manager using Web Audio API
 * Creates procedurally generated sound effects and background music
 * Singleton pattern for global access
 */
export class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  private audioContext?: AudioContext;
  private currentMusic?: { oscillators: OscillatorNode[]; gains: GainNode[]; timeoutId?: number };
  private musicType: 'gameplay' | 'quiz' | null = null;
  private lastMusicType: 'gameplay' | 'quiz' | null = null; // Track last music type for resume

  constructor() {
    // Return existing instance if available
    if (SoundManager.instance) {
      return SoundManager.instance;
    }
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext creation failed:', e);
    }
    
    SoundManager.instance = this;
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Play shoot sound - short high-pitched beep
   */
  playShoot(): void {
    if (!this.enabled) return;
    this.playTone(800, 0.05, 0.1, 'square');
  }

  /**
   * Play hit sound - mid-frequency pop
   */
  playHit(): void {
    if (!this.enabled) return;
    this.playTone(400, 0.08, 0.15, 'triangle');
  }

  /**
   * Play explosion sound - low rumble with sweep
   */
  playExplosion(): void {
    if (!this.enabled) return;
    this.playSweep(300, 50, 0.15, 0.2);
  }

  /**
   * Play power-up sound - ascending arpeggio
   */
  playPowerUp(): void {
    if (!this.enabled) return;
    this.playArpeggio([523, 659, 784, 1047], 0.05, 0.15);
  }

  /**
   * Play correct answer sound - positive chime
   */
  playCorrect(): void {
    if (!this.enabled) return;
    this.playArpeggio([523, 659, 784], 0.08, 0.2);
  }

  /**
   * Play wrong answer sound - negative buzz
   */
  playWrong(): void {
    if (!this.enabled) return;
    this.playTone(200, 0.2, 0.3, 'sawtooth');
  }

  /**
   * Play bomb sound - massive explosion
   */
  playBomb(): void {
    if (!this.enabled) return;
    this.playSweep(500, 30, 0.3, 0.4);
  }

  /**
   * Play damage sound - harsh noise
   */
  playDamage(): void {
    if (!this.enabled) return;
    this.playTone(150, 0.15, 0.25, 'sawtooth');
  }

  /**
   * Generate a simple tone using Web Audio API
   */
  private playTone(frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine'): void {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  /**
   * Generate a frequency sweep (for explosions)
   */
  private playSweep(startFreq: number, endFreq: number, duration: number, volume: number = 0.2): void {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  /**
   * Play an arpeggio sequence of notes
   */
  private playArpeggio(frequencies: number[], noteDuration: number, volume: number = 0.15): void {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, noteDuration, volume, 'sine');
      }, index * noteDuration * 1000);
    });
  }

  /**
   * Toggle sound on/off
   */
  toggle(): void {
    this.enabled = !this.enabled;
  }

  /**
   * Set sound enabled state
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Start upbeat chiptune background music for gameplay
   */
  startGameplayMusic(): void {
    if (!this.musicEnabled || !this.audioContext || this.musicType === 'gameplay') return;
    
    this.stopMusic();
    this.musicType = 'gameplay';

    // Crazy Frog inspired Eurobeat melody - 142 BPM
    // Transposed up for happy eurodance vibe
    const melody = [
      880, 880, 880, 988, 880, 988, 1047, 988,  // A A A B A B C B
      880, 988, 1174, 1047, 988, 880, 784, 880  // A B D C B A G A
    ];
    
    // Pumping 4-on-the-floor bassline
    const bass = [
      220, 220, 220, 247, 220, 220, 196, 220,  // A A A B A A G A
      220, 247, 262, 247, 220, 196, 175, 196   // A B C B A G F G
    ];
    
    const BPM = 142;
    const beat = 60 / BPM;
    const noteLength = beat * 0.25; // 16th notes for melody
    
    this.playEurobeatLoop(melody, bass, noteLength, beat, 0.12);
  }

  /**
   * Start calm background music for quiz overlay
   */
  startQuizMusic(): void {
    if (!this.musicEnabled || !this.audioContext || this.musicType === 'quiz') return;
    
    this.stopMusic();
    this.musicType = 'quiz';

    // Calm, soothing melody - 80 BPM
    const melody = [
      523, 587, 659, 523, 587, 659, 784, 659, // C D E C D E G E
      523, 587, 659, 587, 523, 392, 349, 392  // C D E D C G F G
    ];
    const bass = [262, 196, 220, 196]; // Simple bass
    
    const noteLength = 0.375; // 80 BPM quarter notes
    
    this.playMusicLoop(melody, bass, noteLength, 0.05);
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      // Clear timeout to prevent music from restarting
      if (this.currentMusic.timeoutId) {
        clearTimeout(this.currentMusic.timeoutId);
      }
      
      this.currentMusic.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.currentMusic = { oscillators: [], gains: [] };
    }
    // Save the type before clearing it so we can resume later
    if (this.musicType) {
      this.lastMusicType = this.musicType;
    }
    this.musicType = null;
  }

  /**
   * Play a looping music pattern
   */
  private playMusicLoop(melody: number[], bass: number[], noteLength: number, volume: number): void {
    if (!this.audioContext) return;

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Melody oscillator
    const melodyOsc = this.audioContext.createOscillator();
    const melodyGain = this.audioContext.createGain();
    melodyOsc.type = 'square';
    melodyGain.gain.value = volume;
    melodyOsc.connect(melodyGain);
    melodyGain.connect(this.audioContext.destination);

    // Bass oscillator
    const bassOsc = this.audioContext.createOscillator();
    const bassGain = this.audioContext.createGain();
    bassOsc.type = 'triangle';
    bassGain.gain.value = volume * 0.6;
    bassOsc.connect(bassGain);
    bassGain.connect(this.audioContext.destination);

    oscillators.push(melodyOsc, bassOsc);
    gains.push(melodyGain, bassGain);

    const startTime = this.audioContext.currentTime;
    
    // Schedule melody notes
    melody.forEach((freq, i) => {
      const time = startTime + i * noteLength;
      melodyOsc.frequency.setValueAtTime(freq, time);
    });

    // Schedule bass notes (slower)
    bass.forEach((freq, i) => {
      const time = startTime + i * noteLength * (melody.length / bass.length);
      bassOsc.frequency.setValueAtTime(freq, time);
    });

    // Start oscillators
    melodyOsc.start(startTime);
    bassOsc.start(startTime);

    // Loop the music
    const loopDuration = melody.length * noteLength;
    const scheduleNextLoop = () => {
      if (this.musicType && this.currentMusic) {
        const timeoutId = setTimeout(() => {
          if (this.musicType === 'gameplay') {
            this.startGameplayMusic();
          } else if (this.musicType === 'quiz') {
            this.startQuizMusic();
          }
        }, (loopDuration - 0.1) * 1000); // Slight overlap for seamless loop
        
        if (this.currentMusic) {
          this.currentMusic.timeoutId = timeoutId;
        }
      }
    };

    this.currentMusic = { oscillators, gains };
    scheduleNextLoop();
  }

  /**
   * Play Eurobeat-style music loop with swing and detuning
   */
  private playEurobeatLoop(melody: number[], bass: number[], noteLength: number, beat: number, volume: number): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext; // Store in const for type safety
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    const startTime = ctx.currentTime + 0.1;

    // Create gain nodes for melody and bass
    const melodyGain = ctx.createGain();
    const bassGain = ctx.createGain();
    melodyGain.gain.value = volume;
    bassGain.gain.value = volume * 1.8; // Pumping bass
    melodyGain.connect(ctx.destination);
    bassGain.connect(ctx.destination);
    gains.push(melodyGain, bassGain);

    // Play melody notes with swing and dual detuned oscillators for width
    melody.forEach((freq, i) => {
      const swing = (i % 2) ? beat * 0.03 : 0; // Swing every second note
      const time = startTime + (i * noteLength) + swing;
      const dur = noteLength * 0.9;

      // Main oscillator
      const osc1 = ctx.createOscillator();
      const env1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(freq, time);
      env1.gain.setValueAtTime(0, time);
      env1.gain.linearRampToValueAtTime(1, time + 0.01);
      env1.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc1.connect(env1).connect(melodyGain);
      osc1.start(time);
      osc1.stop(time + dur);
      oscillators.push(osc1);

      // Detuned oscillator for chorus effect
      const osc2 = ctx.createOscillator();
      const env2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.01, time); // 1% detune
      env2.gain.setValueAtTime(0, time);
      env2.gain.linearRampToValueAtTime(0.7, time + 0.01);
      env2.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc2.connect(env2).connect(melodyGain);
      osc2.start(time);
      osc2.stop(time + dur);
      oscillators.push(osc2);
    });

    // Play bass notes - 4-on-the-floor style
    bass.forEach((freq, i) => {
      const time = startTime + (i * beat * 0.5);
      const dur = beat * 0.45;

      const bassOsc = ctx.createOscillator();
      const bassEnv = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(freq, time);
      bassEnv.gain.setValueAtTime(0, time);
      bassEnv.gain.linearRampToValueAtTime(1, time + 0.01);
      bassEnv.gain.exponentialRampToValueAtTime(0.001, time + dur);
      bassOsc.connect(bassEnv).connect(bassGain);
      bassOsc.start(time);
      bassOsc.stop(time + dur);
      oscillators.push(bassOsc);
    });

    // Loop the music
    const loopDuration = melody.length * noteLength + beat * 0.03; // Account for swing
    const scheduleNextLoop = () => {
      if (this.musicType && this.currentMusic) {
        const timeoutId = setTimeout(() => {
          if (this.musicType === 'gameplay') {
            this.startGameplayMusic();
          } else if (this.musicType === 'quiz') {
            this.startQuizMusic();
          }
        }, loopDuration * 1000);
        
        if (this.currentMusic) {
          this.currentMusic.timeoutId = timeoutId;
        }
      }
    };

    this.currentMusic = { oscillators, gains };
    scheduleNextLoop();
  }

  /**
   * Toggle music on/off
   */
  toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else {
      // Resume the music that was last playing
      if (this.lastMusicType === 'gameplay') {
        this.startGameplayMusic();
      } else if (this.lastMusicType === 'quiz') {
        this.startQuizMusic();
      }
    }
  }

  /**
   * Set music enabled state
   */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  /**
   * Check if music is enabled
   */
  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}
