import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 400;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  fire(x: number, y: number, angle: number = -90, speed?: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const bulletSpeed = speed ?? this.speed;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const rad = Phaser.Math.DegToRad(angle);
    body.setVelocity(Math.cos(rad) * bulletSpeed, Math.sin(rad) * bulletSpeed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.y < -10 || this.y > 600 || this.x < -10 || this.x > 1000) {
      this.setActive(false);
      this.setVisible(false);
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    }
  }
}
