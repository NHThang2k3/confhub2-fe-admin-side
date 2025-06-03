// src/app/[locale]/dashboard/crawl/JournalCrawlUploader.tsx

import React from 'react'
// Import the refactored hook and types
import { useJournalCrawl } from '@/src/hooks/crawl/journal/useJournalCrawl' // Adjust path as needed
import { useJournalTableManager } from '@/src/hooks/crawl/journal/useJournalTableManager'
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

ModuleRegistry.registerModules([AllCommunityModule]);

// Extended Journal interface for the response data
interface JournalWithStatus extends Journal {
    lastUpdated: string | null;
    message: string;
}

// --- Main Uploader Component ---
export const JournalCrawlUploader: React.FC = () => {
  const t = useTranslations('JournalCrawl')
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

  // AG Grid column definitions
  const columnDefs: ColDef<JournalWithStatus>[] = [
    { field: 'Title', headerName: 'Title', flex: 2, minWidth: 200 },
    { field: 'Issn', headerName: 'ISSN', flex: 1, minWidth: 100 },
    { field: 'Publisher', headerName: 'Publisher', flex: 1, minWidth: 150 },
    { 
      field: 'Type', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120,
      cellStyle: (params: CellClassParams<JournalWithStatus>) => ({
        color: params.value === 'Crawled' ? 'green' : 'orange'
      })
    },
    { 
      field: 'lastUpdated', 
      headerName: 'Last Updated', 
      flex: 1, 
      minWidth: 120,
      valueFormatter: (params: ValueFormatterParams<JournalWithStatus>) => 
        params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'message', 
      headerName: 'Message', 
      flex: 2, 
      minWidth: 200,
      cellStyle: (params: CellClassParams<JournalWithStatus>) => ({
        color: params.value.includes('Error') ? 'red' : 'inherit'
      })
    }
  ]
  console.log(parsedData);

  // Determine if data is ready to be sent
  const canStartCrawl = !!file && !isCrawling && !isParsing
  // Condition to show the status section
  const showStatusSection =
    isCrawling ||
    crawlMessages.length > 0 ||
    crawlError ||
    crawlProgress.status !== 'idle'

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      {' '}
      {/* Increased max-width for two columns */}
      <h2 className='mb-4 border-b border-gray-300 pb-2 text-xl font-semibold text-gray-700'>
        {t('title')}
      </h2>
      {/* --- Main Content Area with Columns --- */}
      <div className='flex flex-col md:flex-row md:space-x-6'>
        {' '}
        {/* Flex container for columns */}
        {/* === Left Column === */}
        <div className='flex flex-col space-y-6 md:w-1/2'>
          {' '}
          {/* Left column takes half width on md+, stack items vertically */}
          {/* --- File Upload Section --- */}
          <div>
            {' '}
            {/* Wrap section for spacing */}
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {t('fileLabel')}
            </label>
            <div className='flex items-center space-x-4'>
              {/* File Input Label */}
              <label
                className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 ${isParsing || isCrawling ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FaFileUpload
                  className={`mr-2 ${isParsing ? 'animate-spin' : ''}`}
                />
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
              {/* File Name Display */}
              {file && !isParsing && (
                <span
                  className='min-w-0 flex-shrink truncate text-sm text-gray-600'
                  title={file.name}
                >
                  {file.name}
                </span>
              )}
              {/* Parsing Spinner */}
              {isParsing && (
                <FaSpinner className='animate-spin text-blue-500' />
              )}
            </div>
            {/* Parsing Error Message */}
            {parseError && (
              <p className='mt-2 flex items-center text-sm text-red-600'>
                <FaSpinner className='mr-1' /> {parseError}
              </p>
            )}
          </div>
          {/* --- Action Buttons --- */}
          <div className='flex items-center space-x-4'>
            <Button
              onClick={startCrawl}
              disabled={!canStartCrawl}
              className={canStartCrawl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}
            >
              {isCrawling ? (
                <FaSpinner className='-ml-1 mr-2 h-5 w-5 animate-spin' />
              ) : (
                <FaPlay className='-ml-1 mr-2 h-5 w-5' />
              )}
              {isCrawling
                ? t('sendingData')
                : crawlProgress.status !== 'idle' &&
                    crawlProgress.status !== 'crawling'
                  ? t('sendAgain')
                  : t('startCrawl')}
            </Button>
            <Button
              onClick={resetCrawl}
              variant='outline'
              disabled={isCrawling || isParsing}
            >
              <FaRedo className='mr-2' /> {t('reset')}
            </Button>
          </div>
          {/* --- Progress and Results Section --- */}
          {showStatusSection && (
            <div className='rounded-md border border-gray-200 bg-gray-5 p-4'>
              <h3 className='text-md mb-3 font-semibold text-gray-700'>
                {t('statusAndResults')}
              </h3>

              {/* Crawling indicator */}
              {isCrawling && crawlProgress.status === 'crawling' && (
                <p className='mb-3 flex items-center text-sm text-blue-600'>
                  <FaSpinner className='mr-2 animate-spin' /> {t('checkingJournals')}
                </p>
              )}

              {/* Error Display */}
              {crawlError && (
                <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'>
                  <FaSpinner className='mr-2 mt-0.5 flex-shrink-0 text-red-600' />
                  <span className='break-words'>
                    <b>{t('error')}:</b> {crawlError}
                  </span>
                </div>
              )}

              {/* Results Summary */}
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

              {/* Messages Log */}
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
        </div>{' '}
        {/* End Left Column */}
        {/* === Right Column === */}
        {/* <div className='mt-6 flex flex-col space-y-4 md:mt-0 md:w-1/2'>
          {parsedData && parsedData.length > 0 && (
            <JournalTable
              data={tableManager.data}
              selectedRows={tableManager.selectedRows}
              expandedRowUniqueId={tableManager.expandedRowUniqueId}
              sortColumn={tableManager.sortColumn}
              sortDirection={tableManager.sortDirection}
              onSort={tableManager.onSort}
              onToggleExpand={tableManager.onToggleExpand}
              onSelectToggle={tableManager.onSelectToggle}
              columnFilters={tableManager.columnFilters}
              onColumnFilterChange={tableManager.onColumnFilterChange}
              totalRowsCount={tableManager.totalRowsCount}
              selectedRowsCount={tableManager.selectedRowsCount}
              onSelectAll={tableManager.onSelectAll}
            />
          )}
        </div>{' '} */}
        {/* End Right Column */}
      </div>{' '}
      {/* End Flex Container */}
    </div> // End Main Component Div
  )
}

export default JournalCrawlUploader
