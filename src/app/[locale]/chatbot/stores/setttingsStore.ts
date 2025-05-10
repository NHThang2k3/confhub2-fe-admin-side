import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import {
    IS_STREAMING_ENABLED_DEFAULT,
    DEFAULT_LANGUAGE_REGULAR_CHAT,
    AVAILABLE_LANGUAGES_REGULAR_CHAT
} from '@/src/app/[locale]/chatbot/lib/constants'; // Adjust path

// --- Types for Settings Store ---
export type LanguageCode = 'en' | 'vi' | 'zh';
export type ChatMode = 'live' | 'regular';
export interface LanguageOption {
    code: LanguageCode;
    name: string;
    flagCode: string;
}

export interface SettingsStoreState {
    chatMode: ChatMode;
    currentLocale: string; // App's current language from URL
    isStreamingEnabled: boolean;
    currentLanguage: LanguageOption; // Chatbot's language
    availableLanguages: LanguageOption[];
}

export interface SettingsStoreActions {
    setChatMode: (mode: ChatMode) => void;
    setCurrentLocale: (locale: string) => void;
    setIsStreamingEnabled: (enabled: boolean) => void;
    setCurrentLanguage: (language: LanguageOption) => void;
    // availableLanguages is usually static, but if it could change:
    // setAvailableLanguages: (languages: LanguageOption[]) => void;
}

const initialSettingsStoreState: SettingsStoreState = {
    chatMode: 'regular',
    currentLocale: 'en', // Default, will be overridden
    isStreamingEnabled: IS_STREAMING_ENABLED_DEFAULT,
    currentLanguage: DEFAULT_LANGUAGE_REGULAR_CHAT,
    availableLanguages: AVAILABLE_LANGUAGES_REGULAR_CHAT,
};

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialSettingsStoreState,

                setChatMode: (mode) => {
                    if (get().chatMode === mode) return;
                    set({ chatMode: mode }, false, `setChatMode/${mode}`);
                    // Component (e.g., MainLayout or a settings component) will handle navigation
                    // and potentially call startNewConversation from conversationStore if needed.
                },
                setCurrentLocale: (locale) => {
                    if (get().currentLocale === locale) return;
                    set({ currentLocale: locale }, false, 'setCurrentLocale');
                },
                setIsStreamingEnabled: (enabled) => set({ isStreamingEnabled: enabled }, false, 'setIsStreamingEnabled'),
                setCurrentLanguage: (language) => set({ currentLanguage: language }, false, 'setCurrentLanguage'),
            }),
            {
                name: 'chatbot-settings-storage-v1',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    chatMode: state.chatMode,
                    currentLocale: state.currentLocale,
                    isStreamingEnabled: state.isStreamingEnabled,
                    currentLanguage: state.currentLanguage,
                    // availableLanguages is from constants, no need to persist
                }),
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        // Ensure availableLanguages is always up-to-date from constants
                        state.availableLanguages = AVAILABLE_LANGUAGES_REGULAR_CHAT;
                        // Validate currentLanguage against availableLanguages
                        if (!AVAILABLE_LANGUAGES_REGULAR_CHAT.find(lang => lang.code === state.currentLanguage?.code)) {
                            state.currentLanguage = DEFAULT_LANGUAGE_REGULAR_CHAT;
                        }
                        console.log('[SettingsStore] Rehydrated from storage. ChatMode:', state.chatMode, 'Lang:', state.currentLanguage?.name);
                    }
                }
            }
        ),
        { name: "SettingsStore" }
    )
);