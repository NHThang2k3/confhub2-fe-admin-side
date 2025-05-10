// src/components/chatbot/EmailConfirmationDialog.tsx (or appropriate path)
import React, { useState, useEffect, useRef } from 'react';
import { ConfirmSendEmailAction } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  data: ConfirmSendEmailAction | null;
  onConfirm: (confirmationId: string) => void;
  onCancel: (confirmationId: string) => void;
  onClose: () => void; // Generic close handler
}

const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  isOpen,
  data,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (isOpen && data) {
      const initialTime = Math.ceil(data.timeoutMs / 1000);
      setTimeLeft(initialTime);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            onClose();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Cleanup timer if dialog closes or data changes
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(0); // Reset time
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, data, onClose]); // Rerun effect if isOpen or data changes

  if (!isOpen || !data) {
    return null;
  }

  const handleConfirmClick = () => {
    onConfirm(data.confirmationId);
    onClose(); // Close dialog immediately on action
  };

  const handleCancelClick = () => {
    onCancel(data.confirmationId);
    onClose(); // Close dialog immediately on action
  };

  // Simple modal structure (adapt styling as needed, maybe reuse SupportForm's card style)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Confirm Email Action
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Please review the details below before confirming to send the email.
        </p>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{data.subject}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {/* Translate the request type */}
              {data.requestType === 'contact' ? 'Contact Request' : 'Report'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Message:</span>
            {/* Use pre-wrap to preserve formatting */}
            <p className="mt-1 whitespace-pre-wrap rounded bg-gray-100 p-2 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {data.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleConfirmClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            Confirm
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {`Time left: ${timeLeft} seconds`}
          </span>
          <button
            onClick={handleCancelClick}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationDialog;