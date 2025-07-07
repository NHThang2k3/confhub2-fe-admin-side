// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/ModalFooter.tsx
import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface ModalFooterProps {
    step: 'map' | 'review';
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isNextDisabled: boolean;
    t: (key: string) => string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ step, onBack, onNext, onSubmit, isNextDisabled, t }) => {
    return (
        <div className="flex justify-between w-full">
            {step === 'review' ? (
                <button onClick={onBack} className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-20">
                    <ArrowLeft className="h-4 w-4 mr-2" /> {t('backButton')}
                </button>
            ) : <div />}

            {step === 'map' ? (
                <button onClick={onNext} disabled={isNextDisabled} className="flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('nextButton')} <ArrowRight className="h-4 w-4 ml-2" />
                </button>
            ) : (
                <button onClick={onSubmit} className="flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" /> {t('confirmButton')}
                </button>
            )}
        </div>
    );
};

export default ModalFooter;