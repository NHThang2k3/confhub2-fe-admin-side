// ToolCallLog.tsx
import React from "react";
import { ToolCallMessage } from "../multimodal-live-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cn from "classnames";

type ToolCallLogProps = {
  message: ToolCallMessage;
};

const ToolCallLog: React.FC<ToolCallLogProps> = ({ message }) => {
  const { toolCall } = message;
  return (
    <div className={cn("rich-log tool-call")}>
      {toolCall.functionCalls.map((fc, i) => (
        <div key={fc.id} className="part part-functioncall">
          <h5>Function call: {fc.name}</h5>
          <SyntaxHighlighter language="json" style={dark}>
            {JSON.stringify(fc, null, "  ")}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
};
export default ToolCallLog