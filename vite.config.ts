import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/practice-quizz/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/app"),
      "@quiz": path.resolve(__dirname, "src/features/quiz"),
      "@quizData": path.resolve(__dirname, "src/features/quiz/data"),
      "@quizState": path.resolve(__dirname, "src/features/quiz/state"),
      "@flashcards": path.resolve(__dirname, "src/features/flashcards"),
      "@flashcardData": path.resolve(__dirname, "src/features/flashcards/data"),
      "@auth": path.resolve(__dirname, "src/features/auth"),
      "@authData": path.resolve(__dirname, "src/features/auth/data"),
      "@authState": path.resolve(__dirname, "src/features/auth/state"),
      "@folders": path.resolve(__dirname, "src/features/folders"),
      "@folderData": path.resolve(__dirname, "src/features/folders/data"),
      "@preferences": path.resolve(__dirname, "src/features/preferences"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
