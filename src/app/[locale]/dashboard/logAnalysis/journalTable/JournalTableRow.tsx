// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTableRow.tsx (MODIFIED)
import React from 'react';
// Ensure RowSaveStatus is imported correctly
import { JournalTableData, RowSaveStatus } from '@/src/hooks/crawl/journal/useJournalTableManager'; // Updated path based on manager
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaTimesCircle, FaCheckCircle, FaQuestionCircle, FaMinusCircle, FaExternalLinkAlt, FaSave, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { LogError } from '@/src/models/logAnalysis';

// --- MainJournalRowCells (No changes needed here) ---
// ... (giữ nguyên code của MainJournalRowCells và ExpandedJournalRowContent)
interface MainJournalRowCellsProps {
  journalData: JournalTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  formatDateTime: (isoString: string | null | undefined) => string;
  getStatusChipClass: (status: string | undefined | null) => string;
  t: (key: string, values?: any) => string;
  saveStatus: RowSaveStatus;
  saveError?: string;
  isAlreadyPersisted: boolean;
}

const StatusStepIcon: React.FC<{ success: boolean | null; attempted: boolean }> = ({ success, attempted }) => {
  if (!attempted) return <FaMinusCircle className="text-gray-400" title="Not Attempted" />;
  if (success === true) return <FaCheckCircle className="text-green-500" title="Successful" />;
  if (success === false) return <FaTimesCircle className="text-red-500" title="Failed" />;
  return <FaQuestionCircle className="text-yellow-500" title="Unknown/Skipped" />;
};


