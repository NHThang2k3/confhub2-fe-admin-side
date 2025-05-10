// src/app/[locale]/chatbot/AppWideInitializers.tsx
'use client';
import { useChatSocketManager } from '@/src/hooks/chatbot/useChatSocketManager';

export function AppWideInitializers() {
  useChatSocketManager();
  return null;
}