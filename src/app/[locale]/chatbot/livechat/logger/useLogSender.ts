// useLogSender.ts
import { useCallback } from "react";
import { debounce } from "lodash";
import { StreamingLog } from "../multimodal-live-types";
import { appConfig } from "@/src/middleware";

async function sendLogToBackend(log: StreamingLog) {
  try {
    const standardizedLog = {
      date: log.date.toISOString(),
      type: log.type,
      message: log.message,
      count: log.count || null,
    };

    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(standardizedLog, null, 2),
    });

    if (!response.ok) {
      console.error('Lỗi khi gửi log đến backend:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Lỗi khi gửi log đến backend:', error);
  }
}

const useLogSender = () => {
    const debouncedSendLogs = useCallback(
      debounce((logsToSend: StreamingLog[]) => {
        logsToSend.forEach(log => sendLogToBackend(log));
      }, 500), // Adjust the delay as needed
      []
    );
  
    // Use useCallback to ensure the function identity is stable
    const sendLogs = useCallback((logs: StreamingLog[]) => {
      debouncedSendLogs(logs);
  
      return () => {
        debouncedSendLogs.cancel();
      };
    }, [debouncedSendLogs]);
  
    return sendLogs;
  };

export default useLogSender;