// LogEntry.tsx (Minor Adjustments for Clarity)
import React, { ReactNode, memo } from "react";
import cn from "classnames";
import { StreamingLog } from "../multimodal-live-types";

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({
    message,
  }: {
    message: StreamingLog["message"];
  }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): JSX.Element => {
  const isUserMessage = log.type.startsWith("send");

  return (
    <li
      className={cn(
        "max-w-full mb-4",
        isUserMessage ? "float-right clear-both" : "float-left clear-both"
      )}
    >
        {/* <div className="text-xs text-gray-400">
          {formatTime(log.date)} - {log.type}
        </div> */}
        <MessageComponent message={log.message} />
    </li>
  );
};

export default memo(LogEntry);
