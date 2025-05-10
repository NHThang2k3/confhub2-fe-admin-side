// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import {
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted
} from './multimodal-live-types'
import { useLoggerStore } from './lib/store-logger'
import Logger from './logger/Logger'
import ChatInput from './main-layout/ChatInput'
import ConnectionButton from './main-layout/ConnectionButton'
import MicButton from './main-layout/MicButton'
import ChatIntroduction from './main-layout/ChatIntroduction'
import ConnectionStatus from './main-layout/ConnectionStatus'
import RestartStreamButton from './main-layout/RestartStreamButton'
import { LiveChatAPIConfig } from './LiveChatAPIConfig'

// Hooks
import useConnection from './hooks/useConnection'
import useTimer from './hooks/useTimer'
import useLoggerScroll from './hooks/useLoggerScroll'
import useLoggerEvents from './hooks/useLoggerEvents'
import useAudioRecorder from './hooks/useAudioRecorder'
import useModelAudioResponse from './hooks/useModelAudioResponse'
import useVolumeControl from './hooks/useVolumeControl'
import useInteractionHandlers from './hooks/useInteractionHandlers'

// Types and Constants
import { getSystemInstructions } from '../lib/instructions'
import { AudioRecorder } from './lib/audio-recorder'
import { useTranslations } from 'next-intl'

// --- THAY ĐỔI QUAN TRỌNG ---
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext' // Context này cho modality, voice
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks';

export default function LiveChatExperience() {
  const {
    currentModality,
    currentVoice,
    // --- LẤY SETTER TỪ LIVE CHAT SETTINGS CONTEXT ---
    setLiveChatConnected,
  } = useLiveChatSettings()

  const { currentLanguage: currentLanguageOptionFromStore } = useChatSettingsState();
  const currentLanguageCode = currentLanguageOptionFromStore.code;

  const t = useTranslations()

  const {
    connected, // Đây là trạng thái kết nối chính từ useConnection
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect,
    error: connectionError
  } = useConnection()

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  )

  const { client, volume, on, off } = useLiveAPIContext()
  const { log, clearLogs, logs } = useLoggerStore()

  const loggerRef = useRef<HTMLDivElement>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const lastSentLogIndexRef = useRef<number | null>(null)
  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    startLoading: (sentLogIndex: number) => {
      setIsSendingMessage(true)
      lastSentLogIndexRef.current = sentLogIndex
    },
    stopLoading: () => {
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null
    }
  })

  // --- EFFECT ĐỂ CẬP NHẬT TRẠNG THÁI KẾT NỐI TRONG CONTEXT ---
  useEffect(() => {
    setLiveChatConnected(connected); // Cập nhật context khi 'connected' thay đổi
  }, [connected, setLiveChatConnected]);

  useEffect(() => {
    if (connected) {
      clearLogs()
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null
    }
  }, [connected, clearLogs])

  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true)
    }
  }, [connected, isConnecting, streamStartTime])

  useEffect(() => {
    if (!isSendingMessage || lastSentLogIndexRef.current === null) {
      return
    }
    const startIndexToCheck = lastSentLogIndexRef.current + 1
    for (let i = startIndexToCheck; i < logs.length; i++) {
      const currentLog = logs[i]
      if (!currentLog?.message) {
        continue
      }
      if (isServerContentMessage(currentLog.message)) {
        const { serverContent } = currentLog.message
        if (
          isModelTurn(serverContent) ||
          isTurnComplete(serverContent) ||
          isInterrupted(serverContent)
        ) {
          setIsSendingMessage(false)
          lastSentLogIndexRef.current = null
          return
        }
      }
    }
  }, [logs, isSendingMessage])

  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log)
  useVolumeControl(inVolume)

  const systemInstructions = getSystemInstructions(currentLanguageCode)

  let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' =
    'info'
  if (isConnecting) connectionStatusType = 'connecting'
  else if (connected) connectionStatusType = 'connected'
  else if (connectionStatusMessage || connectionError)
    connectionStatusType = streamStartTime !== null ? 'error' : 'info'

  const effectiveStatusMessage =
    connectionStatusMessage || connectionError?.message || null
  const shouldShowExternalStatus =
    showTimer ||
    (effectiveStatusMessage && connectionStatusType !== 'connected')
  const shouldShowRestartButton = connectionStatusType === 'error'

  return (
    <div className='bg-white-pure relative flex h-full flex-col rounded-xl border-2 shadow-inner '>
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguageCode}
        systemInstructions={systemInstructions}
      />

      {shouldShowExternalStatus && (
        <div className='z-10'>
          <ConnectionStatus
            status={connectionStatusType}
            message={effectiveStatusMessage}
            elapsedTime={
              connectionStatusType === 'connected' ? elapsedTime : undefined
            }
            onClose={handleCloseTimer}
          />
        </div>
      )}

      {shouldShowRestartButton && (
        <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
          <RestartStreamButton onRestart={handleReconnect} />
        </div>
      )}

      <div className='flex-grow overflow-y-auto p-4' ref={loggerRef}>
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

      <div className='border-gray-20 bg-gray-10 m-4 flex items-center gap-2 rounded-full border p-1.5  '>
        <ConnectionButton
          connected={connected}
          connect={connectWithPermissions}
          disconnect={handleDisconnect}
          isConnecting={isConnecting}
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
            disabled={!connected || isSendingMessage}
            isLoading={isSendingMessage}
          />
        </div>
      </div>
    </div>
  )
}