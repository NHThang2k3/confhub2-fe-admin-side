// ClientAudioLog.tsx
import React from "react";
import { ClientAudioMessage } from "../multimodal-live-types";
import AudioPlayer from "../audio-player/AudioPlayer";

type ClientAudioLogProps = {
  message: ClientAudioMessage;
};

const ClientAudioLog: React.FC<ClientAudioLogProps> = ({ message }) => {
  const { audioData } = message.clientAudio;
  return (
    <div className="rich-log client-audio">
      {/* No changes needed here, it's well-structured */}
      {audioData ? <AudioPlayer audioData={audioData} sampleRate={16000}/> : <p>Loading audio...</p>}
    </div>
  );
};

export default ClientAudioLog;