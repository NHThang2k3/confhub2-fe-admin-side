// src/app/[locale]/dashboard/crawl/steps/ProcessingStep.tsx
import React, { useState } from 'react';
import {
  FaSpinner, FaPlay, FaRedo, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaChevronLeft, FaInfoCircle
} from 'react-icons/fa';
import { CrawlProgress } from '@/src/models/logAnalysis/importConferenceCrawl';
import { useTranslations } from 'next-intl';

interface ProcessingStepProps {
  isCrawling: boolean;
  crawlError: string | null;
  crawlProgress: CrawlProgress;
  crawlMessages: string[];
  enableChunking: boolean;
  onStartProcess: (description?: string) => void;
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
  const t = useTranslations('ProcessingStep');
  const [crawlDescription, setCrawlDescription] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Constants for description
  const MAX_DESCRIPTION_LENGTH = 200; // Giới hạn 200 ký tự

  const showStatusSection =
    isCrawling ||
    crawlMessages.length > 0 ||
    crawlError ||
    crawlProgress.status !== 'idle';

  const handleStartProcessClick = () => {
    onStartProcess(crawlDescription.trim() || undefined);
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-5 bg-white shadow-md">
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">{t('header.title')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('header.description')}</p>
      </div>

      {/* Description Input Section - NỔI BẬT HƠN */}
      <div className="pt-2 p-4 rounded-md border border-blue-100 bg-blue-50 shadow-sm">
        <label htmlFor="crawlDescription" className="block text-sm font-semibold text-blue-800 mb-2">
          {t('descriptionInput.label')}
          <span className="text-gray-500 font-normal ml-2 text-xs">(Optional)</span>
          <span
            className="ml-1 inline-flex items-center cursor-help relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <FaInfoCircle className="h-4 w-4 text-blue-500" />
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10 bottom-full mb-2">
                {t('descriptionInput.tooltipContent')}
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
              </div>
            )}
          </span>
        </label>
        <textarea
          id="crawlDescription"
          name="crawlDescription"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder={t('descriptionInput.placeholder')}
          value={crawlDescription}
          onChange={(e) => setCrawlDescription(e.target.value)}
          disabled={isCrawling}
          maxLength={MAX_DESCRIPTION_LENGTH} // Thêm giới hạn ký tự
        />
        <p className="mt-1 text-xs text-gray-600">
          {t('descriptionInput.characterCount', {
            current: crawlDescription.length,
            max: MAX_DESCRIPTION_LENGTH,
          })}
        </p>
        <p className="mt-1 text-xs text-gray-600">{t('descriptionInput.helperText')}</p>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-3 pt-2'>
        <button
          onClick={handleStartProcessClick}
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
            ? t('buttons.processingData')
            : crawlProgress.status !== 'idle' && crawlProgress.status !== 'crawling'
              ? t('buttons.restartProcess')
              : t('buttons.startProcessing')}
        </button>
        <button
          onClick={onResetAll}
          className='inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-5
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none'
          title={t('buttons.resetAllTitle')}
          disabled={isCrawling}
        >
          <FaRedo className='mr-2 h-3.5 w-3.5' /> {t('buttons.resetAll')}
        </button>
      </div>

      {/* Status and Log Section */}
      {showStatusSection && (
        <div className='mt-5 rounded-md border border-gray-200 p-5 bg-gray-10 shadow-sm'>
          <h4 className='text-base mb-3 font-semibold text-gray-800'>
            {t('statusLog.title')}
          </h4>

          {isCrawling && enableChunking && crawlProgress.total > 1 && (
            <div className='mb-3'>
              <div className='mb-1.5 flex justify-between items-center'>
                <span className='text-sm font-medium text-blue-700'>
                  {t('statusLog.processingChunk', { current: crawlProgress.current, total: crawlProgress.total })}
                </span>
                <span className='text-sm font-medium text-blue-700'>
                  {t('statusLog.percentageComplete', { percentage: Math.round((crawlProgress.current / crawlProgress.total) * 100) })}
                </span>
              </div>
              <div className='h-2.5 w-full rounded-full bg-gray-200 overflow-hidden'>
                <div
                  className='h-full rounded-full bg-blue-600 transition-all duration-500 ease-out'
                  style={{
                    width: `${(crawlProgress.current / crawlProgress.total) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}
          {isCrawling && (!enableChunking || crawlProgress.total <= 1) && (
            <p className='mb-3 flex items-center text-sm text-blue-600 font-medium'>
              <FaSpinner className='mr-2 h-4 w-4 animate-spin' /> {t('statusLog.processingItems')}
            </p>
          )}

          {crawlError && (
            <div className='mb-3 flex items-start rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800'>
              <FaExclamationTriangle className='mr-2 mt-0.5 flex-shrink-0 h-4 w-4' />
              <span className='break-words font-medium'>
                <strong className="text-red-900">{t('statusLog.processingErrorLabel')}:</strong> {crawlError}
              </span>
            </div>
          )}

          {!isCrawling && crawlProgress.status === 'success' && (
            <p className='mb-3 flex items-center text-sm text-green-700 font-medium p-2.5 bg-green-50 border border-green-200 rounded-md'>
              <FaCheckCircle className='mr-2 h-4 w-4' /> {t('statusLog.processCompletedSuccessfully')}
            </p>
          )}
          {!isCrawling &&
            (crawlProgress.status === 'error' ||
              crawlProgress.status === 'stopped') &&
            !crawlError && (
              <p className='mb-3 flex items-center text-sm text-red-700 font-medium p-2.5 bg-red-50 border border-red-200 rounded-md'>
                <FaTimesCircle className='mr-2 h-4 w-4' /> {t('statusLog.processFailedOrStopped')}
              </p>
            )}

          {crawlMessages.length > 0 && (
            <div className='custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-white p-3 text-xs font-mono text-gray-700 shadow-inner'>
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
      <div className="mt-6 flex justify-start">
         <button
          type="button"
          onClick={onPrev}
          disabled={isCrawling}
          className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-5
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <FaChevronLeft className="mr-2 h-3.5 w-3.5" /> {t('navigation.previousStep')}
        </button>
      </div>
    </div>
  );
};

export default ProcessingStep;