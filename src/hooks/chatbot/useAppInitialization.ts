// src/hooks/chatbot/layout/useAppInitialization.ts
import { useEffect } from 'react';
import { usePathname } from '@/src/navigation';
import { useSocketStore, useSettingsStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';

export function useAppInitialization() {
  const { initializeAuth } = useSocketStore(
    useShallow(state => ({
      initializeAuth: state.initializeAuth,
    }))
  );
  const { setCurrentLocale } = useSettingsStore(
    useShallow(state => ({
      setCurrentLocale: state.setCurrentLocale,
    }))
  );
  const currentPathname = usePathname();

  // Initialize auth token
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set current UI locale from path
  useEffect(() => {
    const localeFromPath = currentPathname.split('/')[1] || 'en'; // Default to 'en' if not found
    setCurrentLocale(localeFromPath);
  }, [currentPathname, setCurrentLocale]);

  // This hook primarily performs side effects and doesn't need to return anything.
}