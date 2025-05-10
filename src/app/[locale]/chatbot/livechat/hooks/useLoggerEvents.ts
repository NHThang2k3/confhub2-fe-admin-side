// hooks/useLoggerEvents.ts
import { useEffect } from "react";

const useLoggerEvents = <E extends string>(
  on: (event: E, callback: (...args: any[]) => void) => void,
  off: (event: E, callback: (...args: any[]) => void) => void,
  log: (entry: any) => void,
) => {
  useEffect(() => {
    on("log" as E, log);
    return () => {
      off("log" as E, log);
    };
  }, [on, off, log]);
};

export default useLoggerEvents;