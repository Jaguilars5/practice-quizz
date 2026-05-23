import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
      <motion.div
        className="h-full bg-primary-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      />
    </div>
  );
};
