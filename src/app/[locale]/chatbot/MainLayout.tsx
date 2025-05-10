'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightSettingsPanel from './RightPanel';
import { Settings, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, AppPathname, useRouter } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
  useSocketStore,
  useSettingsStore,
  useUiStore,
  useMessageStore, // Added import
} from './stores';
import { useShallow } from 'zustand/react/shallow';

// Import custom hooks
import { useAppInitialization } from '@/src/hooks/chatbot/useAppInitialization';
import { useUrlConversationSync, urlSearchParamsToObject } from '@/src/hooks/chatbot/useUrlConversationSync';
import { useConversationLifecycleManager } from '@/src/hooks/chatbot/useConversationLifecycleManager';

interface MainLayoutComponentProps {
  children: React.ReactNode;
  isLiveChatContextActive?: boolean;
}

type MainContentView = 'chat' | 'history';

export const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

export default function MainLayoutComponent({
  children,
  isLiveChatContextActive
}: MainLayoutComponentProps) {
  const t = useTranslations();
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  // --- Store Hooks ---
  const {
    activeConversationId,
    isLoadingHistory,
    loadConversation,
    startNewConversation,
    deleteConversation,
    setActiveConversationId: storeSetActiveConversationId, // Get the setter
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      loadConversation: state.loadConversation,
      startNewConversation: state.startNewConversation,
      deleteConversation: state.deleteConversation,
      setActiveConversationId: state.setActiveConversationId, // Add to shallow selector
    }))
  );

  const { resetChatUIForNewConversation } = useMessageStore( // Get reset function
    useShallow(state => ({
      resetChatUIForNewConversation: state.resetChatUIForNewConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const { chatMode } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
    }))
  );

  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  // --- Local State & Refs for MainLayout ---
  const [currentView, setCurrentView] = useState<MainContentView>(
    currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat'
  );
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);
  const [idBeingDeleted, setIdBeingDeleted] = useState<string | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);
  const prevPathnameRef = useRef<string | null>(null); // <<<< To track pathname changes for blank slate logic
  const prevSearchParamsStringRef = useRef<string>(''); // <<<< To track search param changes

  useAppInitialization();

  const { didAttemptLoadFromUrlRef } = useUrlConversationSync({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
  });


  useConversationLifecycleManager({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
    prevActiveIdRef,
    urlIdParam: searchParamsHook.get('id'),
    searchParamsString: searchParamsHook.toString(),
    onDeletionProcessed: () => {
      setIsProcessingDeletion(false);
      setIdBeingDeleted(null);
    },
    didAttemptLoadFromUrlRef: didAttemptLoadFromUrlRef,
    onNotFoundProcessed: () => {
      console.log("[MainLayout] onNotFoundProcessed called from LifecycleManager.");
      if (didAttemptLoadFromUrlRef.current) {
        didAttemptLoadFromUrlRef.current = false;
        console.log("[MainLayout] Reset didAttemptLoadFromUrlRef to false.");
      }
    },
  });

  // --- Remaining useEffects in MainLayout ---
  useEffect(() => {
    prevActiveIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const newView = currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat';
    if (currentView !== newView) {
      setCurrentView(newView);
    }
  }, [currentPathname, currentView]);

  // Revised "blank slate" logic
  useEffect(() => {
    const currentUrlId = searchParamsHook.get('id');
    const currentSearchParamsString = searchParamsHook.toString();

    const justNavigatedToRegularChatBase =
        (prevPathnameRef.current !== CHATBOT_REGULARCHAT_PATH && currentPathname === CHATBOT_REGULARCHAT_PATH) ||
        (currentPathname === CHATBOT_REGULARCHAT_PATH && prevPathnameRef.current === CHATBOT_REGULARCHAT_PATH && prevSearchParamsStringRef.current !== '' && currentSearchParamsString === '');
        // Điều kiện thứ 2: prevPathnameRef.current === CHATBOT_REGULARCHAT_PATH để đảm bảo không phải từ trang khác tới
        // mà là từ regularchat?id=... về regularchat

    if (
        currentPathname === CHATBOT_REGULARCHAT_PATH &&
        !currentUrlId &&
        justNavigatedToRegularChatBase &&
        activeConversationId !== null // Lấy từ store
    ) {
        console.log('[MainLayout] Blank Slate: Navigated to /chatbot/regularchat (no URL ID) with an active conversation in store. Resetting.');
        storeSetActiveConversationId(null); // <- This will set activeConversationId in conversationStore to null
        resetChatUIForNewConversation(true); // <- This will clear messages in messageStore
    }

    prevPathnameRef.current = currentPathname;
    prevSearchParamsStringRef.current = currentSearchParamsString;

}, [
    currentPathname,
    searchParamsHook,
    activeConversationId, // Thêm dependency này RẤT QUAN TRỌNG
    storeSetActiveConversationId,
    resetChatUIForNewConversation,
]);


  // --- Event Handlers ---
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected || isProcessingDeletion || isLoadingHistory) return;
      loadConversation(conversationId);
      const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
      const newParams = new URLSearchParams(searchParamsHook.toString());

      if (targetChatPath === CHATBOT_LIVECHAT_PATH) {
        newParams.delete('id');
      } else {
        newParams.set('id', conversationId);
      }
      const newQuery = urlSearchParamsToObject(newParams);
      const newQueryString = newParams.toString();
      const currentQueryString = searchParamsHook.toString();

      if (currentPathname !== targetChatPath || currentQueryString !== newQueryString) {
        if (currentView === 'history' || currentPathname !== targetChatPath) {
          router.push({ pathname: targetChatPath, query: newQuery });
        } else {
          router.replace({ pathname: currentPathname, query: newQuery });
        }
      }
    },
    [
      loadConversation, currentView, router, chatMode, isConnected,
      isProcessingDeletion, isLoadingHistory, currentPathname, searchParamsHook,
    ]
  );

  const handleStartNewConversation = useCallback(() => {
    if (!isConnected || !isServerReadyForCommands || isProcessingDeletion) return;
    startNewConversation(); // This will trigger store changes, leading to activeId becoming null then newId
    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
    const newParams = new URLSearchParams(searchParamsHook.toString());
    newParams.delete('id'); // Always remove 'id' when starting a new conversation
    const newQuery = urlSearchParamsToObject(newParams);
    const currentUrlId = searchParamsHook.get('id');

    // Navigate if path changes OR if there was an ID in the URL previously (even on same path)
    if (currentPathname !== targetChatPath || currentUrlId) {
      router.push({ pathname: targetChatPath, query: newQuery });
    }
  }, [
    startNewConversation, router, chatMode, isConnected, isServerReadyForCommands,
    currentPathname, isProcessingDeletion, searchParamsHook
  ]);

  const handleDeleteConversation = useCallback(
    async (conversationIdToDelete: string) => {
      if (!isConnected || isProcessingDeletion) return;
      console.log(`[MainLayout handleDeleteConversation] Initiating deletion for ${conversationIdToDelete}.`);
      setIsProcessingDeletion(true);
      setIdBeingDeleted(conversationIdToDelete);
      try {
        await deleteConversation(conversationIdToDelete);
      } catch (error) {
        console.error(`[MainLayout] Error emitting delete request for ${conversationIdToDelete}:`, error);
        setIsProcessingDeletion(false);
        setIdBeingDeleted(null);
      }
    },
    [deleteConversation, isConnected, isProcessingDeletion]
  );

  return (
    <div className='bg-gray-10 flex h-screen overflow-hidden' >
      <LeftPanel
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentView={currentView}
        deletingConversationId={isProcessingDeletion ? idBeingDeleted : null}
      />

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out' >
        {isProcessingDeletion && idBeingDeleted && currentView === 'chat' && activeConversationId === idBeingDeleted && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-75">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-xl flex items-center text-gray-700 dark:text-gray-200">
              <Loader2 size={24} className="animate-spin mr-3" />
              <span>{t('Deleting_conversation_ellipsis')}</span>
            </div>
          </div>
        )}
        <div className='h-full w-full' > {children} </div>
      </main>

      <RightSettingsPanel
        isLiveChatContextActive={isLiveChatContextActive}
      />

      {!isRightPanelOpen && (
        <button
          onClick={() => {
            if (isProcessingDeletion) return;
            setRightPanelOpen(true)
          }}
          disabled={isProcessingDeletion}
          className='bg-white-pure hover:bg-gray-5 fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          title={t('Open_settings')}
          aria-label={t('Open_settings')}
        >
          <Settings className='h-5 w-5' />
        </button>
      )}
    </div>
  );
}