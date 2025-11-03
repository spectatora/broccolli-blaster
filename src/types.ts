// Type definitions for Broccoli Blaster

export type AnswerChoice = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  prompt: string;
  choices: AnswerChoice[];
  explanation?: string;
  reward?: "spread" | "rapid" | "shield" | "bomb";
  penalty?: "heat" | "spawn" | "chip";
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type QuizPack = {
  id: string;
  title: string;
  questions: Question[];
};

export type RunStats = {
  score: number;
  wave: number;
  hp: number;
  powerTimers: Record<string, number>;
};

export type Best = {
  bestScore: number;
  bestWave: number;
};

export type WeaponType = "pea-shooter" | "laser" | "shotgun" | "missiles";

export type Progression = {
  unlockedWeapons: WeaponType[];
  currentWeapon: WeaponType;
};

export type EnemyType = "fries" | "soda" | "burger";

export type PowerUpType = "spread" | "rapid" | "shield" | "bomb";
export type PenaltyType = "heat" | "spawn" | "chip";
