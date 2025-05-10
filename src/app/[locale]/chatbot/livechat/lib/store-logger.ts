
import { create } from "zustand";
import { StreamingLog } from "../multimodal-live-types";

interface StoreLoggerState {
  maxLogs: number;
  logs: StreamingLog[];
  log: (streamingLog: StreamingLog) => void;
  clearLogs: () => void;
  setMaxLogs: (n: number) => void;
}

export const useLoggerStore = create<StoreLoggerState>((set, get) => ({
  maxLogs: 500,
  logs: [],
  log: ({ date, type, message }: StreamingLog) => {
    set((state) => {
      // Luôn tạo log mới cho audio
      if (type.includes("audio")) {
        return {
          logs: [
            ...state.logs.slice(-(get().maxLogs - 1)),
            { date, type, message, count: 1 } as StreamingLog,
          ],
        };
      }

      const prevLog = state.logs.at(-1);
      if (
        prevLog &&
        prevLog.type === type &&
        JSON.stringify(prevLog.message) === JSON.stringify(message)
      ) {
        return {
          logs: [
            ...state.logs.slice(0, -1),
            {
              date,
              type,
              message,
              count: prevLog.count ? prevLog.count + 1 : 2,
            } as StreamingLog,
          ],
        };
      }
      return {
        logs: [
          ...state.logs.slice(-(get().maxLogs - 1)),
          {
            date,
            type,
            message,
            count: 1,
          } as StreamingLog,
        ],
      };
    });
  },

  clearLogs: () => {
    console.log("clear log");
    set({ logs: [] });
  },
  setMaxLogs: (n: number) => set({ maxLogs: n }),
}));

