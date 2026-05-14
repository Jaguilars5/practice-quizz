export const calculateScore = (
  isCorrect: boolean,
  timeUsed: number,
  timeLimit: number,
  multiplier: number
): { base: number; bonus: number } => {
  if (!isCorrect) return { base: 0, bonus: 0 }

  const base = Math.round(100 * multiplier)
  const halfTime = timeLimit / 2
  const bonus = timeUsed <= halfTime ? 50 : 0

  return { base, bonus }
}
