import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
    text?: string;
    size?: number;
}

export const LoadingSpinner = ({ text = "Loading...", size = 48 }: LoadingSpinnerProps) => {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-gray-500 dark:text-gray-400">
            <FiLoader size={size} className="animate-spin mb-4" />
            <p className="text-lg">{text}</p>
        </div>
    );
};