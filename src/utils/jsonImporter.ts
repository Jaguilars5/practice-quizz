import type { Test } from '../types'

export const importTestFromJson = (): Promise<Test> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No se seleccionó archivo'))
        return
      }
      try {
        const text = await file.text()
        const test = JSON.parse(text) as Test
        resolve(test)
      } catch {
        reject(new Error('Archivo JSON inválido'))
      }
    }
    input.click()
  })
}
