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

    // --- DERIVED DATA (MEMOS) ---
    const data = useMemo(() => initialData, [initialData]);
    const originalHeaders = useMemo(() => (data && data.length > 0 ? Object.keys(data[0]) : []), [data]);
    const mappedHeaders = useMemo(() => Object.values(headerMap), [headerMap]);
    const availableDropdownOptions = useMemo(() => isDbImport ? ALL_FIELDS : REQUIRED_FIELDS, [isDbImport]);
    const missingRequiredHeaders = useMemo(() => REQUIRED_FIELDS.filter(h => !mappedHeaders.includes(h)), [mappedHeaders]);
    const missingOptionalHeaders = useMemo(() => {
        if (!isDbImport) return [];
        return OPTIONAL_FIELDS.filter(field => !mappedHeaders.includes(field));
    }, [headerMap, isDbImport]);

    const finalData = useMemo(() => {
        if (!data || !showHeaders) return [];
        return data.map((row, index) => {
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
    }, [data, headerMap, showHeaders]);

    // --- EFFECTS ---
    useEffect(() => {
        if (isOpen) {
            setStep('map');
            setHeaderMap({});
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
        if (!data || data.length === 0) {
            return <div className="text-gray-500 flex items-center justify-center h-64"><AlertTriangle className="mr-2" />{t('noData')}</div>;
        }

        if (step === 'map') {
            return (
                <MappingStep
                    showHeaders={showHeaders}
                    missingRequiredHeaders={missingRequiredHeaders}
                    originalHeaders={originalHeaders}
                    tableData={data.slice(0, 10)}
                    headerMap={headerMap}
                    availableDropdownOptions={availableDropdownOptions}
                    mappedHeaders={mappedHeaders}
                    onHeaderChange={handleHeaderChange}
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
                    data && data.length > 0 ? (
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