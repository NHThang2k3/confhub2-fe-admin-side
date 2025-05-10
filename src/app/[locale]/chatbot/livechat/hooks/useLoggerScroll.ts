// hooks/useLoggerScroll.ts
import { useEffect, useRef } from "react";

const useLoggerScroll = (loggerRef: React.RefObject<HTMLDivElement>) => {
  const loggerLastHeightRef = useRef<number>(-1);
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [loggerRef, loggerLastHeightRef]);
};

export default useLoggerScroll;