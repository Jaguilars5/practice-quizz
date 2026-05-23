import * as yup from 'yup'
import type { Test, Question } from '@shared/types'

export const questionSchema = yup.object({
  text: yup.string().required('La pregunta es obligatoria').min(5, 'Mínimo 5 caracteres'),
  type: yup.mixed<'multiple' | 'truefalse'>().oneOf(['multiple', 'truefalse']).required(),
  options: yup.array().when('type', {
    is: 'multiple',
    then: (schema) => schema.of(yup.string().required('Opción obligatoria')).min(2, 'Mínimo 2 opciones'),
    otherwise: (schema) => schema.notRequired(),
  }),
  correct: yup.mixed().required('Selecciona la respuesta correcta'),
  explanation: yup.string().notRequired(),
  points: yup.number().min(10, 'Mínimo 10 puntos').max(500, 'Máximo 500 puntos').default(100),
  timeLimit: yup.number().min(5, 'Mínimo 5 segundos').max(120, 'Máximo 120 segundos').default(20),
})

export const testSchema = yup.object({
  title: yup.string().required('El título es obligatorio').min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: yup.string().notRequired().max(300, 'Máximo 300 caracteres'),
  category: yup.string().required('La categoría es obligatoria').min(2, 'Mínimo 2 caracteres'),
  difficulty: yup.mixed<'facil' | 'medio' | 'dificil'>().oneOf(['facil', 'medio', 'dificil']).required(),
  timePerQuestion: yup.number().min(5, 'Mínimo 5 segundos').max(120, 'Máximo 120 segundos').default(20),
  visibility: yup.mixed<'global' | 'private'>().oneOf(['global', 'private']).default('private'),
  code: yup.string().length(6, 'El código debe tener 6 caracteres').matches(/^[A-Z0-9]+$/, 'Solo letras y números'),
  shuffleQuestions: yup.boolean().default(false),
  shuffleOptions: yup.boolean().default(false),
  autoAdvance: yup.number().min(0, 'Mínimo 0').max(10, 'Máximo 10 segundos').default(4),
  folderId: yup.string().notRequired(),
})

export const defaultQuestion: Question = {
  id: Date.now(),
  text: '',
  type: 'multiple',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  points: 100,
  timeLimit: 20,
}

export const defaultTestValues = {
  title: '',
  description: '',
  category: 'General',
  difficulty: 'medio' as const,
  timePerQuestion: 20,
  visibility: 'private' as const,
  code: '',
  shuffleQuestions: false,
  shuffleOptions: false,
  autoAdvance: 4,
  folderId: undefined,
}

export const mapTestToFormValues = (test?: Test) => ({
  title: test?.title || '',
  description: test?.description || '',
  category: test?.category || 'General',
  difficulty: test?.difficulty || 'medio' as const,
  timePerQuestion: test?.timePerQuestion || 20,
  visibility: test?.visibility || 'private' as const,
  code: test?.code || generateCode(),
  shuffleQuestions: test?.shuffleQuestions || false,
  shuffleOptions: test?.shuffleOptions || false,
  autoAdvance: test?.autoAdvance ?? 4,
  folderId: test?.folderId || undefined,
})

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export type TestFormValues = yup.InferType<typeof testSchema>
export type QuestionFormValues = yup.InferType<typeof questionSchema>
