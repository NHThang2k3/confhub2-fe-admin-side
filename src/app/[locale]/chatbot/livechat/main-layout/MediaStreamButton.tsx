// MediaStreamButton.tsx
import { memo } from "react";

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
};

const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop }: MediaStreamButtonProps) => (
    <button
      className="flex items-center justify-center w-12 h-12 rounded-full border border-transparent text-xl text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-gray-100 transition-all duration-200 ease-in-out focus:outline-2 focus:outline-gray-200 focus:outline-offset-2 select-none"
      onClick={isStreaming ? stop : start}
    >
      <span className="material-symbols-outlined">
        {isStreaming ? onIcon : offIcon}
      </span>
    </button>
  ),
);
export default MediaStreamButton;