import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/useAuthStore'
import { Navbar } from './components/layout/Navbar'
import { ParticleBackground } from './components/layout/ParticleBackground'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Creator } from './pages/Creator'
import { Play } from './pages/Play'
import { Results } from './pages/Results'
import { Leaderboard } from './pages/Leaderboard'
import { MyAnswers } from './pages/MyAnswers'
import { FlashcardsHome } from './pages/FlashcardsHome'
import { FlashcardCreator } from './pages/FlashcardCreator'
import { FlashcardStudy } from './pages/FlashcardStudy'

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/play/:testId" element={<Play />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/mis-respuestas" element={<MyAnswers />} />
          <Route path="/flashcards" element={<FlashcardsHome />} />
          <Route path="/flashcards/crear" element={<FlashcardCreator />} />
          <Route path="/flashcards/study/:setId" element={<FlashcardStudy />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export const App = () => {
  const { init, loading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = init()
    return () => unsubscribe()
  }, [init])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-16 px-4 max-w-6xl mx-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </HashRouter>
  )
}
