import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import QuizScene from './scenes/QuizScene';
import PauseScene from './scenes/PauseScene';
import ResultScene from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#e9f7ef',
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [BootScene, MenuScene, GameScene, QuizScene, PauseScene, ResultScene]
};

new Phaser.Game(config);
