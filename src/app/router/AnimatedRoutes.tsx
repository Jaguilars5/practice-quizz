import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { routes } from "./routes";

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full"
    />
  </div>
);

export const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};
