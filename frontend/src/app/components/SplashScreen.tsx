"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type SplashScreenProps = {
  onComplete?: () => void;
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.main
          className="fixed inset-0 bg-white z-[999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          <div className="w-full h-full flex justify-center items-center">
            <motion.img
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
              src={"/logo.svg"}
              alt="placeholder"
              className="w-52"
            />
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
