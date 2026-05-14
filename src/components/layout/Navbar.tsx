import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { logout } from '../../firebase/authService'
import { Button } from '../ui/Button'
import { LogOut, User, ClipboardList, Menu, X, Plus, Trophy } from 'lucide-react'

export const Navbar = () => {
  const { user } = useAuthStore()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

  const linkClass = (path: string) =>
    `transition-colors text-sm font-medium ${isActive(path) ? 'text-primary-300' : 'text-gray-300 hover:text-white'}`

  const navLinks = user ? [
    { to: '/creator', label: 'Crear', icon: Plus },
    { to: '/mis-respuestas', label: 'Respuestas', icon: ClipboardList },
    { to: '/leaderboard', label: 'Ranking', icon: Trophy },
  ] : []

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white" onClick={() => setMenuOpen(false)}>
          <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
            <span className="text-primary-400">Quiz</span>zY
          </motion.span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-4">
                <Link to="/creator" className={linkClass('/creator')}>Crear</Link>
                <Link to="/mis-respuestas" className={`${linkClass('/mis-respuestas')} flex items-center gap-1`}>
                  <ClipboardList size={16} />
                  <span className="hidden sm:inline">Mis respuestas</span>
                </Link>
                <Link to="/leaderboard" className={linkClass('/leaderboard')}>Ranking</Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <User size={18} />
                )}
                <span className="hidden sm:inline max-w-[100px] truncate">{user.displayName}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
                <LogOut size={16} />
              </Button>

              <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 text-gray-300 hover:text-white">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Ingresar</Button>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive(l.to) ? 'bg-primary-500/10 text-primary-300' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <l.icon size={18} />
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
