import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { SoundManager } from '../utils/SoundManager';
import { WEAPON_CONFIGS } from '../systems/WeaponSystem';
import type { WeaponType } from '../types';

export default class MenuScene extends Phaser.Scene {
  private soundManager!: SoundManager;

  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    const centerX = 480;

    // Get singleton sound manager instance
    this.soundManager = SoundManager.getInstance();

    // Background
    this.cameras.main.setBackgroundColor('#e9f7ef');

    // Title
    this.add.text(centerX, 80, '🥦 BROCCOLI BLASTER 🥦', {
      fontSize: '52px',
      color: '#228B22',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(centerX, 140, 'The Veggie Vendetta!', {
      fontSize: '24px',
      color: '#32CD32',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(centerX, 190, 'Fight junk food with the power of vegetables!', {
      fontSize: '18px',
      color: '#333333'
    }).setOrigin(0.5);

    this.add.text(centerX, 220, 'Answer quiz questions correctly for power-ups!', {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(centerX, 280, '▶ START GAME', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#228B22',
      padding: { x: 30, y: 15 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
      startButton.setBackgroundColor('#32CD32');
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
      startButton.setBackgroundColor('#228B22');
    });

    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // How to Play button
    const howToPlayButton = this.add.text(centerX, 340, '📖 HOW TO PLAY', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#3498db',
      padding: { x: 30, y: 12 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    howToPlayButton.on('pointerover', () => {
      howToPlayButton.setScale(1.1);
      howToPlayButton.setBackgroundColor('#5dade2');
    });

    howToPlayButton.on('pointerout', () => {
      howToPlayButton.setScale(1);
      howToPlayButton.setBackgroundColor('#3498db');
    });

    howToPlayButton.on('pointerdown', () => {
      this.showHowToPlay();
    });

    // Best scores
    this.add.text(centerX, 390, 'BEST RECORDS', {
      fontSize: '18px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX - 100, 418, `High Score: ${gameState.best.bestScore}`, {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(centerX + 100, 418, `Best Wave: ${gameState.best.bestWave}`, {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // Unlocked weapons display
    this.showUnlockedWeapons();

    // Controls - positioned at very bottom
    this.add.text(centerX, 525, 'WASD/Arrows: Move  |  SPACE: Shoot  |  P: Pause  |  1-4: Switch Weapon', {
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5);

    // Space to start
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        this.startGame();
      });
    }

    // Sound toggle buttons in top-right corner
    this.createSoundToggles();
  }

  private showUnlockedWeapons(): void {
    const centerX = 480;
    const startY = 490;
    const boxWidth = 130;
    const boxHeight = 45;
    const spacing = 145;

    // Title for weapons section with more padding
    this.add.text(centerX, 455, 'WEAPONS', {
      fontSize: '16px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const allWeapons: WeaponType[] = ['pea-shooter', 'laser', 'shotgun', 'missiles'];
    
    allWeapons.forEach((weapon, index) => {
      const config = WEAPON_CONFIGS[weapon];
      const isUnlocked = gameState.isWeaponUnlocked(weapon);
      // Center the weapons horizontally - start from leftmost position
      const totalWidth = (allWeapons.length - 1) * spacing;
      const startX = centerX - (totalWidth / 2);
      const x = startX + (index * spacing);
      
      // Weapon box with rounded corners effect
      const box = this.add.rectangle(x, startY, boxWidth, boxHeight, isUnlocked ? 0x228B22 : 0x555555, 0.3);
      box.setStrokeStyle(2, isUnlocked ? 0x32CD32 : 0x888888);
      
      // Weapon number and name on separate lines for better readability
      this.add.text(x, startY - 10, `[${index + 1}]`, {
        fontSize: '12px',
        color: isUnlocked ? '#FFFF00' : '#999999',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.add.text(x, startY + 5, config.name, {
        fontSize: '10px',
        color: isUnlocked ? '#ffffff' : '#aaaaaa',
        fontStyle: 'bold',
        wordWrap: { width: boxWidth - 10 },
        align: 'center'
      }).setOrigin(0.5);
      
      // Unlock requirement or status - smaller and at bottom
      if (isUnlocked) {
        this.add.text(x, startY + 18, '✓', {
          fontSize: '14px',
          color: '#00ff00'
        }).setOrigin(0.5);
      } else {
        this.add.text(x, startY + 18, `Unlock: Wave ${config.unlockWave}`, {
          fontSize: '8px',
          color: '#ffaa00'
        }).setOrigin(0.5);
      }
    });
  }

  private createSoundToggles(): void {
    // Music toggle button
    const musicButton = this.add.text(880, 30, '🎵', {
      fontSize: '32px',
      backgroundColor: '#228B22',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const musicSlash = this.add.text(880, 30, '/', {
      fontSize: '40px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setVisible(!this.soundManager.isMusicEnabled());

    musicButton.on('pointerover', () => {
      musicButton.setScale(1.1);
      musicButton.setBackgroundColor('#32CD32');
    });

    musicButton.on('pointerout', () => {
      musicButton.setScale(1);
      musicButton.setBackgroundColor('#228B22');
    });

    musicButton.on('pointerdown', () => {
      this.soundManager.toggleMusic();
      musicSlash.setVisible(!this.soundManager.isMusicEnabled());
      this.soundManager.playHit(); // Feedback sound
    });

    // Sound effects toggle button
    const sfxButton = this.add.text(930, 30, '🔊', {
      fontSize: '32px',
      backgroundColor: '#228B22',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const sfxSlash = this.add.text(930, 30, '/', {
      fontSize: '40px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setVisible(!this.soundManager.isEnabled());

    sfxButton.on('pointerover', () => {
      sfxButton.setScale(1.1);
      sfxButton.setBackgroundColor('#32CD32');
    });

    sfxButton.on('pointerout', () => {
      sfxButton.setScale(1);
      sfxButton.setBackgroundColor('#228B22');
    });

    sfxButton.on('pointerdown', () => {
      this.soundManager.toggle();
      sfxSlash.setVisible(!this.soundManager.isEnabled());
      if (this.soundManager.isEnabled()) {
        this.soundManager.playHit(); // Feedback sound when enabling
      }
    });

    // Tooltip text
    this.add.text(880, 60, 'Music', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(930, 60, 'SFX', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  private showHowToPlay(): void {
    // Store references to help elements for easy cleanup
    const helpElements: Phaser.GameObjects.GameObject[] = [];

    // Darken background
    const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.85).setDepth(100);
    helpElements.push(overlay);
    
    // Help panel
    const panel = this.add.rectangle(480, 270, 800, 480, 0xffffff).setDepth(101);
    panel.setStrokeStyle(4, 0x228B22);
    helpElements.push(panel);

    // Title
    const title = this.add.text(480, 60, '📖 HOW TO PLAY', {
      fontSize: '36px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);
    helpElements.push(title);

    // Game objective
    const objTitle = this.add.text(480, 110, '🎯 OBJECTIVE', {
      fontSize: '24px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);
    helpElements.push(objTitle);

    const objText = this.add.text(480, 140, 'Survive waves of junk food enemies and answer quiz questions!', {
      fontSize: '16px',
      color: '#333333',
      wordWrap: { width: 700 }
    }).setOrigin(0.5).setDepth(102);
    helpElements.push(objText);

    // Enemies section
    const enemiesTitle = this.add.text(180, 180, '👾 ENEMIES', {
      fontSize: '20px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(enemiesTitle);

    const enemiesText = this.add.text(180, 210, '🍟 Fries - Fast fodder (10 pts)\n🥤 Soda - Zigzag menace (20 pts)\n🍔 Burger - Tough tank (40 pts)', {
      fontSize: '14px',
      color: '#333333',
      lineSpacing: 8
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(enemiesText);

    // Power-ups section
    const powerupsTitle = this.add.text(500, 180, '⚡ POWER-UPS (Correct Answers)', {
      fontSize: '20px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(powerupsTitle);

    const powerupsText = this.add.text(500, 210, '🌟 Spread Shot - Fire 3 bullets\n⚡ Rapid Fire - Faster shooting\n🛡️ Shield - One-hit protection\n💣 Smart Bomb - Clear enemies', {
      fontSize: '14px',
      color: '#333333',
      lineSpacing: 8
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(powerupsText);

    // Penalties section
    const penaltiesTitle = this.add.text(180, 310, '⚠️ PENALTIES (Wrong Answers)', {
      fontSize: '20px',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(penaltiesTitle);

    const penaltiesText = this.add.text(180, 340, '🔥 Heat Up - Slower fire rate\n⚠️ Junk Spawn - Extra enemies\n💔 Chip HP - Lose 1 health', {
      fontSize: '14px',
      color: '#333333',
      lineSpacing: 8
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(penaltiesText);

    // Tips section
    const tipsTitle = this.add.text(500, 310, '💡 TIPS', {
      fontSize: '20px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(tipsTitle);

    const tipsText = this.add.text(500, 340, '• Keep moving to dodge enemies\n• Learn healthy eating facts\n• Use power-ups strategically\n• Wave bonus: +100 points', {
      fontSize: '14px',
      color: '#333333',
      lineSpacing: 8
    }).setOrigin(0, 0).setDepth(102);
    helpElements.push(tipsText);

    // Close button
    const closeButton = this.add.text(480, 470, '✕ CLOSE', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 40, y: 12 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive().setDepth(102);
    helpElements.push(closeButton);

    closeButton.on('pointerover', () => {
      closeButton.setScale(1.1);
      closeButton.setBackgroundColor('#c0392b');
    });

    closeButton.on('pointerout', () => {
      closeButton.setScale(1);
      closeButton.setBackgroundColor('#e74c3c');
    });

    closeButton.on('pointerdown', () => {
      // Remove only the help elements
      helpElements.forEach(element => element.destroy());
    });
  }

  private startGame(): void {
    gameState.startRun();
    this.scene.start('Game');
  }
}
