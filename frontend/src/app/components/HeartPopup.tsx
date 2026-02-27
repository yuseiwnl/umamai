"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

export default function HeartPopup() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none"
      >
        <FaHeart className="text-red-500 text-8xl drop-shadow-lg" />
      </motion.div>
    </AnimatePresence>
  );
}
