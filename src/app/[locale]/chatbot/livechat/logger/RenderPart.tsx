// RenderPart.tsx
// import React from "react";
import { Part } from "@google/generative-ai";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

type RenderPartProps = {
  part: Part;
};

function tryParseCodeExecutionResult(output: string) {
  try {
    const json = JSON.parse(output);
    return JSON.stringify(json, null, "  ");
  } catch (e) {
    return output;
  }
}

const RenderPart: React.FC<RenderPartProps> = ({ part }) =>
  part.text && part.text.length ? (
    <p className="part part-text">{part.text}</p>
  ) : part.executableCode ? (
    <div className="part part-executableCode">
      <h5>executableCode: {part.executableCode.language}</h5>
      <SyntaxHighlighter
        language={part.executableCode.language.toLowerCase()}
        style={dark}
      >
        {part.executableCode.code}
      </SyntaxHighlighter>
    </div>
  ) : part.codeExecutionResult ? (
    <div className="part part-codeExecutionResult">
      <h5>codeExecutionResult: {part.codeExecutionResult.outcome}</h5>
      <SyntaxHighlighter language="json" style={dark}>
        {tryParseCodeExecutionResult(part.codeExecutionResult.output)}
      </SyntaxHighlighter>
    </div>
  ) : (
    <div className="part part-inlinedata">
      <h5>Inline Data: {part.inlineData?.mimeType}</h5>
    </div>
  );

export default RenderPart;