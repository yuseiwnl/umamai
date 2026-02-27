import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { useLineCount } from "@/hooks/use-line-count";

export function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const { ref: lineRef, lines } = useLineCount(text ?? "");

  // measure full content height
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // compute collapsed height = 3 × computed line-height
  const [collapsedHeight, setCollapsedHeight] = useState(0);

  // Measure on mount/text change and when content resizes
  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    const pEl = lineRef.current;
    if (!contentEl || !pEl) return;

    const computeHeights = () => {
      // full height
      setContentHeight(contentEl.scrollHeight || 0);

      // collapsed (3 lines) height derived from computed line-height
      const style = window.getComputedStyle(pEl);
      const lh = parseFloat(style.lineHeight);
      if (Number.isFinite(lh)) {
        setCollapsedHeight(Math.round(lh * 3));
      }
    };

    computeHeights();

    const ro = new ResizeObserver(() => computeHeights());
    ro.observe(contentEl);
    ro.observe(pEl);

    return () => ro.disconnect();
  }, [text, lineRef]);

  const shouldCollapse = lines > 3;
  const targetHeight =
    expanded || !shouldCollapse ? contentHeight : collapsedHeight || 0;

  return (
    <div className="mt-1 text-base text-gray-200">
      <motion.div
        // Single element: no AnimatePresence, no key => no duplicate
        initial={false}
        animate={{ height: targetHeight, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="overflow-hidden"
        style={{
          // Avoid flash before measurement
          visibility:
            contentHeight === 0 && shouldCollapse ? "hidden" : "visible",
        }}
      >
        <div ref={contentRef}>
          <p ref={lineRef} className="whitespace-pre-line">
            {text}
          </p>
        </div>
      </motion.div>

      {shouldCollapse && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-1 text-sm text-gray-300 underline hover:text-white"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
