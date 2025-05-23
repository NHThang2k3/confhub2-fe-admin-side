// src/appp/[locale]/dashboard/logAnalysis/steps/ProcessingStep.tsx
import React from 'react';
import {
  FaSpinner, FaPlay, FaRedo, FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { CrawlProgress } from '@/src/models/logAnalysis/importConferenceCrawl';

interface ProcessingStepProps {
  isCrawling: boolean;
  crawlError: string | null;
  crawlProgress: CrawlProgress;
  crawlMessages: string[];
  enableChunking: boolean;
  onStartProcess: () => void;
  onResetAll: () => void;
  canStartProcess: boolean;
  onPrev: () => void; // To go back to configuration step
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  isCrawling,
  crawlError,
  crawlProgress,
  crawlMessages,
  enableChunking,
  onStartProcess,
  onResetAll,
  canStartProcess,
  onPrev,
}) => {
  const showStatusSection =
    isCrawling ||
    crawlMessages.length > 0 ||
    crawlError ||
    crawlProgress.status !== 'idle';

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Process Execution & Status</h3>

      {/* Action Buttons */}
      <div className='flex items-center space-x-4 pt-2'>
        <button
          onClick={onStartProcess}
          disabled={!canStartProcess || isCrawling}
          className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${canStartProcess && !isCrawling ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : 'cursor-not-allowed bg-gray-400'}`}
        >
          {isCrawling ? (
            <FaSpinner className='-ml-1 mr-2 h-5 w-5 animate-spin' />
          ) : (
            <FaPlay className='-ml-1 mr-2 h-5 w-5' />
          )}
          {isCrawling
            ? 'Processing...'
            : crawlProgress.status !== 'idle' &&
                crawlProgress.status !== 'crawling'
              ? 'Start Process Again'
              : 'Start Process Selected'}
        </button>
        <button
          onClick={onResetAll} // This now resets to step 1
          className='inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          title='Reset all configurations, data and return to first step'
          disabled={isCrawling}
        >
          <FaRedo className='mr-2' /> Reset All & Start Over
        </button>
      </div>

      {/* Status and Log Section */}
      {showStatusSection && (
        <div className='mt-4 rounded-md border border-gray-200 p-4 bg-gray-5'>
          <h4 className='text-md mb-3 font-semibold text-gray-700'>
            Process Status & Log
          </h4>
          {isCrawling && enableChunking && crawlProgress.total > 1 && (
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
          {isCrawling && (!enableChunking || crawlProgress.total <= 1) && (
            <p className='mb-3 flex items-center text-sm text-blue-600'>
              <FaSpinner className='mr-2 animate-spin' /> Processing items...
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
              <FaCheckCircle className='mr-1' /> Process completed
              successfully.
            </p>
          )}
          {!isCrawling &&
            (crawlProgress.status === 'error' ||
              crawlProgress.status === 'stopped') &&
            !crawlError && (
              <p className='mb-3 flex items-center text-sm text-red-600'>
                <FaTimesCircle className='mr-1' /> Process failed or
                was stopped. Check logs for details.
              </p>
            )}

          {crawlMessages.length > 0 && (
            <div className='custom-scrollbar max-h-60 space-y-1 overflow-y-auto rounded border border-gray-100 bg-white p-3 text-xs text-gray-600'>
              {crawlMessages.map((msg, index) => (
                <p
                  key={index}
                  className={`break-words ${msg.startsWith('FAILED') ? 'font-medium text-red-500' : msg.startsWith('WARNING:') ? 'font-medium text-yellow-600' : msg.includes('Successfully processed') ? 'font-medium text-green-700' : ''}`}
                >
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-start">
         <button
          type="button"
          onClick={onPrev}
          disabled={isCrawling}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous: Configure Settings
        </button>
      </div>
    </div>
  );
};

export default ProcessingStep;