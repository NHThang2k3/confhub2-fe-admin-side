// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/index.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

import Modal from './Modal';
import WarningConfirmationModal from './WarningConfirmationModal';
import MappingStep from './dataReviewModal/MappingStep';
import ReviewStep from './dataReviewModal/ReviewStep';
import ModalFooter from './dataReviewModal/ModalFooter';
import { ALL_FIELDS, OPTIONAL_FIELDS, REQUIRED_FIELDS } from './dataReviewModal/constants';
import { Conference, DataReviewModalProps } from './dataReviewModal/types';

const DataReviewModal: React.FC<DataReviewModalProps> = ({
    isOpen,
    onClose,
    initialData,
    isDbImport,
    onFinalize,
}) => {
    const t = useTranslations('DataReviewModal');

    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState<'map' | 'review'>('map');
    const [showHeaders] = useState(true); // Logic for toggling was removed, keeping state for consistency
    const [headerMap, setHeaderMap] = useState<Record<string, string>>({});
    const [isWarningModalOpen, setWarningModalOpen] = useState(false);
    // BỔ SUNG: Thêm state mới cho checkbox loại bỏ header
    const [removeHeaderRow, setRemoveHeaderRow] = useState(false); 

    // --- DERIVED DATA (MEMOS) ---
    // BỔ SUNG: Dữ liệu thực tế để hiển thị, loại bỏ hàng đầu tiên nếu removeHeaderRow là true
    const displayData = useMemo(() => {
        if (!initialData) return [];
        return removeHeaderRow ? initialData.slice(1) : initialData;
    }, [initialData, removeHeaderRow]);

    const originalHeaders = useMemo(() => (displayData && displayData.length > 0 ? Object.keys(displayData[0]) : []), [displayData]);
    const mappedHeaders = useMemo(() => Object.values(headerMap), [headerMap]);
    const availableDropdownOptions = useMemo(() => isDbImport ? ALL_FIELDS : REQUIRED_FIELDS, [isDbImport]);
    const missingRequiredHeaders = useMemo(() => REQUIRED_FIELDS.filter(h => !mappedHeaders.includes(h)), [mappedHeaders]);
    const missingOptionalHeaders = useMemo(() => {
        if (!isDbImport) return [];
        return OPTIONAL_FIELDS.filter(field => !mappedHeaders.includes(field));
    }, [headerMap, isDbImport]);

    const finalData = useMemo(() => {
        if (!displayData || !showHeaders) return []; // Sử dụng displayData ở đây
        return displayData.map((row, index) => {
            const newRow: Partial<Conference> & { id: string } = { id: `row-${Date.now()}-${index}` };
            Object.keys(headerMap).forEach(originalHeader => {
                const mappedKey = headerMap[originalHeader];
                if (mappedKey) {
                    const modelKey = mappedKey.charAt(0).toLowerCase() + mappedKey.slice(1).replace(/ [0-9]/g, (match) => match.trim().toUpperCase());
                    (newRow as any)[modelKey] = row[originalHeader];
                }
            });
            return newRow as Conference;
        }).filter(row => row.title && row.acronym);
    }, [displayData, headerMap, showHeaders]); // Thay đổi data thành displayData

    // --- EFFECTS ---
    useEffect(() => {
        if (isOpen) {
            setStep('map');
            setHeaderMap({});
            setRemoveHeaderRow(false); // Reset trạng thái khi mở modal
        }
    }, [isOpen]);

    // --- EVENT HANDLERS ---
    const handleHeaderChange = (csvHeader: string, newHeader: string | null) => {
        setHeaderMap(prev => {
            const newMap = { ...prev };
            Object.keys(newMap).forEach(key => {
                if (newMap[key] === newHeader) delete newMap[key];
            });
            if (newHeader) newMap[csvHeader] = newHeader;
            else delete newMap[csvHeader];
            return newMap;
        });
    };

    const handleNext = () => {
        // Nếu người dùng chọn removeHeaderRow, thì headers sẽ lấy từ hàng thứ 2,
        // nhưng MappingStep vẫn hiển thị hàng đầu tiên của initialData để chọn header.
        // Logic kiểm tra missingRequiredHeaders vẫn đúng vì nó dựa trên headerMap và availableDropdownOptions.
        if (missingRequiredHeaders.length === 0) setStep('review');
    };

    const handleSubmit = () => {
        if (missingOptionalHeaders.length > 0 && isDbImport) {
            setWarningModalOpen(true);
        } else {
            onFinalize(finalData);
        }
    };

    const handleForceSubmit = () => {
        setWarningModalOpen(false);
        onFinalize(finalData);
    };

    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (!initialData || initialData.length === 0) { // Vẫn kiểm tra initialData
            return <div className="text-gray-500 flex items-center justify-center h-64"><AlertTriangle className="mr-2" />{t('noData')}</div>;
        }

        if (step === 'map') {
            return (
                <MappingStep
                    showHeaders={showHeaders}
                    missingRequiredHeaders={missingRequiredHeaders}
                    originalHeaders={originalHeaders}
                    tableData={initialData.slice(0, 10)} // Vẫn truyền 10 hàng đầu tiên của initialData để người dùng xem và map
                    headerMap={headerMap}
                    availableDropdownOptions={availableDropdownOptions}
                    mappedHeaders={mappedHeaders}
                    onHeaderChange={handleHeaderChange}
                    removeHeaderRow={removeHeaderRow} // BỔ SUNG: Truyền prop mới
                    setRemoveHeaderRow={setRemoveHeaderRow} // BỔ SUNG: Truyền prop mới
                    t={t}
                />
            );
        }

        if (step === 'review') {
            return (
                <ReviewStep
                    missingOptionalHeaders={missingOptionalHeaders}
                    isDbImport={isDbImport}
                    finalData={finalData}
                    finalHeaders={Object.values(headerMap)}
                    t={t}
                />
            );
        }
        return null;
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={t('title')}
                size="7xl"
                footer={
                    initialData && initialData.length > 0 ? ( // Vẫn kiểm tra initialData
                        <ModalFooter
                            step={step}
                            onBack={() => setStep('map')}
                            onNext={handleNext}
                            onSubmit={handleSubmit}
                            isNextDisabled={missingRequiredHeaders.length > 0 || !showHeaders}
                            t={t}
                        />
                    ) : undefined
                }
            >
                {renderContent()}
            </Modal>
            <WarningConfirmationModal
                isOpen={isWarningModalOpen}
                onClose={() => setWarningModalOpen(false)}
                onConfirm={handleForceSubmit}
                missingFields={missingOptionalHeaders}
            />
        </>
    );
};

export default DataReviewModal;