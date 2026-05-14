import type { Question } from '../../types'

interface QuestionEditorProps {
  question: Question
  index: number
  onChange: (index: number, question: Question) => void
  onRemove: (index: number) => void
}

export const QuestionEditor = ({ question, index, onChange, onRemove }: QuestionEditorProps) => {
  const update = (field: keyof Question, value: unknown) => {
    onChange(index, { ...question, [field]: value })
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary-400">Pregunta {index + 1}</span>
        <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300 text-sm">
          Eliminar
        </button>
      </div>

      <input
        type="text"
        value={question.text}
        onChange={(e) => update('text', e.target.value)}
        placeholder="Escribe la pregunta..."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
      />

      <div className="flex gap-2">
        {(['multiple', 'truefalse'] as const).map((type) => (
          <button
            key={type}
            onClick={() => update('type', type)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              question.type === type
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type === 'multiple' ? 'Opción múltiple' : 'Verdadero/Falso'}
          </button>
        ))}
      </div>

      {question.type === 'multiple' && (
        <div className="space-y-2">
          {question.options?.map((opt, oi) => (
            <div key={oi} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const opts = [...(question.options || [])]
                  opts[oi] = e.target.value
                  update('options', opts)
                }}
                placeholder={`Opción ${oi + 1}`}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={() => update('correct', oi)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  question.correct === oi
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                Correcta
              </button>
              {question.options!.length > 2 && (
                <button
                  onClick={() => {
                    const opts = question.options!.filter((_, i) => i !== oi)
                    update('options', opts)
                    if (question.correct === oi) update('correct', 0)
                    else if (question.correct as number > oi) update('correct', (question.correct as number) - 1)
                  }}
                  className="text-red-400 text-sm"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => update('options', [...(question.options || []), ''])}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Agregar opción
          </button>
        </div>
      )}

      {question.type === 'truefalse' && (
        <div className="flex gap-2">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              onClick={() => update('correct', val)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                question.correct === val
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {val ? 'Verdadero' : 'Falso'}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <div>
          <label className="text-xs text-gray-500">Puntos</label>
          <input
            type="number"
            value={question.points}
            onChange={(e) => update('points', Number(e.target.value))}
            className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Tiempo (s)</label>
          <input
            type="number"
            value={question.timeLimit}
            onChange={(e) => update('timeLimit', Number(e.target.value))}
            className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <input
        type="text"
        value={question.explanation}
        onChange={(e) => update('explanation', e.target.value)}
        placeholder="Explicación (opcional)"
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
      />
    </div>
  )
}
