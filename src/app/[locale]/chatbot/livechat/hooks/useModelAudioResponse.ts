// hooks/useModelAudioResponse.ts
import { useEffect } from "react";

const useModelAudioResponse = <E extends string>(
  on: (event: E, callback: (...args: any[]) => void) => void,
  off: (event: E, callback: (...args: any[]) => void) => void,
  log: (entry: any) => void,
) => {
  useEffect(() => {
    const onAudioResponse = (audioResponse: any) => {
      log({
        date: new Date(),
        type: "receive.serverAudio",
        message: { serverAudio: { audioData: audioResponse.data } },
      });
    };

    on("audioResponse" as E, onAudioResponse);
    return () => {
      off("audioResponse" as E, onAudioResponse);
    };
  }, [on, off, log]);
};
export default useModelAudioResponse;