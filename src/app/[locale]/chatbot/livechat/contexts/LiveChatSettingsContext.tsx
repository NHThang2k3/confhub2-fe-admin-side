"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OutputModality, PrebuiltVoice } from '../../lib/live-chat.types';
import { AVAILABLE_VOICES_LIVE_CHAT, DEFAULT_MODALITY_LIVE_CHAT, DEFAULT_VOICE_LIVE_CHAT } from '../../lib/constants';

// --- Interface cho Context Value ---
interface LiveChatSettingsContextType {
    currentModality: OutputModality;
    setCurrentModality: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    setCurrentVoice: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];
    // --- THÊM TRẠNG THÁI KẾT NỐI VÀ SETTER ---
    isLiveChatConnected: boolean;
    setLiveChatConnected: (isConnected: boolean) => void;
}

interface LiveChatSettingsProviderProps {
    children: ReactNode;
}

const LiveChatSettingsContext = createContext<LiveChatSettingsContextType | undefined>(undefined);

export const useLiveChatSettings = (): LiveChatSettingsContextType => {
    const context = useContext(LiveChatSettingsContext);
    if (!context) {
        throw new Error('useLiveChatSettings must be used within a LiveChatSettingsProvider');
    }
    return context;
};

export const LiveChatSettingsProvider: React.FC<LiveChatSettingsProviderProps> = ({ children }) => {
    const [currentModality, setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY_LIVE_CHAT);
    const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE_LIVE_CHAT);
    // --- STATE MỚI CHO KẾT NỐI LIVE CHAT ---
    const [isLiveChatConnected, setLiveChatConnected] = useState<boolean>(false);

    return (
        <LiveChatSettingsContext.Provider
            value={{
                currentModality,
                setCurrentModality,
                currentVoice,
                setCurrentVoice,
                availableVoices: AVAILABLE_VOICES_LIVE_CHAT,
                // --- TRUYỀN STATE VÀ SETTER MỚI VÀO CONTEXT VALUE ---
                isLiveChatConnected,
                setLiveChatConnected,
            }}
        >
            {children}
        </LiveChatSettingsContext.Provider>
    );
};