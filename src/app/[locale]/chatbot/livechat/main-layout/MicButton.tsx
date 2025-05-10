// MicButton.tsx
import cn from "classnames";
import React from "react";
import AudioPulse from "../audio-pulse/AudioPulse";

type MicButtonProps = {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  volume: number;
  connected: boolean;
};
const MicButton: React.FC<MicButtonProps> = ({
  muted,
  setMuted,
  volume,
  connected,
}) => (
  <div className="flex items-center gap-2">
    <button
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full text-xl transition-all duration-200 ease-in select-none relative z-10",
        {
          "bg-red-600 text-black hover:bg-red-400 focus:outline-2 focus:outline-red-500 focus:border-gray-800":
            !muted,
          "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100 focus:outline-2 focus:outline-gray-200 focus:border-transparent":
            muted,
        },
      )}
      onClick={() => setMuted(!muted)}
    >
      <span className="material-symbols-outlined filled">
        {muted ? "mic_off" : "mic"}
      </span>
      {!muted && (
        <div
          className="absolute inset-0 rounded-full bg-red-500 opacity-35 z-0 pointer-events-none transition-all duration-200 ease-in-out"
          style={{
            top: `calc((var(--volume) * -1))`,
            left: `calc((var(--volume) * -1))`,
            width: `calc(100% + var(--volume) * 2)`,
            height: `calc(100% + var(--volume) * 2)`,
          }}
        />
      )}
    </button>
    <div className="w-12 h-12 flex items-center justify-center">
      <AudioPulse volume={volume} active={connected} hover={false} />
    </div>
  </div>
);

export default MicButton;