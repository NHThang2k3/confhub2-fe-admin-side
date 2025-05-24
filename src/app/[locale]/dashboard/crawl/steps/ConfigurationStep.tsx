// src/appp/[locale]/dashboard/logAnalysis/steps/ConfigurationStep.tsx
import React from 'react';
import { ApiName, CrawlModelType } from '@/src/hooks/crawl/useConferenceCrawl'; // Adjust path if needed

interface ApiStepConfig {
  name: ApiName;
  displayName: string;
}
interface ConfigurationStepProps {
  enableChunking: boolean;
  setEnableChunking: (enabled: boolean) => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  apiModels: Record<ApiName, CrawlModelType | null>;
  setApiModel: (apiName: ApiName, modelType: CrawlModelType) => void;
  apiStepsForUploader: ApiStepConfig[];
  isCrawling: boolean;
  allModelsSelected: boolean;
  onNext: () => void; // Thêm onNext
  onPrev: () => void; // Thêm onPrev
  canProceed: boolean; // Thêm canProceed
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  enableChunking,
  setEnableChunking,
  chunkSize,
  setChunkSize,
  apiModels,
  setApiModel,
  apiStepsForUploader,
  isCrawling,
  allModelsSelected,
  onNext, // Nhận prop onNext
  onPrev, // Nhận prop onPrev
  canProceed, // Nhận prop canProceed
}) => {
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow mb-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 3: Configure Process Settings</h3>
      
      {/* Chunking Configuration */}
      <div className='rounded-md border border-gray-200 bg-gray-5 p-4 space-y-4'>
        <h4 className='text-md font-semibold text-gray-700'>Chunking Configuration</h4>
        <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0'>
          <div className='flex items-center'>
            <input
              id='enable-chunking'
              type='checkbox'
              className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              checked={enableChunking}
              onChange={e => setEnableChunking(e.target.checked)}
              disabled={isCrawling}
            />
            <label
              htmlFor='enable-chunking'
              className='ml-2 block text-sm text-gray-900'
            >
              Enable Chunking
            </label>
          </div>
          <div
            className={`flex items-center ${!enableChunking ? 'opacity-50' : ''}`}
          >
              <label
              htmlFor='chunk-size'
              className='mr-2 block text-sm font-medium text-gray-700'
            >
              Chunk Size (Max 50):
            </label>
              <input
              id='chunk-size'
              type='number'
              min='1'
              max='50'
              className='w-20 rounded-md border border-gray-300 p-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm'
              value={chunkSize}
              onChange={e =>
                setChunkSize(
                  Math.max(1, parseInt(e.target.value, 10) || 1)
                )
              }
              disabled={!enableChunking || isCrawling}
            />
          </div>
        </div>
      </div>

      {/* API Model Selection */}
      <div className="rounded-md border border-gray-200 bg-gray-5 p-4 space-y-4">
        <h4 className='text-md font-semibold text-gray-700'>API Model Selection</h4>
        <p className="text-sm font-medium text-gray-700">Select Model for Each API Step <span className="text-red-500">*</span>:</p>
        {apiStepsForUploader.map(step => (
          <div key={step.name}>
            <label className='block text-xs font-medium text-gray-600 mb-1'>{step.displayName}:</label>
            <div className='flex space-x-4'>
              {(['non-tuned', 'tuned'] as CrawlModelType[]).map(modelValue => (
                <div key={modelValue} className='flex items-center'>
                  <input
                    id={`model-${step.name}-${modelValue}`}
                    name={`model-${step.name}`}
                    type='radio'
                    value={modelValue}
                    checked={apiModels[step.name] === modelValue}
                    onChange={() => setApiModel(step.name, modelValue)}
                    disabled={isCrawling}
                    className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor={`model-${step.name}-${modelValue}`}
                    className='ml-2 block text-sm text-gray-900 capitalize'
                  >
                    {modelValue.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
              {apiModels[step.name] === null && !isCrawling && (
                  <p className="text-xs text-red-500 mt-1">Please select a model for {step.displayName.replace(' Model', '')}.</p>
            )}
          </div>
        ))}
         {!allModelsSelected && !isCrawling && (
            <p className="text-sm text-red-600 mt-2">
                Please select a model for all API steps before proceeding.
            </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isCrawling}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous: Select Conferences
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isCrawling}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Start Processing
        </button>
      </div>
    </div>
  );
};

export default ConfigurationStep;