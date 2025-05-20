// src/components/modals/CrawlModelSelectModal.tsx (Tạo file mới)
import React from 'react';
import { CrawlModelType } from '@/src/hooks/crawl/useConferenceCrawl';

interface CrawlModelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedModel: CrawlModelType) => void;
  currentGlobalModel: CrawlModelType; // Để gợi ý model hiện tại
  itemCount: number;
}

const CrawlModelSelectModal: React.FC<CrawlModelSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentGlobalModel,
  itemCount,
}) => {
  const [selectedModel, setSelectedModel] = React.useState<CrawlModelType>(currentGlobalModel);

  React.useEffect(() => {
    // Reset selected model to current global model when modal reopens or currentGlobalModel changes
    setSelectedModel(currentGlobalModel);
  }, [isOpen, currentGlobalModel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
          Select Crawl Model
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          You are about to re-crawl <strong>{itemCount}</strong> selected conference(s).
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Please choose the model type for this operation:
        </p>

        <div className="space-y-3 mb-6">
          <div>
            <label htmlFor="non-tuned-model" className="flex items-center cursor-pointer">
              <input
                type="radio"
                id="non-tuned-model"
                name="crawlModel"
                value="non-tuned"
                checked={selectedModel === 'non-tuned'}
                onChange={() => setSelectedModel('non-tuned')}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-3 block text-sm font-medium text-gray-700">
                Non-Tuned Model
              </span>
            </label>
            <p className="ml-7 text-xs text-gray-500">General purpose, good for diverse or new conferences.</p>
          </div>
          <div>
            <label htmlFor="tuned-model" className="flex items-center cursor-pointer">
              <input
                type="radio"
                id="tuned-model"
                name="crawlModel"
                value="tuned"
                checked={selectedModel === 'tuned'}
                onChange={() => setSelectedModel('tuned')}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-3 block text-sm font-medium text-gray-700">
                Tuned Model
              </span>
            </label>
            <p className="ml-7 text-xs text-gray-500">Optimized for specific patterns, potentially higher accuracy for known types.</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Start Crawl
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrawlModelSelectModal;