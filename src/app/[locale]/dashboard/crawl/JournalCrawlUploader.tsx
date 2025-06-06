// src/app/[locale]/dashboard/crawl/JournalCrawlUploader.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useJournalCrawl } from '@/src/hooks/crawl/journal/useJournalCrawl'
import JournalSelectionStep from './steps/JournalSelectionStep' // Assuming this is compatible
import StepperNavigation from './steps/StepperNavigation'
import { Button } from '@/src/components/ui/button'
import {
  FaFileUpload, FaSpinner, FaPlay, FaTimesCircle, FaCheckCircle, FaStop, FaExclamationTriangle, FaRedo
} from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { JournalWithStatus, ScimagoJournal } from '@/src/models/logAnalysis/importJournalCrawl' // Import ScimagoJournal if using preview

// Define steps for the journal crawl process
const JOURNAL_STEPS = [
    { id: 1, name: 'Upload & Check DB' }, // Step 1 now includes DB check
    { id: 2, name: 'Select Journals for Action' },
    { id: 3, name: 'Review & Start Backend Crawl' } // Step 3 is for backend crawl
];

// Memoize the ScimagoPreviewTable component
const ScimagoPreviewTable = React.memo<{ data: ScimagoJournal[] }>(({ data }) => {
  const memoizedData = React.useMemo(() => data, [data]);
  
  return (
    <div className='mt-4 rounded-lg border border-gray-200 shadow-sm'>
      <h3 className='text-md flex items-center rounded-t-lg border-b border-gray-200 bg-gray-10 p-3 font-semibold text-gray-700'>
        Preview of Raw SCImago CSV Data ({memoizedData.length} items)
      </h3>
      <div className='custom-scrollbar max-h-60 overflow-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='sticky top-0 z-10 bg-gray-100'>
            <tr>
              <th scope='col' className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600'>Rank</th>
              <th scope='col' className='min-w-[250px] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600'>Title</th>
              <th scope='col' className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600'>ISSN</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {memoizedData.map((journal, index) => (
              <tr key={journal.Sourceid ? `${journal.Sourceid}-${index}` : index} className='hover:bg-gray-10'>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500'>{journal.Rank ?? 'N/A'}</td>
                <td className='px-3 py-2 text-sm text-gray-900'>{journal.Title ?? 'N/A'}</td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500'>{journal.Issn ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {memoizedData.length === 0 && <p className='p-4 text-center text-sm text-gray-500'>No SCImago journals found in preview.</p>}
    </div>
  );
});

ScimagoPreviewTable.displayName = 'ScimagoPreviewTable';

