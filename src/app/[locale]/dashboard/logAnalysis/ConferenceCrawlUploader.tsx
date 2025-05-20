// src/app/[locale]/dashboard/logAnalysis/ConferenceCrawlUpoader.tsx

import React, { useMemo, useState } from 'react'
import { useConferenceCrawl } from '@/src/hooks/crawl/useConferenceCrawl' 
import {
  FaFileUpload,
  FaSpinner,
  FaPlay,
  FaStop,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaRedo,
  FaTable
} from 'react-icons/fa'
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl'

import {
  AllCommunityModule,
  ModuleRegistry,
  RowSelectionModule
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule])

export const ConferenceCrawlUploader: React.FC = () => {
  const {
    file,
    parsedData,
    isParsing,
    parseError,
    enableChunking,
    chunkSize,
    crawlModel, // ++ GET from hook
    isCrawling,
    crawlError,
    crawlProgress,
    crawlMessages,
    handleFileChange,
    setEnableChunking,
    setChunkSize,
    setCrawlModel, // ++ GET from hook
    startCrawl,
    resetCrawl,
    onSelectionChanged
  } = useConferenceCrawl()

  const hasData = parsedData && parsedData.length > 0
  const canStartCrawl = hasData && !isCrawling
  const showStatusSection =
    isCrawling ||
    crawlMessages.length > 0 ||
    crawlError ||
    crawlProgress.status !== 'idle'

  const [colDef, setColDef] = useState([
    // ... (colDef remains the same)
    {
      field: 'acronym' as keyof Conference,
      headerName: 'Acronym',
      sortable: true,
      filter: true
    },
    {
      field: 'title' as keyof Conference,
      headerName: 'Title',
      sortable: true,
      filter: true
    },
    {
      field: 'sources' as keyof Conference,
      headerName: 'Sources',
      sortable: true,
      filter: true
    },
    {
      field: 'ranks' as keyof Conference,
      headerName: 'Ranks',
      sortable: true,
      filter: true
    },
    {
      field: 'researchFields' as keyof Conference,
      headerName: 'Research Fields',
      sortable: true,
      filter: true
    },
    {
      field: 'status' as keyof Conference,
      headerName: 'Status',
      sortable: true,
      filter: true
    },
    {
      field: 'updatedAt' as keyof Conference,
      headerName: 'Updated At',
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        const date = new Date(params.value)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    }
  ])

  const rowSelection = useMemo(() => {
    return {
      mode: 'multiRow',
      checkBox: true,
      headerCheckBox: true,
      enableClickSelection: true,
      selectAll: 'filtered'
    }
  }, [])

  return (
    <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
      <h2 className='mb-4 border-b border-gray-300 pb-2 text-xl font-semibold text-gray-700'>
        Crawl Conferences from CSV
      </h2>
      <div className='flex flex-col md:flex-row md:space-x-6'>
        <div className='flex flex-col space-y-4 md:w-1/2'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Select CSV File (Requires columns: Title, Acronym)
            </label>
            <div className='flex items-center space-x-4'>
              <label
                className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 ${isParsing || isCrawling ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FaFileUpload
                  className={`mr-2 ${isParsing ? 'animate-spin' : ''}`}
                />
                <span>
                  {isParsing
                    ? 'Parsing...'
                    : file
                      ? 'Change File'
                      : 'Choose File'}
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
                <span
                  className='min-w-0 flex-shrink truncate text-sm text-gray-600'
                  title={file.name}
                >
                  {file.name}
                </span>
              )}
              {isParsing && (
                <FaSpinner className='animate-spin text-blue-500' />
              )}
            </div>
            {parseError && (
              <p className='mt-2 flex items-center text-sm text-red-600'>
                <FaTimesCircle className='mr-1' /> {parseError}
              </p>
            )}
            {hasData && !isParsing && (
              <p className='mt-2 flex items-center text-sm text-green-600'>
                <FaCheckCircle className='mr-1' /> Parsed {parsedData.length}{' '}
                conferences. Ready to crawl.
              </p>
            )}
            {!hasData &&
              file &&
              !isParsing &&
              !parseError && (
                <p className='mt-2 flex items-center text-sm text-yellow-700'>
                  <FaExclamationTriangle className='mr-1' /> Could not find
                  valid conference data (Title, Acronym) in the selected file.
                </p>
              )}
          </div>
          
          {hasData && (
            <div className='rounded-md border border-gray-200 bg-gray-5 p-4'>
              <h3 className='text-md mb-3 font-semibold text-gray-700'>
                Crawl Configuration
              </h3>
              {/* Chunking Configuration */}
              <div className='mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0'>
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
                    Chunk Size:
                  </label>
                  <input
                    id='chunk-size'
                    type='number'
                    min='1'
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

              {/* ++ ADDED: Model Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Select Crawl Model:
                </label>
                <div className='mt-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                  <div className='flex items-center'>
                    <input
                      id='model-non-tuned'
                      name='crawlModel'
                      type='radio'
                      value='non-tuned'
                      checked={crawlModel === 'non-tuned'}
                      onChange={() => setCrawlModel('non-tuned')}
                      disabled={isCrawling}
                      className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label
                      htmlFor='model-non-tuned'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Non-Tuned Model
                    </label>
                  </div>
                  <div className='flex items-center'>
                    <input
                      id='model-tuned'
                      name='crawlModel'
                      type='radio'
                      value='tuned'
                      checked={crawlModel === 'tuned'}
                      onChange={() => setCrawlModel('tuned')}
                      disabled={isCrawling}
                      className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label
                      htmlFor='model-tuned'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Tuned Model
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center space-x-4'>
            <button
              onClick={startCrawl}
              disabled={!canStartCrawl}
              className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${canStartCrawl ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : 'cursor-not-allowed bg-gray-400'}`}
            >
              {isCrawling ? (
                <FaSpinner className='-ml-1 mr-2 h-5 w-5 animate-spin' />
              ) : (
                <FaPlay className='-ml-1 mr-2 h-5 w-5' />
              )}
              {isCrawling
                ? 'Crawling...'
                : crawlProgress.status !== 'idle' &&
                    crawlProgress.status !== 'crawling'
                  ? 'Start Crawl Again'
                  : 'Start Crawl'}
            </button>
            <button
              onClick={resetCrawl}
              className='inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              title='Clear selection and results'
              disabled={isCrawling}
            >
              <FaRedo className='mr-2' /> Reset
            </button>
          </div>
          
          {showStatusSection && (
            <div className='rounded-md border border-gray-200 p-4'>
              <h3 className='text-md mb-3 font-semibold text-gray-700'>
                Crawl Status & Log
              </h3>
              {isCrawling && enableChunking && crawlProgress.total > 0 && (
                <div className='mb-3'>
                  <div className='mb-1 flex justify-between'>
                    <span className='text-sm font-medium text-blue-700'>
                      Processing Chunk {crawlProgress.current} of{' '}
                      {crawlProgress.total}
                    </span>
                    <span className='text-sm font-medium text-blue-700'>
                      {Math.round(
                        (crawlProgress.current / crawlProgress.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className='h-2.5 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-out'
                      style={{
                        width: `${(crawlProgress.current / crawlProgress.total) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {isCrawling && !enableChunking && (
                <p className='mb-3 flex items-center text-sm text-blue-600'>
                  <FaSpinner className='mr-2 animate-spin' /> Sending entire
                  list...
                </p>
              )}

              {crawlError && (
                <div className='mb-3 flex items-start rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                  <FaExclamationTriangle className='mr-2 mt-0.5 flex-shrink-0' />
                  <span className='break-words'>
                    <b>Error:</b> {crawlError}
                  </span>
                </div>
              )}

              {!isCrawling && crawlProgress.status === 'success' && (
                <p className='mb-3 flex items-center text-sm text-green-600'>
                  <FaCheckCircle className='mr-1' /> Crawl process completed
                  successfully.
                </p>
              )}
              {!isCrawling &&
                (crawlProgress.status === 'error' ||
                  crawlProgress.status === 'stopped') &&
                !crawlError && ( 
                  <p className='mb-3 flex items-center text-sm text-red-600'>
                    <FaTimesCircle className='mr-1' /> Crawl process failed or
                    was stopped. Check logs for details.
                  </p>
                )}

              {crawlMessages.length > 0 && (
                <div className='custom-scrollbar max-h-60 space-y-1 overflow-y-auto rounded border border-gray-100 bg-gray-5 p-3 text-xs text-gray-600'>
                  {crawlMessages.map((msg, index) => (
                    <p
                      key={index}
                      className={`break-words ${msg.startsWith('FAILED') ? 'font-medium text-red-500' : msg.includes('Successfully processed') ? 'font-medium text-green-700' : ''}`}
                    >
                      {msg}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className='mt-4 flex flex-col space-y-4 md:mt-0 md:w-1/2'>
          {hasData &&
            !isParsing && (
              <AgGridReact
                className='ag-theme-alpine'
                rowData={parsedData}
                columnDefs={colDef}
                rowSelection={rowSelection as any}
                onSelectionChanged={onSelectionChanged}
                domLayout='autoHeight' // Optional: makes the grid fit its content height
              />
            )}
        </div>
      </div>
    </div>
  )
}

export default ConferenceCrawlUploader