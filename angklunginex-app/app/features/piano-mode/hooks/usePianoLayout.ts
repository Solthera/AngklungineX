import { useState, useEffect, useRef, useCallback } from "react";
import { KEY_PAD, MIN_KEY_WIDTH } from "../utils/piano-helpers";

export function usePianoLayout(totalWhiteKeys: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [keyWidth, setKeyWidth] = useState<number>(MIN_KEY_WIDTH);

  const calculateLayout = useCallback(() => {
    if (!wrapperRef.current) return;

    const available = wrapperRef.current.clientWidth - KEY_PAD * 2;
    const calculatedWidth = totalWhiteKeys > 0 ? available / totalWhiteKeys : MIN_KEY_WIDTH;
    const nextWidth = Math.max(calculatedWidth, MIN_KEY_WIDTH);

    setKeyWidth(nextWidth);
  }, [totalWhiteKeys]);

  useEffect(() => {
    calculateLayout();

    const handleResize = () => {
      calculateLayout();
    };

    window.addEventListener("resize", handleResize);

    // Also use ResizeObserver for precision if wrapper size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateLayout();
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [calculateLayout]);

  const getBlackKeyLeft = useCallback(
    (whiteIndex: number) => {
      const blackWidth = keyWidth * 0.63;
      return whiteIndex * keyWidth - blackWidth / 2 + KEY_PAD;
    },
    [keyWidth],
  );

  return {
    wrapperRef,
    keyWidth,
    getBlackKeyLeft,
  };
}
