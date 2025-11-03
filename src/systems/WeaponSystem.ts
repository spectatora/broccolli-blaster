import Phaser from 'phaser';
import { WeaponType } from '../types';
import { Bullet } from '../entities/Bullet';
import { SoundManager } from '../utils/SoundManager';

export interface WeaponConfig {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  unlockWave: number;
  color: number;
}

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  'pea-shooter': {
    name: 'Pea Shooter',
    description: 'Classic single shot',
    cooldown: 160,
    damage: 1,
    unlockWave: 1,
    color: 0x00ff00
  },
  'laser': {
    name: 'Laser Beam',
    description: 'Fast, piercing shots',
    cooldown: 80,
    damage: 1,
    unlockWave: 3,
    color: 0xff0000
  },
  'shotgun': {
    name: 'Veggie Shotgun',
    description: 'Wide spread, close range',
    cooldown: 400,
    damage: 1,
    unlockWave: 5,
    color: 0xffaa00
  },
  'missiles': {
    name: 'Carrot Missiles',
    description: 'Homing rockets',
    cooldown: 600,
    damage: 3,
    unlockWave: 8,
    color: 0xff6600
  }
};

export class WeaponSystem {
  private bullets: Phaser.GameObjects.Group;
  private soundManager: SoundManager;
  private currentWeapon: WeaponType = 'pea-shooter';

  constructor(_scene: Phaser.Scene, bullets: Phaser.GameObjects.Group) {
    this.bullets = bullets;
    this.soundManager = SoundManager.getInstance();
  }

  setWeapon(weapon: WeaponType): void {
    this.currentWeapon = weapon;
  }

  getCurrentWeapon(): WeaponType {
    return this.currentWeapon;
  }

  getCooldown(): number {
    return WEAPON_CONFIGS[this.currentWeapon].cooldown;
  }

  fire(x: number, y: number, spreadActive: boolean = false): void {
    this.soundManager.playShoot();

    switch (this.currentWeapon) {
      case 'pea-shooter':
        this.firePeaShooter(x, y, spreadActive);
        break;
      case 'laser':
        this.fireLaser(x, y, spreadActive);
        break;
      case 'shotgun':
        this.fireShotgun(x, y);
        break;
      case 'missiles':
        this.fireMissiles(x, y);
        break;
    }
  }

  private firePeaShooter(x: number, y: number, spreadActive: boolean): void {
    if (spreadActive) {
      this.createBullet(x, y, -100, 0x00ff00);
      this.createBullet(x, y, -90, 0x00ff00);
      this.createBullet(x, y, -80, 0x00ff00);
    } else {
      this.createBullet(x, y, -90, 0x00ff00);
    }
  }

  private fireLaser(x: number, y: number, spreadActive: boolean): void {
    if (spreadActive) {
      this.createBullet(x, y, -100, 0xff0000, 600);
      this.createBullet(x, y, -90, 0xff0000, 600);
      this.createBullet(x, y, -80, 0xff0000, 600);
    } else {
      this.createBullet(x, y, -90, 0xff0000, 600);
    }
  }

  private fireShotgun(x: number, y: number): void {
    // Shotgun always fires spread, regardless of power-up
    const angles = [-110, -100, -90, -80, -70];
    angles.forEach(angle => {
      this.createBullet(x, y, angle, 0xffaa00, 400);
    });
  }

  private fireMissiles(x: number, y: number): void {
    // Fire 2 homing missiles
    this.createBullet(x - 10, y, -90, 0xff6600, 350);
    this.createBullet(x + 10, y, -90, 0xff6600, 350);
  }

  private createBullet(x: number, y: number, angle: number, tint: number, speed: number = 400): void {
    const bullet = this.bullets.get(x, y - 20) as Bullet;
    if (bullet) {
      bullet.fire(x, y - 20, angle, speed);
      bullet.setTint(tint);
    }
  }

  getWeaponInfo(weapon: WeaponType): WeaponConfig {
    return WEAPON_CONFIGS[weapon];
  }
}