const MainJournalRowCells: React.FC<MainJournalRowCellsProps> = ({
  journalData, isSelected, isExpanded, onSelectToggle, onToggleExpand,
  formatDateTime, getStatusChipClass, t,
  saveStatus, saveError, isAlreadyPersisted
}) => {
  const {
    uniqueRowId, journalTitle, sourceId, dataSource, status,
    issn,
    durationSeconds, steps, errorCount
  } = journalData;
  const statusDisplay = status
    ? t(`statusNames.${status.toLowerCase()}`, { defaultValue: status })
    : t('statusNames.unknown');

  const renderSaveStatusIcon = () => {
    if (isAlreadyPersisted && saveStatus === 'idle') {
        return <FaCheckCircle className="text-green-500" title={t('saveStatus.alreadySaved')} />;
    }
    switch (saveStatus) {
      case 'saving':
        return <FaSpinner className="animate-spin text-blue-500" title={t('saveStatus.saving')} />;
      case 'success':
        return <FaCheckCircle className="text-green-500" title={t('saveStatus.saveSuccess')} />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" title={`${t('saveStatus.saveError')}: ${saveError || t('unknownError')}`} />;
      case 'idle':
      default:
        if (errorCount > 0) {
            return <FaTimesCircle className="text-gray-400" title={t('saveStatus.cannotSaveWithErrors')} />;
        }
        return <FaSave className="text-gray-400" title={t('saveStatus.readyToSave')} />;
    }
  };

  return (
    <>
      <td className='whitespace-nowrap px-3 py-2 text-center text-sm'>
        <input type='checkbox' className='h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
          checked={isSelected} onChange={() => onSelectToggle(uniqueRowId)} aria-label={t('selectRowAria', { title: journalTitle })} />
      </td>
      <td
        className='px-3 py-2 text-sm font-medium text-gray-900 max-w-[250px] cursor-pointer group'
        title={t('expandRowTooltip', { title: journalTitle, action: isExpanded ? t('collapse') : t('expand') })}
        onClick={() => onToggleExpand(uniqueRowId)}
      >
        <div className="flex items-center">
          {isExpanded
            ? <FaChevronUp className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />
            : <FaChevronDown className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />}
          <span className="truncate" title={journalTitle}>{journalTitle}</span>
        </div>
      </td>
      <td className='px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate' title={issn}>{issn || '-'}</td>
      <td className='px-3 py-2 text-sm text-gray-500 max-w-[100px] truncate' title={dataSource}>{dataSource}</td>
      <td className='whitespace-nowrap px-3 py-2 text-sm'>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getStatusChipClass(status)}`}>
          {statusDisplay}
        </span>
      </td>
      <td className='whitespace-nowrap px-6 text-center text-lg'><StatusStepIcon success={steps.bioxbio_success} attempted={steps.bioxbio_attempted} /></td>
      <td className='whitespace-nowrap px-6 text-center text-lg'><StatusStepIcon success={steps.scimago_details_success} attempted={steps.scimago_details_attempted} /></td>
      <td className='whitespace-nowrap px-6 text-center text-lg'><StatusStepIcon success={steps.image_search_success} attempted={steps.image_search_attempted} /></td>
      <td className='whitespace-nowrap px-6 text-center text-lg'><StatusStepIcon success={steps.jsonl_write_success} attempted={!!steps.jsonl_write_success || errorCount > 0 || status === 'completed' || status === 'failed'} /></td>
      <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
        {errorCount > 0 && <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' title={t('errorCountTooltip', { count: errorCount })} />}
        {errorCount}
      </td>
      <td className="whitespace-nowrap px-10 py-2 text-center text-sm">
        {renderSaveStatusIcon()}
      </td>
    </>
  );
};

interface ExpandedJournalRowContentProps {
  journalData: JournalTableData;
  formatDateTime: (isoString: string | null | undefined) => string;
  t: (key: string, values?: any) => string;
}

const ExpandedJournalRowContent: React.FC<ExpandedJournalRowContentProps> = ({ journalData, formatDateTime, t }) => {
  const { errors, steps, originalInput, startTime, endTime } = journalData;
  const colSpan = 13;

  return (
    <td colSpan={colSpan} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4 bg-slate-50'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">{t('expanded.basicInfoTitle')}</h4>
          <p><strong>{t('expanded.startTimeLabel')}:</strong> {formatDateTime(startTime)}</p>
          <p><strong>{t('expanded.endTimeLabel')}:</strong> {formatDateTime(endTime)}</p>
          {originalInput && (
            <p>
              <strong>{t('expanded.originalInputLabel')}:</strong>
              <span className="block whitespace-pre-wrap break-all bg-gray-100 p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
                {originalInput}
              </span>
            </p>
          )}
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">{t('expanded.stepsTitle')}</h4>
          <ul className="list-disc list-inside pl-1 space-y-1 text-xs">
            <li><strong>{t('expanded.bioxbioAttempted')}:</strong> {steps.bioxbio_attempted ? t('yes') : t('no')} ({t('expanded.success')}: {steps.bioxbio_success === null ? t('na') : steps.bioxbio_success ? t('yes') : t('no')}, {t('expanded.cacheUsed')}: {steps.bioxbio_cache_used === null ? t('na') : typeof steps.bioxbio_cache_used === 'boolean' ? (steps.bioxbio_cache_used ? t('yes') : t('no')) : t('na')})</li>
            <li><strong>{t('expanded.scimagoDetailsAttempted')}:</strong> {steps.scimago_details_attempted ? t('yes') : t('no')} ({t('expanded.success')}: {steps.scimago_details_success === null ? t('na') : steps.scimago_details_success ? t('yes') : t('no')})</li>
            <li><strong>{t('expanded.imageSearchAttempted')}:</strong> {steps.image_search_attempted ? t('yes') : t('no')} ({t('expanded.success')}: {steps.image_search_success === null ? t('na') : steps.image_search_success ? t('yes') : t('no')})</li>
            <li><strong>{t('expanded.jsonlWriteSuccess')}:</strong> {steps.jsonl_write_success === null ? t('na') : steps.jsonl_write_success ? t('yes') : t('no')}</li>
          </ul>
        </div>
        {errors && errors.length > 0 && (
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-semibold text-red-600">{t('expanded.errorsTitle', { count: errors.length })}</h4>
            <ul className="list-disc list-inside pl-1 space-y-1 text-xs max-h-40 overflow-y-auto bg-red-50 p-2 rounded border border-red-200">
              {errors.map((err: LogError, index: number) => (
                <li key={index} className="text-red-700">
                  <strong>[{err.timestamp ? formatDateTime(err.timestamp) : 'N/A'}] {err.key}:</strong> {err.message}
                  {err.details && <pre className="text-xs whitespace-pre-wrap break-all bg-red-100 p-1 mt-1 rounded max-h-24 overflow-y-auto">{JSON.stringify(err.details, null, 2)}</pre>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </td>
  );
};


// --- JournalTableRow (Main Component) ---
interface JournalTableRowProps {
  journalData: JournalTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  formatDateTime: (isoString: string | null | undefined) => string;
  getStatusChipClass: (status: string | undefined | null) => string;
  saveStatus: RowSaveStatus;
  saveError?: string;
}

export const JournalTableRow: React.FC<JournalTableRowProps> = ({
  journalData, isSelected, isExpanded, onSelectToggle, onToggleExpand, formatDateTime, getStatusChipClass,
  saveStatus, saveError
}) => {
  const t = useTranslations('JournalTableRow');
  const { status, errorCount, persistedSaveStatus, uniqueRowId } = journalData;

  // Logic to determine background class. The 'animate-pulse' class has been removed.
  let rowBgClass = 'hover:bg-gray-100'; // Default hover

  if (saveStatus === 'saving') {
    // REMOVED 'animate-pulse'
    rowBgClass = isSelected ? 'bg-blue-200 hover:bg-blue-300' : 'bg-blue-100 hover:bg-blue-200';
  } else if (saveStatus === 'success') {
    rowBgClass = isSelected ? 'bg-green-200 hover:bg-green-300' : 'bg-green-100 hover:bg-green-200';
  } else if (saveStatus === 'error') {
    rowBgClass = isSelected ? 'bg-red-200 hover:bg-red-300' : 'bg-red-100 hover:bg-red-200';
  }
  // Fallback to original logic if saveStatus is 'idle'
  else if (persistedSaveStatus === 'SAVED_TO_DATABASE') {
     rowBgClass = isSelected ? 'bg-teal-100 hover:bg-teal-200' : 'bg-teal-50 hover:bg-teal-100';
  } else if (errorCount > 0) {
    rowBgClass = isSelected ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100';
  } else if (isSelected) {
    rowBgClass = 'bg-blue-50 hover:bg-blue-100';
  } else {
    if (status === 'failed') rowBgClass = 'bg-red-50 hover:bg-red-100';
    // REMOVED 'animate-pulse' from processing status as well for consistency
    else if (status === 'processing') rowBgClass = 'bg-blue-50 hover:bg-blue-100';
    else if (status === 'completed') rowBgClass = 'bg-white hover:bg-green-50';
    else rowBgClass = 'bg-white hover:bg-gray-100';
  }

  return (
    <React.Fragment>
      <tr className={`${rowBgClass} transition-colors duration-150`} key={uniqueRowId}>
        <MainJournalRowCells
          journalData={journalData}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onSelectToggle={onSelectToggle}
          onToggleExpand={onToggleExpand}
          formatDateTime={formatDateTime}
          getStatusChipClass={getStatusChipClass}
          t={t}
          saveStatus={saveStatus}
          saveError={saveError}
          isAlreadyPersisted={persistedSaveStatus === 'SAVED_TO_DATABASE'}
        />
      </tr>
      {isExpanded && (
        <tr className='bg-slate-50 hover:bg-slate-100' key={`${uniqueRowId}-expanded`}>
          <ExpandedJournalRowContent journalData={journalData} formatDateTime={formatDateTime} t={t} />
        </tr>
      )}
    </React.Fragment>
  );
};