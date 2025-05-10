// MessageRenderer.tsx
// import React from "react";
import {
  StreamingLog,
  isClientContentMessage,
  isToolCallMessage,
  isToolCallCancellationMessage,
  isToolResponseMessage,
  isServerContentMessage,
  isInterrupted,
  isTurnComplete,
  isModelTurn,
  isClientAudioMessage,
  isServerAudioMessage,
} from "../multimodal-live-types";
import ClientContentLog from "./ClientContentLog";
import ToolCallLog from "./ToolCallLog";
import ToolCallCancellationLog from "./ToolCallCancellationLog";
import ToolResponseLog from "./ToolResponseLog";
import ModelTurnLog from "./ModelTurnLog";
import PlainTextMessage from "./PlainTextMessage";
import ClientAudioLog from "./ClientAudioLog";
import ServerAudioLog from "./ServerAudioLog";
import AnyMessage from "./AnyMessage";
import { ReactNode } from "react";


const CustomPlainTextLog = ({ msg }: { msg: string }): ReactNode => {
  return <PlainTextMessage message={msg} />;
};


const MessageRenderer = ({ message }: { message: StreamingLog["message"] }) => {
  if (isClientAudioMessage(message)) {
    return <ClientAudioLog message={message} />;
  }

  if (isServerAudioMessage(message)) {
    return <ServerAudioLog message={message} />;
  }


  if (isClientContentMessage(message)) {
    // FIX: Pass message.clientContent, not the whole message
    return <ClientContentLog message={message.clientContent} />;
  }
  if (isToolCallMessage(message)) {
    return <ToolCallLog message={message} />;
  }
  if (isToolCallCancellationMessage(message)) {
    return <ToolCallCancellationLog message={message} />;
  }
  if (isToolResponseMessage(message)) {
    return <ToolResponseLog message={message} />;
  }
  if (isServerContentMessage(message)) {

    const { serverContent } = message;
    if (isInterrupted(serverContent)) {
      return <CustomPlainTextLog msg="interrupted" />;
    }
    if (isTurnComplete(serverContent)) {
      return <CustomPlainTextLog msg="turnComplete" />;
    }
    if (isModelTurn(serverContent)) {
      console.log("isModelTurn", message);

      return <ModelTurnLog message={message} />;
    }
  }
  if (typeof message === "string") {
    console.log("PlainTextMessage", message);
    return <PlainTextMessage message={message} />;
  }
  return <AnyMessage message={message} />;
};

export default MessageRenderer;