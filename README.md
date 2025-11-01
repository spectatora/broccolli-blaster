# 🥦 Broccoli Blaster - The Veggie Vendetta!

An epic arcade shooter where you play as a heroic broccoli fighting against an army of junk food! Blast your way through waves of enemies and answer quiz questions to gain powerful abilities.

![Game Type](https://img.shields.io/badge/type-arcade%20shooter-green)
![Platform](https://img.shields.io/badge/platform-web-blue)
![Tech](https://img.shields.io/badge/tech-Phaser%203-orange)

## 🎮 Game Overview

Fight off waves of junk food enemies including:
- 🍟 **Fries** - Fast-moving fodder
- 🥤 **Soda** - Zigzagging menaces
- 🍔 **Burgers** - Tough tanks

After each wave, answer a health & nutrition quiz question. Get it right for awesome power-ups, get it wrong and face penalties!

## ✨ Features

### Core Gameplay
- **Fast-paced arcade action** with smooth physics
- **Wave-based progression** with increasing difficulty
- **3 enemy types** with unique movement patterns
- **Quiz integration** - education meets entertainment!

### Power-Ups (Correct Answers)
- 🌟 **Spread Shot** - Fire 3 bullets in a fan pattern
- ⚡ **Rapid Fire** - 1.6x fire rate increase
- 🛡️ **Shield Leaf** - One-hit protection
- 💣 **Smart Bomb** - Clear all small enemies instantly

### Penalties (Wrong Answers)
- 🔥 **Heat Up** - Reduced fire rate
- ⚠️ **Junk Spawn** - Spawn extra enemies
- 💔 **Chip HP** - Lose 1 health point

### Progression System
- **Score tracking** with local storage
- **Best wave records** that persist
- **15 quiz questions** with funny, educational content
- **Increasing difficulty** each wave

## 🕹️ Controls

| Action | Keys |
|--------|------|
| Move | `WASD` or `Arrow Keys` |
| Shoot | `SPACE` |
| Pause | `P` |
| Menu Navigation | `Mouse/Click` |
| Quiz Answers | `1-4` keys or `Click` |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd phaser
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Tech Stack

- **Engine**: [Phaser 3](https://phaser.io/) - Fast, free, and fun HTML5 game framework
- **Language**: TypeScript
- **Build Tool**: Vite
- **Physics**: Phaser Arcade Physics
- **Storage**: localStorage for persistence

## 📁 Project Structure

```
broccoli-blaster/
├── public/
│   └── quiz.sample.json      # Quiz questions
├── src/
│   ├── main.ts               # Game entry point
│   ├── types.ts              # TypeScript definitions
│   ├── entities/             # Game objects
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   └── Bullet.ts
│   ├── scenes/               # Game scenes
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── QuizScene.ts
│   │   └── ResultScene.ts
│   ├── state/                # State management
│   │   ├── GameState.ts
│   │   └── Persist.ts
│   └── systems/              # Game systems
│       ├── Spawner.ts
│       ├── Powerups.ts
│       ├── Penalties.ts
│       └── UI.ts
└── index.html
```

## 🎯 Game Design

### Scoring
- 🍟 Fries: **10 points**
- 🥤 Soda: **20 points**
- 🍔 Burger: **40 points**
- Wave Clear Bonus: **100 points**

### Player Stats
- **HP**: 3 hearts
- **Speed**: 220 px/s
- **Fire Rate**: 8 rounds per second
- **Hitbox**: 60% of sprite size

### Wave Progression
- Base enemies: 5
- Scaling: +2 enemies per wave
- HP increases every 3 waves
- Maximum 40 enemies on screen

## 🎓 Educational Content

The quiz questions cover:
- Nutrition basics
- Healthy eating habits
- Food science
- Vitamin and mineral knowledge
- Making smart food choices

Perfect for players who want to learn while having fun!

## 🎨 Assets

The game uses procedurally generated placeholder graphics:
- Simple shapes drawn with Phaser Graphics
- Emoji-enhanced UI for personality
- Colorful tints for visual variety

## 🔧 Customization

### Adding New Questions

Edit `public/quiz.sample.json` to add more questions:

```json
{
  "id": "q16",
  "prompt": "Your question here?",
  "choices": [
    {"id": "a", "text": "Option A", "isCorrect": true},
    {"id": "b", "text": "Option B", "isCorrect": false}
  ],
  "explanation": "Educational explanation",
  "reward": "spread",
  "penalty": "heat"
}
```

### Tweaking Difficulty

Adjust values in `src/systems/Spawner.ts`:
- `baseCount` - Starting number of enemies
- `waveScale` - Enemy increase per wave
- HP scaling in `src/entities/Enemy.ts`

## 🐛 Known Issues

- None! The game runs smoothly at 60 FPS

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new enemy types
- Create new quiz questions
- Improve visual effects
- Add sound effects
- Enhance mobile controls

## 🎉 Credits

Created with ❤️ using Phaser 3

**Concept**: Educational arcade shooter combining classic gameplay with learning

---

**Have fun blasting junk food and learning about nutrition! 🥦💪**
