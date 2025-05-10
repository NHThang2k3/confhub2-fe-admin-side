// src/app/[locale]/chatbot/lib/constants.ts
import {
    LanguageOption as LiveChatLanguageOption,
    PrebuiltVoice,
    Language as LiveChatLanguageCode,
    OutputModality
} from './live-chat.types';

import { LanguageOption as RegularChatLanguageOption } from './regular-chat.types';

// --- Constants cho Live Chat ---
export const AVAILABLE_VOICES_LIVE_CHAT: PrebuiltVoice[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Orus", "Zephyr"];

// BỎ thuộc tính 'value' nếu không cần thiết
export const AVAILABLE_LANGUAGES_LIVE_CHAT: LiveChatLanguageOption[] = [
    { code: 'en', name: 'English', flagCode: 'gb' },
    { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' },
    { code: 'zh', name: '中文', flagCode: 'cn' },
];

export const DEFAULT_LANGUAGE_LIVE_CHAT: LiveChatLanguageCode = 'vi';
export const DEFAULT_VOICE_LIVE_CHAT: PrebuiltVoice = 'Puck';
export const DEFAULT_MODALITY_LIVE_CHAT: OutputModality = 'audio';

// --- Constants cho Regular Chat (VÀ CÓ THỂ DÙNG CHUNG) ---
export const AVAILABLE_LANGUAGES_REGULAR_CHAT: RegularChatLanguageOption[] = [
    { code: 'en', name: 'English', flagCode: 'gb' },
    { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' },
    { code: 'zh', name: '中文', flagCode: 'cn' },
];

export const DEFAULT_LANGUAGE_REGULAR_CHAT: RegularChatLanguageOption = AVAILABLE_LANGUAGES_REGULAR_CHAT[0];
export const IS_STREAMING_ENABLED_DEFAULT: boolean = true;

// --- API Configuration ---
export const API_HOST = "generativelanguage.googleapis.com";
export const API_URI = `wss://${API_HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;