import { AnswerOption } from "@quiz/game-engine/components/AnswerOption";
import { TimerRing } from "@quiz/game-engine/components/TimerRing";
import type { Question } from "@quiz/test-management/types/test.types";
import { Badge } from "@shared/components/ui/Badge";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | boolean | null;
  onSelect: (value: number | boolean) => void;
  timeLeft: number;
  showResult: boolean;
  currentIndex: number;
  total: number;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  onSelect,
  timeLeft,
  showResult,
  currentIndex,
  total,
}: QuestionCardProps) => {
  const options =
    question.type === "truefalse"
      ? ["Verdadero", "Falso"]
      : question.options || [];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Badge color="primary">
          {currentIndex + 1} / {total}
        </Badge>
        <TimerRing timeLeft={timeLeft} timeLimit={question.timeLimit} />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg sm:text-xl font-bold text-white leading-snug"
      >
        {question.text}
      </motion.h2>

      <div className="space-y-3">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrectAnswer =
            question.type === "truefalse"
              ? (question.correct === true && i === 0) ||
                (question.correct === false && i === 1)
              : question.correct === i;
          const showCorrect = showResult && isCorrectAnswer;
          const showWrong = showResult && isSelected && !isCorrectAnswer;

          let borderColor = "border-gray-700 hover:border-primary-500/50";
          if (showCorrect) borderColor = "border-green-500 bg-green-500/10";
          else if (showWrong) borderColor = "border-red-500 bg-red-500/10";
          else if (isSelected)
            borderColor = "border-primary-500 bg-primary-500/10";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <AnswerOption
                text={opt}
                selected={isSelected}
                correct={showCorrect}
                wrong={showWrong}
                disabled={showResult}
                onClick={() => onSelect(i)}
                borderColor={borderColor}
              />
            </motion.div>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-5 py-4 rounded-xl bg-primary-500/10 border border-primary-500/20"
        >
          <p className="text-sm text-primary-300 leading-relaxed">
            {question.explanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
