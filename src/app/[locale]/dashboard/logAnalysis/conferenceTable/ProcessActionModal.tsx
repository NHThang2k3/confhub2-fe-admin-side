// src/app/[locale]/dashboard/logAnalysis/analysis/ProcessActionModal.tsx

import React, { useState, useEffect } from 'react';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';
import { CrawlModelType, ApiName, ApiModels } from '@/src/models/logAnalysis/crawl.types';
import { FaInfoCircle } from 'react-icons/fa';

interface ProcessActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // <<< THAY ĐỔI 1: Cập nhật signature của onConfirm
  onConfirm: (
    processedItems: ConferenceForAction[],
    selectedModels: ApiModels,
    description: string | undefined,
    recordFileOverride: boolean // Thêm tham số mới
  ) => void;
  itemsToProcess: ConferenceForAction[];
  // <<< THAY ĐỔI 2: Nhận giá trị recordFile chung
  globalRecordFile: boolean;
}

const apiSteps: { name: ApiName, displayName: string, description: string }[] = [
    { name: "determineLinks", displayName: "Determine Links", description: "Finding relevant URLs for the conference." },
    { name: "extractInfo", displayName: "Extract Information", description: "Extracting key details from conference pages." },
    { name: "extractCfp", displayName: "Extract CFP", description: "Extracting Call for Papers information." },
];

const MAX_DESCRIPTION_LENGTH = 200;

const ProcessActionModal: React.FC<ProcessActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemsToProcess,
  globalRecordFile, // <<< Nhận prop mới
}) => {
  const [selectedApiModels, setSelectedApiModels] = useState<ApiModels>({
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
  });
  const [batchActionType, setBatchActionType] = useState<'crawl' | 'update'>('crawl');
  const [description, setDescription] = useState<string>('');
  // <<< THAY ĐỔI 3: Thêm state cục bộ cho recordFile
  const [localRecordFile, setLocalRecordFile] = useState<boolean>(globalRecordFile);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showLinkWarning, setShowLinkWarning] = useState(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const itemCount = itemsToProcess.length;

  useEffect(() => {
    if (isOpen) {
      // Reset state khi modal mở
      setSelectedApiModels({ determineLinks: null, extractInfo: null, extractCfp: null });
      setBatchActionType('crawl');
      setDescription('');
      // <<< THAY ĐỔI 4: Đồng bộ state cục bộ với giá trị chung
      setLocalRecordFile(globalRecordFile);
      setShowValidationError(false);
      setShowLinkWarning(false);
    }
  }, [isOpen, globalRecordFile]);

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
    const updatedItems = itemsToProcess.map(item => ({ ...item, crawlType: batchActionType }));
    if (batchActionType === 'update') {
      const itemsMissingLinkForUpdate = updatedItems.filter(item => !item.link || item.link.trim() === '');
      if (itemsMissingLinkForUpdate.length > 0) {
        setShowLinkWarning(true);
      }
    }
    // <<< THAY ĐỔI 5: Truyền giá trị localRecordFile ra ngoài
    onConfirm(updatedItems, selectedApiModels, description.trim() || undefined, localRecordFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 mt-12 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all duration-300 scale-100">
        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-2">
          Re-process Selected Conferences
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          You are about to re-process <strong>{itemCount}</strong> conference(s).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="p-3 rounded-md border border-blue-100 bg-blue-50">
                <label htmlFor="recrawlDescription" className="block text-sm font-semibold text-blue-800 mb-1">
                    Request Description
                    <span className="text-gray-500 font-normal ml-1 text-xs">(Optional)</span>
                    <span
                        className="ml-1 inline-flex items-center cursor-help relative"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <FaInfoCircle className="h-3.5 w-3.5 text-blue-500" />
                        {showTooltip && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10 bottom-full mb-2">
                            Provide a note for this re-crawl request to help track it in logs.
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                        </div>
                        )}
                    </span>
                </label>
                <textarea
                    id="recrawlDescription"
                    name="recrawlDescription"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    placeholder="e.g., Re-crawling failed items"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <p className="mt-1 text-xs text-gray-600 text-right">{description.length}/{MAX_DESCRIPTION_LENGTH}</p>
            </div>

            <div className="p-3 border rounded-md bg-gray-10 space-y-2">
                <div>
                    <label htmlFor="action-type-select" className="block text-sm font-semibold text-gray-800 mb-1">
                        Action Type for All:
                    </label>
                    <select
                        id="action-type-select"
                        value={batchActionType}
                        onChange={handleActionTypeChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="crawl">Crawl (New Data)</option>
                        <option value="update">Update (Existing Data)</option>
                    </select>
                </div>
                {/* <<< THAY ĐỔI 6: Thêm checkbox cho recordFile */}
                <div className="flex items-center pt-2">
                    <input
                        id="record-file-override"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={localRecordFile}
                        onChange={(e) => setLocalRecordFile(e.target.checked)}
                    />
                    <label htmlFor="record-file-override" className="ml-2 text-sm font-medium text-gray-800 cursor-pointer">
                        Save output file on server
                    </label>
                </div>
            </div>
        </div>

        {/* <div className="mb-6 p-4 border rounded-md">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Model Selection for API Steps</h4>
            <div className="space-y-3">
                {apiSteps.map(step => (
                    <div key={step.name} className="grid grid-cols-3 items-center gap-4 p-2 rounded-md hover:bg-gray-10">
                        <div className="col-span-1">
                            <p className="text-sm font-medium text-gray-800">{step.displayName}</p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                        <div className="col-span-1 flex items-center space-x-6">
                            <label htmlFor={`${step.name}-non-tuned`} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-indigo-50">
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
                            <label htmlFor={`${step.name}-tuned`} className={`flex items-center p-2 rounded-md ${step.name === 'extractCfp' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50'}`}>
                                <input
                                    type="radio"
                                    id={`${step.name}-tuned`}
                                    name={step.name}
                                    value="tuned"
                                    checked={selectedApiModels[step.name] === 'tuned'}
                                    onChange={() => handleModelChange(step.name, 'tuned')}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    disabled={step.name === 'extractCfp'}
                                />
                                <span className="ml-2 block text-sm font-medium text-gray-700">Tuned</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div> */}

        {showValidationError && (
            <p className="text-sm text-red-600 mb-4 text-center font-medium">
                Please select a model for all API steps.
            </p>
        )}
        {showLinkWarning && batchActionType === 'update' && (
            <p className="text-sm text-amber-700 bg-amber-100 p-2 rounded-md mb-4 text-center">
                Warning: Some items for Update are missing a link and will be processed as Crawl.
            </p>
        )}

        <div className="flex justify-end space-x-3 border-t pt-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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