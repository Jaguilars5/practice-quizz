import { ROUTES } from "@app/constants/routes";
import { logError } from "@app/services/errorLogger";
import { useAuthStore } from "@auth/store";
import { getAnswersByTest, getLocalAnswers } from "@quiz/answers/services";
import type { AnswerSet } from "@quiz/answers/types/answer.types";
import { getLocalTests } from "@quiz/test-management/services";
import type { Test } from "@quiz/test-management/types/test.types";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Card } from "@shared/components/ui/Card";
import { hasFirebaseConfig } from "@shared/services/firebase";
import { motion } from "framer-motion";
import { ArrowLeft, Medal, Search, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Leaderboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerSet[]>([]);
  const [searchTitle, setSearchTitle] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setTests(getLocalTests());
  }, [user, navigate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!selectedTestId) return;

    const load = async () => {
      if (hasFirebaseConfig) {
        try {
          const fb = await getAnswersByTest(selectedTestId);
          setAnswers(fb);
          return;
        } catch (error) {
          logError(error, "Leaderboard:loadAnswers");
        }
      }
      setAnswers(getLocalAnswers(selectedTestId));
    };
    load();
  }, [selectedTestId]);

  const selectedTest = tests.find((t) => t.id === selectedTestId);

  const rankings = useMemo(() => {
    const grouped = answers.reduce<
      Record<
        string,
        {
          name: string;
          score: number;
          correct: number;
          total: number;
          count: number;
        }
      >
    >((acc, a) => {
      if (!acc[a.playerId]) {
        acc[a.playerId] = {
          name: a.playerName,
          score: 0,
          correct: 0,
          total: 0,
          count: 0,
        };
      }
      acc[a.playerId].score = Math.max(acc[a.playerId].score, a.totalScore);
      acc[a.playerId].correct += a.stats.correct;
      acc[a.playerId].total += a.stats.correct + a.stats.incorrect;
      acc[a.playerId].count++;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.score - a.score);
  }, [answers]);

  const podium = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Ranking</h1>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aún no hay tests para mostrar ranking</p>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Buscar test..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {tests
              .filter(
                (t) =>
                  !searchTitle.trim() ||
                  t.title.toLowerCase().includes(searchTitle.toLowerCase()),
              )
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTestId(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedTestId === t.id
                      ? "bg-primary-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {t.title}
                </button>
              ))}
          </div>

          {!selectedTestId ? (
            <div className="text-center py-20 text-gray-500">
              <Medal size={48} className="mx-auto mb-4 opacity-50" />
              <p>Seleccioná un test para ver el ranking</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>
                No hay respuestas para <strong>{selectedTest?.title}</strong>{" "}
                todavía
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <Card className="flex items-center gap-4">
                    <div className="w-10 text-center">
                      {i < 3 ? (
                        <Medal size={24} className={podium[i]} />
                      ) : (
                        <span className="text-gray-500 font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-semibold truncate block">
                        {entry.name}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <Badge color="primary">{entry.score} pts</Badge>
                        <Badge color="gray">
                          {entry.correct}/{entry.total} correctas
                        </Badge>
                        <Badge color="gray">
                          {entry.count} intento{entry.count !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
