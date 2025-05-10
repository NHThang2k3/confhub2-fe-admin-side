// src/app/[locale]/chatbot/history/ConversationHistoryPage.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
    useConversationListState,
    useConversationActions,
    useChatSettingsState,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { ConversationMetadata } from '../lib/regular-chat.types';
import { Loader2, MessageSquarePlus } from 'lucide-react'; // Giữ lại các icon dùng ở đây
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/navigation';
import HistoryTableRow from './HistoryTableRow'; // Import component con

const ConversationHistoryPage: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();

  const {
    conversationList: initialListFromStore,
    searchResults,
    isSearching,
    isLoadingHistory,
  } = useConversationListState();

  const {
    loadConversation,
    startNewConversation,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    searchConversations,
  } = useConversationActions();

  const { chatMode } = useChatSettingsState();

  const [searchTerm, setSearchTerm] = useState('');
  const [displayedConversations, setDisplayedConversations] = useState<
    ConversationMetadata[]
  >(initialListFromStore); // Khởi tạo với initialListFromStore

  useEffect(() => {
    searchConversations(searchTerm);
  }, [searchTerm, searchConversations]);

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setDisplayedConversations(searchResults);
    } else {
      setDisplayedConversations(initialListFromStore);
    }
  }, [searchTerm, searchResults, initialListFromStore]);

  const handleSelectAndGoToChat = useCallback(
    (conversationId: string) => {
      loadConversation(conversationId);
      const targetPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';
      router.push({ pathname: targetPath });
    },
    [loadConversation, router, chatMode]
  );

  const handleStartNewAndGoToChat = useCallback(() => {
    startNewConversation();
    const targetPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';
    router.push(targetPath);
  }, [startNewConversation, router, chatMode]);

  // Các hàm confirm sẽ được gọi bên trong HistoryTableRow nếu muốn, hoặc truyền callback đã có confirm
  const handleDeleteWithConfirm = useCallback(
    async (id: string, title: string) => {
      if (
        window.confirm(
          t('Confirm_Delete_Conversation', {
            title: title || t('Untitled_Conversation')
          })
        )
      ) {
        try {
          await deleteConversation(id);
        } catch (error) {
          console.error("Error deleting conversation from history page:", error);
          // Xử lý lỗi chung ở đây nếu cần
          throw error; // Ném lại lỗi để HistoryTableRow có thể xử lý isProcessingAction
        }
      } else {
        throw new Error("Deletion cancelled by user"); // Ném lỗi để Row biết hủy
      }
    },
    [deleteConversation, t]
  );

  const handleClearWithConfirm = useCallback(
    (id: string, title: string) => {
      if (
        window.confirm(
          t('Confirm_Clear_Conversation', {
            title: title || t('Untitled_Conversation')
          })
        )
      ) {
        clearConversation(id);
      }
    },
    [clearConversation, t]
  );


  const showInitialLoading = isLoadingHistory && displayedConversations.length === 0 && searchTerm.trim() === '';

  return (
    <div className='bg-gray-5 flex h-full flex-col p-4 md:p-6 dark:bg-gray-900'>
      <div className='mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <h1 className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>{t('Chat_History_Full')}</h1>
        <button
          onClick={handleStartNewAndGoToChat}
          className='flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
        >
          <MessageSquarePlus size={18} />
          <span>{t('Start_New_Chat_And_Open')}</span>
        </button>
      </div>

      <div className='mb-6 flex gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('Search_Conversations_Placeholder')}
          className='flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
        />
        {isSearching && (
          <div className='flex items-center justify-center px-2'>
            <Loader2 size={18} className='animate-spin text-gray-500 dark:text-gray-400' />
          </div>
        )}
      </div>

      {showInitialLoading && (
        <div className='flex flex-1 items-center justify-center text-gray-600 dark:text-gray-300'>
          <Loader2 size={24} className='mr-2 animate-spin' />
          <span>{t('Loading_Initial_History')}</span>
        </div>
      )}

      {!showInitialLoading && displayedConversations.length === 0 && (
        <div className='flex flex-1 items-center justify-center text-center text-gray-500 dark:text-gray-400'>
          {searchTerm.trim() !== ''
            ? t('No_Search_Results_Found')
            : t('No_Conversations_Found_Yet')}
        </div>
      )}

      {displayedConversations.length > 0 && (
        <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-100 dark:bg-gray-800'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'
                >
                  {t('Title')}
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'
                >
                  {t('Last_Activity')}
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'
                >
                  {t('Actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800/30'>
              {displayedConversations.map(conv => (
                <HistoryTableRow
                  key={conv.id}
                  conv={conv}
                  onSelectAndGoToChat={handleSelectAndGoToChat}
                  onDelete={handleDeleteWithConfirm}
                  onClear={handleClearWithConfirm}
                  onRename={renameConversation} // Truyền trực tiếp action nếu không cần confirm ở đây
                  onTogglePin={pinConversation}  // Truyền trực tiếp action
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConversationHistoryPage;