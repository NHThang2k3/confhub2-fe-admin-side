// AudioPlayer.tsx (FINAL REVISED with Styling)
import { useState, useRef, useEffect } from 'react';
import AudioPulse from '../audio-pulse/AudioPulse';
import { debounce } from 'lodash';

interface AudioPlayerProps {
  audioData: string;
  autoPlay?: boolean;
  sampleRate: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, autoPlay = false, sampleRate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const volumeRef = useRef(1);

  // --- Audio Context Setup, Decode, Playback, Seek, Mute - No changes needed here ---
  useEffect(() => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volumeRef.current;
    } catch (error) {
      console.error("Failed to create AudioContext:", error);
      setError("Failed to initialize audio.");
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, [sampleRate]);

  useEffect(() => {
    if (!audioData || !audioContextRef.current) return;

    const decodeAndSetBuffer = async () => {
      try {
        const audioBuffer = await base64ToAudioBuffer(audioData, audioContextRef.current!);
        if (!audioBuffer) {
          setError("Failed to decode audio data.");
          return;
        }

        audioBufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);
        setCurrentTime(0);
        setError(null);

        if (autoPlay) {
          playFrom(0);
        }
      } catch (error) {
        console.error("Error decoding audio data:", error);
        setError("Error decoding audio data.");
      }
    };
    decodeAndSetBuffer();

    return () => {
      stopAndDisconnect();
    };
  }, [audioData, autoPlay, sampleRate]);

  const stopAndDisconnect = () => {
    if (bufferSourceRef.current) {
      try {
        bufferSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      bufferSourceRef.current.disconnect();
      bufferSourceRef.current = null;
    }
  };

  const playFrom = (startTime: number) => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return;

    stopAndDisconnect();
    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBufferRef.current;
    newSource.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);
    bufferSourceRef.current = newSource;

    newSource.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopAndDisconnect();
    };

    try {
      newSource.start(0, startTime);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to start playback:", error);
      setIsPlaying(false);
      setError("Failed to start playback.");
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAndDisconnect();
      setIsPlaying(false);
    } else {
      playFrom(currentTime);
    }
  };

  const debouncedSeek = debounce((time: number) => {
    setCurrentTime(time);
    if (isPlaying) {
      playFrom(time);
    }
  }, 250);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    debouncedSeek(time);
  };

  const toggleMute = () => {
    if (gainNodeRef.current) {
      if (gainNodeRef.current.gain.value > 0) {
        gainNodeRef.current.gain.value = 0;
        volumeRef.current = 0;
      } else {
        gainNodeRef.current.gain.value = 1;
        volumeRef.current = 1;
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const base64ToAudioBuffer = async (base64: string, context: AudioContext): Promise<AudioBuffer | null> => {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16View = new Int16Array(bytes.buffer);
      const audioBuffer = context.createBuffer(1, int16View.length, context.sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < int16View.length; i++) {
        channelData[i] = int16View[i] / 32768.0;
      }
      return audioBuffer;
    } catch (e) {
      console.error("Decode audio error", e);
      return null;
    }
  };
  // --- Rendering (with updated styling) ---
  return (
    <div
      className="flex items-center rounded-full bg-gray-100 dark:bg-gray-700 m-4 p-2 pl-2 pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          bg-gray-300 dark:bg-gray-600
          text-gray-700 dark:text-gray-300
          hover:bg-gray-400 dark:hover:bg-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        {isPlaying ? (
          <span className="material-symbols-outlined">pause</span>
        ) : (
          <span className="material-symbols-outlined">play_arrow</span>
        )}
      </button>

      <span className="mx-2 text-xs text-gray-600 dark:text-gray-400">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <div className="relative flex-grow">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={seek}
          className="
            absolute top-0 left-2 z-10
            w-full h-full
            opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full">
          <AudioPulse active={isPlaying} volume={isPlaying ? volumeRef.current : 0} hover={isHovered} />
        </div>
      </div>

      <button
        onClick={toggleMute}
        aria-label={volumeRef.current > 0 ? "Mute" : "Unmute"}
        className="
          flex items-center justify-center
          w-7 h-7 rounded-full ml-8
          bg-transparent text-gray-600 dark:text-gray-400
          hover:bg-gray-200 dark:hover:bg-gray-600
          focus:outline-none
          transition-colors"
      >
        <span className="material-symbols-outlined">
          {volumeRef.current > 0 ? "volume_up" : "volume_off"}
        </span>
      </button>

      {/* Optional "More" Button -  Implement functionality as needed */}
      <button
        className="
            flex items-center justify-center
            w-7 h-7 rounded-full ml-1
            bg-transparent text-gray-600 dark:text-gray-400
            hover:bg-gray-200 dark:hover:bg-gray-600
            focus:outline-none
            transition-colors"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default AudioPlayer;