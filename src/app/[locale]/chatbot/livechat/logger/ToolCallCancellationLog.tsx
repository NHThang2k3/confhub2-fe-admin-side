// ToolCallCancellationLog.tsx
// import React from "react";
import { ToolCallCancellationMessage } from "../multimodal-live-types";
import cn from "classnames";

type ToolCallCancellationLogProps = {
  message: ToolCallCancellationMessage;
};

const ToolCallCancellationLog: React.FC<ToolCallCancellationLogProps> = ({ message }):  JSX.Element => (
    <div className={cn("rich-log tool-call-cancellation")}>
      <span>
        {" "}
        ids:{" "}
        {message.toolCallCancellation.ids.map(
          (id) => (
            <span className="inline-code" key={`cancel-${id}`}>
              "{id}"
            </span>
          ),
        )}
      </span>
    </div>
  );

export default ToolCallCancellationLog;