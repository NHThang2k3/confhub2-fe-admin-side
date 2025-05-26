import React from 'react';
import { FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface ErrorScreenProps {
    error: string | null;
    onRetry: () => void;
    children?: React.ReactNode; // To allow embedding header or other static elements
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry, children }) => {
    // Khởi tạo t với namespace 'ErrorScreen'
    const t = useTranslations('ErrorScreen');

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-red-50 min-h-screen font-sans">
            {children}
            <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600 font-semibold">
                <FaExclamationTriangle size={32} className="mb-4 text-red-500" />
                {t('errorMessagePrefix')}: {/* Sử dụng t() */}
                <p className="text-sm mt-2 text-center max-w-md">{error}</p> {/* `error` là prop, không cần dịch */}
                <button onClick={onRetry} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center">
                    <FaSyncAlt className="mr-2" /> {t('retryButton')} {/* Sử dụng t() */}
                </button>
            </div>
        </div>
    );
};

export default ErrorScreen;