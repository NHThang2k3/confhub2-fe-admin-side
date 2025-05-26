// src/components/crawl/ConferenceCrawlUploader.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useConferenceCrawl, ApiName, CrawlModelType } from '@/src/hooks/crawl/useConferenceCrawl';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// Import các component con cho từng bước
import FileUploadStep from './steps/FileUploadStep';
import ConferenceSelectionStep from './steps/ConferenceSelectionStep'; // Correct path if it's in a subfolder of steps
import ConfigurationStep from './steps/ConfigurationStep';
import ProcessingStep from './steps/ProcessingStep';
import StepperNavigation from './steps/StepperNavigation';
import { useTranslations } from 'next-intl';
const apiStepsForUploader: { name: ApiName; displayName: string }[] = [
  { name: "determineLinks", displayName: "Determine Links Model" },
  { name: "extractInfo", displayName: "Extract Information Model" },
  { name: "extractCfp", displayName: "Extract CFP Model" },
];

const STEPS = [
  { id: 1, name: 'Import CSV' },
  { id: 2, name: 'Select Conferences' },
  { id: 3, name: 'Configure Settings' },
  { id: 4, name: 'Process & View Status' },
];

export const ConferenceCrawlUploader: React.FC = () => {
  const t = useTranslations('ConferenceCrawlUploader');
  const apiStepsForUploader: { name: ApiName; displayName: string }[] = useMemo(() => [
      { name: "determineLinks", displayName: t('apiSteps.determineLinksModel') },
      { name: "extractInfo", displayName: t('apiSteps.extractInfoModel') },
      { name: "extractCfp", displayName: t('apiSteps.extractCfpModel') },
  ], [t]); // Thêm t vào dependency array

  const STEPS = useMemo(() => [
    { id: 1, name: t('steps.importCsv') },
    { id: 2, name: t('steps.selectConferences') },
    { id: 3, name: t('steps.configureSettings') },
    { id: 4, name: t('steps.processAndViewStatus') },
  ], [t]); // Thêm t vào dependency array

  const crawlHook = useConferenceCrawl();
  const [currentStep, setCurrentStep] = useState(STEPS[0].id);

  const {
    file,
    parsedData,
    isParsing,
    parseError,
    selectedCsvRows, // This is used for canProceedToStep3
    apiModels,
    isCrawling,
    startCrawlFromCsv,
    resetCrawl,
    enableChunking,
    chunkSize,
    crawlError,
    crawlProgress,
    crawlMessages,
    setApiModel,
    setEnableChunking,
    setChunkSize,
    updateActionTypeOfSelectedRows,
  } = crawlHook;

  const canProceedToStep2 = useMemo(() => {
    return !!parsedData && parsedData.length > 0 && !isParsing && !parseError;
  }, [parsedData, isParsing, parseError]);

  // This logic correctly uses selectedCsvRows from the hook for global state
  const canProceedToStep3 = useMemo(() => {
    return selectedCsvRows && selectedCsvRows.length > 0;
  }, [selectedCsvRows]);

  const allModelsSelected = useMemo(() => {
    return apiStepsForUploader.every(step => apiModels[step.name] !== null);
  }, [apiModels, apiStepsForUploader]);

  const canProceedToStep4 = useMemo(() => {
    return canProceedToStep3 && allModelsSelected;
  }, [canProceedToStep3, allModelsSelected]);

  const canStartProcessing = useMemo(() => {
    return canProceedToStep4 && !isCrawling;
  }, [canProceedToStep4, isCrawling]);

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleReset = () => {
    resetCrawl();
    setCurrentStep(1);
  };

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      <h2 className='mb-6 border-b border-gray-300 pb-3 text-xl font-semibold text-gray-700'>
        {t('title')}
      </h2>

      <StepperNavigation steps={STEPS} currentStepId={currentStep} />

      <div className="mt-6">
        {currentStep === 1 && (
          <FileUploadStep
            file={file}
            isParsing={isParsing}
            parseError={parseError}
            parsedDataLength={parsedData?.length || 0}
            handleFileChange={crawlHook.handleFileChange}
            onNext={handleNextStep}
            canProceed={canProceedToStep2}
          />
        )}

        {currentStep === 2 && parsedData && (
          <ConferenceSelectionStep
            parsedData={parsedData}
            onSelectionChanged={crawlHook.onCsvSelectionChanged}
            // selectedCsvRowsCount={selectedCsvRows.length} // PROP REMOVED HERE
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={canProceedToStep3}
            onUpdateActionTypeForSelected={updateActionTypeOfSelectedRows}
          />
        )}

        {currentStep === 3 && (
          <ConfigurationStep
            enableChunking={enableChunking}
            setEnableChunking={setEnableChunking}
            chunkSize={chunkSize}
            setChunkSize={setChunkSize}
            apiModels={apiModels}
            setApiModel={setApiModel}
            apiStepsForUploader={apiStepsForUploader}
            isCrawling={isCrawling}
            allModelsSelected={allModelsSelected}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={canProceedToStep4}
          />
        )}

        {currentStep === 4 && (
          <ProcessingStep
            isCrawling={isCrawling}
            crawlError={crawlError}
            crawlProgress={crawlProgress}
            crawlMessages={crawlMessages}
            enableChunking={enableChunking}
            onStartProcess={startCrawlFromCsv}
            onResetAll={handleReset}
            canStartProcess={canStartProcessing}
            onPrev={handlePrevStep}
          />
        )}
      </div>
    </div>
  );
};

export default ConferenceCrawlUploader;