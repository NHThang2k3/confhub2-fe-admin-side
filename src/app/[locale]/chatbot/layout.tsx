"use client";

import { LiveAPIProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import MainLayoutComponent from '@/src/app/[locale]/chatbot/MainLayout';
import { LiveChatSettingsProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveChatSettingsContext';
import { API_URI } from '@/src/app/[locale]/chatbot/lib/constants';
import { usePathname } from '@/src/navigation';
import { AppWideInitializers } from '@/src/app/[locale]/chatbot/AppWideInitializers';
// --- IMPORT STORE MỚI ---
import { useSettingsStore } from './stores/setttingsStore'; // Hoặc './stores' nếu có index.ts
import { useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function ChatbotRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const unlocalizedPathname = usePathname();
    // --- Lấy state và action từ SettingsStore ---
    const setChatMode = useSettingsStore(state => state.setChatMode);
    const currentStoreChatMode = useSettingsStore(state => state.chatMode);

    const isLiveChatPage = unlocalizedPathname.includes('/chatbot/livechat');

    // Đồng bộ chatMode trong store với trạng thái isLiveChatPage
    useEffect(() => {
        const newMode = isLiveChatPage ? 'live' : 'regular';
        if (currentStoreChatMode !== newMode) {
            // console.log(`[ChatbotRootLayout] Path: ${unlocalizedPathname}. Setting chatMode from ${currentStoreChatMode} to ${newMode}`);
            setChatMode(newMode); // Action từ SettingsStore
        }
    }, [isLiveChatPage, currentStoreChatMode, setChatMode, unlocalizedPathname]);


    if (typeof API_KEY !== "string" || !API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set or invalid.");
        return (
            <div className="flex h-screen items-center justify-center text-lg font-semibold text-red-600">
                Configuration Error: Live Chat API Key is missing. Please contact support.
            </div>
        );
    }

    return (
        <>
            <AppWideInitializers />

            {isLiveChatPage ? (
                <LiveAPIProvider url={API_URI} apiKey={API_KEY}>
                    <LiveChatSettingsProvider>
                        <MainLayoutComponent isLiveChatContextActive={true}>
                            {children}
                        </MainLayoutComponent>
                    </LiveChatSettingsProvider>
                </LiveAPIProvider>
            ) : unlocalizedPathname === '/chatbot/landingchatbot' ? (
                <>{children}</>
            ) : (
                <MainLayoutComponent isLiveChatContextActive={false}>
                    {children}
                </MainLayoutComponent>
            )}
        </>
    );
}