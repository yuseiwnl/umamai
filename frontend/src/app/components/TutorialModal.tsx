"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Menu, MoveLeft, MoveRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gurumeai:tutorial-shown";
type TutorialStep = "swipe" | "menu" | "info";

export default function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep>("swipe");
  const [overlayMask, setOverlayMask] = useState<string | null>(null);

  const removeAllHighlights = useCallback(() => {
    if (typeof document === "undefined") return;

    document
      .querySelectorAll(".tutorial-highlighted")
      .forEach((el) => el.classList.remove("tutorial-highlighted"));

    setOverlayMask(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeen = sessionStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setCurrentStep("swipe");
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    removeAllHighlights();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
  };

  const steps = useMemo<TutorialStep[]>(() => ["swipe", "menu", "info"], []);

  const handleNext = () => {
    const index = steps.indexOf(currentStep);
    if (index === steps.length - 1) {
      handleClose();
    } else {
      setCurrentStep(steps[index + 1]);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const highlightSelectors = useMemo<
    Partial<Record<TutorialStep, string>>
  >(() => {
    return {
      menu: '[data-tutorial-target="menu-button"]',
      info: '[data-tutorial-target="info-button"]',
    };
  }, []);

  const updateHighlightMask = useCallback(() => {
    if (typeof document === "undefined" || !isOpen) {
      setOverlayMask(null);
      return;
    }

    const selector = highlightSelectors[currentStep];
    if (!selector) {
      setOverlayMask(null);
      return;
    }

    const target = document.querySelector(selector) as HTMLElement | null;
    if (!target) {
      setOverlayMask(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 20;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.max(rect.width, rect.height) / 2 + padding;

    const mask = `radial-gradient(circle at ${centerX}px ${centerY}px, transparent ${Math.max(
      0,
      radius - 16
    )}px, rgba(0, 0, 0, 1) ${radius}px)`;

    setOverlayMask(mask);
  }, [currentStep, highlightSelectors, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      removeAllHighlights();
      return;
    }

    removeAllHighlights();

    const selector = highlightSelectors[currentStep];
    if (selector) {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add("tutorial-highlighted");
      });

      requestAnimationFrame(() => updateHighlightMask());
    }

    return () => {
      removeAllHighlights();
    };
  }, [
    currentStep,
    highlightSelectors,
    isOpen,
    removeAllHighlights,
    updateHighlightMask,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleRecompute = () => {
      updateHighlightMask();
    };

    window.addEventListener("resize", handleRecompute);
    window.addEventListener("scroll", handleRecompute, true);

    return () => {
      window.removeEventListener("resize", handleRecompute);
      window.removeEventListener("scroll", handleRecompute, true);
    };
  }, [isOpen, updateHighlightMask]);

  const renderControls = ({
    primaryLabel,
    secondaryLabel = "Skip tutorial",
    tone = "dark",
    wrapperClassName = "",
  }: {
    primaryLabel: string;
    secondaryLabel?: string;
    tone?: "light" | "dark";
    wrapperClassName?: string;
  }) => (
    <div
      className={`mt-6 flex w-full flex-col items-center gap-3 ${wrapperClassName}`}
    >
      <button
        type="button"
        className="w-full rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        onClick={handleNext}
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        className={`text-sm font-medium underline-offset-4 transition hover:underline ${
          tone === "dark"
            ? "text-white/90 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={handleSkip}
      >
        {secondaryLabel}
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[300]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={
              overlayMask
                ? {
                    WebkitMaskImage: overlayMask,
                    maskImage: overlayMask,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }
                : undefined
            }
          />

          {currentStep === "swipe" && (
            <div
              className="relative flex h-full flex-col items-center justify-center px-6"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className="w-full max-w-sm rounded-3xl bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Step 1 of 3
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    Swipe to explore dishes
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Use quick gestures to fine-tune your recommendations.
                  </p>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-relaxed">
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
                      <MoveRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700">
                        Swipe right to like an image
                      </p>
                      <p className="text-gray-600">
                        We&apos;ll keep track of the dishes you love.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-rose-50/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-200 text-rose-700">
                      <MoveLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-rose-700">
                        Swipe left to dislike an image
                      </p>
                      <p className="text-gray-600">
                        Pass on dishes to keep your feed fresh.
                      </p>
                    </div>
                  </div>
                </div>

                {renderControls({ primaryLabel: "Next", tone: "light" })}
              </motion.div>
            </div>
          )}

          {currentStep === "menu" && (
            <div
              className="relative flex h-full flex-col items-center justify-center px-6"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className="w-full max-w-sm rounded-3xl bg-white/95 p-5 text-gray-900 shadow-2xl backdrop-blur"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Step 2 of 3
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-900">
                    Open the menu in the top-right
                  </h2>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    <Menu className="h-4 w-4" />
                    Menu button
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    View the dishes you&apos;ve liked or upload your own food
                    photos whenever you&apos;re ready.
                  </p>
                </div>

                {renderControls({
                  primaryLabel: "Next",
                  tone: "light",
                })}
              </motion.div>
            </div>
          )}

          {currentStep === "info" && (
            <div
              className="relative flex h-full flex-col items-center justify-center px-6"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className="w-full max-w-sm rounded-3xl bg-white/95 p-5 text-gray-900 shadow-2xl backdrop-blur"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Step 3 of 3
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-900">
                    Tap the info button for details
                  </h2>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    <Info className="h-4 w-4" />
                    Info button
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Learn more about the restaurant behind any dish - location,
                    description, and more - by tapping the info button on the
                    bottom-right corner of each card.
                  </p>
                </div>

                {renderControls({
                  primaryLabel: "Got it",
                  tone: "light",
                })}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
