import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Spawner } from '../systems/Spawner';
import { Powerups } from '../systems/Powerups';
import { Penalties } from '../systems/Penalties';
import { UI } from '../systems/UI';
import { WeaponSystem, WEAPON_CONFIGS } from '../systems/WeaponSystem';
import { SoundManager } from '../utils/SoundManager';
import type { WeaponType } from '../types';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.GameObjects.Group;
  private spawner!: Spawner;
  private powerups!: Powerups;
  private penalties!: Penalties;
  private ui!: UI;
  private weaponSystem!: WeaponSystem;
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
    this.weaponSystem = new WeaponSystem(this, this.bullets);
    this.ui = new UI(this);
    this.soundManager = SoundManager.getInstance();

    // Set current weapon
    this.weaponSystem.setWeapon(gameState.getCurrentWeapon());

    // Setup collisions
    this.setupCollisions();

    // Listen for quiz resolution
    this.events.on('quiz:resolve', this.onQuizResolve, this);
    
    // Listen for smart bomb
    this.events.on('smart-bomb', this.onSmartBomb, this);

    // Start background music
    this.soundManager.startGameplayMusic();

    // Start first wave
    this.startWave();

    // Pause key
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        this.scene.pause();
        this.scene.launch('Pause');
      });

      // Weapon switching keys
      this.input.keyboard.on('keydown-ONE', () => this.switchWeapon('pea-shooter'));
      this.input.keyboard.on('keydown-TWO', () => this.switchWeapon('laser'));
      this.input.keyboard.on('keydown-THREE', () => this.switchWeapon('shotgun'));
      this.input.keyboard.on('keydown-FOUR', () => this.switchWeapon('missiles'));
    }

    // Create always-visible sound toggle buttons
    this.createSoundToggles();
  }

  private switchWeapon(weapon: WeaponType): void {
    if (gameState.isWeaponUnlocked(weapon)) {
      gameState.setCurrentWeapon(weapon);
      this.weaponSystem.setWeapon(weapon);
      this.soundManager.playHit();
      
      // Show weapon switch notification
      const config = WEAPON_CONFIGS[weapon];
      const text = this.add.text(480, 500, `Switched to ${config.name}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setDepth(1000);

      this.tweens.add({
        targets: text,
        alpha: 0,
        y: 480,
        duration: 1000,
        onComplete: () => text.destroy()
      });
    }
  }

  private createSoundToggles(): void {
    // Music toggle button (top-right corner, below wave text)
    const musicButton = this.add.text(880, 80, '🎵', {
      fontSize: '32px',
      backgroundColor: '#228B22',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1000);

    const musicSlash = this.add.text(880, 80, '/', {
      fontSize: '40px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setVisible(!this.soundManager.isMusicEnabled()).setScrollFactor(0).setDepth(1001);

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
      this.soundManager.playHit();
    });

    // Sound effects toggle button
    const sfxButton = this.add.text(930, 80, '🔊', {
      fontSize: '32px',
      backgroundColor: '#228B22',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1000);

    const sfxSlash = this.add.text(930, 80, '/', {
      fontSize: '40px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setVisible(!this.soundManager.isEnabled()).setScrollFactor(0).setDepth(1001);

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
        this.soundManager.playHit();
      }
    });
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
      // Create particle explosion
      this.createExplosion(enemy.x, enemy.y, enemy.enemyType);
      // Create floating score text
      this.createFloatingScore(enemy.x, enemy.y, enemy.scoreValue);
      // Play explosion sound
      this.soundManager.playExplosion();
      // Screen shake on enemy death
      this.cameras.main.shake(100, 0.002);
    }
  }

  private onEnemyHitPlayer(_playerObj: any, enemyObj: any): void {
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
      
      // Screen shake on damage
      this.cameras.main.shake(150, 0.005);
      
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
    
    // Check for weapon unlocks
    this.checkWeaponUnlocks();
    
    this.ui.showWaveComplete();

    // Start quiz after delay
    this.time.delayedCall(1000, () => {
      this.startQuiz();
    });
  }

  private checkWeaponUnlocks(): void {
    if (!gameState.run) return;

    const wave = gameState.run.wave;
    const weaponsToCheck: Array<{ weapon: WeaponType; wave: number }> = [
      { weapon: 'laser', wave: 3 },
      { weapon: 'shotgun', wave: 5 },
      { weapon: 'missiles', wave: 8 }
    ];

    weaponsToCheck.forEach(({ weapon, wave: unlockWave }) => {
      if (wave === unlockWave && gameState.unlockWeapon(weapon)) {
        this.showWeaponUnlock(weapon);
      }
    });
  }

  private showWeaponUnlock(weapon: WeaponType): void {
    const config = WEAPON_CONFIGS[weapon];
    const text = this.add.text(480, 270, `NEW WEAPON UNLOCKED!\n${config.name}\n${config.description}\n\nPress [1-4] to switch weapons`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);

    // Flash effect
    this.tweens.add({
      targets: text,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 3000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });

    // Play unlock sound
    this.soundManager.playCorrect();
  }

  private startQuiz(): void {
    this.scene.pause();
    this.scene.launch('Quiz', { wave: gameState.run?.wave });
    // Switch to calm quiz music
    this.soundManager.startQuizMusic();
  }

  private onQuizResolve(result: { correct: boolean; reward?: string; penalty?: string }): void {
    this.scene.stop('Quiz');
    this.scene.resume();

    // Resume gameplay music
    this.soundManager.startGameplayMusic();

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
    
    // Massive screen shake for bomb
    this.cameras.main.shake(300, 0.01);
    
    // Flash effect
    this.cameras.main.flash(200, 255, 255, 200);
    
    const enemies = this.spawner.getAllEnemies();
    enemies.forEach(enemy => {
      if (enemy.enemyType === 'fries' || enemy.enemyType === 'soda') {
        // Create explosion before destroying
        this.createExplosion(enemy.x, enemy.y, enemy.enemyType);
        gameState.addScore(enemy.scoreValue);
        enemy.takeDamage(999);
      }
    });
  }

  private gameOver(): void {
    gameState.endRun();
    // Stop background music
    this.soundManager.stopMusic();
    this.scene.start('Result');
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

    // Update fire cooldown based on weapon and power-ups
    const weaponCooldown = this.weaponSystem.getCooldown();
    const adjustedCooldown = this.player.rapidActive ? weaponCooldown * 0.625 : weaponCooldown;
    this.player.setFireCooldown(adjustedCooldown);

    // Update UI
    this.ui.update();
  }

  private fireBullets(): void {
    this.weaponSystem.fire(this.player.x, this.player.y, this.player.spreadActive);
  }

  private createExplosion(x: number, y: number, enemyType: string): void {
    // Determine particle color based on enemy type
    let particleColor = 0xFFFFFF;
    switch (enemyType) {
      case 'fries':
        particleColor = 0xFFD700; // Gold
        break;
      case 'soda':
        particleColor = 0xFF4444; // Red
        break;
      case 'burger':
        particleColor = 0x8B4513; // Brown
        break;
    }

    // Create particles
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      gravityY: 200,
      quantity: 15,
      tint: particleColor,
      emitting: false
    });

    // Emit burst
    particles.explode(15);

    // Destroy emitter after particles die
    this.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  private createFloatingScore(x: number, y: number, scoreValue: number): void {
    // Create floating text showing score
    const scoreText = this.add.text(x, y, `+${scoreValue}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate text floating up and fading out
    this.tweens.add({
      targets: scoreText,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  shutdown(): void {
    // Stop music when scene shuts down
    this.soundManager.stopMusic();
  }
}
