interface AnswerOptionProps {
  text: string
  selected: boolean
  correct: boolean
  wrong: boolean
  disabled: boolean
  onClick: () => void
  borderColor: string
}

export const AnswerOption = ({ text, disabled, onClick, borderColor }: AnswerOptionProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-xl border bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${borderColor} ${disabled ? 'cursor-default' : 'active:scale-[0.98]'}`}
    >
      <span className="text-white font-medium">{text}</span>
    </button>
  )
}
