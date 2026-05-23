import { Button } from "@shared/components/ui/Button";

interface AnswerOptionProps {
  text: string;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
  borderColor: string;
}

export const AnswerOption = ({
  text,
  selected,
  correct,
  wrong,
  disabled,
  onClick,
  borderColor,
}: AnswerOptionProps) => {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className="w-full"
    >
      <div
        className={`w-full px-5 py-4 rounded-xl border-2 border text-left transition-all ${borderColor} ${
          disabled ? "cursor-default" : "cursor-pointer"
        }`}
      >
        <span
          className={`text-sm font-medium ${
            correct
              ? "text-green-400"
              : wrong
                ? "text-red-400"
                : selected
                  ? "text-white"
                  : "text-gray-300"
          }`}
        >
          {text}
        </span>
      </div>
    </Button>
  );
};
