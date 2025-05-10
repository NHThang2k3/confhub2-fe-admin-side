import React from 'react';
import { X, Settings } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';
import LiveChatSpecificSettings from './livechat/LiveChatSpecificSettings';
import { useTranslations } from 'next-intl';
import { useUiStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLiveChatSettings } from './livechat/contexts/LiveChatSettingsContext';

// --- IMPORT CÁC KIỂU CẦN THIẾT TỪ STORE ---
// Giả sử 'setttingsStore.ts' (hoặc tên file store của bạn) export các kiểu này,
// và './stores/index.ts' (nếu có) cũng re-export chúng.
// Nếu không, bạn có thể cần import trực tiếp từ file store, ví dụ:
// import { LanguageOption } from './stores/setttingsStore';
import { LanguageOption } from './stores';


interface RightSettingsPanelProps {
  isLiveChatContextActive?: boolean;
}

// --- SỬA ĐỔI ĐỊNH NGHĨA PROPS CHO LiveAwareLanguageDropdown ---
const LiveAwareLanguageDropdown: React.FC<{
  currentLanguage: LanguageOption; // Sử dụng kiểu LanguageOption trực tiếp
  availableLanguages: LanguageOption[]; // Sử dụng mảng LanguageOption
  setCurrentLanguage: (language: LanguageOption) => void; // Định nghĩa kiểu hàm trực tiếp
}> = ({ currentLanguage, availableLanguages, setCurrentLanguage }) => {
  const { isLiveChatConnected } = useLiveChatSettings();

  return (
    <LanguageDropdown
      currentLanguage={currentLanguage}
      availableLanguages={availableLanguages}
      onLanguageChange={setCurrentLanguage}
      disabled={isLiveChatConnected}
    />
  );
};

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isLiveChatContextActive
}) => {
  const t = useTranslations();

  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  const {
    chatMode,
    currentLanguage, // Kiểu ở đây sẽ là LanguageOption
    availableLanguages, // Kiểu ở đây sẽ là LanguageOption[]
    isStreamingEnabled,
    setCurrentLanguage, // Kiểu ở đây sẽ là (language: LanguageOption) => void
    setIsStreamingEnabled,
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
    }))
  );

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked);
  };

  if (!isRightPanelOpen) {
    return null;
  }

   return (
    <div
      className={`bg-white-pure h-full flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out  ${
        isRightPanelOpen ? 'w-72 opacity-100' : 'pointer-events-none w-0 opacity-0'
      }`}
      aria-hidden={!isRightPanelOpen}
    >
      <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
        <div className='border-gray-20 flex flex-shrink-0 items-center justify-between border-b  pb-4 pt-4 '>
          <div className='flex items-center space-x-2'>
            <Settings size={20} className='' />
            <h2 id='right-panel-title' className='text-lg font-semibold '>
              {t('Settings')}
            </h2>
          </div>
          <button
            onClick={() => setRightPanelOpen(false)}
            className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:hover:bg-black dark:hover:text-gray-300'
            title={t('Close_settings')}
            aria-label={t('Close_settings')}
          >
            <X size={20} strokeWidth={1.5} className='h-5 w-5' aria-hidden='true'/>
          </button>
        </div>

        <div className='flex-grow space-y-6  pt-4'>
          {chatMode === 'regular' && (
            <div className='space-y-2 '>
              <label htmlFor='streaming-toggle-settings' className='block text-sm font-medium '>{t('Stream_Response')}</label>
              <label htmlFor='streaming-toggle-settings' className='inline-flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  id='streaming-toggle-settings'
                  className='peer sr-only'
                  checked={isStreamingEnabled}
                  onChange={handleStreamingToggle}
                />
                <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
              </label>
            </div>
          )}

          {isLiveChatContextActive && chatMode === 'live' ? (
            <LiveAwareLanguageDropdown
              currentLanguage={currentLanguage}
              availableLanguages={availableLanguages}
              setCurrentLanguage={setCurrentLanguage}
            />
          ) : (
            <LanguageDropdown
              currentLanguage={currentLanguage}
              availableLanguages={availableLanguages}
              onLanguageChange={setCurrentLanguage}
              disabled={false}
            />
          )}

          {isLiveChatContextActive && chatMode === 'live' && (
            <LiveChatSpecificSettings
              currentChatMode={chatMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSettingsPanel;