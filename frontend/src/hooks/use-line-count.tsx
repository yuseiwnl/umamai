import { useLayoutEffect, useRef, useState } from "react";

export function useLineCount(text: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<number>(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // get computed line height
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);

    if (lineHeight && el.scrollHeight) {
      setLines(Math.round(el.scrollHeight / lineHeight));
    }
  }, [text]);

  return { ref, lines };
}
