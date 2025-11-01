import Phaser from 'phaser';

/**
 * Simple sound manager using Phaser's built-in audio
 * Creates procedurally generated sound effects
 */
export class SoundManager {
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    // Scene reference kept for future audio loading
    scene;
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
}
