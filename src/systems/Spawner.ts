import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import type { EnemyType } from '../types';

export class Spawner {
  private scene: Phaser.Scene;
  private enemyGroups: Map<EnemyType, Phaser.GameObjects.Group>;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enemyGroups = new Map();
    
    // Create groups for each enemy type
    const types: EnemyType[] = ['fries', 'soda', 'burger'];
    types.forEach(type => {
      const group = scene.add.group({
        classType: Enemy,
        runChildUpdate: true
      });
      this.enemyGroups.set(type, group);
    });
  }

  spawnWave(waveNumber: number): void {
    const baseCount = 5;
    const waveScale = 2;
    const totalEnemies = Math.min(baseCount + waveNumber * waveScale, 40);
    
    // Distribution based on wave - ensure at least 1 of each type
    let friesCount = Math.max(1, Math.floor(totalEnemies * 0.5));
    let sodaCount = Math.max(1, Math.floor(totalEnemies * 0.3));
    let burgerCount = Math.max(1, Math.floor(totalEnemies * 0.2));

    // Adjust for rounding to match total
    const actualTotal = friesCount + sodaCount + burgerCount;
    if (actualTotal < totalEnemies) {
      friesCount += (totalEnemies - actualTotal); // Add remainder to fries
    }

    // Spawn in formations
    this.spawnFormation('fries', friesCount, waveNumber, 'rows');
    
    this.scene.time.delayedCall(1000, () => {
      this.spawnFormation('soda', sodaCount, waveNumber, 'v');
    });

    this.scene.time.delayedCall(2000, () => {
      this.spawnFormation('burger', burgerCount, waveNumber, 'columns');
    });
  }

  private spawnFormation(type: EnemyType, count: number, wave: number, pattern: 'rows' | 'columns' | 'v'): void {
    const group = this.enemyGroups.get(type);
    if (!group) return;

    const spacing = 60;
    const startX = 100;
    const startY = -50;

    for (let i = 0; i < count; i++) {
      let x = startX;
      let y = startY;

      switch (pattern) {
        case 'rows':
          x = startX + (i % 10) * spacing;
          y = startY - Math.floor(i / 10) * spacing;
          break;
        case 'columns':
          x = startX + Math.floor(i / 5) * spacing;
          y = startY - (i % 5) * spacing;
          break;
        case 'v':
          const side = i % 2;
          const row = Math.floor(i / 2);
          x = side === 0 ? 200 + row * 40 : 760 - row * 40;
          y = startY - row * 50;
          break;
      }

      const enemy = new Enemy(this.scene, x, y, type, wave);
      group.add(enemy);
    }
  }

  spawnEnemies(type: EnemyType, count: number, wave: number): void {
    const group = this.enemyGroups.get(type);
    if (!group) return;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, 860);
      const y = -50;
      const enemy = new Enemy(this.scene, x, y, type, wave);
      group.add(enemy);
    }
  }

  getAllEnemies(): Enemy[] {
    const allEnemies: Enemy[] = [];
    this.enemyGroups.forEach(group => {
      group.getChildren().forEach(child => {
        if (child instanceof Enemy && child.active) {
          allEnemies.push(child);
        }
      });
    });
    return allEnemies;
  }

  getEnemyGroup(type: EnemyType): Phaser.GameObjects.Group | undefined {
    return this.enemyGroups.get(type);
  }

  clearAll(): void {
    this.enemyGroups.forEach(group => {
      group.clear(true, true);
    });
  }

  getRemainingCount(): number {
    return this.getAllEnemies().length;
  }
}
