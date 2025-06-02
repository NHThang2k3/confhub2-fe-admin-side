import React, { useState, useEffect } from 'react';
import { CrawlModelType, ApiModels, ApiName } from '@/src/hooks/crawl/conference/useConferenceCrawl';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl'; // Import ConferenceForAction

interface ProcessActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm giờ nhận ConferenceForAction[] đã được cập nhật crawlType
  onConfirm: (processedItems: ConferenceForAction[], selectedModels: ApiModels) => void;
  itemsToProcess: ConferenceForAction[]; // Danh sách các item được chọn từ bảng
}

const apiSteps: { name: ApiName, displayName: string, description: string }[] = [
    { name: "determineLinks", displayName: "Determine Links", description: "Finding relevant URLs for the conference." },
    { name: "extractInfo", displayName: "Extract Information", description: "Extracting key details from conference pages." },
    { name: "extractCfp", displayName: "Extract CFP", description: "Extracting Call for Papers information." },
];

const ProcessActionModal: React.FC<ProcessActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemsToProcess,
}) => {
  const [selectedApiModels, setSelectedApiModels] = useState<ApiModels>({
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
  });
  // State để lưu trữ lựa chọn action type cho batch
  const [batchActionType, setBatchActionType] = useState<'crawl' | 'update'>('crawl');
  const [showValidationError, setShowValidationError] = useState(false);
  const [showLinkWarning, setShowLinkWarning] = useState(false);

  const itemCount = itemsToProcess.length;

  useEffect(() => {
    if (isOpen) {
      setSelectedApiModels({
        determineLinks: null,
        extractInfo: null,
        extractCfp: null,
      });
      setBatchActionType('crawl'); // Reset action type khi modal mở
      setShowValidationError(false);
      setShowLinkWarning(false);
    }
  }, [isOpen]);

  const handleModelChange = (apiName: ApiName, model: CrawlModelType) => {
    setSelectedApiModels(prev => ({ ...prev, [apiName]: model }));
    if (showValidationError) setShowValidationError(false);
  };

  const handleActionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBatchActionType(event.target.value as 'crawl' | 'update');
    if (showLinkWarning) setShowLinkWarning(false);
  };

  const handleConfirm = () => {
    const allModelsSelected = Object.values(selectedApiModels).every(model => model !== null);
    if (!allModelsSelected) {
      setShowValidationError(true);
      return;
    }

    // Cập nhật crawlType cho tất cả items dựa trên batchActionType
    const updatedItems = itemsToProcess.map(item => ({
      ...item,
      crawlType: batchActionType,
    }));

    // Kiểm tra link nếu action là 'update'
    if (batchActionType === 'update') {
      const itemsMissingLinkForUpdate = updatedItems.filter(item => !item.link || item.link.trim() === '');
      if (itemsMissingLinkForUpdate.length > 0) {
        // Có thể hiển thị cảnh báo chi tiết hơn, hoặc chỉ một cảnh báo chung
        console.warn(`Warning: ${itemsMissingLinkForUpdate.length} item(s) marked for UPDATE are missing a 'link'. They will be processed as 'crawl'.`);
        setShowLinkWarning(true); // Hiển thị cảnh báo chung trong modal
        // Không chặn confirm, hook useConferenceCrawl sẽ xử lý fallback
      }
    }

    onConfirm(updatedItems, selectedApiModels);
    // onClose(); // Parent sẽ gọi onClose sau khi onConfirm hoàn tất
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
          Re-process Selected Conferences
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          You are about to re-process <strong>{itemCount}</strong> selected conference(s).
          Please choose the action type and model for each API operation.
        </p>

        {/* Action Type Selection */}
        <div className="mb-6 p-3 border rounded-md bg-gray-5">
          <label htmlFor="action-type-select" className="block text-md font-medium text-gray-800 mb-1">
            Action Type for All Selected:
          </label>
          <select
            id="action-type-select"
            value={batchActionType}
            onChange={handleActionTypeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="crawl">Crawl (New Data)</option>
            <option value="update">Update (Existing Data with Links)</option>
          </select>
          {batchActionType === 'update' && (
            <p className="text-xs text-gray-500 mt-1">
              'Update' requires the 'Link' field to be present for each conference. Missing links will default to 'Crawl'.
            </p>
          )}
        </div>

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
                <label htmlFor={`${step.name}-tuned`} className={`flex items-center cursor-pointer ${step.name === 'extractCfp' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    id={`${step.name}-tuned`}
                    name={step.name}
                    value="tuned"
                    checked={selectedApiModels[step.name] === 'tuned'}
                    onChange={() => handleModelChange(step.name, 'tuned')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    disabled={step.name === 'extractCfp'} // Khóa nếu là 'extractCfp'
                  />
                  <span className="ml-2 block text-sm font-medium text-gray-700">Tuned</span>
                </label>
                {step.name === 'extractCfp' && selectedApiModels[step.name] === 'tuned' && (
                    <p className="ml-2 text-xs text-red-500">Temporarily disabled</p> // Thông báo cho người dùng
                )}
              </div>
            </div>
          ))}
        </div>

        {showValidationError && (
            <p className="text-sm text-red-600 mb-3 text-center">
                Please select a model for all API steps.
            </p>
        )}
        {showLinkWarning && batchActionType === 'update' && (
            <p className="text-sm text-amber-700 bg-amber-100 p-2 rounded-md mb-3 text-center">
                Warning: Some items selected for 'Update' are missing a main link. They will be processed as 'Crawl' instead.
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
            Start Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessActionModal;