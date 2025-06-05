// src/app/[locale]/dashboard/logAnalysis/analysis/DeletionStatusDisplay.tsx
import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
// Import the correct, exported type
import { RequestDeletionResultFE } from '@/src/hooks/logAnalysis/useDeleteLogRequests';

interface DeletionStatusDisplayProps {
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    detailedResults: RequestDeletionResultFE[] | null; // Use the correct type here
    onClearMessages: () => void;
}

const DeletionStatusDisplay: React.FC<DeletionStatusDisplayProps> = ({
    isLoading,
    error,
    successMessage,
    detailedResults,
    onClearMessages,
}) => {
    const t = useTranslations('AnalysisPage');
    const tCommon = useTranslations('Common');

    if (!isLoading && !error && !successMessage) return null;

    const getStatusColorClasses = () => {
        if (error) return 'bg-red-100 border-red-300 text-red-700';
        if (successMessage) {
            const someFailed = detailedResults?.some(r => !r.overallSuccess);
            return someFailed ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-green-100 border-green-300 text-green-700';
        }
        return 'bg-blue-100 border-blue-300 text-blue-700'; // For loading
    };

    const Icon = error ? FaTimesCircle : (successMessage && !(detailedResults?.some(r => !r.overallSuccess)) ? FaCheckCircle : FaExclamationTriangle);

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-full max-w-md p-1">
            <div className={`relative p-4 pr-10 rounded-md shadow-lg border ${getStatusColorClasses()}`}>
                <button
                    onClick={onClearMessages}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label={tCommon('close')}
                >
                    <FaTimesCircle size={18} />
                </button>
                <div className="flex items-start">
                    <Icon className={`mr-3 h-6 w-6 flex-shrink-0 ${error ? 'text-red-500' : (successMessage && !(detailedResults?.some(r => !r.overallSuccess)) ? 'text-green-500' : 'text-yellow-500')}`} />
                    <div>
                        <p className="font-semibold text-sm">
                            {isLoading ? t('deleteAction.loading') : (error ? t('deleteAction.errorTitle') : t('deleteAction.statusTitle'))}
                        </p>
                        <p className="text-xs mt-1">
                            {isLoading ? t('deleteAction.processing') : (error || successMessage)}
                        </p>
                        {detailedResults && (error || successMessage) && (
                            <ul className="text-xs mt-2 list-disc list-inside max-h-24 overflow-y-auto">
                                {detailedResults.map(r => (
                                    <li key={r.requestId} className={r.overallSuccess ? 'text-green-700' : 'text-red-700'}>
                                        {r.requestId}: {r.overallSuccess ? t('deleteAction.deletedSuccessfully') : (r.errorMessage || t('deleteAction.deletionFailed'))}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeletionStatusDisplay;