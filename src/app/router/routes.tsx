import type { ReactElement } from 'react'
import { Home } from '@quiz/pages/Home'
import { Creator } from '@quiz/pages/Creator'
import { Play } from '@quiz/pages/Play'
import { Results } from '@quiz/pages/Results'
import { Leaderboard } from '@quiz/pages/Leaderboard'
import { MyAnswersPage } from '@quiz/pages/MyAnswersPage'
import { FlashcardsHome } from '@flashcards/pages/FlashcardsHome'
import { FlashcardCreator } from '@flashcards/pages/FlashcardCreator'
import { FlashcardStudy } from '@flashcards/pages/FlashcardStudy'
import { Login } from '@auth/pages/Login'
import { DesignSystem } from '@/pages/DesignSystem'
import { ROUTES } from '@app/constants/routes'

interface AppRoute {
  path: string
  element: ReactElement
}

export const routes: AppRoute[] = [
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.LOGIN, element: <Login /> },
  { path: ROUTES.CREATOR, element: <Creator /> },
  { path: ROUTES.PLAY(':testId'), element: <Play /> },
  { path: ROUTES.RESULTS, element: <Results /> },
  { path: ROUTES.LEADERBOARD, element: <Leaderboard /> },
  { path: ROUTES.MY_ANSWERS, element: <MyAnswersPage /> },
  { path: ROUTES.FLASHCARDS, element: <FlashcardsHome /> },
  { path: ROUTES.FLASHCARD_CREATOR, element: <FlashcardCreator /> },
  { path: ROUTES.FLASHCARD_STUDY(':setId'), element: <FlashcardStudy /> },
  { path: ROUTES.DESIGN_SYSTEM, element: <DesignSystem /> },
]
