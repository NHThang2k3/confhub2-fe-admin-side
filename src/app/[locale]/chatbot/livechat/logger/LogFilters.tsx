// LogFilters.tsx
import {
    StreamingLog,
    isClientContentMessage,
    isToolCallMessage,
    isToolCallCancellationMessage,
    isToolResponseMessage,
    isServerContentMessage,
      isClientAudioMessage,
      isServerAudioMessage
  } from "../multimodal-live-types";
  
  export type LoggerFilterType = "conversations" | "tools" | "none";
  
  export const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
    tools: (log: StreamingLog) =>
      isToolCallMessage(log.message) ||
      isToolResponseMessage(log.message) ||
      isToolCallCancellationMessage(log.message),
    conversations: (log: StreamingLog) =>
      isClientContentMessage(log.message) || isServerContentMessage(log.message) || isClientAudioMessage(log.message) || isServerAudioMessage(log.message),
    none: () => true,
  };