import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
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

export const App = () => {
  const { init, loading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = init()
    return () => unsubscribe()
  }, [init])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-16 px-4 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/creator" element={<Creator />} />
            <Route path="/play/:testId" element={<Play />} />
            <Route path="/results" element={<Results />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/mis-respuestas" element={<MyAnswers />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
