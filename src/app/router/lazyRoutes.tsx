import { lazy } from "react";

export const LazyDesignSystem = lazy(() =>
  import("@/pages/DesignSystem").then((m) => ({ default: m.DesignSystem })),
);
export const LazyLogin = lazy(() =>
  import("@auth/pages/Login").then((m) => ({ default: m.Login })),
);
export const LazyFlashcardCreator = lazy(() =>
  import("@flashcards/pages/FlashcardCreator").then((m) => ({
    default: m.FlashcardCreator,
  })),
);
export const LazyFlashcardsHome = lazy(() =>
  import("@flashcards/pages/FlashcardsHome").then((m) => ({
    default: m.FlashcardsHome,
  })),
);
export const LazyFlashcardStudy = lazy(() =>
  import("@flashcards/pages/FlashcardStudy").then((m) => ({
    default: m.FlashcardStudy,
  })),
);
export const LazyLeaderboard = lazy(() =>
  import("@quiz/answers/pages/Leaderboard").then((m) => ({
    default: m.Leaderboard,
  })),
);
export const LazyMyAnswersPage = lazy(() =>
  import("@quiz/answers/pages/MyAnswersPage").then((m) => ({
    default: m.MyAnswersPage,
  })),
);
export const LazyResults = lazy(() =>
  import("@quiz/answers/pages/Results").then((m) => ({ default: m.Results })),
);
export const LazyPlay = lazy(() =>
  import("@quiz/game-engine/pages/Play").then((m) => ({ default: m.Play })),
);
export const LazyCreator = lazy(() =>
  import("@quiz/test-management/pages/Creator").then((m) => ({
    default: m.Creator,
  })),
);
export const LazyHome = lazy(() =>
  import("@quiz/test-management/pages/Home").then((m) => ({ default: m.Home })),
);
