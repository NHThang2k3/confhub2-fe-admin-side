// src/app/[locale]/dashboard/logAnalysis/CrawlModelSelectModal.tsx
import React, { useState, useEffect } from 'react';
import { CrawlModelType, ApiModels, ApiName } from '@/src/hooks/crawl/useConferenceCrawl'; // Correct path to useConferencesCrawl

interface CrawlModelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedModels: ApiModels) => void;
  // initialApiModels can be used to pre-fill if needed, e.g., from a global default or last used.
  // For now, we'll default to nulls internally to force selection.
  // initialApiModels?: Partial<ApiModels>; 
  itemCount: number;
}

const apiSteps: { name: ApiName, displayName: string, description: string }[] = [
    { name: "determineLinks", displayName: "Determine Links", description: "Finding relevant URLs for the conference." },
    { name: "extractInfo", displayName: "Extract Information", description: "Extracting key details from conference pages." },
    { name: "extractCfp", displayName: "Extract CFP", description: "Extracting Call for Papers information." },
];

const CrawlModelSelectModal: React.FC<CrawlModelSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}) => {
  const [selectedApiModels, setSelectedApiModels] = useState<ApiModels>({
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
  });
  const [showValidationError, setShowValidationError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset to nulls when modal opens to ensure fresh selection
      setSelectedApiModels({
        determineLinks: null, // Or 'non-tuned' if you want a default selected
        extractInfo: null,
        extractCfp: null,
      });
      setShowValidationError(false);
    }
  }, [isOpen]);

  const handleModelChange = (apiName: ApiName, model: CrawlModelType) => {
    setSelectedApiModels(prev => ({ ...prev, [apiName]: model }));
    setShowValidationError(false); // Hide error on change
  };

  const handleConfirm = () => {
    const allModelsSelected = Object.values(selectedApiModels).every(model => model !== null);
    if (!allModelsSelected) {
      setShowValidationError(true);
      return;
    }
    onConfirm(selectedApiModels);
    // onClose(); // onClose is typically called by the parent after onConfirm promise resolves or action taken
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
          Select Crawl Models for Each API Step
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          You are about to re-crawl <strong>{itemCount}</strong> selected conference(s).
          Please choose the model type for each API operation:
        </p>

        <div className="space-y-4 mb-6">
          {apiSteps.map(step => (
            <div key={step.name} className="p-3 border rounded-md bg-gray-5">
              <p className="text-md font-medium text-gray-800">{step.displayName}:</p>
              <p className="text-xs text-gray-500 mb-2">{step.description}</p>
              <div className="flex space-x-4">
                <label htmlFor={`${step.name}-non-tuned`} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id={`${step.name}-non-tuned`}
                    name={step.name}
                    value="non-tuned"
                    checked={selectedApiModels[step.name] === 'non-tuned'}
                    onChange={() => handleModelChange(step.name, 'non-tuned')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 block text-sm font-medium text-gray-700">Non-Tuned</span>
                </label>
                <label htmlFor={`${step.name}-tuned`} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id={`${step.name}-tuned`}
                    name={step.name}
                    value="tuned"
                    checked={selectedApiModels[step.name] === 'tuned'}
                    onChange={() => handleModelChange(step.name, 'tuned')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 block text-sm font-medium text-gray-700">Tuned</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {showValidationError && (
            <p className="text-sm text-red-600 mb-3 text-center">
                Please select a model for all API steps.
            </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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