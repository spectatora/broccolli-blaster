import type { RunStats, Best, QuizPack, Question } from '../types';
import { loadBest, saveBest } from './Persist';

export class GameState {
  run: RunStats | null = null;
  best: Best = loadBest() ?? { bestScore: 0, bestWave: 0 };
  quizPack: QuizPack | null = null;
  usedQuestions: Set<string> = new Set();

  startRun(): void {
    this.run = {
      score: 0,
      wave: 1,
      hp: 3,
      powerTimers: {}
    };
    this.usedQuestions.clear();
  }

  endRun(): void {
    if (this.run) {
      if (this.run.score > this.best.bestScore) {
        this.best.bestScore = this.run.score;
      }
      if (this.run.wave > this.best.bestWave) {
        this.best.bestWave = this.run.wave;
      }
      saveBest(this.best);
      this.run = null;
    }
  }

  addScore(points: number): void {
    if (this.run) {
      this.run.score += points;
    }
  }

  nextWave(): void {
    if (this.run) {
      this.run.wave += 1;
    }
  }

  takeDamage(amount: number = 1): boolean {
    if (this.run) {
      this.run.hp = Math.max(0, this.run.hp - amount);
      return this.run.hp <= 0;
    }
    return true;
  }

  healHP(amount: number = 1): void {
    if (this.run) {
      this.run.hp = Math.min(3, this.run.hp + amount);
    }
  }

  getNextQuestion(): Question | null {
    if (!this.quizPack || this.quizPack.questions.length === 0) {
      return null;
    }

    // Find unused questions
    const unusedQuestions = this.quizPack.questions.filter(q => !this.usedQuestions.has(q.id));
    
    // If all questions used, reset
    if (unusedQuestions.length === 0) {
      this.usedQuestions.clear();
      return this.quizPack.questions[0];
    }

    // Return random unused question
    const question = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
    this.usedQuestions.add(question.id);
    return question;
  }

  setQuizPack(pack: QuizPack): void {
    this.quizPack = pack;
  }
}

// Global singleton instance
export const gameState = new GameState();
