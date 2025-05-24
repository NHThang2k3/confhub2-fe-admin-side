// src/components/crawl/ConferenceCrawlUploader.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useConferenceCrawl, ApiName, CrawlModelType } from '@/src/hooks/crawl/useConferenceCrawl';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// Import các component con cho từng bước
import FileUploadStep from './steps/FileUploadStep';
import ConferenceSelectionStep from './steps/ConferenceSelectionStep';
import ConfigurationStep from './steps/ConfigurationStep';
import ProcessingStep from './steps/ProcessingStep';
import StepperNavigation from './steps/StepperNavigation'; // Optional: for visual steps

const apiStepsForUploader: { name: ApiName; displayName: string }[] = [
    { name: "determineLinks", displayName: "Determine Links Model" },
    { name: "extractInfo", displayName: "Extract Information Model" },
    { name: "extractCfp", displayName: "Extract CFP Model" },
];


const STEPS = [
  { id: 1, name: 'Import CSV' },
  { id: 2, name: 'Select Conferences' },
  { id: 3, name: 'Configure Settings' }, // Đổi tên để rõ ràng hơn
  { id: 4, name: 'Process & View Status' }, // Thêm bước 4
];

export const ConferenceCrawlUploader: React.FC = () => {
  const crawlHook = useConferenceCrawl();
  const [currentStep, setCurrentStep] = useState(STEPS[0].id);

  const {
    file,
    parsedData,
    isParsing,
    parseError,
    selectedCsvRows,
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

  const canProceedToStep3 = useMemo(() => {
    return selectedCsvRows && selectedCsvRows.length > 0;
  }, [selectedCsvRows]);

  const allModelsSelected = useMemo(() => {
    return apiStepsForUploader.every(step => apiModels[step.name] !== null);
  }, [apiModels]);

  const canProceedToStep4 = useMemo(() => { // Logic mới cho việc chuyển sang bước 4
    return canProceedToStep3 && allModelsSelected; // Phải chọn đủ model để chuyển sang bước xử lý
  }, [canProceedToStep3, allModelsSelected]);

  const canStartProcessing = useMemo(() => { // Logic giữ nguyên cho việc bắt đầu xử lý
    return canProceedToStep4 && !isCrawling;
  }, [canProceedToStep4, isCrawling]);


  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4) { // Thêm logic cho bước 3 -> 4
        setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 4) { // Thêm logic cho bước 4 -> 3
        setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Optionally clear selections or keep them
      setCurrentStep(1);
    }
  };

  const handleReset = () => {
    resetCrawl(); // This should also clear parsedData, file, etc. from the hook
    setCurrentStep(1);
  };

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      <h2 className='mb-6 border-b border-gray-300 pb-3 text-xl font-semibold text-gray-700'>
        Process Conferences (Step by Step)
      </h2>

      {/* Optional Stepper Navigation */}
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
            selectedCsvRowsCount={selectedCsvRows.length}
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
            onNext={handleNextStep} // Thêm onNext và onPrev
            onPrev={handlePrevStep}
            canProceed={canProceedToStep4} // Logic cho ConfigurationStep có thể tiến tới bước tiếp theo
          />
        )}

        {currentStep === 4 && ( // Hiển thị ProcessingStep ở bước 4
            <ProcessingStep
                isCrawling={isCrawling}
                crawlError={crawlError}
                crawlProgress={crawlProgress}
                crawlMessages={crawlMessages}
                enableChunking={enableChunking}
                onStartProcess={startCrawlFromCsv}
                onResetAll={handleReset}
                canStartProcess={canStartProcessing}
                onPrev={handlePrevStep} // Giữ nguyên onPrev
            />
        )}
      </div>
    </div>
  );
};

export default ConferenceCrawlUploader;