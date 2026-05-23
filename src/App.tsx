import { AnimatedRoutes } from "@app/router/AnimatedRoutes";
import { useAuthStore } from "@auth/store";
import { Navbar } from "@shared/components/layout/Navbar";
import { ParticleBackground } from "@shared/components/layout/ParticleBackground";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { HashRouter } from "react-router-dom";

export const App = () => {
  const { init, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = init();
    return () => unsubscribe();
  }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-16 px-4 max-w-6xl mx-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </HashRouter>
  );
};
