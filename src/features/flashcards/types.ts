export interface Flashcard {
  id: number
  front: string
  back: string
}

export interface FlashcardSet {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: string
  cards: Flashcard[]
  visibility: 'global' | 'private'
  code: string
  shuffleCards?: boolean
  folderId?: string
}
