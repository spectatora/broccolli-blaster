import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { SoundManager } from '../utils/SoundManager';

export default class PauseScene extends Phaser.Scene {
  private soundManager!: SoundManager;

  constructor() {
    super({ key: 'Pause' });
  }

  create(): void {
    this.soundManager = SoundManager.getInstance();

    // Semi-transparent overlay
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7);
    
    // Title
    this.add.text(480, 160, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Continue button
    const continueButton = this.add.text(480, 250, 'Continue', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#228B22',
      padding: { x: 40, y: 15 },
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Restart button
    const restartButton = this.add.text(480, 320, 'Restart', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#FF8C00',
      padding: { x: 40, y: 15 },
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Quit button
    const quitButton = this.add.text(480, 390, 'Quit to Menu', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#DC143C',
      padding: { x: 40, y: 15 },
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Hint text
    this.add.text(480, 460, 'Press P or ESC to resume | Use sound icons in top-right for audio', {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Continue button handlers
    continueButton.on('pointerover', () => {
      continueButton.setBackgroundColor('#32CD32');
      continueButton.setScale(1.05);
    });

    continueButton.on('pointerout', () => {
      continueButton.setBackgroundColor('#228B22');
      continueButton.setScale(1);
    });

    continueButton.on('pointerdown', () => {
      this.soundManager.playHit();
      this.resumeGame();
    });

    // Restart button handlers
    restartButton.on('pointerover', () => {
      restartButton.setBackgroundColor('#FFA500');
      restartButton.setScale(1.05);
    });

    restartButton.on('pointerout', () => {
      restartButton.setBackgroundColor('#FF8C00');
      restartButton.setScale(1);
    });

    restartButton.on('pointerdown', () => {
      this.soundManager.playHit();
      this.restartGame();
    });

    // Quit button handlers
    quitButton.on('pointerover', () => {
      quitButton.setBackgroundColor('#FF1493');
      quitButton.setScale(1.05);
    });

    quitButton.on('pointerout', () => {
      quitButton.setBackgroundColor('#DC143C');
      quitButton.setScale(1);
    });

    quitButton.on('pointerdown', () => {
      this.soundManager.playHit();
      this.quitToMenu();
    });

    // Keyboard shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        this.soundManager.playHit();
        this.resumeGame();
      });

      this.input.keyboard.on('keydown-ESC', () => {
        this.soundManager.playHit();
        this.resumeGame();
      });
    }
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }

  private restartGame(): void {
    gameState.startRun();
    this.scene.stop();
    this.scene.stop('Game');
    this.scene.start('Game');
  }

  private quitToMenu(): void {
    gameState.endRun();
    this.soundManager.stopMusic();
    this.scene.stop();
    this.scene.stop('Game');
    this.scene.start('Menu');
  }
}
