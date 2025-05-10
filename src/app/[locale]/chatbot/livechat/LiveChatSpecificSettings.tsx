// src/app/[locale]/chatbot/livechat/LiveChatSpecificSettings.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext'; // Hook cho context
import OutputFormatSelector from './OutputFormatSelector'; // Giả sử path đúng
import VoiceDropdown from './VoiceDropdown'; // Giả sử path đúng

interface LiveChatSpecificSettingsProps {
  // isLiveServiceConnected?: boolean; // <-- ĐÃ XÓA TRONG PHIÊN BẢN TRƯỚC
  currentChatMode: 'live' | 'regular';
}

const LiveChatSpecificSettings: React.FC<LiveChatSpecificSettingsProps> = ({
  currentChatMode
}) => {
  const t = useTranslations();
  const {
    currentModality,
    setCurrentModality,
    currentVoice,
    setCurrentVoice,
    availableVoices,
    isLiveChatConnected, // Lấy trạng thái kết nối từ context
  } = useLiveChatSettings();

  // Disable settings nếu đang kết nối live chat HOẶC không ở chế độ live
  const disableLiveSettings = isLiveChatConnected || currentChatMode === 'regular';
  const isAudioSelected = currentModality === 'audio';
  // Disable voice dropdown nếu live settings bị disable HOẶC output modality không phải là audio
  const disableVoiceDropdown = disableLiveSettings || !isAudioSelected;

  return (
    <fieldset
      id='live-settings-content'
      disabled={disableLiveSettings}
      className={`space-y-6 transition-opacity duration-300 ${
        disableLiveSettings ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
      }`}
    >
       <legend className='sr-only'>{t('Live_Stream_Output_Settings')}</legend>
      <OutputFormatSelector
        currentModality={currentModality}
        onModalityChange={setCurrentModality}
        disabled={disableLiveSettings}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isAudioSelected && !disableLiveSettings
            ? 'max-h-40 opacity-100'
            : 'max-h-0 overflow-hidden opacity-0 pointer-events-none'
        }`}
      >
        {isAudioSelected && (
          <VoiceDropdown
            currentVoice={currentVoice}
            availableVoices={availableVoices}
            onVoiceChange={setCurrentVoice}
            disabled={disableVoiceDropdown}
          />
        )}
      </div>
    </fieldset>
  );
};

export default LiveChatSpecificSettings;