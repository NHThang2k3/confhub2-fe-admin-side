// src/components/Moderation/CommentModal.tsx
'use client'; // <-- Add directive

import React from 'react';
// Import ConferenceStatus
import { ConferenceStatus } from '@/src/types'; // Ensure this uses uppercase status strings
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import


interface CommentModalProps {
    show: boolean;
    targetStatus: ConferenceStatus | null; // 'PENDING', 'APPROVED', 'REJECTED'
    comment: string;
    commentError: string; // Assuming this string is already translated by the parent
    setComment: (comment: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    // If using namespaces, pass the 't' function related to this component's namespace
    // t: ReturnType<typeof useTranslations>; // Or get t inside the component
}

const CommentModal: React.FC<CommentModalProps> = ({
    show,
    targetStatus,
    comment,
    commentError, // Use directly, assume translated
    setComment,
    onSubmit,
    onCancel,
    // If receiving t as prop: t,
}) => {
    // Call useTranslations hook here
    const t = useTranslations('CommentModal'); // <-- Added hook call (using a namespace example)
    // Alternatively, if passing t from parent: const { t } = props;

    if (!show) {
        return null;
    }

    // Determine button text and modal title based on targetStatus (uppercase)
    let modalTitle = t('Title_Default'); // <-- Translate default title
    let submitButtonText = t('Button_Submit_Default'); // <-- Translate default submit text
    let submitButtonColor = 'bg-blue-500 hover:bg-blue-600'; // Default color

    if (targetStatus === 'APPROVED') {
        modalTitle = t('Title_Approved'); // <-- Translate title
        submitButtonText = t('Button_Approve'); // <-- Translate button text
        submitButtonColor = 'bg-green-500 hover:bg-green-600';
    } else if (targetStatus === 'REJECTED') {
        modalTitle = t('Title_Rejected'); // <-- Translate title
        submitButtonText = t('Button_Reject'); // <-- Translate button text
        submitButtonColor = 'bg-red-500 hover:bg-red-600';
    } else if (targetStatus === 'PENDING') {
        modalTitle = t('Title_Pending'); // <-- Translate title
        submitButtonText = t('Button_Pending'); // <-- Translate button text
        submitButtonColor = 'bg-gray-500 hover:bg-gray-600';
    }

    // Determine dynamic placeholder and prompt text
    const commentPlaceholder = targetStatus === 'REJECTED' ? t('Placeholder_Rejected') : t('Placeholder_Generic'); // <-- Translate placeholders
    const promptText = targetStatus === 'REJECTED' ? t('ReasonRequired_Rejected_Label') : null; // <-- Translate conditional prompt


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                   {modalTitle} {/* Use translated dynamic title */}
                </h3>
                {/* Show prompt text if determined */}
                 {promptText && <p className="mb-4 text-gray-700">{promptText}</p>} {/* <-- Use translated prompt */}

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`w-full rounded border p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    placeholder={commentPlaceholder} // Use translated dynamic placeholder
                ></textarea>
                {/* commentError is assumed to be pre-translated string from parent */}
                {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                    >
                        {/* Translate Cancel button */}
                        {t('Button_Cancel')} {/* <-- Translated */}
                    </button>
                    <button
                        onClick={onSubmit}
                        className={`rounded px-4 py-2 text-sm text-white ${submitButtonColor}`}
                    >
                        {submitButtonText} {/* Use translated dynamic text */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;