// src/app/[locale]/chatbot/regularchat/ConversationItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ConversationMetadata } from '../lib/regular-chat.types';
import { Loader2, Trash2, Eraser, Pencil, Pin, PinOff, Check, X as CancelIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

interface ConversationItemProps {
  conv: ConversationMetadata;
  isActive: boolean; // Is this the logically active conversation in the chat view
  isBeingDeleted: boolean; // Is this specific item currently being processed for deletion
  isLoadingList: boolean; // Is the parent list in a general loading state
  onSelect: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onClear: (id: string, title: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onTogglePin: (id: string, currentPinStatus: boolean) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  isBeingDeleted,
  isLoadingList,
  onSelect,
  onDelete,
  onClear,
  onRename,
  onTogglePin,
}) => {
  const t = useTranslations();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(conv.title || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const title = conv.title || `Chat ${conv.id.substring(0, 6)}...`;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit text if the conversation title changes from outside (e.g., via store update)
  // while not editing this specific item.
  useEffect(() => {
    if (!isEditing) {
        setEditText(conv.title || '');
    }
  }, [conv.title, isEditing]);


  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBeingDeleted) return;
    setIsEditing(true);
    setEditText(conv.title || ''); // Initialize with current title
  };

  const handleEditCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    // setEditText(conv.title || ''); // Reset to original title if needed
  };

  const handleEditSave = (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (editText.trim() !== '') {
      onRename(conv.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Confirmation is now handled by the parent or the action itself
    onDelete(conv.id, title);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBeingDeleted) return;
    // Confirmation is now handled by the parent or the action itself
    onClear(conv.id, title);
  };

  const handleTogglePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBeingDeleted) return;
    onTogglePin(conv.id, !conv.isPinned); // <--- SỬA Ở ĐÂY
  };

  const handleSelectConvClick = () => {
    if (isBeingDeleted || isEditing) return; // Prevent selection if deleting or editing
    onSelect(conv.id);
  };

  const itemDisabled = isLoadingList || isBeingDeleted;

  return (
    <div
      className={`group relative rounded-md transition-colors duration-150 
        ${isActive && !isBeingDeleted ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        ${isBeingDeleted ? 'opacity-70 cursor-default animate-pulse' : ''} 
      `}
    >
      {isEditing ? (
        <form onSubmit={handleEditSave} className='flex items-center p-2 space-x-1'>
          <input
            ref={inputRef}
            type='text'
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') handleEditCancel(); }}
            className='mr-1 flex-grow rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
          <button type='submit' title={t('Save_Title')} className='rounded-md p-1.5 text-green-600 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed' disabled={editText.trim() === ''}>
            <Check size={16} />
          </button>
          <button type='button' onClick={handleEditCancel} title={t('Cancel_Edit')} className='rounded-md p-1.5 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:hover:bg-gray-600'>
            <CancelIcon size={16} />
          </button>
        </form>
      ) : (
        <button
          onClick={handleSelectConvClick}
          disabled={itemDisabled}
          className={`w-full py-2 pl-3 pr-24 text-left text-sm focus:outline-none 
            ${isActive && !isBeingDeleted ? 'font-semibold text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}
            ${isBeingDeleted ? 'cursor-not-allowed' : ''}
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
          aria-current={isActive && !isBeingDeleted ? 'page' : undefined}
        >
          <div className='flex items-center'>
            {conv.isPinned && <Pin size={14} className='mr-1.5 flex-shrink-0 text-blue-500 dark:text-blue-400' />}
            <span className='truncate font-medium' title={title}>{title}</span>
          </div>
          <div className={`text-xs ${isActive && !isBeingDeleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
          </div>
        </button>
      )}

      {!isEditing && (
        <div className={`absolute right-0 top-0 flex h-full items-center space-x-0.5 pr-1 transition-opacity duration-150 
          ${isBeingDeleted ? 'opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100'}
        `}>
          <button
            onClick={handleTogglePinClick}
            disabled={itemDisabled}
            title={conv.isPinned ? t('Unpin') : t('Pin')}
            className={`rounded-md p-1.5 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${conv.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {conv.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            onClick={handleEditStart}
            disabled={itemDisabled}
            title={t('Rename')}
            className='rounded-md p-1.5 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700'
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleClearClick}
            disabled={itemDisabled}
            title={t('Clear_Messages')}
            className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-yellow-400 dark:hover:bg-yellow-700'
          >
            <Eraser size={14} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={itemDisabled}
            title={t('Delete_Conversation')}
            className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-700'
          >
            {isBeingDeleted ? (
              <Loader2 size={14} className='animate-spin' />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;