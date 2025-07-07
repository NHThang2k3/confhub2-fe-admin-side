// src/app/[locale]/dashboard/logAnalysis/modals/ImportDatabaseConfirmationModal.tsx
import React from 'react';
import Modal from './Modal';
import { useTranslations } from 'next-intl';
import { Database, SkipForward } from 'lucide-react';

interface ImportDatabaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSkip: () => void;
}

const ImportDatabaseConfirmationModal: React.FC<ImportDatabaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
}) => {
  const t = useTranslations('ImportDatabaseConfirmationModal');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">{t('description')}</p>
        <div className="flex flex-col space-y-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Database className="mr-2 h-5 w-5" />
            {t('importButton')}
          </button>
          <button
            onClick={onSkip}
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <SkipForward className="mr-2 h-5 w-5" />
            {t('skipButton')}
          </button>
        </div>
        <p className="text-xs text-gray-500 pt-2">{t('note')}</p>
      </div>
    </Modal>
  );
};

export default ImportDatabaseConfirmationModal;