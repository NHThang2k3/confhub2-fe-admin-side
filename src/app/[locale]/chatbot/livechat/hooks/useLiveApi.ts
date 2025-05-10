// useLiveApi.ts (Corrected for Accumulation)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from "../lib/multimodal-live-client";
import { LiveConfig, ServerAudioMessage, ServerContentMessage, ServerContent, ModelTurn } from "../multimodal-live-types"; // Import ModelTurn
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import EventEmitter from "eventemitter3";
import { debounce } from 'lodash';
import { Part } from "@google/generative-ai";

export type EventType =
  | "close"
  | "open"
  | "config"
  | "log"
  | "interrupted"
  | "audio"
  | "audioResponse"
  | "toolcall"
  | "text"
  | "serverError"
  | "generate"
  | "reset";


export type UseLiveAPIResults = {
  client: MultimodalLiveClient;
  setConfig: (config: LiveConfig) => void;
  config: LiveConfig;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  on: (event: EventType, callback: (...args: any[]) => void) => void;
  off: (event: EventType, callback: (...args: any[]) => void) => void;
};

export function useLiveAPI({
  url,
  apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }),
    [url, apiKey],
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null); // Keep

  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-live-001",
  });
  const [volume, setVolume] = useState(0);
  const [accumulatedServerAudio, setAccumulatedServerAudio] = useState("");
  const accumulatedServerAudioRef = useRef("");

    // *** NEW: Ref to accumulate text parts ***
  const accumulatedTextPartsRef = useRef<Part[]>([]);

  const emitter = useRef(new EventEmitter()).current;



  const debouncedEmitServerAudioLog = useCallback(
    debounce((audioData: string) => {
      const serverAudioMessage: ServerAudioMessage = {
        serverAudio: { audioData },
      };
      emitter.emit("log", {
        date: new Date(),
        type: "receive.serverAudio",
        message: serverAudioMessage,
      });
    }, 500),
    [emitter]
  );


  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onClose = () => {
      setConnected(false);
      emitter.emit("close");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = "";
      debouncedEmitServerAudioLog.cancel();
        accumulatedTextPartsRef.current = []; // Clear accumulated parts

    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop();

    const onAudio = (data: ArrayBuffer) => {
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));
      const audioDataBase64 = btoa(String.fromCharCode(...new Uint8Array(data)));
      accumulatedServerAudioRef.current += audioDataBase64;
      setAccumulatedServerAudio((prev) => prev + audioDataBase64);
    };


    const onGenerate = (data: any) => {
      accumulatedServerAudioRef.current = "";
      setAccumulatedServerAudio("");
        accumulatedTextPartsRef.current = []; // Clear accumulated parts

      if (data.responseModalities && data.responseModalities.includes("audio")) {
        if (
          data.multimodalResponse &&
          data.multimodalResponse.parts &&
          data.multimodalResponse.parts.length
        ) {
          data.multimodalResponse.parts.forEach((part: Part) => {
            if (part.inlineData) {
              emitter.emit("audioResponse", {
                data: part.inlineData.data,
              });
            }
          });
        }
      }
      emitter.emit("generate", data);
    };

    const onInterrupted = () => {
      stopAudioStreamer();
      emitter.emit("interrupted");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = "";
      debouncedEmitServerAudioLog.cancel();
        accumulatedTextPartsRef.current = []; // Clear accumulated parts
    };


    const onTurnComplete = () => {
      const audioData = accumulatedServerAudioRef.current;
      if (audioData) {
        const serverAudioMessage: ServerAudioMessage = {
          serverAudio: { audioData },
        };
        emitter.emit("log", {
          date: new Date(),
          type: "receive.serverAudio",
          message: serverAudioMessage,
        });
      }

      accumulatedServerAudioRef.current = "";
      setAccumulatedServerAudio("");
      emitter.emit("turncomplete");

        // *** NEW: Log accumulated text parts ***
      if (accumulatedTextPartsRef.current.length > 0) {
        const completeModelTurn: ModelTurn = {
          modelTurn: { parts: accumulatedTextPartsRef.current },
        };
        const serverContentMessage: ServerContentMessage = {
          serverContent: completeModelTurn,
        };
        emitter.emit("log", {
          date: new Date(),
          type: "receive.content",
          message: serverContentMessage,
        });
      }
      accumulatedTextPartsRef.current = []; // Clear for the next turn
    };

    const onContent = (data: ServerContent) => {
        // *** MODIFIED: Accumulate parts instead of logging immediately ***
      if (data && 'modelTurn' in data && data.modelTurn.parts) {
        accumulatedTextPartsRef.current = accumulatedTextPartsRef.current.concat(data.modelTurn.parts);
      }
    };


    client.on("close", onClose);
    client.on("interrupted", onInterrupted);
    client.on("audio", onAudio);
    client.on("log", (logData) => {
      emitter.emit("log", logData);
    });
    client.on("toolcall", (toolCallData) => {
      emitter.emit("toolcall", toolCallData);
    });
    client.on("setupcomplete", () => {
      emitter.emit("setupcomplete");
    });
    client.on("turncomplete", onTurnComplete);
    client.on("open", () => emitter.emit("open"));
    client.on("content", onContent);


    emitter.on("generate", onGenerate);

    return () => {
      client.off("close", onClose);
      client.off("interrupted", onInterrupted);
      client.off("audio", onAudio);
      client.off("log", (logData) => {
        emitter.emit("log", logData);
      });
      client.off("toolcall", (toolCallData) => {
        emitter.emit("toolcall", toolCallData);
      });
      client.off("setupcomplete", () => {
        emitter.emit("setupcomplete");
      });
      client.off("turncomplete", onTurnComplete);
      client.off("open", () => emitter.emit("open"));
      client.off("content", onContent);

      emitter.off("generate", onGenerate);
      debouncedEmitServerAudioLog.cancel();
        accumulatedTextPartsRef.current = []; // Clear accumulated parts

    };
  }, [client, audioStreamerRef, emitter, debouncedEmitServerAudioLog]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error("config has not been set");
    }
    client.disconnect();
    await client.connect(config);
    setConnected(true);
  }, [client, setConnected, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
    on: (event: EventType, callback: (...args: any[]) => void) => {
      emitter.on(event, callback);
    },
    off: (event: EventType, callback: (...args: any[]) => void) => {
      emitter.off(event, callback);
    },
  };
}