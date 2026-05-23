import { motion } from "framer-motion";

interface TimerRingProps {
  timeLeft: number;
  timeLimit: number;
}

export const TimerRing = ({ timeLeft, timeLimit }: TimerRingProps) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLimit > 0 ? timeLeft / timeLimit : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const isLow = timeLeft <= 5;

  return (
    <div className="relative w-12 h-12">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="transform -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="3"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={isLow ? "#ef4444" : "#6366f1"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-bold ${
          isLow ? "text-red-400" : "text-gray-300"
        }`}
      >
        {timeLeft}
      </span>
    </div>
  );
};
