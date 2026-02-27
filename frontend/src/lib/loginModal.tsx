"use client";

import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabase/client";

const LoginModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      },
    });

    if (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl px-10 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-6 text-center">
              Sign In to Like
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 bg-white border border-gray-300 rounded-full shadow px-6 py-3 text-sm font-medium text-gray-800 transition hover:bg-green-500 hover:text-white"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
