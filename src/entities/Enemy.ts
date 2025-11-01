import Phaser from 'phaser';
import type { EnemyType } from '../types';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType: EnemyType;
  public hp: number;
  public maxHp: number;
  public scoreValue: number;
  private movePattern: 'down' | 'sine' | 'slow';
  private sineOffset: number = 0;
  private sineSpeed: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, wave: number = 1) {
    super(scene, x, y, `enemy_${type}`);
    
    this.enemyType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup based on type
    switch (type) {
      case 'fries':
        this.maxHp = 1 + Math.floor(wave / 3);
        this.scoreValue = 10;
        this.movePattern = 'down';
        this.setTint(0xffcc00);
        (this.body as Phaser.Physics.Arcade.Body).setVelocityY(120);
        break;
      case 'soda':
        this.maxHp = 2 + Math.floor(wave / 3);
        this.scoreValue = 20;
        this.movePattern = 'sine';
        this.setTint(0xff4444);
        this.sineOffset = Math.random() * Math.PI * 2;
        (this.body as Phaser.Physics.Arcade.Body).setVelocityY(80);
        break;
      case 'burger':
        this.maxHp = 5 + Math.floor(wave / 2);
        this.scoreValue = 40;
        this.movePattern = 'slow';
        this.setTint(0x8B4513);
        (this.body as Phaser.Physics.Arcade.Body).setVelocityY(50);
        break;
    }

    this.hp = this.maxHp;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.7, this.height * 0.7);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Apply movement patterns
    if (this.movePattern === 'sine' && this.active) {
      this.sineOffset += delta * 0.003;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(Math.sin(this.sineOffset) * this.sineSpeed);
    }

    // Destroy if off screen
    if (this.y > 600) {
      this.destroy();
    }
  }

  takeDamage(amount: number = 1): boolean {
    this.hp -= amount;
    
    // Flash white on hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
        // Restore type tint
        switch (this.enemyType) {
          case 'fries':
            this.setTint(0xffcc00);
            break;
          case 'soda':
            this.setTint(0xff4444);
            break;
          case 'burger':
            this.setTint(0x8B4513);
            break;
        }
      }
    });

    if (this.hp <= 0) {
      this.explode();
      return true;
    }
    return false;
  }

  private explode(): void {
    // Simple scale/fade explosion
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
