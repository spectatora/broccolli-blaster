import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Spawner } from '../systems/Spawner';
import { Powerups } from '../systems/Powerups';
import { Penalties } from '../systems/Penalties';
import { UI } from '../systems/UI';
import { SoundManager } from '../utils/SoundManager';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.GameObjects.Group;
  private spawner!: Spawner;
  private powerups!: Powerups;
  private penalties!: Penalties;
  private ui!: UI;
  private soundManager!: SoundManager;
  private waveInProgress: boolean = false;
  private invulnerable: boolean = false;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#e9f7ef');

    // Create player
    this.player = new Player(this, 480, 450);

    // Create bullet pool
    this.bullets = this.add.group({
      classType: Bullet,
      maxSize: 60,
      runChildUpdate: true
    });

    // Create systems
    this.spawner = new Spawner(this);
    this.powerups = new Powerups(this, this.player);
    this.penalties = new Penalties(this, this.player, this.spawner);
    this.ui = new UI(this);
    this.soundManager = new SoundManager(this);

    // Setup collisions
    this.setupCollisions();

    // Listen for quiz resolution
    this.events.on('quiz:resolve', this.onQuizResolve, this);
    
    // Listen for smart bomb
    this.events.on('smart-bomb', this.onSmartBomb, this);

    // Start first wave
    this.startWave();

    // Pause key
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        this.scene.pause();
        this.showPauseOverlay();
      });
    }
  }

  private setupCollisions(): void {
    // Bullet hits enemy
    const enemyTypes = ['fries', 'soda', 'burger'];
    enemyTypes.forEach(type => {
      const group = this.spawner.getEnemyGroup(type as any);
      if (group) {
        this.physics.add.overlap(this.bullets, group, this.onBulletHitEnemy, undefined, this);
      }
    });

    // Enemy hits player
    enemyTypes.forEach(type => {
      const group = this.spawner.getEnemyGroup(type as any);
      if (group) {
        this.physics.add.overlap(this.player, group, this.onEnemyHitPlayer, undefined, this);
      }
    });
  }

  private onBulletHitEnemy(bulletObj: any, enemyObj: any): void {
    const bullet = bulletObj as Bullet;
    const enemy = enemyObj as Enemy;

    if (!bullet.active || !enemy.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);

    // Play hit sound
    this.soundManager.playHit();

    const killed = enemy.takeDamage(1);
    if (killed) {
      gameState.addScore(enemy.scoreValue);
      // Play explosion sound
      this.soundManager.playExplosion();
    }
  }

  private onEnemyHitPlayer(playerObj: any, enemyObj: any): void {
    const enemy = enemyObj as Enemy;

    if (this.invulnerable || !enemy.active) return;

    if (this.player.hasShield) {
      this.player.deactivateShield();
      this.soundManager.playHit();
      enemy.takeDamage(999);
    } else {
      const isDead = gameState.takeDamage(1);
      this.player.flashDamage();
      
      // Play damage sound
      this.soundManager.playDamage();
      
      if (isDead) {
        this.gameOver();
        return;
      }

      // Brief invulnerability
      this.invulnerable = true;
      this.time.delayedCall(1000, () => {
        this.invulnerable = false;
      });

      enemy.takeDamage(999);
    }
  }

  private startWave(): void {
    if (!gameState.run) return;

    this.waveInProgress = true;
    this.spawner.spawnWave(gameState.run.wave);

    // Check wave completion periodically
    this.time.addEvent({
      delay: 1000,
      callback: this.checkWaveComplete,
      callbackScope: this,
      loop: true
    });
  }

  private checkWaveComplete(): void {
    if (!this.waveInProgress) return;

    const remaining = this.spawner.getRemainingCount();
    if (remaining === 0) {
      this.waveInProgress = false;
      this.onWaveComplete();
    }
  }

  private onWaveComplete(): void {
    // Add wave bonus
    gameState.addScore(100);
    
    this.ui.showWaveComplete();

    // Start quiz after delay
    this.time.delayedCall(1000, () => {
      this.startQuiz();
    });
  }

  private startQuiz(): void {
    this.scene.pause();
    this.scene.launch('Quiz', { wave: gameState.run?.wave });
  }

  private onQuizResolve(result: { correct: boolean; reward?: string; penalty?: string }): void {
    this.scene.stop('Quiz');
    this.scene.resume();

    if (result.correct && result.reward) {
      this.powerups.apply(result.reward as any);
      this.ui.showPowerup(result.reward as any);
      // Play correct answer sound
      this.soundManager.playCorrect();
    } else if (!result.correct && result.penalty) {
      this.penalties.apply(result.penalty as any);
      this.ui.showPenalty(result.penalty);
      // Play wrong answer sound
      this.soundManager.playWrong();
    }

    // Next wave
    gameState.nextWave();
    
    this.time.delayedCall(1500, () => {
      this.startWave();
    });
  }

  private onSmartBomb(): void {
    // Play bomb sound
    this.soundManager.playBomb();
    
    const enemies = this.spawner.getAllEnemies();
    enemies.forEach(enemy => {
      if (enemy.enemyType === 'fries' || enemy.enemyType === 'soda') {
        gameState.addScore(enemy.scoreValue);
        enemy.takeDamage(999);
      }
    });
  }

  private gameOver(): void {
    gameState.endRun();
    this.scene.start('Result');
  }

  private showPauseOverlay(): void {
    const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7);
    const text = this.add.text(480, 270, 'PAUSED\n\nPress P to resume', {
      fontSize: '48px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-P', () => {
        overlay.destroy();
        text.destroy();
        this.scene.resume();
      });
    }
  }

  update(time: number): void {
    if (!this.player || !this.player.active) return;

    // Update player
    this.player.update(time);

    // Handle firing
    if (this.input.keyboard) {
      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      if (spaceKey.isDown && this.player.canFire(time)) {
        this.fireBullets();
        this.player.recordFire(time);
      }
    }

    // Update UI
    this.ui.update();
  }

  private fireBullets(): void {
    // Play shoot sound
    this.soundManager.playShoot();
    
    if (this.player.spreadActive) {
      // Fire 3 bullets in spread pattern
      this.fireBullet(-10);
      this.fireBullet(0);
      this.fireBullet(10);
    } else {
      this.fireBullet(0);
    }
  }

  private fireBullet(angleOffset: number): void {
    const bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
    if (bullet) {
      bullet.fire(this.player.x, this.player.y - 20, -90 + angleOffset);
    }
  }
}
