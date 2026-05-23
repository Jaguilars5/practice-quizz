export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CREATOR: '/creator',
  PLAY: (testId: string) => `/play/${testId}`,
  RESULTS: '/results',
  LEADERBOARD: '/leaderboard',
  MY_ANSWERS: '/my-answers',
  FLASHCARDS: '/flashcards',
  FLASHCARD_CREATOR: '/flashcards/crear',
  FLASHCARD_STUDY: (setId: string) => `/flashcards/study/${setId}`,
  DESIGN_SYSTEM: '/design-system',
} as const

export type RouteKey = keyof typeof ROUTES
