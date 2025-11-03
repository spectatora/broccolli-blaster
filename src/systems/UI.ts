import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { WEAPON_CONFIGS } from './WeaponSystem';
import type { PowerUpType } from '../types';

export class UI {
  private scene: Phaser.Scene;
  private scoreText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  private weaponText?: Phaser.GameObjects.Text;
  private hpIcons: Phaser.GameObjects.Text[] = [];
  private powerupTexts: Map<PowerUpType, Phaser.GameObjects.Text> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    // Score - top center
    this.scoreText = this.scene.add.text(480, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0);

    // Wave - top right
    this.waveText = this.scene.add.text(920, 20, 'Wave: 1', {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);

    // HP hearts - top left
    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add.text(40 + i * 40, 20, '🥦', {
        fontSize: '32px'
      });
      this.hpIcons.push(heart);
    }

    // Weapon indicator - bottom center
    this.weaponText = this.scene.add.text(480, 520, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  update(): void {
    if (!gameState.run) return;

    // Update score
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${gameState.run.score}`);
    }

    // Update wave
    if (this.waveText) {
      this.waveText.setText(`Wave: ${gameState.run.wave}`);
    }

    // Update weapon display
    if (this.weaponText) {
      const currentWeapon = gameState.getCurrentWeapon();
      const config = WEAPON_CONFIGS[currentWeapon];
      const weaponNumber = ['pea-shooter', 'laser', 'shotgun', 'missiles'].indexOf(currentWeapon) + 1;
      this.weaponText.setText(`[${weaponNumber}] ${config.name}`);
    }

    // Update HP
    for (let i = 0; i < this.hpIcons.length; i++) {
      if (i < gameState.run.hp) {
        this.hpIcons[i].setAlpha(1);
      } else {
        this.hpIcons[i].setAlpha(0.3);
      }
    }
  }

  showPowerup(type: PowerUpType): void {
    const icons: Record<PowerUpType, string> = {
      spread: '🌟 SPREAD',
      rapid: '⚡ RAPID',
      shield: '🛡️ SHIELD',
      bomb: '💣 BOMB'
    };

    const text = this.scene.add.text(480, 270, icons[type], {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: 220,
      alpha: 0,
      scale: 1.5,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  showPenalty(type: string): void {
    const messages: Record<string, string> = {
      heat: '🔥 OVERHEATED!',
      spawn: '⚠️ JUNK INCOMING!',
      chip: '💔 OUCH!'
    };

    const text = this.scene.add.text(480, 270, messages[type] || 'PENALTY!', {
      fontSize: '36px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: 220,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  showWaveComplete(): void {
    const text = this.scene.add.text(480, 270, '🎉 WAVE COMPLETE! 🎉', {
      fontSize: '42px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  destroy(): void {
    this.hpIcons.forEach(icon => icon.destroy());
    this.scoreText?.destroy();
    this.waveText?.destroy();
    this.weaponText?.destroy();
    this.powerupTexts.forEach(text => text.destroy());
  }
}
