import React from 'react';
import {
  FaSpinner, FaPlay, FaRedo, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaChevronLeft
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
  onPrev: () => void;
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
    <div className="space-y-6 rounded-lg border border-gray-200 p-5 bg-white shadow-md">
      {/* Header with adjusted styling */}
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">Process Execution & Status</h3>
        <p className="mt-1 text-sm text-gray-600">Monitor the progress and view detailed logs of the processing.</p>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-3 pt-2'> {/* Reduced gap */}
        <button
          onClick={onStartProcess}
          disabled={!canStartProcess || isCrawling}
          className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white shadow-sm transition-all duration-200 ease-in-out
                      ${canStartProcess && !isCrawling 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
                        : 'bg-gray-400 cursor-not-allowed opacity-60'}`}
        >
          {isCrawling ? (
            <FaSpinner className='-ml-1 mr-2 h-4 w-4 animate-spin' /> 
          ) : (
            <FaPlay className='-ml-1 mr-2 h-4 w-4' /> 
          )}
          {isCrawling
            ? 'Processing Data...'
            : crawlProgress.status !== 'idle' && crawlProgress.status !== 'crawling'
              ? 'Restart Process'
              : 'Start Processing'}
        </button>
        <button
          onClick={onResetAll}
          className='inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-5 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none'
          title='Reset all configurations, data, and return to the first step'
          disabled={isCrawling}
        >
          <FaRedo className='mr-2 h-3.5 w-3.5' /> Reset All & Start Over {/* Reduced icon size */}
        </button>
      </div>

      {/* Status and Log Section */}
      {showStatusSection && (
        <div className='mt-5 rounded-md border border-gray-200 p-5 bg-gray-5 shadow-sm'> {/* Reduced margin, padding, shadow */}
          <h4 className='text-base mb-3 font-semibold text-gray-800'> {/* Reduced font size, margin */}
            Process Status & Log
          </h4>
          
          {/* Progress Bar (Chunking) */}
          {isCrawling && enableChunking && crawlProgress.total > 1 && (
            <div className='mb-3'> {/* Reduced margin */}
              <div className='mb-1.5 flex justify-between items-center'> {/* Reduced margin */}
                <span className='text-sm font-medium text-blue-700'>
                  Processing Chunk <span className="font-semibold">{crawlProgress.current}</span> of{' '}
                  <span className="font-semibold">{crawlProgress.total}</span>
                </span>
                <span className='text-sm font-medium text-blue-700'>
                  {Math.round(
                    (crawlProgress.current / crawlProgress.total) * 100
                  )}
                  % Complete
                </span>
              </div>
              <div className='h-2.5 w-full rounded-full bg-gray-200 overflow-hidden'> {/* Reduced height */}
                <div
                  className='h-full rounded-full bg-blue-600 transition-all duration-500 ease-out'
                  style={{
                    width: `${(crawlProgress.current / crawlProgress.total) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}
          {/* General Processing Message */}
          {isCrawling && (!enableChunking || crawlProgress.total <= 1) && (
            <p className='mb-3 flex items-center text-sm text-blue-600 font-medium'> {/* Reduced font size, margin, icon size */}
              <FaSpinner className='mr-2 h-4 w-4 animate-spin' /> Processing items, please wait...
            </p>
          )}

          {/* Error Message */}
          {crawlError && (
            <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'> {/* Reduced margin, padding, icon size */}
              <FaExclamationTriangle className='mr-2 mt-0.5 flex-shrink-0 h-4 w-4' />
              <span className='break-words font-medium'>
                <strong className="text-red-900">Processing Error:</strong> {crawlError}
              </span>
            </div>
          )}

          {/* Success Message */}
          {!isCrawling && crawlProgress.status === 'success' && (
            <p className='mb-3 flex items-center text-sm text-green-700 font-medium p-2.5 bg-green-50 border border-green-200 rounded-md'> {/* Reduced font size, margin, padding, icon size */}
              <FaCheckCircle className='mr-2 h-4 w-4' /> Process completed successfully!
            </p>
          )}
          {/* General Failure/Stopped Message */}
          {!isCrawling &&
            (crawlProgress.status === 'error' ||
              crawlProgress.status === 'stopped') &&
            !crawlError && (
              <p className='mb-3 flex items-center text-sm text-red-700 font-medium p-2.5 bg-red-50 border border-red-200 rounded-md'> {/* Reduced font size, margin, padding, icon size */}
                <FaTimesCircle className='mr-2 h-4 w-4' /> Process failed or was stopped. Please review the logs above.
              </p>
            )}

          {/* Log Display Area */}
          {crawlMessages.length > 0 && (
            <div className='custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-white p-3 text-xs font-mono text-gray-700 shadow-inner'> {/* Reduced max height, padding, space-y */}
              {crawlMessages.map((msg, index) => (
                <p
                  key={index}
                  className={`break-words leading-relaxed ${msg.startsWith('FAILED') ? 'font-bold text-red-600' : msg.startsWith('WARNING:') ? 'font-semibold text-orange-600' : msg.includes('Successfully processed') ? 'font-medium text-green-700' : 'text-gray-800'}`}
                >
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-start"> {/* Reduced margin */}
         <button
          type="button"
          onClick={onPrev}
          disabled={isCrawling}
          className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-5 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <FaChevronLeft className="mr-2 h-3.5 w-3.5" /> Previous: Configure Settings {/* Reduced icon size */}
        </button>
      </div>
    </div>
  );
};

export default ProcessingStep;