// src/app/[locale]/dashboard/logAnalysis/modals/WarningConfirmationModal.tsx
import React from 'react';
import Modal from './Modal';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

interface WarningConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  missingFields: string[];
}

const WarningConfirmationModal: React.FC<WarningConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  missingFields,
}) => {
  const t = useTranslations('WarningConfirmationModal');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <div className="flex flex-col items-center text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg font-semibold text-gray-800">{t('header')}</p>
        <p className="mt-2 text-sm text-gray-600">
          {t('description')}
        </p>
        <div className="mt-3 text-sm text-gray-500 font-medium">
            {missingFields.join(', ')}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          {t('confirmationPrompt')}
        </p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-20"
        >
          {t('cancelButton')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
        >
          {t('confirmButton')}
        </button>
      </div>
    </Modal>
  );
};

export default WarningConfirmationModal;