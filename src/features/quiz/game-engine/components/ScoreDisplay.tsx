import type { AnswerStats } from "@quiz/game-engine/types/game.types";
import { motion } from "framer-motion";
import { Clock, Target, Trophy, Zap } from "lucide-react";

interface ScoreDisplayProps {
  totalScore: number;
  maxScore: number;
  stats: AnswerStats;
}

export const ScoreDisplay = ({
  totalScore,
  maxScore,
  stats,
}: ScoreDisplayProps) => {
  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{percentage}%</span>
        </div>
        <Trophy
          size={24}
          className="absolute -top-1 -right-1 text-yellow-400"
        />
      </motion.div>

      <div className="text-center">
        <p className="text-2xl font-bold text-white">
          {totalScore} / {maxScore}
        </p>
        <p className="text-sm text-gray-400 mt-1">Puntuación total</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <Target size={20} className="mx-auto text-green-400 mb-1" />
          <p className="text-lg font-bold text-green-400">{stats.accuracy}</p>
          <p className="text-xs text-gray-500">Acierto</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <Target size={20} className="mx-auto text-red-400 mb-1" />
          <p className="text-lg font-bold text-red-400">
            {stats.correct}/{stats.correct + stats.incorrect}
          </p>
          <p className="text-xs text-gray-500">Correctas/Total</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Zap size={20} className="mx-auto text-yellow-400 mb-1" />
          <p className="text-lg font-bold text-yellow-400">{stats.maxStreak}</p>
          <p className="text-xs text-gray-500">Mejor racha</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Clock size={20} className="mx-auto text-blue-400 mb-1" />
          <p className="text-lg font-bold text-blue-400">
            {stats.avgTime.toFixed(1)}s
          </p>
          <p className="text-xs text-gray-500">Tiempo prom.</p>
        </div>
      </div>
    </div>
  );
};
