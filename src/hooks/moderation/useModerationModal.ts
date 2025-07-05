// src/hooks/useModerationModal.ts

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ConferenceStatus } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

interface UseModerationModalProps {
    onUpdateSuccess: () => void; // Callback to trigger a data refetch
}

/**
 * Custom hook to manage the state and logic of the moderation comment modal.
 * @param onUpdateSuccess - A callback function to execute after a successful status update.
 * @returns An object containing modal state and handlers to control the modal.
 */
export const useModerationModal = ({ onUpdateSuccess }: UseModerationModalProps) => {
    const t = useTranslations('Moderation');

    const [show, setShow] = useState(false);
    const [conferenceId, setConferenceId] = useState<string | null>(null);
    const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const openModal = useCallback((confId: string, status: ConferenceStatus) => {
        setConferenceId(confId);
        setTargetStatus(status);
        setComment('');
        setCommentError('');
        setSubmissionError(null);
        setShow(true);
    }, []);

    const closeModal = useCallback(() => {
        setShow(false);
        setConferenceId(null);
        setTargetStatus(null);
        setComment('');
        setCommentError('');
        setSubmissionError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!comment.trim() && targetStatus === 'REJECTED') {
            setCommentError(t('Error_CommentRequiredForStatus', { status: targetStatus }));
            return;
        }

        if (!conferenceId || !targetStatus) {
            console.warn("Moderation submit called without valid ID or target status.");
            closeModal();
            return;
        }

        if (!API_BASE_URL) {
            setSubmissionError(t('Error_BackendUrlNotConfigured'));
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/conferences/requests/${conferenceId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
                },
                body: JSON.stringify({ status: targetStatus, message: comment.trim() }),
            });

            if (!response.ok) {
                let errorMsg = `${t('Error_FailedToUpdateStatus')}: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    errorMsg += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
                } catch (e) { /* ignore */ }
                throw new Error(errorMsg);
            }

            console.log(`Successfully updated request ${conferenceId} to ${targetStatus}`);
            onUpdateSuccess(); // Trigger refetch
            closeModal(); // Close modal on success

        } catch (err: any) {
            console.error("API update failed:", err.message);
            setSubmissionError(t('Error_NetworkErrorUpdatingStatus', { message: err.message }));
            // Do not close modal on error, so user can see the message and retry.
        }
    }, [comment, conferenceId, targetStatus, onUpdateSuccess, closeModal, t]);

    return {
        openModal,
        modalProps: {
            show,
            targetStatus,
            comment,
            commentError,
            submissionError, // Pass submission error to the modal
            setComment,
            onSubmit: handleSubmit,
            onCancel: closeModal,
        },
    };
};