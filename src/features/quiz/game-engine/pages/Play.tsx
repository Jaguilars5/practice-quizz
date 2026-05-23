import { ROUTES } from "@app/constants/routes";
import { useAuthStore } from "@auth/store";
import { usePreferencesStore } from "@preferences/store/preferences.store";
import {
  playCorrectSound,
  playIncorrectSound,
} from "@preferences/utils/soundEffects";
import {
  saveAnswerToLocal,
  submitAnswerToFirestore,
} from "@quiz/answers/services";
import { ProgressBar } from "@quiz/game-engine/components/ProgressBar";
import { QuestionCard } from "@quiz/game-engine/components/QuestionCard";
import { useQuizLoader } from "@quiz/game-engine/hooks/useQuizLoader.hook";
import { useQuizTimer } from "@quiz/game-engine/hooks/useQuizTimer.hook";
import { useQuizStore } from "@quiz/game-engine/store";
import {
  clearQuizProgress,
  saveQuizProgress,
} from "@quiz/game-engine/utils/quiz-progress.util";
import { calculateCorrectValue } from "@quiz/game-engine/utils/quiz-scoring.util";
import type { Question } from "@quiz/test-management/types/test.types";
import { Button } from "@shared/components/ui/Button";
import { Modal } from "@shared/components/ui/Modal";
import { hasFirebaseConfig } from "@shared/services/firebase";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Play as PlayIcon,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const Play = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentQuestionIndex,
    streak,
    setTest,
    startQuiz,
    answerQuestion,
    nextQuestion,
    restoreQuiz,
    finishQuiz,
  } = useQuizStore();

  const { soundEnabled, particlesEnabled, toggleSound, toggleParticles } =
    usePreferencesStore();

  const {
    test,
    loading,
    shuffledQuestions,
    optionMaps,
    savedProgress,
    showRestoreDialog,
    setShowRestoreDialog,
    onQuizStarted,
  } = useQuizLoader(testId, user, navigate, setTest, startQuiz);

  const totalQuestions =
    shuffledQuestions?.length || test?.questions.length || 0;

  const { timeLeft, startTimer, resetTimer, getElapsed } = useQuizTimer();

  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const finishedRef = useRef(false);
  const initializedRef = useRef(false);
  const autoAdvanceRef = useRef<number>(0);

  const advance = useCallback(() => {
    clearTimeout(autoAdvanceRef.current);
    setShowResult(false);
    setSelected(null);
    setShowNextButton(false);
    if (currentQuestionIndex + 1 < totalQuestions) {
      nextQuestion();
    } else if (!finishedRef.current) {
      finishedRef.current = true;
      clearQuizProgress();
      const result = finishQuiz(
        user?.email || "anonimo",
        user?.displayName || "Anónimo",
      );
      if (hasFirebaseConfig) {
        submitAnswerToFirestore(result).catch(() => saveAnswerToLocal(result));
      } else {
        saveAnswerToLocal(result);
      }
      navigate(ROUTES.RESULTS, {
        state: { answerSet: result, questions: test?.questions },
      });
    }
  }, [
    currentQuestionIndex,
    totalQuestions,
    nextQuestion,
    user,
    finishQuiz,
    navigate,
    test,
  ]);

  const originalQuestion = (shuffledQuestions || test?.questions || [])[
    currentQuestionIndex
  ];

  const displayQuestion: Question | null = useMemo(() => {
    if (!originalQuestion) return null;
    if (
      originalQuestion.type !== "multiple" ||
      !optionMaps[originalQuestion.id]
    ) {
      return originalQuestion;
    }
    const map = optionMaps[originalQuestion.id];
    const opts = originalQuestion.options || [];
    return {
      ...originalQuestion,
      options: map.map((i) => opts[i]),
      correct: map.indexOf(originalQuestion.correct as number),
    };
  }, [originalQuestion, optionMaps]);

  const handleAnswer = useCallback(
    (value: number | boolean | null) => {
      if (showResult || !displayQuestion) return;

      setSelected(value);
      const elapsed = Math.min(getElapsed(), displayQuestion.timeLimit);

      const originalValue = calculateCorrectValue(
        displayQuestion,
        value,
        optionMaps,
      );

      const isCorrect = originalValue === originalQuestion.correct;

      if (soundEnabled) {
        if (isCorrect) playCorrectSound();
        else playIncorrectSound();
      }

      if (particlesEnabled) {
        if (isCorrect) {
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.7 },
            colors: ["#22c55e", "#4ade80", "#6366f1"],
          });
        } else {
          confetti({
            particleCount: 10,
            spread: 30,
            origin: { y: 0.7 },
            colors: ["#ef4444", "#f87171"],
            startVelocity: 20,
          });
        }
      }

      answerQuestion(originalValue, elapsed);
      setShowResult(true);
      setShowNextButton(true);

      const nextIndex =
        currentQuestionIndex + 1 < totalQuestions
          ? currentQuestionIndex + 1
          : currentQuestionIndex;
      saveQuizProgress({
        testId: testId!,
        currentQuestionIndex: nextIndex,
        answers: [...useQuizStore.getState().answers],
        startTime: useQuizStore.getState().startTime,
        streak: useQuizStore.getState().streak,
        maxStreak: useQuizStore.getState().maxStreak,
        shuffledQuestions,
        optionMaps,
        savedAt: Date.now(),
      });

      const delay = (test?.autoAdvance ?? 4) * 1000;
      if (delay > 0) {
        autoAdvanceRef.current = window.setTimeout(() => {
          advance();
        }, delay);
      }
    },
    [
      showResult,
      displayQuestion,
      optionMaps,
      originalQuestion,
      soundEnabled,
      particlesEnabled,
      answerQuestion,
      currentQuestionIndex,
      totalQuestions,
      testId,
      shuffledQuestions,
      test,
      advance,
      getElapsed,
    ],
  );

  useEffect(() => {
    if (!displayQuestion) return;
    startTimer(displayQuestion, () => handleAnswer(null));
    return () => resetTimer();
  }, [
    currentQuestionIndex,
    displayQuestion,
    startTimer,
    handleAnswer,
    resetTimer,
  ]);

  const handleRestore = () => {
    if (!savedProgress || !test) return;
    restoreQuiz(
      savedProgress.currentQuestionIndex,
      savedProgress.answers,
      savedProgress.streak,
      savedProgress.maxStreak,
      savedProgress.startTime,
    );
    setShowRestoreDialog(false);
    initializedRef.current = true;
  };

  const handleStartOver = () => {
    clearQuizProgress();
    setShowRestoreDialog(false);
    onQuizStarted();
    initializedRef.current = true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    );
  }

  if (!test || !displayQuestion) {
    return (
      <div className="text-center py-20 text-gray-500">Test no encontrado</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-0">
      {showRestoreDialog && savedProgress && (
        <Modal isOpen={true} onClose={() => {}} title="Quiz en progreso">
          <div className="space-y-4">
            <p className="text-gray-300">
              Tenés <strong>{savedProgress.answers.length}</strong> de{" "}
              <strong>{totalQuestions}</strong> preguntas respondidas. ¿Querés
              continuar donde lo dejaste o empezar de cero?
            </p>
            <div className="flex gap-3">
              <Button onClick={handleRestore} className="flex-1">
                <PlayIcon size={16} /> Continuar
              </Button>
              <Button
                variant="secondary"
                onClick={handleStartOver}
                className="flex-1"
              >
                <RotateCcw size={16} /> Empezar de cero
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.HOME)}
          className="shrink-0"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white truncate">
            {test.title}
          </h1>
          <ProgressBar current={currentQuestionIndex} total={totalQuestions} />
        </div>
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg transition-all ${soundEnabled ? "text-gray-400 hover:text-white" : "text-gray-600"}`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={toggleParticles}
          className={`p-2 rounded-lg transition-all ${particlesEnabled ? "text-gray-400 hover:text-white" : "text-gray-600"}`}
        >
          <Sparkles size={18} />
        </button>
      </div>

      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
        >
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300">
            ¡Racha de {streak}!{" "}
            {streak >= 5
              ? "Puntos dobles 🎉"
              : streak >= 3
                ? "1.5x puntos ⚡"
                : ""}
          </span>
        </motion.div>
      )}

      <QuestionCard
        question={displayQuestion}
        selectedAnswer={selected}
        onSelect={handleAnswer}
        timeLeft={timeLeft}
        showResult={showResult}
        currentIndex={currentQuestionIndex}
        total={totalQuestions}
      />

      {showNextButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <Button
            size="lg"
            onClick={() => {
              clearTimeout(autoAdvanceRef.current);
              advance();
            }}
            className="px-12"
          >
            {currentQuestionIndex + 1 < totalQuestions ? (
              <>
                Siguiente <span className="text-lg">→</span>
              </>
            ) : (
              "Ver resultados →"
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
