// ToolResponseLog.tsx
import React from "react";
import { ToolResponseMessage } from "../multimodal-live-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cn from "classnames";

type ToolResponseLogProps = {
  message: ToolResponseMessage;
};
const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }): JSX.Element  => (
    <div className={cn("rich-log tool-response")}>
      {message.toolResponse.functionResponses.map(
        (fc) => (
          <div key={`tool-response-${fc.id}`} className="part">
            <h5>Function Response: {fc.id}</h5>
            <SyntaxHighlighter language="json" style={dark}>
              {JSON.stringify(fc.response, null, "  ")}
            </SyntaxHighlighter>
          </div>
        ),
      )}
    </div>
  );

export default ToolResponseLog;