// src/app/[locale]/chatbot/regularchat/ConversationList.tsx
import React from 'react'; 
import { ConversationMetadata } from '../lib/regular-chat.types';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ConversationItem from './ConversationItem'; 

interface ConversationListProps {
  conversationList: ConversationMetadata[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
  isLoading: boolean; // Loading toàn bộ danh sách
  onDeleteConversation: (conversationId: string) => void;
  onClearConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onPinConversation: (conversationId: string, isPinned: boolean) => void;
  currentView: 'chat' | 'history'; // Vẫn cần để xác định isLogicallyActive
  deletingConversationId: string | null; // ID của conversation đang trong quá trình xóa chung
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversationList,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  isLoading,
  onDeleteConversation,
  onClearConversation,
  onRenameConversation,
  onPinConversation,
  currentView,
  deletingConversationId,
}) => {
  const t = useTranslations();

  // Logic confirm trước khi xóa/clear có thể chuyển vào ConversationItem
  // Hoặc giữ ở đây nếu bạn muốn tất cả confirmation dialog có cùng style/behavior từ đây
  const handleDeleteWithConfirm = (id: string, title: string) => {
    if (window.confirm(t('Confirm_Delete_Conversation', { title: title || 'Untitled' }))) {
      onDeleteConversation(id);
    }
  };

  const handleClearWithConfirm = (id: string, title: string) => {
     if (window.confirm(t('Confirm_Clear_Conversation', { title: title || 'Untitled' }))) {
      onClearConversation(id);
    }
  };


  return (
    <div className='flex flex-grow flex-col overflow-hidden px-3 pb-3 pt-0'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
          {t('Chat_History')}
        </span>
        <button
          onClick={onStartNewConversation}
          disabled={isLoading || !!deletingConversationId}
          className='flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/50'
          title={t('Start_New_Chat')}
        >
          <PlusCircle size={14} />
          <span>{t('New_Chat')}</span>
        </button>
      </div>

      <div className='-mr-3 flex-grow space-y-1 overflow-y-auto pr-3'>
        {isLoading && conversationList.length === 0 && (
          <div className='flex items-center justify-center py-4 text-gray-600 dark:text-gray-300'>
            <Loader2 size={18} className='mr-2 animate-spin' />
            <span>{t('Loading')}</span>
          </div>
        )}
        {!isLoading && conversationList.length === 0 && (
          <div className='px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
            {t('No_Conversations_Found')}
          </div>
        )}

        {conversationList.map(conv => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeConversationId && currentView === 'chat'}
            isBeingDeleted={deletingConversationId === conv.id}
            isLoadingList={isLoading}
            onSelect={onSelectConversation}
            onDelete={handleDeleteWithConfirm} // Truyền hàm có confirm
            onClear={handleClearWithConfirm}   // Truyền hàm có confirm
            onRename={onRenameConversation}
            onTogglePin={onPinConversation}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;