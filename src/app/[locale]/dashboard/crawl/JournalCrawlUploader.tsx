// src/app/[locale]/dashboard/crawl/JournalCrawlUploader.tsx

import React, { useState } from 'react'
// Import the refactored hook and types
import { useJournalCrawl } from '@/src/hooks/crawl/journal/useJournalCrawl'
import { useJournalTableManager } from '@/src/hooks/crawl/useJournalTableManager'
// import { JournalTable } from './journalTable/JournalTable'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  FaFileUpload,
  FaSpinner,
  FaPlay,
  FaTimesCircle,
  FaExclamationTriangle,
  FaRedo,
  FaTable
} from 'react-icons/fa'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ValueFormatterParams, CellClassParams } from 'ag-grid-community'
import { AllCommunityModule, ModuleRegistry} from 'ag-grid-community'
import JournalSelectionStep from './steps/JournalSelectionStep'
import { useTranslations } from 'next-intl'
import { Journal } from '@/src/models/logAnalysis/importJournalCrawl'
import StepperNavigation from './steps/StepperNavigation'

ModuleRegistry.registerModules([AllCommunityModule]);

// Extended Journal interface for the response data
interface JournalWithStatus extends Journal {
    lastUpdated: string | null;
    message: string;
    actionType?: 'crawl' | 'update';
}

// Define steps for the journal crawl process
const JOURNAL_STEPS = [
    { id: 1, name: 'Upload' },
    { id: 2, name: 'Select Journals' },
    { id: 3, name: 'Review & Start' }
];

