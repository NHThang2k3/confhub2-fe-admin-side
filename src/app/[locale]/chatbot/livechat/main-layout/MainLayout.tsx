// src/components/MainLayout.tsx (Adjusted)
'use client'
import { useRef, useState, useEffect } from 'react'
import { useLiveAPIContext } from '../contexts/LiveAPIContext'
import { useLoggerStore } from '../lib/store-logger'
import Logger from '../logger/Logger'
import { AudioRecorder } from '../lib/audio-recorder'
import ChatInput from './ChatInput'
import SidePanel from './SidePanel' // Import the SidePanel
import useLoggerScroll from '../hooks/useLoggerScroll'
import useLoggerEvents from '../hooks/useLoggerEvents'
import useAudioRecorder from '../hooks/useAudioRecorder'
import useModelAudioResponse from '../hooks/useModelAudioResponse'
import useVolumeControl from '../hooks/useVolumeControl'
import ConnectionButton from './ConnectionButton'
import MicButton from './MicButton'
import ChatIntroduction from './ChatIntroduction'
import useInteractionHandlers from '../hooks/useInteractionHandlers'
import { AlignJustify } from 'lucide-react'

import {
  OutputModality,
  PrebuiltVoice,
  Language
} from '../multimodal-live-types' // Or from src/types.ts

// --- Define the mapping from language code to flag code ---
// (Could be imported from a shared constants file)
const languageFlagMapping: Record<Language, string> = {
  en: 'gb',
  // de: 'de',
  // fr: 'fr',
  vi: 'vn',
  // es: 'es',
  // ru: 'ru',
  zh: 'cn'
  // ja: 'jp',
  // ko: 'kr',
  // ar: 'sa',
  // fa: 'ir',
  // Add any other languages your app supports here
  // Make sure the Language type includes all these keys
}

// --- Interface for Language with FlagCode (as expected by SidePanel) ---
interface LanguageOption {
  code: Language
  name: string
  flagCode: string
}

// --- Props Interface for MainLayout (reflects what it RECEIVES) ---
interface MainLayoutProps {
  currentModality: OutputModality
  onModalityChange: (modality: OutputModality) => void
  currentVoice: PrebuiltVoice
  onVoiceChange: (voice: PrebuiltVoice) => void
  availableVoices: PrebuiltVoice[]
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
  // This is what MainLayout RECEIVES
  availableLanguages: { code: Language; name: string }[]
  connected: boolean
  isConnecting: boolean
  streamStartTime: number | null
  connectionStatusMessage: string | null
  connectWithPermissions: () => Promise<void>
  handleDisconnect: () => void
}

// --- Main Component ---
export default function MainLayout({
  currentModality,
  onModalityChange,
  currentVoice,
  onVoiceChange,
  availableVoices,
  currentLanguage,
  onLanguageChange,
  availableLanguages,
  connected,
  isConnecting,
  streamStartTime,
  connectWithPermissions,
  handleDisconnect
}: MainLayoutProps) {
  const { client, volume, on, off } = useLiveAPIContext()
  const loggerRef = useRef<HTMLDivElement>(null)
  const { log, clearLogs } = useLoggerStore()
  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isOutputSettingsOpen, setIsOutputSettingsOpen] = useState(true) // Panel state

  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log
  })

  // --- Effects (same as before) ---
  useEffect(() => {
    if (connected) {
      clearLogs()
    }
  }, [connected, clearLogs])
  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true)
    }
  }, [connected, isConnecting, streamStartTime])

  // --- Hooks (same as before) ---
  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log)
  useVolumeControl(inVolume)

  // --- Handlers (same as before, used by SidePanel props) ---
  const handleModalitySettingChange = (newValue: OutputModality) => {
    if (!connected) {
      onModalityChange(newValue)
    }
  }
  const handleVoiceSettingChange = (newValue: PrebuiltVoice) => {
    if (!connected) {
      onVoiceChange(newValue)
    }
  }
  const handleLanguageSettingChange = (newValue: Language) => {
    if (!connected) {
      onLanguageChange(newValue)
    }
  }

  // --- START: Transform availableLanguages to include flagCode ---
  const languagesWithOptions: LanguageOption[] = availableLanguages.map(
    lang => ({
      ...lang, // Spread existing code and name
      flagCode: languageFlagMapping[lang.code] || 'xx' // Get flagCode from mapping, provide a fallback like 'xx' (unknown) if needed
    })
  )
  // --- END: Transformation ---

  return (
    <div className='relative flex h-screen flex-row bg-gray-100'>
      {' '}
      {/* Added relative positioning context */}
      {/* --- Open Settings Button (Visible only when panel is closed) --- */}
      {!isOutputSettingsOpen && (
        <button
          onClick={() => setIsOutputSettingsOpen(true)}
          className='bg-white-pure hover:bg-gray-5 fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 '
          title='Open settings'
          aria-label='Open settings'
          aria-expanded={isOutputSettingsOpen} // Technically false here, but reflects the state it controls
          aria-controls='sidepanel-content' // Optional: Reference content if needed
        >
          <AlignJustify
            stroke='currentColor'
            className='h-4 w-4'
            strokeLinecap='round'
            strokeLinejoin='round'
            size={20}
            strokeWidth={1.5}
          />
          <span className='sr-only'>Open settings</span>
        </button>
      )}
      {/* --- Side Panel Component --- */}
      <SidePanel
        isOpen={isOutputSettingsOpen}
        onClose={() => setIsOutputSettingsOpen(false)}
        currentModality={currentModality}
        onModalityChange={handleModalitySettingChange}
        currentVoice={currentVoice}
        onVoiceChange={handleVoiceSettingChange}
        availableVoices={availableVoices}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageSettingChange}
        // Pass the TRANSFORMED array with flag codes
        availableLanguages={languagesWithOptions}
        isConnected={connected}
      />
      {/* --- Right Panel (Main Chat Area) --- */}
      {/* Add transition and conditional margin/padding to avoid overlap */}
      <div
        className={`flex flex-grow flex-col space-y-4 bg-white p-4 text-gray-700 shadow-inner transition-all duration-300 ease-in-out ${
          isOutputSettingsOpen ? 'ml-72' : 'ml-0' // Adjust margin based on panel state
        }`}
      >
        <div className='flex-grow overflow-y-auto' ref={loggerRef}>
          {!connected && !hasInteracted ? (
            <ChatIntroduction
              onStartVoice={() => {
                handleStartVoice()
                setHasInteracted(true)
              }}
            />
          ) : (
            <Logger filter='none' />
          )}
        </div>
        {/* Chat Input Area (same as before) */}
        <div className='flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5'>
          <ConnectionButton
            connected={connected}
            connect={connectWithPermissions}
            disconnect={handleDisconnect}
          />
          <MicButton
            muted={muted}
            setMuted={setMuted}
            volume={volume}
            connected={connected}
          />
          <div className='flex-grow'>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!connected}
            />
          </div>
        </div>
      </div>
      {/* --- End Right Panel --- */}
    </div> // End Main Flex Row Container
  )
}