export const JournalCrawlUploader: React.FC = () => {
  const t = useTranslations('JournalCrawl') // Ensure your translation keys match
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedJournalsForAction, setSelectedJournalsForAction] = useState<JournalWithStatus[]>([]);

  const {
    file,
    rawCsvContent, // Available for the backend crawl
    isReadingFile,
    fileReadError,
    scimagoPreviewData, // Optional preview data

    isCheckingDB,
    checkDBError,
    parsedDataForSelectionTable,
    dbCheckSummary,
    dbCheckMessages,

    isCrawlingBackend,
    crawlBackendError,
    crawlBackendProgress,
    crawlBackendMessages,

    handleFileChange,
    startBackendCrawl,
    resetAll
  } = useJournalCrawl()

  const handleNext = useCallback(() => {
    if (currentStep < JOURNAL_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSelectionChanged = useCallback((selectedRows: JournalWithStatus[]) => {
    console.log('Selection changed:', selectedRows.length, 'rows selected');
    setSelectedJournalsForAction(prev => {
      // Only update if the selection has actually changed
      const hasChanged = selectedRows.length !== prev.length || 
        selectedRows.some((row, index) => 
          row.Issn !== prev[index]?.Issn || 
          row.Title !== prev[index]?.Title
        );
      
      if (!hasChanged) {
        console.log('Selection unchanged, skipping update');
        return prev;
      }
      
      console.log('Updating selection with new rows');
      return selectedRows;
    });
  }, []); // Empty dependency array since we're using functional updates

  const handleUpdateActionType = useCallback((actionType: 'crawl' | 'update', journalsToUpdate: JournalWithStatus[]) => {
    console.log('Updating action type:', actionType, 'for', journalsToUpdate.length, 'journals');
    setSelectedJournalsForAction(prev => {
      const updatedJournals = journalsToUpdate.map(journal => ({
        ...journal,
        actionType
      }));
      
      return prev.map(journal => {
        const updated = updatedJournals.find(j => j.Issn === journal.Issn && j.Title === journal.Title);
        return updated || journal;
      });
    });
  }, []); // Empty dependency array since we're using functional updates
  
  // Memoize these values to prevent unnecessary re-renders
  const isLoading = useMemo(() => 
    isReadingFile || isCheckingDB || isCrawlingBackend,
    [isReadingFile, isCheckingDB, isCrawlingBackend]
  );

  const canProceedToStep2 = useMemo(() => 
    Boolean(file && !isReadingFile && !fileReadError && parsedDataForSelectionTable && !isCheckingDB),
    [file, isReadingFile, fileReadError, parsedDataForSelectionTable, isCheckingDB]
  );

  const canProceedToStep3 = useMemo(() => 
    selectedJournalsForAction.length > 0,
    [selectedJournalsForAction.length]
  );

  const canStartBackendCrawlProcess = useMemo(() => 
    Boolean(rawCsvContent && selectedJournalsForAction.length > 0 && !isLoading),
    [rawCsvContent, selectedJournalsForAction.length, isLoading]
  );

  // Memoize the showStatusSection value
  const showStatusSection = useMemo(() => 
    Boolean(
      dbCheckMessages.length > 0 ||
      checkDBError ||
      crawlBackendMessages.length > 0 ||
      crawlBackendError ||
      isCrawlingBackend ||
      crawlBackendProgress.status !== 'idle'
    ),
    [
      dbCheckMessages.length,
      checkDBError,
      crawlBackendMessages.length,
      crawlBackendError,
      isCrawlingBackend,
      crawlBackendProgress.status
    ]
  );

  // Memoize the preview data
  const memoizedPreviewData = useMemo(() => scimagoPreviewData, [scimagoPreviewData]);

  // Memoize the renderStepContent function
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1: // Upload & Check DB
        return (
          <div className='flex flex-col space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                {t('fileLabel')} (SCImago CSV, Semicolon-delimited ';')
              </label>
              <div className='flex items-center space-x-4'>
                <label
                  className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-10 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <FaFileUpload className={`mr-2 ${(isReadingFile || isCheckingDB) ? 'animate-spin' : ''}`} />
                  <span>
                    {(isReadingFile || isCheckingDB) ? t('processing') : file ? t('changeFile') : t('chooseFile')}
                  </span>
                  <input
                    type='file'
                    className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                    accept='.csv, text/csv'
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>
                {file && !(isReadingFile || isCheckingDB) && (
                  <span className='min-w-0 flex-shrink truncate text-sm text-gray-600' title={file.name}>
                    {file.name}
                  </span>
                )}
                {(isReadingFile || isCheckingDB) && <FaSpinner className='animate-spin text-blue-500' />}
              </div>
              {fileReadError && (
                <p className='mt-2 flex items-center text-sm text-red-600'>
                  <FaTimesCircle className='mr-1' /> {fileReadError}
                </p>
              )}
              {!fileReadError && file && !isReadingFile && !isCheckingDB && parsedDataForSelectionTable && (
                 <p className='mt-2 flex items-center text-sm text-green-600'>
                    <FaCheckCircle className='mr-1' /> File processed, DB check complete. Ready for selection.
                </p>
              )}
            </div>
            
            {/* Optional SCImago Preview */}
            {memoizedPreviewData && memoizedPreviewData.length > 0 && !isReadingFile && (
              <ScimagoPreviewTable data={memoizedPreviewData} />
            )}

            <div className='flex justify-end'>
              <Button
                onClick={handleNext}
                disabled={!canProceedToStep2 || isLoading}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {t('nextStep')}
              </Button>
            </div>
          </div>
        );
      case 2: // Select Journals for Action
        return (
          <JournalSelectionStep
            parsedData={parsedDataForSelectionTable || []} // Data from DB check
            onSelectionChanged={handleSelectionChanged}
            onNext={handleNext}
            onPrev={handlePrev}
            canProceed={canProceedToStep3 && !isLoading}
            onUpdateActionTypeForSelected={handleUpdateActionType} // Ensure this prop is handled by JournalSelectionStep
          />
        );
      case 3: // Review & Start Backend Crawl
        return (
          <div className='space-y-6'>
            <div className='rounded-lg border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>{t('reviewAndStartBackendCrawl')}</h3>
              <p className='text-sm text-gray-700 mb-2'>
                The backend crawl will process the <strong>entire uploaded CSV file</strong> ({file?.name}).
                The {selectedJournalsForAction.length} journal(s) you've selected below are for your review and to indicate primary interest.
              </p>
              <div className='mb-4'>
                <p className='text-sm text-gray-600'>{t('selectedJournalsCount', { count: selectedJournalsForAction.length })}</p>
                {selectedJournalsForAction.length > 0 && (
                  <div className='mt-2 max-h-60 overflow-y-auto rounded border border-gray-200'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-100'>
                        <tr>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('title')}</th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('issn')}</th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>{t('intendedAction')}</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200 bg-white'>
                        {selectedJournalsForAction.map((journal, index) => (
                          <tr key={journal.Issn || index}>
                            <td className='px-4 py-2 text-sm text-gray-900'>{journal.Title}</td>
                            <td className='px-4 py-2 text-sm text-gray-900'>{journal.Issn}</td>
                            <td className='px-4 py-2 text-sm text-gray-900 capitalize'>{journal.actionType || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className='flex items-center justify-between'>
                <Button onClick={resetAll} variant='destructive' className='text-xs' disabled={isLoading}>
                    <FaRedo className='mr-2' /> {t('resetAll')}
                </Button>
                <div className='flex space-x-4'>
                    <Button onClick={handlePrev} variant='outline' disabled={isLoading}>
                    {t('back')}
                    </Button>
                    <Button
                    onClick={() => startBackendCrawl(selectedJournalsForAction)} // Pass selected journals
                    disabled={!canStartBackendCrawlProcess || isLoading}
                    className='bg-green-600 hover:bg-green-700 text-white'
                    >
                    {isCrawlingBackend ? (
                        <>
                        <FaSpinner className='mr-2 animate-spin' />
                        {t('crawlingBackend')}
                        </>
                    ) : (
                        <>
                        <FaPlay className='mr-2' />
                        {t('startBackendCrawlButton')}
                        </>
                    )}
                    </Button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    currentStep,
    file,
    isLoading,
    fileReadError,
    parsedDataForSelectionTable,
    selectedJournalsForAction,
    canProceedToStep2,
    canProceedToStep3,
    canStartBackendCrawlProcess,
    isCrawlingBackend,
    memoizedPreviewData,
    isReadingFile,
    handleNext,
    handlePrev,
    handleSelectionChanged,
    handleUpdateActionType,
    startBackendCrawl,
    resetAll,
    t
  ]);

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      <div className='mb-6'>
        <h2 className='mb-4 border-b border-gray-300 pb-2 text-xl font-semibold text-gray-700'>
          {t('mainTitle')} {/* e.g., Journal Crawl and Database Import */}
        </h2>
        <StepperNavigation steps={JOURNAL_STEPS} currentStepId={currentStep} />
      </div>

      <div className='mt-6'>
        {renderStepContent()}
      </div>

      {showStatusSection && (
        <div className='mt-6 rounded-md border border-gray-200 bg-gray-10 p-4'>
          <h3 className='text-md mb-3 font-semibold text-gray-700'>
            {t('statusAndResults')}
          </h3>

          {/* DB Check Status */}
          {isCheckingDB && (
            <p className='mb-3 flex items-center text-sm text-blue-600'>
              <FaSpinner className='mr-2 animate-spin' /> {t('checkingJournalsDB')}
            </p>
          )}
          {checkDBError && (
            <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'>
              <FaTimesCircle className='mr-2 mt-0.5 flex-shrink-0 text-red-600' />
              <span className='break-words'><b>{t('dbCheckError')}:</b> {checkDBError}</span>
            </div>
          )}
          {dbCheckSummary && !isCheckingDB && !checkDBError && (
            <div className='mb-4 rounded-md border border-green-200 bg-green-50 p-3'>
              <h4 className='mb-2 font-medium text-green-800'>{t('dbCheckSummaryTitle')}</h4>
              <div className='grid grid-cols-1 gap-2 text-sm md:grid-cols-3 md:gap-4'>
                <div><span className='font-medium text-green-700'>{t('totalProcessed')}:</span> {dbCheckSummary.totalProcessed ?? 0}</div>
                <div><span className='font-medium text-green-700'>{t('alreadyInDB')}:</span> {dbCheckSummary.totalExists ?? 0}</div>
                <div><span className='font-medium text-green-700'>{t('newToDB')}:</span> {dbCheckSummary.totalNew ?? 0}</div>
              </div>
            </div>
          )}
           {dbCheckMessages.length > 0 && (
            <div className='custom-scrollbar mb-4 max-h-32 space-y-1 overflow-y-auto rounded border border-gray-200 bg-white p-2 text-xs text-gray-700 shadow-inner'>
              <h4 className='mb-1 text-xs font-semibold text-gray-500'>{t('dbCheckLogTitle')}:</h4>
              {dbCheckMessages.map((msg, index) => (
                <p key={`db-${index}`} className={`break-words ${msg.toLowerCase().includes('error') ? 'text-red-600' : ''}`}>{msg}</p>
              ))}
            </div>
          )}

          {/* Backend Crawl Status (similar to old code's status section) */}
          {isCrawlingBackend && crawlBackendProgress.status === 'crawling' && (
            <p className='mb-3 flex items-center text-sm text-blue-600'>
              <FaSpinner className='mr-2 animate-spin' /> {t('backendCrawlInProgress')}
            </p>
          )}
          {crawlBackendError && (
            <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'>
              <FaExclamationTriangle className='mr-2 mt-0.5 flex-shrink-0 text-red-600' />
              <span className='break-words'><b>{t('backendCrawlError')}:</b> {crawlBackendError}</span>
            </div>
          )}
          {!isCrawlingBackend && crawlBackendProgress.status === 'success' && (
            <p className='mb-3 flex items-center text-sm text-green-700'>
              <FaCheckCircle className='mr-1 text-green-600' />
              {t('backendCrawlSuccess')}
            </p>
          )}
          {!isCrawlingBackend && crawlBackendProgress.status === 'error' && !crawlBackendError && (
            <p className='mb-3 flex items-center text-sm text-red-800'>
              <FaTimesCircle className='mr-1 text-red-600' />
              {t('backendCrawlFailed')}
            </p>
          )}
          {crawlBackendMessages.length > 0 && (
            <div className='custom-scrollbar max-h-60 space-y-1 overflow-y-auto rounded border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-inner'>
              <h4 className='mb-1 text-xs font-semibold text-gray-500'>{t('backendCrawlLogTitle')}:</h4>
              {crawlBackendMessages.map((msg, index) => (
                <p
                  key={`crawl-${index}`}
                  className={`break-words ${
                    msg.startsWith('FAILED') ? 'font-medium text-red-600' : ''
                  } ${msg.startsWith('Warning:') ? 'text-yellow-700' : ''} ${
                    msg.startsWith('Backend Crawl:') || msg.toLowerCase().includes('success') ? 'text-green-600' : ''
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