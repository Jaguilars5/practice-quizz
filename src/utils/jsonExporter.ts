import type { Test, AnswerSet } from '../types'

export const exportTestAsJson = (test: Test) => {
  const blob = new Blob([JSON.stringify(test, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `preguntas_${test.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportAnswersAsJson = (answers: AnswerSet) => {
  const blob = new Blob([JSON.stringify(answers, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `respuestas_${answers.testId}_${answers.playerId}.json`
  a.click()
  URL.revokeObjectURL(url)
}
