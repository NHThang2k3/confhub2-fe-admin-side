import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void; // Hàm callback để thử lại, là optional
}

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-8 rounded-lg">
            <FiAlertTriangle size={48} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">An Error Occurred</h3>
            <p className="text-center mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <FiRefreshCw className="mr-2" />
                    Try Again
                </button>
            )}
        </div>
    );
};