import Phaser from 'phaser';
import { Player } from '../entities/Player';
import type { PowerUpType } from '../types';

export class Powerups {
  private scene: Phaser.Scene;
  private player: Player;
  private activeEffects: Map<PowerUpType, Phaser.Time.TimerEvent> = new Map();
  private baseCooldown: number = 160;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  apply(type: PowerUpType): void {
    // Screen shake for power-up activation
    this.scene.cameras.main.shake(100, 0.003);
    
    switch (type) {
      case 'spread':
        this.activateSpread();
        break;
      case 'rapid':
        this.activateRapid();
        break;
      case 'shield':
        this.activateShield();
        break;
      case 'bomb':
        this.activateBomb();
        break;
    }
  }

  private activateSpread(): void {
    const duration = 15000;
    this.player.spreadActive = true;
    this.extendOrStartTimer('spread', duration);
    
    // Visual feedback
    this.scene.tweens.add({
      targets: this.player,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true
    });
  }

  private activateRapid(): void {
    const duration = 15000;
    this.player.rapidActive = true;
    this.player.setFireCooldown(100);
    this.extendOrStartTimer('rapid', duration);
    
    this.scene.tweens.add({
      targets: this.player,
      angle: 360,
      duration: 300,
      onComplete: () => {
        this.player.setAngle(0);
      }
    });
  }

  private activateShield(): void {
    const duration = 10000;
    this.player.activateShield();
    this.extendOrStartTimer('shield', duration);
  }

  private activateBomb(): void {
    // Immediate effect - no timer
    this.scene.cameras.main.shake(200, 0.003);
    
    // Emit event that GameScene will handle
    this.scene.events.emit('smart-bomb');
  }

  private extendOrStartTimer(type: PowerUpType, duration: number): void {
    // Cancel existing timer if any
    const existingTimer = this.activeEffects.get(type);
    if (existingTimer) {
      this.scene.time.removeEvent(existingTimer);
    }

    // Start new timer
    const timer = this.scene.time.delayedCall(duration, () => {
      this.deactivate(type);
    });

    this.activeEffects.set(type, timer);
  }

  private deactivate(type: PowerUpType): void {
    this.activeEffects.delete(type);

    switch (type) {
      case 'spread':
        this.player.spreadActive = false;
        break;
      case 'rapid':
        this.player.rapidActive = false;
        this.player.setFireCooldown(this.baseCooldown);
        break;
      case 'shield':
        this.player.deactivateShield();
        break;
    }
  }

  isActive(type: PowerUpType): boolean {
    return this.activeEffects.has(type);
  }

  getActiveEffects(): PowerUpType[] {
    return Array.from(this.activeEffects.keys());
  }

  reset(): void {
    this.activeEffects.forEach((_, type) => this.deactivate(type));
    this.activeEffects.clear();
  }
}
