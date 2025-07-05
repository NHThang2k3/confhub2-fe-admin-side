// src/components/Moderation/CommentModal.tsx
'use client';

import React from 'react';
import { ConferenceStatus } from '@/src/types';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface CommentModalProps {
    show: boolean;
    targetStatus: ConferenceStatus | null;
    comment: string;
    commentError: string;
    setComment: (comment: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
    show, targetStatus, comment, commentError, setComment, onSubmit, onCancel,
}) => {
    const t = useTranslations('CommentModal');

    if (!show) return null;

    let modalTitle = t('Title_Default');
    let submitButtonText = t('Button_Submit_Default');
    let submitButtonColor = 'bg-indigo-600 hover:bg-indigo-700';

    if (targetStatus === 'APPROVED') {
        modalTitle = t('Title_Approved');
        submitButtonText = t('Button_Approve');
        submitButtonColor = 'bg-green-600 hover:bg-green-700';
    } else if (targetStatus === 'REJECTED') {
        modalTitle = t('Title_Rejected');
        submitButtonText = t('Button_Reject');
        submitButtonColor = 'bg-red-600 hover:bg-red-700';
    } else if (targetStatus === 'PENDING') {
        modalTitle = t('Title_Pending');
        submitButtonText = t('Button_Pending');
        submitButtonColor = 'bg-slate-600 hover:bg-slate-700';
    }

    const commentPlaceholder = targetStatus === 'REJECTED' ? t('Placeholder_Rejected') : t('Placeholder_Generic');
    const promptText = targetStatus === 'REJECTED' ? t('ReasonRequired_Rejected_Label') : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 text-left shadow-xl transition-all">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold leading-6 text-slate-900">{modalTitle}</h3>
                    <button type="button" className="rounded-md text-slate-400 hover:text-slate-500" onClick={onCancel}>
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="mt-4">
                    {promptText && <p className="mb-2 text-sm text-amber-700">{promptText}</p>}
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={`w-full rounded-md border p-2 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 ${commentError ? 'border-red-500 ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                        rows={5}
                        placeholder={commentPlaceholder}
                    ></textarea>
                    {commentError && <p className="mt-1 text-sm text-red-600">{commentError}</p>}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onCancel} className="w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:w-auto">
                        {t('Button_Cancel')}
                    </button>
                    <button type="button" onClick={onSubmit} className={`w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm ${submitButtonColor} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto`}>
                        {submitButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;