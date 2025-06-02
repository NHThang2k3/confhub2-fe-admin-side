// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/JournalKpiSection.tsx (File mới)
import React from 'react';
import {
  FaHourglassHalf, FaTasks, FaExclamationTriangle, FaSearch, FaDatabase,
  FaListAlt, FaFileExport, FaKey, FaSyncAlt, FaServer
} from 'react-icons/fa';
import KpiCard from '../overallSummary/KpiCard'; // Tái sử dụng
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import { formatDuration } from '../utils/commonUtils'; // Tái sử dụng
import { useTranslations } from 'next-intl';

const KpiIcon: React.FC<{ bgColor: string; textColor: string; children: React.ReactNode }> = ({ bgColor, textColor, children }) => (
  <div className={`rounded-full p-2.5 ${bgColor} ${textColor}`}>
    {children}
  </div>
);

interface JournalKpiSectionProps {
  data: JournalLogAnalysisResult;
}

const JournalKpiSection: React.FC<JournalKpiSectionProps> = ({ data }) => {
  const t = useTranslations('JournalKpiSection'); // Namespace mới
  const overall = data.overall;
  const bioxbio = data.bioxbio;
  const scimago = data.scimago;
  const googleSearch = data.googleSearch; // Cho image search
  const fileOutput = data.fileOutput;
  const apiKeyManager = data.apiKeyManager; // Nếu Google Search dùng API Key Manager

  const totalJournals = overall?.totalJournalsInput || 0;
  const failedJournals = overall?.totalJournalsFailed || 0;
  let failedJournalsDisplay = `${failedJournals}`;
  if (totalJournals > 0 && failedJournals > 0) {
    const failedPercentage = (failedJournals / totalJournals) * 100;
    failedJournalsDisplay = `${failedJournals} (${failedPercentage.toFixed(1)}%)`;
  }

  return (
    <div className="space-y-6">
      {/* --- General KPIs --- */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        <KpiCard
          icon={<KpiIcon bgColor="bg-blue-100" textColor="text-blue-600"><FaHourglassHalf className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.totalDuration')}
          value={formatDuration(overall?.durationSeconds)}
        />
        <KpiCard
          icon={<KpiIcon bgColor="bg-green-100" textColor="text-green-600"><FaTasks className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.journalsProcessed')}
          value={overall?.totalJournalsProcessed ?? 0}
          valueDenominator={overall?.totalJournalsInput ?? undefined}
        />
        <KpiCard
          icon={<KpiIcon bgColor="bg-red-100" textColor="text-red-600"><FaExclamationTriangle className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.failedJournals')}
          value={failedJournalsDisplay}
          valueColor={failedJournals > 0 ? "text-red-600" : undefined}
        />
        <KpiCard
          icon={<KpiIcon bgColor="bg-indigo-100" textColor="text-indigo-600"><FaServer className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.requestsAnalyzed')}
          value={overall?.totalRequestsAnalyzed ?? 0}
        />
      </div>

      {/* --- Bioxbio KPIs --- */}
      {bioxbio && (bioxbio.totalFetchesAttempted > 0 || bioxbio.cacheHits > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaDatabase className="mr-2 text-orange-500" /> {t('bioxbioKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-orange-100" textColor="text-orange-600"><FaTasks className='h-5 w-5' /></KpiIcon>}
              label={t('bioxbioKpis.fetchesAttempted')}
              value={bioxbio.totalFetchesAttempted}
            />
            <KpiCard
              icon={<KpiIcon bgColor={bioxbio.totalFetchesSucceeded > 0 ? "bg-green-100" : "bg-gray-100"} textColor={bioxbio.totalFetchesSucceeded > 0 ? "text-green-600" : "text-gray-500"}><FaTasks className='h-5 w-5' /></KpiIcon>}
              label={t('bioxbioKpis.fetchesSucceeded')}
              value={bioxbio.totalFetchesSucceeded}
              subText={bioxbio.totalFetchesFailed > 0 ? t('bioxbioKpis.failedSubText', { count: bioxbio.totalFetchesFailed }) : undefined}
              subTextColor={bioxbio.totalFetchesFailed > 0 ? "text-xs text-red-500" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-teal-100" textColor="text-teal-600"><FaDatabase className='h-5 w-5' /></KpiIcon>}
              label={t('bioxbioKpis.cacheHits')}
              value={bioxbio.cacheHits}
              valueDenominator={bioxbio.cacheHits + bioxbio.cacheMisses}
            />
          </div>
        </div>
      )}

      {/* --- Scimago KPIs --- */}
      {scimago && scimago.scimagoDetailPagesAttempted > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaListAlt className="mr-2 text-sky-500" /> {t('scimagoKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-sky-100" textColor="text-sky-600"><FaTasks className='h-5 w-5' /></KpiIcon>}
              label={t('scimagoKpis.detailPagesAttempted')}
              value={scimago.scimagoDetailPagesAttempted}
            />
            <KpiCard
              icon={<KpiIcon bgColor={scimago.scimagoDetailPagesSucceeded > 0 ? "bg-green-100" : "bg-gray-100"} textColor={scimago.scimagoDetailPagesSucceeded > 0 ? "text-green-600" : "text-gray-500"}><FaTasks className='h-5 w-5' /></KpiIcon>}
              label={t('scimagoKpis.detailPagesSucceeded')}
              value={scimago.scimagoDetailPagesSucceeded}
              subText={scimago.scimagoDetailPagesFailed > 0 ? t('scimagoKpis.failedSubText', { count: scimago.scimagoDetailPagesFailed }) : undefined}
              subTextColor={scimago.scimagoDetailPagesFailed > 0 ? "text-xs text-red-500" : undefined}
            />
             <KpiCard
              icon={<KpiIcon bgColor={scimago.scimagoDetailPagesSkippedNullUrl > 0 ? "bg-yellow-100" : "bg-gray-100"} textColor={scimago.scimagoDetailPagesSkippedNullUrl > 0 ? "text-yellow-600" : "text-gray-500"}><FaTasks className='h-5 w-5' /></KpiIcon>}
              label={t('scimagoKpis.detailPagesSkipped')}
              value={scimago.scimagoDetailPagesSkippedNullUrl}
            />
          </div>
        </div>
      )}

      {/* --- Image Search (Google Search) KPIs --- */}
      {googleSearch && googleSearch.totalSearchesAttempted > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaSearch className="mr-2 text-blue-500" /> {t('imageSearchKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-blue-100" textColor="text-blue-600"><FaSearch className='h-5 w-5' /></KpiIcon>}
              label={t('imageSearchKpis.searchesAttempted')}
              value={googleSearch.totalSearchesAttempted}
            />
            <KpiCard
              icon={<KpiIcon bgColor={googleSearch.totalSearchesSucceeded > 0 ? "bg-green-100" : "bg-gray-100"} textColor={googleSearch.totalSearchesSucceeded > 0 ? "text-green-600" : "text-gray-500"}><FaSearch className='h-5 w-5' /></KpiIcon>}
              label={t('imageSearchKpis.searchesSucceeded')}
              value={googleSearch.totalSearchesSucceeded}
              subText={googleSearch.totalSearchesFailedAfterRetries > 0 ? t('imageSearchKpis.failedSubText', { count: googleSearch.totalSearchesFailedAfterRetries }) : undefined}
              subTextColor={googleSearch.totalSearchesFailedAfterRetries > 0 ? "text-xs text-red-500" : undefined}
            />
            {apiKeyManager && (
                 <KpiCard
                    icon={<KpiIcon
                        bgColor={apiKeyManager.rotationsDueToError > 0 || apiKeyManager.rotationsFailedExhausted > 0 ? "bg-red-100" : "bg-gray-100"}
                        textColor={apiKeyManager.rotationsDueToError > 0 || apiKeyManager.rotationsFailedExhausted > 0 ? "text-red-600" : "text-gray-500"}>
                        <FaKey className='h-5 w-5' />
                    </KpiIcon>}
                    label={t('imageSearchKpis.apiKeyRotations')}
                    value={apiKeyManager.rotationsDueToUsage + apiKeyManager.rotationsDueToError}
                    subText={apiKeyManager.rotationsFailedExhausted > 0 ? t('imageSearchKpis.exhaustedSubText', { count: apiKeyManager.rotationsFailedExhausted }) : undefined}
                    subTextColor={apiKeyManager.rotationsFailedExhausted > 0 ? "text-xs text-red-500" : undefined}
                />
            )}
          </div>
        </div>
      )}

      {/* --- File Output KPIs --- */}
      {fileOutput && (fileOutput.jsonlRecordsAttempted > 0 || fileOutput.jsonlRecordsSuccessfullyWritten > 0 || fileOutput.clientCsvParseAttempts > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaFileExport className="mr-2 text-purple-500" /> {t('fileOutputKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-purple-100" textColor="text-purple-600"><FaFileExport className='h-5 w-5' /></KpiIcon>}
              label={t('fileOutputKpis.jsonlWritten')}
              value={fileOutput.jsonlRecordsSuccessfullyWritten}
              valueDenominator={fileOutput.jsonlRecordsAttempted > 0 ? fileOutput.jsonlRecordsAttempted : undefined}
              subText={fileOutput.jsonlWriteErrors > 0 ? t('fileOutputKpis.errorsSubText', { count: fileOutput.jsonlWriteErrors }) : undefined}
              subTextColor={fileOutput.jsonlWriteErrors > 0 ? "text-xs text-red-500" : undefined}
            />
            {fileOutput.clientCsvParseAttempts > 0 && (
                <KpiCard
                icon={<KpiIcon bgColor="bg-lime-100" textColor="text-lime-600"><FaFileExport className='h-5 w-5' /></KpiIcon>}
                label={t('fileOutputKpis.clientCsvParsed')}
                value={fileOutput.clientCsvParseSuccess}
                valueDenominator={fileOutput.clientCsvParseAttempts}
                subText={fileOutput.clientCsvParseFailed > 0 ? t('fileOutputKpis.errorsSubText', { count: fileOutput.clientCsvParseFailed }) : undefined}
                subTextColor={fileOutput.clientCsvParseFailed > 0 ? "text-xs text-red-500" : undefined}
                />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalKpiSection;