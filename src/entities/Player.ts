import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 220;
  private fireCooldown: number = 160;
  private lastFired: number = 0;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private fireKey?: Phaser.Input.Keyboard.Key;
  public hasShield: boolean = false;
  public spreadActive: boolean = false;
  public rapidActive: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1);
    this.setCollideWorldBounds(true);
    
    // Smaller hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.6, this.height * 0.6);
    
    this.setupInput();
  }

  private setupInput(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
      this.fireKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  update(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    // Movement input
    if (this.cursors && this.wasd) {
      const left = this.cursors.left.isDown || this.wasd.A.isDown;
      const right = this.cursors.right.isDown || this.wasd.D.isDown;
      const up = this.cursors.up.isDown || this.wasd.W.isDown;
      const down = this.cursors.down.isDown || this.wasd.S.isDown;

      if (left) body.setVelocityX(-this.speed);
      else if (right) body.setVelocityX(this.speed);

      if (up) body.setVelocityY(-this.speed);
      else if (down) body.setVelocityY(this.speed);

      // Normalize diagonal movement
      if (body.velocity.x !== 0 && body.velocity.y !== 0) {
        body.velocity.normalize().scale(this.speed);
      }
    }
  }

  canFire(time: number): boolean {
    return time - this.lastFired >= this.fireCooldown;
  }

  recordFire(time: number): void {
    this.lastFired = time;
  }

  setFireCooldown(cooldown: number): void {
    this.fireCooldown = cooldown;
  }

  getFireCooldown(): number {
    return this.fireCooldown;
  }

  activateShield(): void {
    this.hasShield = true;
    this.setTint(0x00ffff);
  }

  deactivateShield(): void {
    this.hasShield = false;
    this.clearTint();
  }

  flashDamage(): void {
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (!this.hasShield) {
        this.clearTint();
      }
    });
  }
}
