import { ROUTES } from "@app/constants/routes";
import { logError } from "@app/services/errorLogger";
import { useAuthStore } from "@auth/store";
import { AnswerDetail } from "@quiz/answers/components/AnswerDetail";
import { getAnswersByPlayer, getLocalAnswers } from "@quiz/answers/services";
import type { AnswerSet } from "@quiz/answers/types/answer.types";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { hasFirebaseConfig } from "@shared/services/firebase";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpDown,
  ClipboardList,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AnswerCard = ({
  answer,
  onPlay,
  onRemove,
}: {
  answer: AnswerSet;
  onPlay: () => void;
  onRemove: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const acc = parseInt(answer.stats.accuracy);
  const accColor = acc >= 80 ? "green" : acc >= 50 ? "yellow" : "red";

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {answer.testTitle}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(answer.finishedAt).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge color={accColor}>{answer.stats.accuracy} acierto</Badge>
              <Badge color="primary">{answer.totalScore} pts</Badge>
              <Badge color="gray">
                {answer.stats.correct}/
                {answer.stats.correct + answer.stats.incorrect}
              </Badge>
              <Badge color="gray">
                {answer.stats.avgTime.toFixed(1)}s prom.
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 items-start">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <Play size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 size={14} className="text-red-400" />
            </Button>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500 mt-1"
            >
              ▸
            </motion.span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {answer.answers.map((a, i) => (
                <AnswerDetail
                  key={i}
                  index={i}
                  questionText={a.questionText}
                  options={a.options}
                  selectedOption={a.selectedOption}
                  isCorrect={a.isCorrect}
                  pointsEarned={a.pointsEarned}
                  bonusPoints={a.bonusPoints}
                  timeUsed={a.timeUsed}
                  correctAnswer={a.correctAnswer}
                  explanation={a.explanation}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MyAnswersPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<AnswerSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortNewest, setSortNewest] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const load = async () => {
      const local = getLocalAnswers(undefined, user.email);
      let firebase: AnswerSet[] = [];

      if (hasFirebaseConfig) {
        try {
          firebase = await getAnswersByPlayer(user.email);
        } catch (error) {
          logError(error, "MyAnswersPage:load");
        }
      }

      const seen = new Set<string>();
      const merged: AnswerSet[] = [];
      for (const a of [...firebase, ...local]) {
        const key = `${a.testId}_${a.finishedAt}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(a);
        }
      }
      merged.sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
      );
      setAnswers(merged);

      setLoading(false);
    };

    load();
  }, [user, navigate]);

  if (!user) return null;

  const removeAnswer = (index: number) => {
    const updated = answers.filter((_, i) => i !== index);
    setAnswers(updated);
    localStorage.setItem("answers", JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(ROUTES.HOME)}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold text-white">Mis respuestas</h1>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Buscar..."
              className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-32 sm:w-40"
            />
          </div>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowUpDown size={14} />
            {sortNewest ? "Más recientes" : "Más antiguos"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Cargando...</div>
      ) : answers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tienes respuestas guardadas</p>
          <p className="text-sm mt-1">
            Juega un test para ver tus resultados aquí
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...answers]
            .filter(
              (a) =>
                !searchTitle.trim() ||
                a.testTitle.toLowerCase().includes(searchTitle.toLowerCase()),
            )
            .sort((a, b) =>
              sortNewest
                ? new Date(b.finishedAt).getTime() -
                  new Date(a.finishedAt).getTime()
                : new Date(a.finishedAt).getTime() -
                  new Date(b.finishedAt).getTime(),
            )
            .map((a, i) => (
              <motion.div
                key={`${a.testId}_${a.finishedAt}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <AnswerCard
                  answer={a}
                  onPlay={() => navigate(ROUTES.PLAY(a.testId))}
                  onRemove={() => removeAnswer(i)}
                />
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};
