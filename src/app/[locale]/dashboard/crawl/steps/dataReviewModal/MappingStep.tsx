// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/MappingStep.tsx
import React from 'react';
import HeaderDropdown from './HeaderDropdown';

interface MappingStepProps {
    showHeaders: boolean;
    missingRequiredHeaders: string[];
    originalHeaders: string[];
    tableData: any[]; // Đây là 10 hàng đầu tiên của initialData
    headerMap: Record<string, string>;
    availableDropdownOptions: string[];
    mappedHeaders: string[];
    onHeaderChange: (csvHeader: string, newHeader: string | null) => void;
    removeHeaderRow: boolean; // BỔ SUNG: Prop mới
    setRemoveHeaderRow: React.Dispatch<React.SetStateAction<boolean>>; // BỔ SUNG: Prop mới
    t: (key: string) => string; // Pass translation function as a prop
}

const MappingStep: React.FC<MappingStepProps> = ({
    showHeaders,
    missingRequiredHeaders,
    originalHeaders,
    tableData, // Đây là tableData ban đầu (bao gồm hàng header nếu có)
    headerMap,
    availableDropdownOptions,
    mappedHeaders,
    onHeaderChange,
    removeHeaderRow, // BỔ SUNG
    setRemoveHeaderRow, // BỔ SUNG
    t
}) => {
    const titleOriginalHeader = Object.keys(headerMap).find(key => headerMap[key] === 'Title');

    // BỔ SUNG: Dữ liệu để hiển thị trong bảng preview, bỏ qua hàng đầu tiên nếu removeHeaderRow được chọn
    const previewTableData = React.useMemo(() => {
        return removeHeaderRow ? tableData.slice(1) : tableData;
    }, [tableData, removeHeaderRow]);


    return (
        <div>
            {/* BỔ SUNG: Checkbox cho phép loại bỏ hàng header */}
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="checkbox"
                    id="remove-header-row"
                    checked={removeHeaderRow}
                    onChange={(e) => setRemoveHeaderRow(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remove-header-row" className="text-sm font-medium text-gray-700">
                    {t('removeFirstRowAsHeader')} {/* Thêm key này vào file translations của bạn */}
                </label>
            </div>

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
                                {/* Headers dropdowns vẫn dựa trên originalHeaders (từ initialData[0]) */}
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
                        {/* Hiển thị previewTableData */}
                        {previewTableData.map((row, rowIndex) => (
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