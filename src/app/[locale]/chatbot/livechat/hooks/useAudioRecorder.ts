// hooks/useAudioRecorder.ts
import { useEffect } from "react";
import { AudioRecorder } from "../lib/audio-recorder";

// Helper function (moved here for better organization)
function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  if (arrays.length === 1) {
    return arrays[0];
  }
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}


const useAudioRecorder = (
  connected: boolean,
  muted: boolean,
  audioRecorder: AudioRecorder,
  client: any,
  log: (entry: any) => void,
  setInVolume: (volume: number) => void,
) => {
  useEffect(() => {
    if (connected && !muted && audioRecorder) {
      let audioChunks: Uint8Array[] = []; // Store binary chunks

      const onData = (base64: string) => {
        try {
          // Decode the base64 string to a Uint8Array
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioChunks.push(bytes);
        } catch (error) {
          console.error("Error decoding base64 chunk in onData", error);
        }

        client.sendRealtimeInput([
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64,
          },
        ]);
      };

      const onStop = () => {
        try {
          // Concatenate the binary chunks
          const combinedBinary = concatenateUint8Arrays(audioChunks);

          // Re-encode the combined binary data to base64
          let binary = "";
          const len = combinedBinary.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(combinedBinary[i]);
          }
          const combinedBase64 = window.btoa(binary);

          // Log the correctly padded base64 data
          if (combinedBase64.length > 0) {
            log({
              date: new Date(),
              type: "send.clientAudio",
              message: { clientAudio: { audioData: combinedBase64 } },
            });
          }
        } catch (error) {
          console.error("Error encoding base64 in onStop", error);
        }
        audioChunks = []; // Reset for the next recording
      };

      audioRecorder.on("data", onData).on("volume", setInVolume);
      audioRecorder.on("stop", onStop);
      audioRecorder.start().catch(console.error);

      return () => {
        audioRecorder.stop();
        audioRecorder.off("data", onData).off("volume", setInVolume);
        audioRecorder.off("stop", onStop);
      };
    }
  }, [connected, client, muted, audioRecorder, log, setInVolume]);
};
export default useAudioRecorder;