import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { logout } from '../../firebase/authService'
import { Button } from '../ui/Button'
import { LogOut, User, ClipboardList } from 'lucide-react'

export const Navbar = () => {
  const { user } = useAuthStore()
  const { pathname } = useLocation()

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

  const linkClass = (path: string) =>
    `transition-colors text-sm font-medium ${isActive(path) ? 'text-primary-300' : 'text-gray-300 hover:text-white'}`

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
            <span className="text-primary-400">Quiz</span>zY
          </motion.span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/creator" className={linkClass('/creator')}>Crear</Link>
              <Link to="/mis-respuestas" className={`${linkClass('/mis-respuestas')} flex items-center gap-1`}>
                <ClipboardList size={16} />
                <span className="hidden sm:inline">Mis respuestas</span>
              </Link>
              <Link to="/leaderboard" className={linkClass('/leaderboard')}>Ranking</Link>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <User size={18} />
                )}
                <span className="hidden sm:inline">{user.displayName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Ingresar</Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
