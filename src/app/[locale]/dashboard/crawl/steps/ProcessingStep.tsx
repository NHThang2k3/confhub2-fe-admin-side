// src/app/[locale]/dashboard/crawl/steps/ProcessingStep.tsx
import React, { useState, useEffect } from 'react'; // <<< THÊM useEffect
import {
  FaSpinner, FaPlay, FaRedo, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaChevronLeft, FaInfoCircle, FaStopCircle, FaPauseCircle, FaArrowRight
} from 'react-icons/fa';
import { CrawlProgress } from '@/src/models/logAnalysis/importConferenceCrawl';
import { useTranslations } from 'next-intl';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';
// Giả định bạn có các class CSS này trong file global.css hoặc dùng utility-first như Tailwind
// Ví dụ với Tailwind:
const btnBase = "inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
const btnPrimary = `${btnBase} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400`;
const btnSecondary = `${btnBase} text-gray-700 bg-white border-gray-300 hover:bg-gray-10 focus:ring-blue-500`;
const btnDanger = `${btnBase} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;

interface ProcessingStepProps {
  isCrawling: boolean;
  isPaused: boolean;
  countdown: number;
  crawlError: string | null;
  crawlProgress: CrawlProgress;
  crawlMessages: string[];
  enableChunking: boolean;
  onStartProcess: (description?: string) => void;
  onResume: (numChunks: number) => void;
  onStopProcess: () => void;
  onResetAll: () => void;
  canStartProcess: boolean;
  onPrev: () => void;
  selectedConferences: ConferenceForAction[]; // <<< THÊM MỚI

}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  isCrawling,
  isPaused,
  countdown,
  crawlError,
  crawlProgress,
  crawlMessages,
  enableChunking,
  onStartProcess,
  onResume,
  onStopProcess,
  onResetAll,
  canStartProcess,
  onPrev,
  selectedConferences
}) => {
  const t = useTranslations('ProcessingStep');
  const [crawlDescription, setCrawlDescription] = useState<string>('');
  const [chunksToResume, setChunksToResume] = useState<number>(1);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const MAX_DESCRIPTION_LENGTH = 200;

  // <<< THÊM MỚI: LOGIC TẠO DESCRIPTION MẶC ĐỊNH
  useEffect(() => {
    if (selectedConferences && selectedConferences.length > 0) {
      if (selectedConferences.length < 12) {
        // Lấy tên viết tắt và nối chúng bằng dấu phẩy
        const acronyms = selectedConferences.map(conf => conf.Acronym).join(', ');
        setCrawlDescription(acronyms);
      } else {
        // Nếu lớn hơn hoặc bằng 12, đặt giá trị mặc định
        setCrawlDescription('Admin Crawl');
      }
    } else {
      // Nếu không có conference nào được chọn, reset description
      setCrawlDescription('');
    }
  }, [selectedConferences]); // Chạy lại hiệu ứng khi danh sách conference thay đổi

  const handleStartProcessClick = () => {
    // Người dùng vẫn có thể chỉnh sửa description, nên chúng ta sẽ dùng giá trị hiện tại của state
    onStartProcess(crawlDescription.trim() || undefined);
  };


  const handleResumeClick = () => {
    onResume(chunksToResume);
  };

  const showStatusSection = isCrawling || crawlMessages.length > 0 || crawlError || crawlProgress.status !== 'idle';
  const showControlPanel = isCrawling && isPaused && enableChunking;

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-5 bg-white shadow-md">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">{t('header.title')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('header.description')}</p>
      </div>

      {/* Description Input Section */}
      <div className={`pt-2 p-4 rounded-md border shadow-sm transition-colors ${isCrawling ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-100'}`}>
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
          placeholder={t('descriptionInput.placeholder')}
          value={crawlDescription}
          onChange={(e) => setCrawlDescription(e.target.value)}
          disabled={isCrawling}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        <p className="mt-1 text-xs text-gray-600">
          {t('descriptionInput.characterCount', { current: crawlDescription.length, max: MAX_DESCRIPTION_LENGTH })}
        </p>
      </div>

      {/* --- BẢNG ĐIỀU KHIỂN --- */}
      {showControlPanel && (
        <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 space-y-4">
          <h4 className="text-lg font-semibold text-blue-800 text-center flex items-center justify-center">
            <FaPauseCircle className="mr-3 text-blue-500" />
            {t('controlPanel.title')}
          </h4>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('controlPanel.autoResumeMessage')}</p>
            <p className="text-4xl font-bold text-blue-600 my-1">{countdown}s</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button onClick={() => onResume(1)} className={btnPrimary}>
              <FaPlay className="mr-2" /> {t('controlPanel.resumeOneButton')}
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={chunksToResume}
                onChange={(e) => setChunksToResume(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 text-center rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
              <button onClick={handleResumeClick} className={btnSecondary}>
                {t('controlPanel.resumeNButton', { count: chunksToResume })} <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NÚT HÀNH ĐỘNG CHÍNH --- */}
      <div className='flex flex-wrap gap-3 pt-2'>
        {!isCrawling && (
          <button onClick={handleStartProcessClick} disabled={!canStartProcess} className={btnPrimary}>
            <FaPlay className='-ml-1 mr-2 h-4 w-4' /> {t('buttons.startProcessing')}
          </button>
        )}

        {isCrawling && (
          <button onClick={onStopProcess} className={btnDanger}>
            <FaStopCircle className='-ml-1 mr-2 h-4 w-4' /> {t('buttons.stopProcess')}
          </button>
        )}

        <button onClick={onResetAll} disabled={isCrawling} className={btnSecondary}>
          <FaRedo className='mr-2 h-3.5 w-3.5' /> {t('buttons.resetAll')}
        </button>
      </div>

      {/* --- KHU VỰC TRẠNG THÁI VÀ LOG --- */}
      {showStatusSection && (
        <div className='mt-5 rounded-md border border-gray-200 p-5 bg-gray-10 shadow-sm'>
          <h4 className='text-base mb-3 font-semibold text-gray-800'>{t('statusLog.title')}</h4>

          {isCrawling && crawlProgress.total > 1 && (
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
                <div className='h-full rounded-full bg-blue-600 transition-all duration-500 ease-out' style={{ width: `${(crawlProgress.current / crawlProgress.total) * 100}%` }}></div>
              </div>
            </div>
          )}

          {isCrawling && !isPaused && (
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

          {crawlProgress.status === 'stopped' && (
            <p className='mb-3 flex items-center text-sm text-yellow-700 font-medium p-2.5 bg-yellow-50 border border-yellow-200 rounded-md'>
              <FaStopCircle className='mr-2 h-4 w-4' /> {t('statusLog.processStoppedByUser')}
            </p>
          )}

          {!isCrawling && crawlProgress.status === 'success' && (
            <p className='mb-3 flex items-center text-sm text-green-700 font-medium p-2.5 bg-green-50 border border-green-200 rounded-md'>
              <FaCheckCircle className='mr-2 h-4 w-4' /> {t('statusLog.processCompletedSuccessfully')}
            </p>
          )}

          {!isCrawling && crawlProgress.status === 'error' && (
            <p className='mb-3 flex items-center text-sm text-red-700 font-medium p-2.5 bg-red-50 border border-red-200 rounded-md'>
              <FaTimesCircle className='mr-2 h-4 w-4' /> {t('statusLog.processFailed')}
            </p>
          )}

          {crawlMessages.length > 0 && (
            <div className='custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs font-mono text-gray-700 shadow-inner'>
              {crawlMessages.map((msg, index) => (
                <p key={index} className={`break-words leading-relaxed ${msg.startsWith('FAILED') ? 'font-bold text-red-600' : msg.startsWith('WARNING:') ? 'font-semibold text-orange-600' : msg.includes('submitted') ? 'font-medium text-blue-700' : 'text-gray-800'}`}>
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nút Previous */}
      <div className="mt-6 flex justify-start">
        <button type="button" onClick={onPrev} disabled={isCrawling} className={btnSecondary}>
          <FaChevronLeft className="mr-2 h-3.5 w-3.5" /> {t('navigation.previousStep')}
        </button>
      </div>
    </div>
  );
};

export default ProcessingStep;