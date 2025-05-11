// src/components/Moderation/CommentModal.tsx

import React from 'react';
// Import ConferenceStatus - make sure this is updated in src/types.ts to use uppercase
import { ConferenceStatus } from '@/src/types';

interface CommentModalProps {
    show: boolean;
    targetStatus: ConferenceStatus | null; // This will be uppercase: 'PENDING', 'APPROVED', 'REJECTED'
    comment: string;
    commentError: string;
    setComment: (comment: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
    show,
    targetStatus,
    comment,
    commentError,
    setComment,
    onSubmit,
    onCancel,
}) => {
    if (!show) {
        return null;
    }

    // Determine button text and modal title based on targetStatus (uppercase)
    let modalTitle = '';
    let submitButtonText = '';
    let submitButtonColor = 'bg-blue-500 hover:bg-blue-600'; // Default color

    if (targetStatus === 'APPROVED') {
        modalTitle = 'Approve Conference';
        submitButtonText = 'Approve';
        submitButtonColor = 'bg-green-500 hover:bg-green-600';
    } else if (targetStatus === 'REJECTED') {
        modalTitle = 'Reject Conference';
        submitButtonText = 'Reject';
        submitButtonColor = 'bg-red-500 hover:bg-red-600';
    } else if (targetStatus === 'PENDING') {
        modalTitle = 'Set Conference to Pending';
        submitButtonText = 'Set Pending';
        submitButtonColor = 'bg-gray-500 hover:bg-gray-600'; // Or choose a grey/blue color
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                   {modalTitle} {/* Use dynamic title */}
                </h3>
                {/* Only show "provide comment" text if it's rejected or might require comment */}
                {/* Adjust this logic based on your moderation flow */}
                 {targetStatus === 'REJECTED' && <p className="mb-4 text-gray-700">Please provide a reason for rejection:</p>}
                 {/* Or if comment is required for all status changes */}
                 {/* <p className="mb-4 text-gray-700">Please provide a comment:</p> */}


                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`w-full rounded border p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    placeholder={targetStatus === 'REJECTED' ? "Enter rejection reason here..." : "Enter comment here..."} // Dynamic placeholder
                ></textarea>
                {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className={`rounded px-4 py-2 text-sm text-white ${submitButtonColor}`} 
                    >
                        {submitButtonText} {/* Use dynamic text */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;