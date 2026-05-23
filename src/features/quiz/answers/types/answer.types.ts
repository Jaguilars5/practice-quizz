import type {
  AnswerStats,
  PlayerAnswer,
} from "@quiz/game-engine/types/game.types";

export interface AnswerSet {
  testId: string;
  testTitle: string;
  testCode: string;
  playerId: string;
  playerName: string;
  startedAt: string;
  finishedAt: string;
  totalScore: number;
  maxScore: number;
  answers: PlayerAnswer[];
  stats: AnswerStats;
}
