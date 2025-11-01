import Phaser from 'phaser';
import type { PenaltyType } from '../types';
import { Spawner } from './Spawner';
import { Player } from '../entities/Player';
import { gameState } from '../state/GameState';

export class Penalties {
  private scene: Phaser.Scene;
  private player: Player;
  private spawner: Spawner;
  private baseCooldown: number = 160;

  constructor(scene: Phaser.Scene, player: Player, spawner: Spawner) {
    this.scene = scene;
    this.player = player;
    this.spawner = spawner;
  }

  apply(type: PenaltyType): void {
    switch (type) {
      case 'heat':
        this.applyHeat();
        break;
      case 'spawn':
        this.applySpawn();
        break;
      case 'chip':
        this.applyChip();
        break;
    }
  }

  private applyHeat(): void {
    const duration = 10000;
    const heatCooldown = Math.floor(this.baseCooldown * 1.3);
    
    this.player.setFireCooldown(heatCooldown);
    this.player.setTint(0xff8800);

    this.scene.time.delayedCall(duration, () => {
      if (!this.player.rapidActive) {
        this.player.setFireCooldown(this.baseCooldown);
      }
      this.player.clearTint();
      if (this.player.hasShield) {
        this.player.activateShield();
      }
    });
  }

  private applySpawn(): void {
    const wave = gameState.run?.wave || 1;
    this.spawner.spawnEnemies('fries', 2, wave);
    
    // Visual feedback
    this.scene.cameras.main.flash(200, 255, 100, 100);
  }

  private applyChip(): void {
    // Never reduce below 1 HP from quiz penalty
    if (gameState.run && gameState.run.hp > 1) {
      gameState.takeDamage(1);
      this.player.flashDamage();
      
      // Screen shake
      this.scene.cameras.main.shake(150, 0.002);
    }
  }
}
