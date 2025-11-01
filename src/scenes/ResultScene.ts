import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Result' });
  }

  create(): void {
    const centerX = 480;
    
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Game Over title
    this.add.text(centerX, 80, '🎮 GAME OVER 🎮', {
      fontSize: '56px',
      color: '#ff6b6b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Final stats
    const finalScore = gameState.best.bestScore;
    const finalWave = gameState.best.bestWave;

    this.add.text(centerX, 180, 'YOUR STATS', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 240, `Final Score: ${finalScore}`, {
      fontSize: '28px',
      color: '#ffd93d'
    }).setOrigin(0.5);

    this.add.text(centerX, 290, `Waves Reached: ${finalWave}`, {
      fontSize: '28px',
      color: '#6bcf7f'
    }).setOrigin(0.5);

    // Check for new records
    const newHighScore = finalScore === gameState.best.bestScore;
    const newBestWave = finalWave === gameState.best.bestWave;

    if (newHighScore || newBestWave) {
      this.add.text(centerX, 350, '🏆 NEW RECORD! 🏆', {
        fontSize: '36px',
        color: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Celebratory animation
      const tween = this.tweens.add({
        targets: this.cameras.main,
        zoom: 1.05,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      this.time.delayedCall(3000, () => {
        tween.stop();
        this.cameras.main.setZoom(1);
      });
    }

    // Retry button
    const retryButton = this.add.text(centerX - 120, 440, '🔄 RETRY', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#228B22',
      padding: { x: 30, y: 15 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    retryButton.on('pointerover', () => {
      retryButton.setScale(1.1);
      retryButton.setBackgroundColor('#32CD32');
    });

    retryButton.on('pointerout', () => {
      retryButton.setScale(1);
      retryButton.setBackgroundColor('#228B22');
    });

    retryButton.on('pointerdown', () => {
      this.retry();
    });

    // Menu button
    const menuButton = this.add.text(centerX + 120, 440, '🏠 MENU', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#3498db',
      padding: { x: 30, y: 15 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
      menuButton.setBackgroundColor('#5dade2');
    });

    menuButton.on('pointerout', () => {
      menuButton.setScale(1);
      menuButton.setBackgroundColor('#3498db');
    });

    menuButton.on('pointerdown', () => {
      this.backToMenu();
    });

    // Fun message based on performance
    const message = this.getPerformanceMessage(finalWave);
    this.add.text(centerX, 510, message, {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Keyboard shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-R', () => this.retry());
      this.input.keyboard.on('keydown-M', () => this.backToMenu());
      this.input.keyboard.on('keydown-SPACE', () => this.retry());
    }
  }

  private getPerformanceMessage(wave: number): string {
    if (wave >= 20) return "🥦 LEGENDARY BROCCOLI WARRIOR! 🥦";
    if (wave >= 15) return "🌟 Outstanding! The veggies are proud!";
    if (wave >= 10) return "💪 Great job! Keep fighting the good fight!";
    if (wave >= 5) return "👍 Not bad! Practice makes perfect!";
    return "🌱 Every hero starts somewhere!";
  }

  private retry(): void {
    gameState.startRun();
    this.scene.start('Game');
  }

  private backToMenu(): void {
    this.scene.start('Menu');
  }
}
