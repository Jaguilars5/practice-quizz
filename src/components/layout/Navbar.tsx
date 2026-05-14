import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { logout } from '../../firebase/authService'
import { Button } from '../ui/Button'
import { LogOut, User, ClipboardList } from 'lucide-react'

export const Navbar = () => {
  const { user } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          <span className="text-primary-400">Quiz</span>zY
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/creator" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Crear
              </Link>
              <Link to="/mis-respuestas" className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                <ClipboardList size={16} />
                <span className="hidden sm:inline">Mis respuestas</span>
              </Link>
              <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Ranking
              </Link>
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
    </nav>
  )
}