// --- Main Uploader Component ---
export const JournalCrawlUploader: React.FC = () => {
  const t = useTranslations('JournalCrawl')
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedJournals, setSelectedJournals] = useState<JournalWithStatus[]>([]);

  // Use the refactored journal hook
  const {
    file,
    parsedData,
    isParsing,
    parseError,
    isCrawling,
    crawlError,
    crawlProgress,
    crawlMessages,
    handleFileChange,
    startCrawl,
    resetCrawl
  } = useJournalCrawl()

  const tableManager = useJournalTableManager(parsedData || [])

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < JOURNAL_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle journal selection
  const handleSelectionChanged = (selectedRows: JournalWithStatus[]) => {
    setSelectedJournals(selectedRows);
  };

  // Handle action type update
  const handleUpdateActionType = (actionType: 'crawl' | 'update', journals: JournalWithStatus[]) => {
    const updatedJournals = journals.map(journal => ({
      ...journal,
      actionType
    }));
    setSelectedJournals(prev => 
      prev.map(journal => {
        const updated = updatedJournals.find(j => j.Issn === journal.Issn);
        return updated || journal;
      })
    );
  };

  // Determine if we can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Upload step
        return !!file && !isParsing && !parseError;
      case 2: // Selection step
        return selectedJournals.length > 0;
      case 3: // Review step
        return selectedJournals.length > 0 && !isCrawling;
      default:
        return false;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='flex flex-col space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                {t('fileLabel')}
              </label>
              <div className='flex items-center space-x-4'>
                <label
                  className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 ${isParsing || isCrawling ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <FaFileUpload className={`mr-2 ${isParsing ? 'animate-spin' : ''}`} />
                  <span>
                    {isParsing ? t('reading') : file ? t('changeFile') : t('chooseFile')}
                  </span>
                  <input
                    type='file'
                    className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                    accept='.csv, text/csv'
                    onChange={handleFileChange}
                    disabled={isParsing || isCrawling}
                  />
                </label>
                {file && !isParsing && (
                  <span className='min-w-0 flex-shrink truncate text-sm text-gray-600' title={file.name}>
                    {file.name}
                  </span>
                )}
                {isParsing && <FaSpinner className='animate-spin text-blue-500' />}
              </div>
              {parseError && (
                <p className='mt-2 flex items-center text-sm text-red-600'>
                  <FaSpinner className='mr-1' /> {parseError}
                </p>
              )}
            </div>
            <div className='flex justify-end'>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {t('nextStep')}
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <JournalSelectionStep
            parsedData={parsedData || []}
            onSelectionChanged={handleSelectionChanged}
            onNext={handleNext}
            onPrev={handlePrev}
            canProceed={canProceed()}
            onUpdateActionTypeForSelected={handleUpdateActionType}
          />
        );
      case 3:
        return (
          <div className='space-y-6'>
            <div className='rounded-lg border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>{t('reviewAndStart')}</h3>
              <div className='mb-4'>
                <p className='text-sm text-gray-600'>{t('selectedJournalsCount', { count: selectedJournals.length })}</p>
                <div className='mt-2 max-h-60 overflow-y-auto rounded border border-gray-200'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('title')}</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('issn')}</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {selectedJournals.map((journal, index) => (
                        <tr key={index}>
                          <td className='px-4 py-2 text-sm text-gray-900'>{journal.Title}</td>
                          <td className='px-4 py-2 text-sm text-gray-900'>{journal.Issn}</td>
                          <td className='px-4 py-2 text-sm text-gray-900'>{journal.actionType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='flex justify-end space-x-4'>
                <Button onClick={handlePrev} variant='outline'>
                  {t('back')}
                </Button>
                <Button
                  onClick={startCrawl}
                  disabled={!canProceed()}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  {isCrawling ? (
                    <>
                      <FaSpinner className='mr-2 animate-spin' />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <FaPlay className='mr-2' />
                      {t('startCrawl')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Condition to show the status section
  const showStatusSection =
    isCrawling ||
    crawlMessages.length > 0 ||
    crawlError ||
    crawlProgress.status !== 'idle'

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      <div className='mb-6'>
        <h2 className='mb-4 border-b border-gray-300 pb-2 text-xl font-semibold text-gray-700'>
          {t('title')}
        </h2>
        <StepperNavigation steps={JOURNAL_STEPS} currentStepId={currentStep} />
      </div>

      <div className='mt-6'>
        {renderStepContent()}
      </div>

      {/* Progress and Results Section */}
      {showStatusSection && (
        <div className='mt-6 rounded-md border border-gray-200 bg-gray-5 p-4'>
          <h3 className='text-md mb-3 font-semibold text-gray-700'>
            {t('statusAndResults')}
          </h3>

          {isCrawling && crawlProgress.status === 'crawling' && (
            <p className='mb-3 flex items-center text-sm text-blue-600'>
              <FaSpinner className='mr-2 animate-spin' /> {t('checkingJournals')}
            </p>
          )}

          {crawlError && (
            <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'>
              <FaSpinner className='mr-2 mt-0.5 flex-shrink-0 text-red-600' />
              <span className='break-words'>
                <b>{t('error')}:</b> {crawlError}
              </span>
            </div>
          )}

          {!isCrawling && crawlProgress.status === 'success' && (
            <div className='mb-4 rounded-md border border-green-200 bg-green-50 p-3'>
              <h4 className='mb-2 font-medium text-green-800'>{t('summary')}</h4>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='font-medium text-green-700'>{t('totalProcessed')}:</span>{' '}
                  {crawlProgress.totalProcessed ?? 0}
                </div>
                <div>
                  <span className='font-medium text-green-700'>{t('alreadyCrawled')}:</span>{' '}
                  {crawlProgress.totalExists ?? 0}
                </div>
                <div>
                  <span className='font-medium text-green-700'>{t('newJournals')}:</span>{' '}
                  {crawlProgress.totalNew ?? 0}
                </div>
              </div>
            </div>
          )}

          {crawlMessages.length > 0 && (
            <div className='custom-scrollbar max-h-60 space-y-1 overflow-y-auto rounded border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-inner'>
              <h4 className='mb-1 text-xs font-semibold text-gray-500'>
                {t('detailedResults')}:
              </h4>
              {crawlMessages.map((msg, index) => (
                <p
                  key={index}
                  className={`break-words ${
                    msg.startsWith('CRAWLED')
                      ? 'text-green-600'
                      : msg.startsWith('NOT CRAWLED')
                      ? 'text-yellow-600'
                      : msg.startsWith('Error')
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JournalCrawlUploader
