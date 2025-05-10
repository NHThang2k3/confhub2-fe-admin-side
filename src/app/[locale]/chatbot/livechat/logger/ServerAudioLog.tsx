// ServerAudioLog.tsx

// import React from "react";
import { ServerAudioMessage } from "../multimodal-live-types"; // Correct import
import AudioPlayer from "../audio-player/AudioPlayer";

type ServerAudioLogProps = {
  message: ServerAudioMessage;
};

const ServerAudioLog: React.FC<ServerAudioLogProps> = ({ message }) => {
  const { audioData } = message.serverAudio;
  return (
    <div className="rich-log server-audio">
      {audioData ? (
        <AudioPlayer
          key={audioData}
          audioData={audioData}
          sampleRate={24000}
          autoPlay
        />
      ) : (
        <p>Loading audio...</p>
      )}
    </div>
  );
};

export default ServerAudioLog;