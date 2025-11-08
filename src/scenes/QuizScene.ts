import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import type { Question } from '../types';

export default class QuizScene extends Phaser.Scene {
  private currentQuestion?: Question;
  private selectedChoice?: string;
  private choiceTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'Quiz' });
  }

  create(): void {
    // Semi-transparent backdrop
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.8);

    // Get next question
    this.currentQuestion = gameState.getNextQuestion();
    
    if (!this.currentQuestion) {
      // No questions available, skip quiz
      this.resolveQuiz(true);
      return;
    }

    // Quiz card background
    const card = this.add.rectangle(480, 270, 700, 400, 0xffffff);
    card.setStrokeStyle(4, 0x228B22);

    // Question prompt
    const promptText = this.add.text(480, 150, this.currentQuestion.prompt, {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);

    // Render choices
    const startY = 240;
    const spacing = 60;
    
    this.currentQuestion.choices.forEach((choice, index) => {
      const y = startY + index * spacing;
      
      const choiceBox = this.add.rectangle(480, y, 600, 50, 0xf0f0f0)
        .setStrokeStyle(2, 0xcccccc)
        .setInteractive();

      const choiceText = this.add.text(480, y, `${String.fromCharCode(65 + index)}. ${choice.text}`, {
        fontSize: '18px',
        color: '#333333'
      }).setOrigin(0.5);

      this.choiceTexts.set(choice.id, choiceText);

      choiceBox.on('pointerover', () => {
        if (this.selectedChoice !== choice.id) {
          choiceBox.setFillStyle(0xe0e0e0);
        }
      });

      choiceBox.on('pointerout', () => {
        if (this.selectedChoice !== choice.id) {
          choiceBox.setFillStyle(0xf0f0f0);
        }
      });

      choiceBox.on('pointerdown', () => {
        this.selectChoice(choice.id, choiceBox);
      });

      // Store reference for keyboard selection
      (choiceBox as any).choiceId = choice.id;
      (choiceBox as any).index = index;
    });

    // Submit button
    const submitButton = this.add.text(480, 450, 'SUBMIT ANSWER', {
      fontSize: '24px',
      color: '#999999',
      backgroundColor: '#cccccc',
      padding: { x: 30, y: 15 },
      fontStyle: 'bold'
    }).setOrigin(0.5);

    submitButton.setInteractive();
    submitButton.on('pointerdown', () => {
      if (this.selectedChoice) {
        this.submitAnswer();
      }
    });

    // Keyboard support
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.selectedChoice) {
          this.submitAnswer();
        }
      });

      // Number keys for quick selection
      for (let i = 0; i < this.currentQuestion.choices.length; i++) {
        const key = String.fromCharCode(49 + i); // '1', '2', '3', etc.
        this.input.keyboard.on(`keydown-${key}`, () => {
          if (this.currentQuestion && i < this.currentQuestion.choices.length) {
            const choice = this.currentQuestion.choices[i];
            if (choice) {
              this.selectChoice(choice.id);
            }
          }
        });
      }
    }
  }

  private selectChoice(choiceId: string, box?: Phaser.GameObjects.Rectangle): void {
    this.selectedChoice = choiceId;

    // Update all choice appearances
    this.choiceTexts.forEach((text, id) => {
      if (id === choiceId) {
        text.setColor('#228B22');
        text.setFontStyle('bold');
      } else {
        text.setColor('#333333');
        text.setFontStyle('normal');
      }
    });

    if (box) {
      box.setFillStyle(0xc8e6c9);
    }
  }

  private submitAnswer(): void {
    if (!this.currentQuestion || !this.selectedChoice) return;

    const selectedChoiceObj = this.currentQuestion.choices.find(c => c.id === this.selectedChoice);
    if (!selectedChoiceObj) return;

    const isCorrect = selectedChoiceObj.isCorrect;

    // Show feedback
    this.showFeedback(isCorrect);

    // Resolve after delay
    this.time.delayedCall(isCorrect ? 1500 : 2000, () => {
      this.resolveQuiz(isCorrect);
    });
  }

  private showFeedback(isCorrect: boolean): void {
    // Clear existing elements
    this.children.removeAll();

    // Backdrop
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.8);

    if (isCorrect) {
      this.add.text(480, 200, '✅ CORRECT!', {
        fontSize: '64px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      this.add.text(480, 300, 'Power-up granted!', {
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Particle effect
      this.cameras.main.flash(500, 0, 255, 0);
    } else {
      this.add.text(480, 200, '❌ NOT QUITE!', {
        fontSize: '54px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      if (this.currentQuestion?.explanation) {
        this.add.text(480, 300, this.currentQuestion.explanation, {
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 700 }
        }).setOrigin(0.5);
      }

      this.cameras.main.flash(300, 255, 0, 0);
    }
  }

  private resolveQuiz(correct: boolean): void {
    const result = {
      correct,
      reward: correct ? this.currentQuestion?.reward : undefined,
      penalty: !correct ? this.currentQuestion?.penalty : undefined
    };

    // Emit to GameScene
    const gameScene = this.scene.get('Game');
    gameScene.events.emit('quiz:resolve', result);
  }
}
