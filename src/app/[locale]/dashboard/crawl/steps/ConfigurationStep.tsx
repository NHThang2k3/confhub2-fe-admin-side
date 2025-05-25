import React, { useState } from 'react';
import { ApiName, CrawlModelType } from '@/src/hooks/crawl/useConferenceCrawl';

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
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

// Define descriptions for model types (outside the component for better performance)
const modelDescriptions: Record<CrawlModelType, string> = {
  'non-tuned': 'A versatile model suitable for general content. Good balance of speed and accuracy.',
  'tuned': 'A highly optimized model fine-tuned for specific patterns, offering superior accuracy for specific tasks.',
};

// Define descriptions for each API step (outside the component)
const apiDescriptions: Record<ApiName, { name: string; purpose: string }> = {
  determineLinks: {
    name: 'Main Links Identification',
    purpose: 'This API analyzes the crawled content to identify and extract primary links, such as those leading to Call for Papers (CFP) and Important Dates (IMP) sections.',
  },
  extractInfo: {
    name: 'General Conference Information Extraction',
    purpose: 'This API extracts core conference details including key dates (submission, notification, conference dates), location, main topics, and organizers.',
  },
  extractCfp: {
    name: 'Call for Papers (CFP) Content Extraction',
    purpose: 'This API specializes in extracting the full text and key elements of the Call for Papers, often including a summary of topics, guidelines, and submission procedures.',
  },
};


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
  onNext,
  onPrev,
  canProceed,
}) => {
  // State to manage which API description panels are open
  const [openApiDescriptions, setOpenApiDescriptions] = useState<Record<ApiName, boolean>>(() =>
    apiStepsForUploader.reduce((acc, step) => ({ ...acc, [step.name]: false }), {} as Record<ApiName, boolean>)
  );

  const toggleDescription = (apiName: ApiName) => {
    setOpenApiDescriptions(prev => ({
      ...prev,
      [apiName]: !prev[apiName],
    }));
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-5 bg-white shadow-md mb-6">
      {/* Header with adjusted styling */}
      <div className="pb-3 border-b border-gray-200 mb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">Step 3: Configure Process Settings</h3>
        <p className="mt-1 text-sm text-gray-600">Adjust the settings for data processing and API model selection to optimize the crawling and extraction process.</p>
      </div>
      
      {/* Main content in two columns on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Column 1: Chunking Configuration */}
        <div>
          <div className='rounded-md border border-gray-200 bg-gray-5 p-5 space-y-4 shadow-sm h-full'>
            <h4 className='text-base font-semibold text-gray-800'>Chunking Configuration</h4>
            <p className="text-sm text-gray-600 mb-3">
              Chunking helps break large documents into smaller, manageable pieces for more efficient processing and better API performance.
            </p>
            
            {/* Chunking Enablement */}
            <div className='flex items-center mb-2'>
              <input
                id='enable-chunking'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed'
                checked={enableChunking}
                onChange={e => setEnableChunking(e.target.checked)}
                disabled={isCrawling}
              />
              <label
                htmlFor='enable-chunking'
                className={`ml-2 text-sm font-medium text-gray-900 ${isCrawling ? 'opacity-60' : 'cursor-pointer'}`}
              >
                Enable Document Chunking
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Select this option to automatically split documents into smaller chunks.
            </p>

            {/* Chunk Size Input */}
            <div
              className={`flex items-center transition-opacity duration-200 ${!enableChunking ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <label
                htmlFor='chunk-size'
                className='mr-2 block text-sm font-medium text-gray-700'
              >
                Chunk Size (1-50):
              </label>
                <input
                id='chunk-size'
                type='number'
                min='1'
                max='50'
                className='w-20 rounded-md border border-gray-300 py-1.5 px-2 shadow-sm text-gray-900 
                           focus:border-blue-500 focus:ring-blue-500 focus:ring-1 
                           disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-sm'
                value={chunkSize}
                onChange={e =>
                  setChunkSize(
                    Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1))
                  )
                }
                disabled={!enableChunking || isCrawling}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Defines the maximum number of text units per chunk. Smaller chunks may increase processing time but improve accuracy.
            </p>
          </div>
        </div>

        {/* Column 2: API Model Selection */}
        <div>
          <div className="rounded-md border border-gray-200 bg-gray-5 p-5 space-y-4 shadow-sm h-full">
            <h4 className='text-base font-semibold text-gray-800'>API Model Selection</h4>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select the appropriate AI model for each data extraction and processing API step. <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-gray-500 mb-4">
                Choose between 'Non-Tuned' (general purpose) or 'Tuned' (fine-tuned for specific tasks, if available) models.
            </p>
            
            <div className="space-y-4">
                {apiStepsForUploader.map(step => (
                <div key={step.name} className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                    <label className='block text-xs font-semibold text-gray-700 mb-1.5'>{step.displayName}:</label>
                    <div className='flex flex-wrap gap-x-5 gap-y-2'>
                    {(['non-tuned', 'tuned'] as CrawlModelType[]).map(modelValue => {
                        const isDisabled = isCrawling || (step.name === 'extractCfp' && modelValue === 'tuned'); 
                        return (
                        <div key={modelValue} className='flex items-center'>
                            <input
                                id={`model-${step.name}-${modelValue}`}
                                name={`model-${step.name}`}
                                type='radio'
                                value={modelValue}
                                checked={apiModels[step.name] === modelValue}
                                onChange={() => setApiModel(step.name, modelValue)}
                                disabled={isDisabled}
                                className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed'
                            />
                            <label
                                htmlFor={`model-${step.name}-${modelValue}`}
                                className={`ml-2 block text-sm font-medium text-gray-900 capitalize 
                                            ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {modelValue.replace('-', ' ')}
                            </label>
                            {step.name === 'extractCfp' && modelValue === 'tuned' && isDisabled && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">Temporarily disabled</span>
                            )}
                        </div>
                        );
                    })}
                    </div>
                    {/* Collapsible description */}
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => toggleDescription(step.name)}
                            className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                            {openApiDescriptions[step.name] ? 'Hide Details' : 'Show Details'}
                            <svg className={`ml-1 h-3 w-3 transition-transform duration-200 ${openApiDescriptions[step.name] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        {openApiDescriptions[step.name] && (
                            <div className={`mt-2 transition-all duration-300 ease-in-out ${isCrawling ? 'opacity-60' : ''}`}>
                                <p className="text-xs text-gray-600 mb-1">
                                    <span className="font-semibold">{apiDescriptions[step.name].name}:</span> {apiDescriptions[step.name].purpose}
                                </p>
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Model Capabilities:</span>
                                    <br/>
                                    <span className="font-semibold capitalize">Non-Tuned:</span> {modelDescriptions['non-tuned']}
                                    <br/>
                                    {step.name !== 'extractCfp' && ( // Only show Tuned description if not disabled
                                      <>
                                        <span className="font-semibold capitalize">Tuned:</span> {modelDescriptions['tuned']}
                                      </>
                                    )}
                                    {step.name === 'extractCfp' && ( // Show disabled message for Tuned CFP
                                      <span className="text-red-500 italic">(Tuned model for CFP is temporarily unavailable)</span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                    {apiModels[step.name] === null && !isCrawling && (
                        <p className="text-xs text-red-600 mt-1.5">Please select a model for {step.displayName.replace(' Model', '')}.</p>
                    )}
                </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning message for API Model selection (outside columns for full width) */}
      {!allModelsSelected && !isCrawling && (
          <p className="text-sm text-red-600 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-md">
              <span className="font-semibold">Important:</span> Please select a model for all API steps before proceeding.
          </p>
      )}

      {/* Navigation Buttons (at the bottom, full width) */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isCrawling}
          className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-5 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Previous: Select Conferences
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isCrawling}
          className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
        >
          Next: Start Processing
        </button>
      </div>
    </div>
  );
};

export default ConfigurationStep;