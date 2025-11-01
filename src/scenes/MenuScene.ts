import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    const centerX = 480;
    const centerY = 270;

    // Background
    this.cameras.main.setBackgroundColor('#e9f7ef');

    // Title
    this.add.text(centerX, 100, '🥦 BROCCOLI BLASTER 🥦', {
      fontSize: '52px',
      color: '#228B22',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(centerX, 160, 'The Veggie Vendetta!', {
      fontSize: '24px',
      color: '#32CD32',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(centerX, 220, 'Fight junk food with the power of vegetables!', {
      fontSize: '18px',
      color: '#333333'
    }).setOrigin(0.5);

    this.add.text(centerX, 250, 'Answer quiz questions correctly for power-ups!', {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(centerX, 320, '▶ START GAME', {
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

    // Best scores
    this.add.text(centerX, 420, 'BEST RECORDS', {
      fontSize: '20px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX - 100, 460, `High Score: ${gameState.best.bestScore}`, {
      fontSize: '18px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(centerX + 100, 460, `Best Wave: ${gameState.best.bestWave}`, {
      fontSize: '18px',
      color: '#666666'
    }).setOrigin(0.5);

    // Controls
    this.add.text(centerX, 510, 'WASD/Arrows: Move  |  SPACE: Shoot  |  P: Pause', {
      fontSize: '14px',
      color: '#999999'
    }).setOrigin(0.5);

    // Space to start
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        this.startGame();
      });
    }
  }

  private startGame(): void {
    gameState.startRun();
    this.scene.start('Game');
  }
}
