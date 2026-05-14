import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { loginWithGoogle } from '../firebase/authService'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LogIn } from 'lucide-react'

export const Login = () => {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-primary-400">Quiz</span>zY
          </h1>
          <p className="text-gray-400 mt-2">Juega y aprende con amigos</p>
        </div>
        <Button onClick={handleLogin} size="lg" className="w-full">
          <LogIn size={20} />
          Ingresar con Google
        </Button>
      </Card>
    </div>
  )
}
