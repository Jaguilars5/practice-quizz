import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { getAnswersByPlayer, getLocalAnswers } from '../firebase/answersService'
import { hasFirebaseConfig } from '../firebase/config'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, ClipboardList, Play, Trash2 } from 'lucide-react'
import type { AnswerSet } from '../types'

export const MyAnswers = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<AnswerSet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const load = async () => {
      const local = getLocalAnswers(undefined, user.email)
      let firebase: AnswerSet[] = []

      if (hasFirebaseConfig) {
        try {
          firebase = await getAnswersByPlayer(user.email)
        } catch {
          // fallback to local
        }
      }

      const seen = new Set<string>()
      const merged: AnswerSet[] = []
      for (const a of [...firebase, ...local]) {
        const key = `${a.testId}_${a.finishedAt}`
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(a)
        }
      }
      merged.sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())

      setAnswers(merged)
      setLoading(false)
    }

    load()
  }, [user, navigate])

  if (!user) return null

  const removeAnswer = (index: number) => {
    const updated = answers.filter((_, i) => i !== index)
    setAnswers(updated)
    localStorage.setItem('answers', JSON.stringify(updated))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Mis respuestas</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Cargando...</div>
      ) : answers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tienes respuestas guardadas</p>
          <p className="text-sm mt-1">Juega un test para ver tus resultados aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((a, i) => {
            const acc = parseInt(a.stats.accuracy)
            const accColor = acc >= 80 ? 'green' : acc >= 50 ? 'yellow' : 'red'

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
              >
              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{a.testTitle}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(a.finishedAt).toLocaleDateString('es', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge color={accColor}>{a.stats.accuracy} acierto</Badge>
                      <Badge color="primary">{a.totalScore} pts</Badge>
                      <Badge color="gray">{a.stats.correct}/{a.stats.correct + a.stats.incorrect}</Badge>
                      <Badge color="gray">{a.stats.avgTime.toFixed(1)}s prom.</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => navigate(`/play/${a.testId}`)}>
                      <Play size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeAnswer(i)}>
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
