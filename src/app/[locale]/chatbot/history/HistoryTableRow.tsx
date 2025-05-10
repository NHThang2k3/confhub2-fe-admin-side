// src/app/[locale]/chatbot/history/HistoryTableRow.tsx
import React, { useState, useCallback } from 'react';
import { ConversationMetadata } from '../lib/regular-chat.types';
import { Trash2, Eraser, Pencil, Pin, PinOff, Check, X as CancelIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

interface HistoryTableRowProps {
  conv: ConversationMetadata;
  onSelectAndGoToChat: (conversationId: string) => void;
  onDelete: (id: string, title: string) => Promise<void>; // Giả sử onDelete có thể là async
  onClear: (id: string, title: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onTogglePin: (id: string, currentPinStatus: boolean) => void;
  // Không cần isBeingDeleted ở đây nếu table không có spinner cho từng row
  // Nếu có, bạn cần truyền deletingConversationId và so sánh
}

const HistoryTableRow: React.FC<HistoryTableRowProps> = ({
  conv,
  onSelectAndGoToChat,
  onDelete,
  onClear,
  onRename,
  onTogglePin,
}) => {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(conv.title || '');
  const [isProcessingAction, setIsProcessingAction] = useState(false); // Cho spinner khi delete

  const currentTitleForDisplay = conv.title || t('Untitled_Conversation');

  const handleRenameClick = useCallback(() => {
    setIsEditing(true);
    setNewTitle(conv.title || '');
  }, [conv.title]);

  const handleSaveRename = useCallback(() => {
    if (newTitle.trim() === '') {
      setIsEditing(false); // Hủy nếu rỗng
      return;
    }
    onRename(conv.id, newTitle.trim());
    setIsEditing(false);
  }, [conv.id, newTitle, onRename]);

  const handleCancelRename = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDeleteClick = useCallback(async () => {
    setIsProcessingAction(true);
    try {
      await onDelete(conv.id, currentTitleForDisplay);
      // Không cần setIsProcessingAction(false) ở đây vì row sẽ bị xóa
    } catch (error) {
      console.error("Error during delete in row:", error);
      setIsProcessingAction(false); // Reset nếu có lỗi
    }
  }, [conv.id, currentTitleForDisplay, onDelete]);

  const handleClearClick = useCallback(() => {
    onClear(conv.id, currentTitleForDisplay);
  }, [conv.id, currentTitleForDisplay, onClear]);

  const handleTogglePinClick = useCallback(() => {
    onTogglePin(conv.id, conv.isPinned);
  }, [conv.id, conv.isPinned, onTogglePin]);


  return (
    <tr className='hover:bg-gray-5 transition-colors dark:hover:bg-gray-800/50'>
      <td className='whitespace-nowrap px-6 py-4'>
        <div className='flex items-center'>
          <div className='min-w-0 flex-1'>
            {isEditing ? (
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  disabled={newTitle.trim() === ''}
                  className='flex-shrink-0 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50'
                  title={t('Save')}
                >
                  <Check size={16}/>
                </button>
                <button
                  onClick={handleCancelRename}
                  className='flex-shrink-0 rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'
                  title={t('Cancel')}
                >
                  <CancelIcon size={16}/>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectAndGoToChat(conv.id)}
                className='block w-full truncate text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
                title={currentTitleForDisplay}
              >
                {conv.isPinned && (
                  <Pin
                    size={14}
                    className='mr-1.5 inline-block align-text-bottom text-blue-500 dark:text-blue-400'
                  />
                )}
                {currentTitleForDisplay}
              </button>
            )}
          </div>
        </div>
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
        {formatDistanceToNow(new Date(conv.lastActivity), {
          addSuffix: true
        })}
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
        <div className='flex items-center space-x-1.5'>
          <button
            onClick={handleRenameClick}
            disabled={isEditing || isProcessingAction}
            className='rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
            title={t('Rename')}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleTogglePinClick}
            disabled={isProcessingAction}
            className={`rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 ${
              conv.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
            title={conv.isPinned ? t('Unpin') : t('Pin')}
          >
            {conv.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={handleClearClick}
            disabled={isProcessingAction}
            className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 dark:text-yellow-400 dark:hover:bg-yellow-700 dark:hover:text-yellow-300'
            title={t('Clear_Messages')}
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isProcessingAction}
            className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-300'
            title={t('Delete')}
          >
            {isProcessingAction ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default HistoryTableRow;