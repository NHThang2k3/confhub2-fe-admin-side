// src/components/crawl/ConferenceCrawlUploader.tsx
import React, { useState, useMemo } from 'react';
import { useConferenceCrawl } from '@/src/hooks/crawl/conference/useConferenceCrawl';
import { ApiName } from '@/src/models/logAnalysis/crawl.types';
// Import các component con cho từng bước
import FileUploadStep from './steps/FileUploadStep';
import ConferenceSelectionStep from './steps/ConferenceSelectionStep';
import ConfigurationStep from './steps/ConfigurationStep';
import ProcessingStep from './steps/ProcessingStep';
import StepperNavigation from './steps/StepperNavigation';
import { useTranslations } from 'next-intl';

export const ConferenceCrawlUploader: React.FC = () => {
  const t = useTranslations('ConferenceCrawlUploader');
  const apiStepsForUploader: { name: ApiName; displayName: string }[] = useMemo(() => [
    { name: "determineLinks", displayName: t('apiSteps.determineLinksModel') },
    { name: "extractInfo", displayName: t('apiSteps.extractInfoModel') },
    { name: "extractCfp", displayName: t('apiSteps.extractCfpModel') },
  ], [t]);

  const STEPS = useMemo(() => [
    { id: 1, name: t('steps.importCsv') },
    { id: 2, name: t('steps.selectConferences') },
    { id: 3, name: t('steps.configureSettings') },
    { id: 4, name: t('steps.processAndViewStatus') },
  ], [t]);

  const crawlHook = useConferenceCrawl();
  const [currentStep, setCurrentStep] = useState(STEPS[0].id);

  // Lấy tất cả các state và hàm cần thiết từ hook, bao gồm cả các hàm điều khiển mới
  const {
    // File Parser
    file,
    parsedData,
    isParsing,
    parseError,
    handleFileChange,
    // Selection Manager
    selectedCsvRows,
    onCsvSelectionChanged,
    updateActionTypeOfSelectedRows,
    // Config
    apiModels,
    enableChunking,
    chunkSize,
    chunkDelay, // <<< MỚI
    setApiModel,
    setEnableChunking,
    setChunkSize,
    setChunkDelay, // <<< MỚI
    // Runner
    isCrawling,
    isPaused, // <<< MỚI
    countdown, // <<< MỚI
    crawlError,
    crawlProgress,
    crawlMessages,
    processCrawlRequest, // <<< Dùng hàm gốc
    resumeCrawl, // <<< MỚI
    stopCrawl,
    // General
    resetCrawl,
  } = crawlHook;

  // --- Logic điều kiện (canProceed) giữ nguyên ---
  const canProceedToStep2 = useMemo(() => !!parsedData && parsedData.length > 0 && !isParsing && !parseError, [parsedData, isParsing, parseError]);
  const canProceedToStep3 = useMemo(() => selectedCsvRows.length > 0, [selectedCsvRows]);
  const allModelsSelected = useMemo(() => apiStepsForUploader.every(step => apiModels[step.name] !== null), [apiModels, apiStepsForUploader]);
  const canProceedToStep4 = useMemo(() => canProceedToStep3 && allModelsSelected, [canProceedToStep3, allModelsSelected]);
  const canStartProcessing = useMemo(() => canProceedToStep4 && !isCrawling, [canProceedToStep4, isCrawling]);

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
    // Không cho phép quay lại khi đang crawl để tránh trạng thái không nhất quán
    if (isCrawling) return;

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


  /**
  * Hàm điều phối chính để bắt đầu quá trình crawl.
  * Nó thu thập tất cả các cấu hình và gọi hàm processCrawlRequest từ hook.
  * @param description - Mô tả tùy chọn cho lần crawl này.
  */
  const handleStartCrawl = (description?: string) => {
    if (!canStartProcessing) return;

    processCrawlRequest(
      selectedCsvRows,
      apiModels,
      enableChunking,
      chunkSize,
      chunkDelay, // <<< TRUYỀN VÀO
      "CSV Selections",
      description
    );
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
            handleFileChange={handleFileChange}
            onNext={handleNextStep}
            canProceed={canProceedToStep2}
          />
        )}

        {currentStep === 2 && parsedData && (
          <ConferenceSelectionStep
            parsedData={parsedData}
            onSelectionChanged={onCsvSelectionChanged}
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
            chunkDelay={chunkDelay} // <<< TRUYỀN XUỐNG
            setChunkDelay={setChunkDelay} // <<< TRUYỀN XUỐNG
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
            isPaused={isPaused} // <<< TRUYỀN XUỐNG
            countdown={countdown} // <<< TRUYỀN XUỐNG
            crawlError={crawlError}
            crawlProgress={crawlProgress}
            crawlMessages={crawlMessages}
            enableChunking={enableChunking}
            onStartProcess={handleStartCrawl} // <<< Dùng hàm điều phối mới
            onResume={resumeCrawl} // <<< TRUYỀN XUỐNG
            onStopProcess={stopCrawl}
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