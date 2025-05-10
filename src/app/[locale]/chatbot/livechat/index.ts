// src/components/chatbot/livechat/index.ts

// --- Contexts ---
export * from './contexts/LiveAPIContext';

// --- Types & Utils ---
export * from './multimodal-live-types'; // Exports isServerContentMessage, isModelTurn, etc.

// --- Lib (Store, Recorder, etc.) ---
export * from './lib/store-logger';
export * from './lib/audio-recorder'; // Export the class

// --- Main Layout Components ---
export { default as ChatInput } from './main-layout/ChatInput';
export { default as ConnectionButton } from './main-layout/ConnectionButton';
export { default as MicButton } from './main-layout/MicButton';
export { default as ChatIntroduction } from './main-layout/ChatIntroduction';
export { default as ConnectionStatus } from './main-layout/ConnectionStatus';
export { default as RestartStreamButton } from './main-layout/RestartStreamButton';
export { default as Logger } from './logger/Logger';        // Export Logger component

// --- Hooks ---
export { default as useConnection } from './hooks/useConnection';
export { default as useTimer } from './hooks/useTimer';
export { default as useLoggerScroll } from './hooks/useLoggerScroll';
export { default as useLoggerEvents } from './hooks/useLoggerEvents';
export { default as useAudioRecorder } from './hooks/useAudioRecorder';
export { default as useModelAudioResponse } from './hooks/useModelAudioResponse';
export { default as useVolumeControl } from './hooks/useVolumeControl';
export { default as useInteractionHandlers } from './hooks/useInteractionHandlers';

// Note: Types/Utils from higher-level dirs like '../lib/live-chat.types'
// are NOT included here as they are not within the 'livechat' subdirectory.
// They should continue to be imported directly where needed.