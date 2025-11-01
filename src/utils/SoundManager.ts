import Phaser from 'phaser';

/**
 * Simple sound manager using Phaser's built-in audio
 * Creates procedurally generated sound effects and background music
 */
export class SoundManager {
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  private audioContext?: AudioContext;
  private currentMusic?: { oscillators: OscillatorNode[]; gains: GainNode[] };
  private musicType: 'gameplay' | 'quiz' | null = null;

  constructor(scene: Phaser.Scene) {
    // Scene reference kept for future audio loading
    scene;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext creation failed:', e);
    }
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
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  /**
   * Generate a frequency sweep (for explosions)
   */
  private playSweep(startFreq: number, endFreq: number, duration: number, volume: number = 0.2): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
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

    // High-energy original chiptune melody - 170 BPM
    // Catchy, repetitive hook with driving rhythm
    const melody = [
      784, 784, 784, 784, 698, 784, 880, 784,  // G G G G F G A G
      698, 698, 784, 880, 988, 880, 784, 698,  // F F G A B A G F
      784, 784, 784, 784, 698, 784, 880, 784,  // G G G G F G A G
      698, 659, 698, 784, 659, 587, 523, 587,  // F E F G E D C D
      784, 784, 784, 784, 698, 784, 880, 784,  // G G G G F G A G (repeat hook)
      698, 698, 784, 880, 988, 880, 784, 698,  // F F G A B A G F
      784, 659, 698, 784, 880, 988, 1047, 988, // G E F G A B C B (climax)
      880, 784, 698, 659, 587, 523, 494, 523   // A G F E D C B C (descend)
    ];
    
    // Pumping bassline with syncopation
    const bass = [
      196, 196, 196, 196, 220, 220, 220, 220, // G G G G A A A A
      196, 196, 196, 196, 175, 175, 196, 196, // G G G G F F G G
      196, 196, 196, 196, 220, 220, 220, 220, // G G G G A A A A
      196, 196, 196, 196, 175, 175, 196, 196  // G G G G F F G G
    ];
    
    const noteLength = 0.176; // 170 BPM eighth notes - super energetic!
    
    this.playMusicLoop(melody, bass, noteLength, 0.09);
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
      this.currentMusic.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.currentMusic = { oscillators: [], gains: [] };
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
        setTimeout(() => {
          if (this.musicType === 'gameplay') {
            this.startGameplayMusic();
          } else if (this.musicType === 'quiz') {
            this.startQuizMusic();
          }
        }, (loopDuration - 0.1) * 1000); // Slight overlap for seamless loop
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
}
