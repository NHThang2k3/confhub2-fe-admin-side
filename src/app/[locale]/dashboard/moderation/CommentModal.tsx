// src/components/Moderation/CommentModal.tsx

import React from 'react';
import { ConferenceStatus } from '@/src/types'; // Import ConferenceStatus

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    {targetStatus === 'approved' && 'Approve'}
                    {targetStatus === 'rejected' && 'Reject'}
                    {targetStatus === 'pending' && 'Set to Pending'}
                    {' '}Conference
                </h3>
                <p className="mb-4 text-gray-700">Please provide a comment:</p>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`w-full rounded border p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    placeholder="Enter comment here..."
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
                        className={`rounded px-4 py-2 text-sm text-white
                            ${targetStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                                targetStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                                'bg-blue-500 hover:bg-blue-600'
                            }
                        `}
                    >
                        {targetStatus === 'approved' && 'Approve'}
                        {targetStatus === 'rejected' && 'Reject'}
                        {targetStatus === 'pending' && 'Set Pending'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;