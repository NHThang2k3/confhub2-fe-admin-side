// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/ReviewStep.tsx
import React from 'react';
import { Conference } from './types';

interface ReviewStepProps {
    missingOptionalHeaders: string[];
    isDbImport: boolean;
    finalData: Conference[];
    finalHeaders: string[];
    t: (key: string, values?: any) => string;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
    missingOptionalHeaders,
    isDbImport,
    finalData,
    finalHeaders,
    t
}) => {
    if (finalHeaders.length === 0) {
        return <div className="text-gray-500">{t('noHeadersMapped')}</div>;
    }

    return (
        <div>
            {missingOptionalHeaders.length > 0 && isDbImport && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded-md text-sm text-blue-800">
                    <p><strong>{t('reviewWarningTitle')}</strong></p>
                    <p>{t('reviewWarningText', { fields: missingOptionalHeaders.join(', ') })}</p>
                </div>
            )}
            <h4 className="font-semibold mb-2">{t('finalPreviewTitle')} ({finalData.length} {t('records')})</h4>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-20">
                        <tr>
                            {finalHeaders.map(header => (
                                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {finalData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {finalHeaders.map(header => {
                                    const modelKey = (header.charAt(0).toLowerCase() + header.slice(1).replace(/ [0-9]/g, (match) => match.trim().toUpperCase())) as keyof Conference;
                                    const cellValue = row[modelKey];
                                    return (
                                        <td key={header} className={`px-4 py-2 text-sm text-gray-600 ${header === 'Title' ? '' : 'whitespace-nowrap'}`} title={String(cellValue)}>
                                            <div className={header === 'Title' ? 'truncate max-w-md' : ''}>
                                                {String(cellValue)}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewStep;