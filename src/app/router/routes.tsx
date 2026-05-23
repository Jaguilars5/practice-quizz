import { ROUTES } from "@app/constants/routes";
import { type ReactNode } from "react";
import {
  LazyCreator,
  LazyDesignSystem,
  LazyFlashcardCreator,
  LazyFlashcardsHome,
  LazyFlashcardStudy,
  LazyHome,
  LazyLeaderboard,
  LazyLogin,
  LazyMyAnswersPage,
  LazyPlay,
  LazyResults,
} from "./lazyRoutes";

interface AppRoute {
  path: string;
  element: ReactNode;
}

export const routes: AppRoute[] = [
  { path: ROUTES.HOME, element: <LazyHome /> },
  { path: ROUTES.LOGIN, element: <LazyLogin /> },
  { path: ROUTES.CREATOR, element: <LazyCreator /> },
  { path: ROUTES.PLAY(":testId"), element: <LazyPlay /> },
  { path: ROUTES.RESULTS, element: <LazyResults /> },
  { path: ROUTES.LEADERBOARD, element: <LazyLeaderboard /> },
  { path: ROUTES.MY_ANSWERS, element: <LazyMyAnswersPage /> },
  { path: ROUTES.FLASHCARDS, element: <LazyFlashcardsHome /> },
  { path: ROUTES.FLASHCARD_CREATOR, element: <LazyFlashcardCreator /> },
  { path: ROUTES.FLASHCARD_STUDY(":setId"), element: <LazyFlashcardStudy /> },
  { path: ROUTES.DESIGN_SYSTEM, element: <LazyDesignSystem /> },
];
