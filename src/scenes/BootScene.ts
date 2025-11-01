import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Load quiz data
    this.load.json('quiz', '/quiz.sample.json');

    // Create simple placeholder graphics for assets
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    // Player sprite (broccoli)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x228B22, 1);
    playerGraphics.fillCircle(24, 24, 20);
    playerGraphics.fillStyle(0x32CD32, 1);
    playerGraphics.fillCircle(24, 20, 16);
    playerGraphics.generateTexture('player', 48, 48);
    playerGraphics.destroy();

    // Bullet sprite (pea)
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x90EE90, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // Enemy fries
    const friesGraphics = this.add.graphics();
    friesGraphics.fillStyle(0xFFD700, 1);
    friesGraphics.fillRect(0, 0, 32, 40);
    friesGraphics.fillStyle(0xFFA500, 1);
    friesGraphics.fillRect(2, 2, 28, 36);
    friesGraphics.generateTexture('enemy_fries', 32, 40);
    friesGraphics.destroy();

    // Enemy soda
    const sodaGraphics = this.add.graphics();
    sodaGraphics.fillStyle(0xFF0000, 1);
    sodaGraphics.fillRect(8, 0, 24, 40);
    sodaGraphics.fillStyle(0xFFFFFF, 1);
    sodaGraphics.fillRect(8, 10, 24, 8);
    sodaGraphics.generateTexture('enemy_soda', 40, 40);
    sodaGraphics.destroy();

    // Enemy burger
    const burgerGraphics = this.add.graphics();
    burgerGraphics.fillStyle(0xD2691E, 1);
    burgerGraphics.fillRoundedRect(0, 0, 48, 32, 4);
    burgerGraphics.fillStyle(0x8B4513, 1);
    burgerGraphics.fillRoundedRect(4, 12, 40, 12, 2);
    burgerGraphics.fillStyle(0xFF6347, 1);
    burgerGraphics.fillRect(6, 16, 36, 4);
    burgerGraphics.generateTexture('enemy_burger', 48, 32);
    burgerGraphics.destroy();

    // Particle sprite for explosions
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create(): void {
    // Load quiz pack into game state
    const quizData = this.cache.json.get('quiz');
    if (quizData) {
      gameState.setQuizPack(quizData);
    }

    // Start menu
    this.scene.start('Menu');
  }
}
