// src/components/chatbot/RegularChat.tsx (hoặc path tương ứng)
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import ChatIntroductionDisplay from './ChatIntroduction';
import EmailConfirmationDialog from '../EmailConfirmationDialog';
import ConversationToolbar from './ConversationToolbar';
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useTranslations } from 'next-intl';
// --- IMPORT HOOKS TỪ STOREHOOKS ---
import {
    useChatSettingsState,
    useChatMessageState,
    useMessageActions,
    useSocketConnectionStatus,
    useUIState,
    useUIActions,
    useActiveConversationState,
    useConversationListState
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
// useShallow không cần thiết ở đây vì các hook trong storeHooks đã sử dụng nó

function RegularChat() {
  const t = useTranslations();

  // --- Lấy state và actions từ các store đã tách ---
  // Destructure currentLanguage with its correct type, which is Language
  const { currentLanguage, isStreamingEnabled } = useChatSettingsState();

  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { sendMessage } = useMessageActions();

  const { isConnected, socketId } = useSocketConnectionStatus();

  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();

  const { activeConversationId } = useActiveConversationState();
  // isLoadingHistory từ conversationListState là trạng thái loading chung của history
  // có thể khác với messageLoadingState.isLoading (là khi đang gửi/nhận tin nhắn)
  const { isLoadingHistory /*, conversationList */ } = useConversationListState();
  // Bỏ comment conversationList nếu ConversationToolbar hoặc component này thực sự cần

  const { timeCounter, startTimer, stopTimer } = useTimer();
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
  const [fillInputFunction, setFillInputFunction] = useState<
    ((text: string) => void) | null
  >(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current && !showConfirmationDialog) {
      setTimeout(() => {
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chatMessages, showConfirmationDialog]);

  useEffect(() => {
    // Sử dụng messageLoadingState.isLoading cho timer
    if (
      (!messageLoadingState.isLoading || showConfirmationDialog) &&
      timeCounter !== '0.0s'
    ) {
      stopTimer();
    }
  }, [messageLoadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

  const sendChatMessage = useCallback(
    async (userMessage: string) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage) return;
      if (!isConnected) {
        console.warn('Attempted to send message while disconnected.');
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây thông qua uiStore.handleError
        return;
      }
      if (!hasChatStarted) setHasChatStarted(true);
      startTimer();
      sendMessage(trimmedMessage); // Action từ messageStore
    },
    [
      isConnected,
      hasChatStarted,
      startTimer,
      sendMessage, // sendMessage từ messageStore
    ]
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion);
      }
    },
    [fillInputFunction]
  );

  // isLoadingHistory ở đây có thể là trạng thái đang load conversation ban đầu
  const showIntroduction =
    !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null); // Action từ uiStore
  }, [setShowConfirmationDialog]);


  return (
    <div className='bg-white-pure border-gray-20 relative mx-auto flex h-full w-full flex-col rounded-xl border shadow-xl '>
      <div className='bg-gray-5 border-gray-20 flex-shrink-0 border-b p-2'>
        <div className='flex items-center justify-center space-x-1 text-center text-xs '>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            {isConnected ? t('Connected') : t('Disconnected')}{' '}
            {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}
          </span>
        </div>
      </div>

      {activeConversationId && ( // Kiểm tra activeConversationId từ conversationStore
        <ConversationToolbar /> // Component này cũng cần được cập nhật để dùng store mới
      )}

      <div
        ref={chatHistoryRef}
        className='bg-gray-5 flex-grow space-y-4 overflow-y-auto  p-4  md:p-6'
      >
        {showIntroduction && (
          <ChatIntroductionDisplay
            onSuggestionClick={handleSuggestionClick}
            language={currentLanguage.code} // MODIFIED HERE
          />
        )}
        <ChatHistory messages={chatMessages} /> {/* chatMessages từ messageStore */}
      </div>

      {/*
        Kết hợp cả messageLoadingState.isLoading (khi gửi/nhận) và isLoadingHistory (khi load cả cuộc trò chuyện).
        Điều này đảm bảo LoadingIndicator hiển thị đúng trong cả hai trường hợp.
      */}
      {(messageLoadingState.isLoading || isLoadingHistory) &&
        !showConfirmationDialog && (
          <div className='bg-gray-5 flex-shrink-0 border-t border-gray-200 px-4 py-2   dark:border-gray-600 '>
            <LoadingIndicator
              step={isLoadingHistory ? 'loading_history' : messageLoadingState.step}
              message={
                isLoadingHistory
                  ? t('Loading_Chat_History')
                  : messageLoadingState.message // message từ messageLoadingState
              }
              timeCounter={isLoadingHistory ? undefined : timeCounter} // Chỉ hiển thị timer khi không phải load history
            />
          </div>
        )}

      <div className='bg-gray-5 flex-shrink-0 border-t border-gray-200  p-3 pt-2  dark:border-gray-600  md:p-4'>
        <ChatInput
          onSendMessage={sendChatMessage}
          disabled={
            messageLoadingState.isLoading || // Disable khi đang gửi/nhận tin nhắn
            !isConnected ||
            showConfirmationDialog ||
            isLoadingHistory // Disable khi đang load cả cuộc trò chuyện
          }
          onRegisterFillFunction={handleSetFillInput}
        />
      </div>

      <EmailConfirmationDialog
        isOpen={showConfirmationDialog} // Từ uiStore
        data={confirmationData} // Từ uiStore
        onConfirm={handleConfirmSend} // Từ uiStore
        onCancel={handleCancelSend} // Từ uiStore
        onClose={handleDialogClose} // Hàm cục bộ gọi action từ uiStore
      />
    </div>
  );
}

export default RegularChat;