// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/MappingStep.tsx
import React from 'react';
import HeaderDropdown from './HeaderDropdown';

interface MappingStepProps {
    showHeaders: boolean;
    missingRequiredHeaders: string[];
    originalHeaders: string[];
    tableData: any[];
    headerMap: Record<string, string>;
    availableDropdownOptions: string[];
    mappedHeaders: string[];
    onHeaderChange: (csvHeader: string, newHeader: string | null) => void;
    t: (key: string) => string; // Pass translation function as a prop
}

const MappingStep: React.FC<MappingStepProps> = ({
    showHeaders,
    missingRequiredHeaders,
    originalHeaders,
    tableData,
    headerMap,
    availableDropdownOptions,
    mappedHeaders,
    onHeaderChange,
    t
}) => {
    const titleOriginalHeader = Object.keys(headerMap).find(key => headerMap[key] === 'Title');

    return (
        <div>
            {/* <div className="flex items-center space-x-2 mb-4">
                <input type="checkbox" id="show-headers" checked={showHeaders} disabled={true} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
                <label htmlFor="show-headers" className="text-sm font-medium text-gray-700">{t('createHeader')}</label>
            </div> */}
            {missingRequiredHeaders.length > 0 && showHeaders && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-800">
                    {t('requiredFieldsWarning')}: <strong>{missingRequiredHeaders.join(', ')}</strong>
                </div>
            )}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    {showHeaders && (
                        <thead className="bg-gray-20">
                            <tr>
                                {originalHeaders.map(header => (
                                    <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top">
                                        <HeaderDropdown
                                            csvHeader={header}
                                            options={availableDropdownOptions}
                                            selected={headerMap[header]}
                                            usedOptions={mappedHeaders}
                                            onChange={onHeaderChange}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {originalHeaders.map(header => (
                                    <td key={header} className={`px-4 py-2 text-sm text-gray-600 ${header === titleOriginalHeader ? '' : 'whitespace-nowrap'}`} title={row[header]}>
                                        <div className={header === titleOriginalHeader ? 'truncate max-w-md' : ''}>
                                            {row[header]}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MappingStep;