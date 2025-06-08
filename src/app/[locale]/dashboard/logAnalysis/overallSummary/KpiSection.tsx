// src/app/[locale]/dashboard/logAnalysis/overallSummary/KpiSection.tsx
import React from 'react';
import {
  FaExclamationTriangle, FaClipboardCheck, FaKey, FaSyncAlt, FaBan,
  FaSearch, FaGoogle, FaBrain, FaCodeBranch, FaArchive, FaTools, FaCogs, FaBroom,
  FaShieldAlt, FaTasks, FaHourglassHalf, FaRocket, FaWrench, FaServer, FaMemory, FaBolt, FaFileAlt
} from 'react-icons/fa';
import KpiCard from './KpiCard';
import {
  ConferenceLogAnalysisResult,
  GoogleSearchHealthData,
  GeminiApiAnalysis,
  ValidationStats
} from '@/src/models/logAnalysis';
import { formatDuration } from '../utils/commonUtils';
import { useTranslations } from 'next-intl'; // Import useTranslations

const KpiIcon: React.FC<{ bgColor: string; textColor: string; children: React.ReactNode }> = ({ bgColor, textColor, children }) => (
  <div className={`rounded-full p-2.5 ${bgColor} ${textColor}`}>
    {children}
  </div>
);

interface KpiSectionProps {
  data: ConferenceLogAnalysisResult;
  googleSearchHealthData: GoogleSearchHealthData | null;
  geminiApiData: GeminiApiAnalysis | undefined;
  validationStats?: ValidationStats;
}

const KpiSection: React.FC<KpiSectionProps> = ({
  data,
  googleSearchHealthData,
  geminiApiData,
  validationStats
}) => {
  // Khởi tạo t với namespace 'KpiSection'
  const t = useTranslations('KpiSection');

  const overall = data.overall;
  const fileOutput = data.fileOutput;
  const gSearchHealth = googleSearchHealthData;
  const gSearchStats = data.googleSearch;

  const actualTotalGeminiCallsWithRetries = geminiApiData
    ? (geminiApiData.primaryModelStats.attempts || 0) +
    (geminiApiData.fallbackModelStats.attempts || 0) +
    (geminiApiData.totalRetries || 0)
    : 0;

  const geminiInit = geminiApiData?.serviceInitialization;
  const geminiPrimary = geminiApiData?.primaryModelStats;
  const geminiFallback = geminiApiData?.fallbackModelStats;
  const geminiCache = geminiApiData;

  const geminiInitFailures = geminiInit?.failures || 0;

  const totalTasks = overall?.processedConferencesCount || 0;
  const failedTasks = overall?.failedOrCrashedTasks || 0;
  let failedTasksDisplay = `${failedTasks}`;
  if (totalTasks > 0) {
    const failedTasksPercentage = (failedTasks / totalTasks) * 100;
    failedTasksDisplay = `${failedTasks} (${failedTasksPercentage.toFixed(1)}%)`;
  } else if (failedTasks > 0) {
    failedTasksDisplay = `${failedTasks}`;
  }

  const primaryFailures = geminiPrimary?.failures || 0;
  const primarySuccesses = geminiPrimary?.successes || 0;
  const primaryAttempts = geminiPrimary?.attempts || 0;

  const fallbackFailures = geminiFallback?.failures || 0;
  const fallbackSuccesses = geminiFallback?.successes || 0;
  const fallbackAttempts = geminiFallback?.attempts || 0;

  // THÊM: Lấy dữ liệu cho KPI Retries
  const totalRetries = geminiApiData?.totalRetries || 0;
  const retriesByType = geminiApiData?.retriesByType;


  let retriesSubText: string | undefined = undefined;
  if (retriesByType && Object.keys(retriesByType).length > 0) {
    retriesSubText = Object.entries(retriesByType)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }

  const totalConfigSetupErrors = geminiApiData ?
    (geminiApiData.configErrors?.modelListMissing || 0) +
    (geminiApiData.configErrors?.apiTypeConfigMissing || 0) +
    (geminiApiData.apiCallSetupFailures || 0) +
    (geminiPrimary?.preparationFailures || 0) +
    (geminiFallback?.preparationFailures || 0)
    : 0;

  const totalResponseProcessingIssues = geminiApiData?.responseProcessingStats ?
    (geminiApiData.responseProcessingStats.jsonValidationFailedInternal || 0) +
    (geminiApiData.responseProcessingStats.emptyAfterProcessingInternal || 0)
    : 0;

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
          label={data.filterRequestId ? t('generalKpis.tasksInRequest') : t('generalKpis.conferencesProcessed')}
          value={overall?.processedConferencesCount ?? 0}
          valueDenominator={data.filterRequestId ? undefined : (overall?.totalConferencesInput ?? undefined)}
        />
        <KpiCard
          icon={<KpiIcon bgColor="bg-red-100" textColor="text-red-600"><FaExclamationTriangle className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.failedTasks')}
          value={failedTasksDisplay}
          valueColor={(overall?.failedOrCrashedTasks || 0) > 0 ? "text-red-600" : undefined}
        />
        <KpiCard
          icon={<KpiIcon bgColor="bg-purple-100" textColor="text-purple-600"><FaRocket className='h-5 w-5' /></KpiIcon>}
          label={t('generalKpis.geminiOps')}
          value={actualTotalGeminiCallsWithRetries}
        />
      </div>

      {/* --- Gemini API KPIs --- */}
      {geminiApiData && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaBrain className="mr-2 text-purple-500" /> {t('geminiApiKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-indigo-100" textColor="text-indigo-600"><FaServer className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.serviceInits')}
              value={geminiInit?.completes || 0}
              valueDenominator={geminiInit?.starts || 0}
              subText={geminiInitFailures > 0 ? t('geminiApiKpis.failedSubText', { count: geminiInitFailures }) : undefined}
              subTextColor={geminiInitFailures > 0 ? "text-xs text-red-500" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-sky-100" textColor="text-sky-600"><FaTools className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.primaryCalls')}
              value={primaryAttempts}
              subText={t('geminiApiKpis.successFailSubText', { s: primarySuccesses, f: primaryFailures })}
              subTextColor={primaryFailures > 0 ? "text-xs text-red-500" : "text-xs text-green-500"}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-cyan-100" textColor="text-cyan-600"><FaCodeBranch className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.fallbackCalls')}
              value={fallbackAttempts}
              subText={t('geminiApiKpis.successFailSubText', { s: fallbackSuccesses, f: fallbackFailures })}
              subTextColor={fallbackFailures > 0 ? "text-xs text-red-500" : "text-xs text-green-500"}
            />

             {/* THÊM: Thẻ KPI mới cho Retries */}
            <KpiCard
              icon={<KpiIcon bgColor="bg-yellow-100" textColor="text-yellow-600"><FaSyncAlt className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.apiRetries')}
              value={totalRetries}
              valueColor={totalRetries > 0 ? "text-yellow-600" : undefined}
              subText={retriesSubText}
              subTextColor={retriesSubText ? "text-xs text-gray-500" : undefined}
            />
            
            <KpiCard
              icon={<KpiIcon bgColor="bg-pink-100" textColor="text-pink-600"><FaBan className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.safetyBlocks')}
              value={geminiApiData.blockedBySafety || 0}
              valueColor={(geminiApiData.blockedBySafety || 0) > 0 ? "text-pink-600" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-lime-100" textColor="text-lime-600"><FaArchive className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.totalTokensUsed')}
              value={geminiApiData.totalTokens > 0 ? (geminiApiData.totalTokens / 1000).toFixed(1) + t('geminiApiKpis.thousandSuffix') : `0${t('geminiApiKpis.thousandSuffix')}`}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-yellow-100" textColor="text-yellow-600"><FaMemory className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.cacheHits')}
              value={geminiCache?.cacheContextHits || 0}
              valueDenominator={geminiCache?.cacheDecisionStats?.cacheUsageAttempts || 0}
              subText={t('geminiApiKpis.attemptedToUseCache')}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-orange-100" textColor="text-orange-600"><FaWrench className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.configSetupErrors')}
              value={totalConfigSetupErrors}
              valueColor={totalConfigSetupErrors > 0 ? "text-orange-600" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-red-100" textColor="text-red-600"><FaBolt className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.intermediateErrors')}
              value={geminiApiData.intermediateErrors || 0}
              valueColor={(geminiApiData.intermediateErrors || 0) > 0 ? "text-red-500" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-gray-100" textColor="text-gray-600"><FaFileAlt className='h-5 w-5' /></KpiIcon>}
              label={t('geminiApiKpis.responseProcIssues')}
              value={totalResponseProcessingIssues}
              valueColor={totalResponseProcessingIssues > 0 ? "text-yellow-700" : undefined}
            />
          </div>
        </div>
      )}

      {/* --- Google Search KPIs --- */}
      {(gSearchStats || gSearchHealth) && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> {t('googleSearchKpis.title')}
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-teal-100" textColor="text-teal-600"><FaSearch className='h-5 w-5' /></KpiIcon>}
              label={t('googleSearchKpis.totalRequests')}
              value={gSearchStats?.totalRequests ?? 0}
            />
            <KpiCard
              icon={<KpiIcon
                bgColor={(gSearchStats?.quotaErrors || 0) > 0 ? "bg-red-100" : "bg-gray-100"}
                textColor={(gSearchStats?.quotaErrors || 0) > 0 ? "text-red-600" : "text-gray-500"}>
                <FaBan className='h-5 w-5' />
              </KpiIcon>}
              label={t('googleSearchKpis.quotaErrors')}
              value={gSearchStats?.quotaErrors || 0}
              valueColor={(gSearchStats?.quotaErrors || 0) > 0 ? "text-red-600" : undefined}
            />
            {gSearchHealth && (
              <>
                <KpiCard
                  icon={<KpiIcon
                    bgColor={gSearchHealth.rotationsSuccess > 0 ? "bg-sky-100" : "bg-gray-100"}
                    textColor={gSearchHealth.rotationsSuccess > 0 ? "text-sky-600" : "text-gray-500"}>
                    <FaSyncAlt className='h-5 w-5' />
                  </KpiIcon>}
                  label={t('googleSearchKpis.keyRotations')}
                  value={gSearchHealth.rotationsSuccess}
                  valueDenominator={gSearchHealth.rotationsSuccess + gSearchHealth.rotationsFailed}
                  subText={gSearchHealth.rotationsFailed > 0 ? t('googleSearchKpis.failedSubText', { count: gSearchHealth.rotationsFailed }) : undefined}
                  subTextColor={gSearchHealth.rotationsFailed > 0 ? "text-xs text-red-500" : undefined}
                />
                <KpiCard
                  icon={<KpiIcon
                    bgColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "bg-orange-100" : "bg-gray-100"}
                    textColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "text-orange-600" : "text-gray-500"}>
                    <FaBan className='h-5 w-5' />
                  </KpiIcon>}
                  label={t('googleSearchKpis.allKeysExhausted')}
                  value={gSearchHealth.allKeysExhaustedOnGetNextKey}
                  valueColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "text-orange-600" : undefined}
                />
              </>
            )}
          </div>
        </div>
      )}


      {/* --- Output & Validation KPIs --- */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-md font-semibold mb-3 text-gray-700">{t('outputValidationKpis.title')}</h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          <KpiCard
            icon={<KpiIcon
              bgColor={fileOutput?.csvFileGenerated === true ? 'bg-emerald-100' : fileOutput?.csvFileGenerated === false ? 'bg-red-100' : 'bg-gray-100'}
              textColor={fileOutput?.csvFileGenerated === true ? 'text-emerald-600' : fileOutput?.csvFileGenerated === false ? 'text-red-600' : 'text-gray-500'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </KpiIcon>}
            label={t('outputValidationKpis.csvRecordsWritten')}
            value={fileOutput?.csvRecordsSuccessfullyWritten ?? 0}
            valueDenominator={fileOutput?.csvRecordsAttempted ?? undefined}
            subText={fileOutput?.csvPipelineFailures ?? 0 > 0 ? t('outputValidationKpis.pipelineFailsSubText', { count: fileOutput?.csvPipelineFailures }) : undefined}
            subTextColor={fileOutput?.csvPipelineFailures ?? 0 > 0 ? "text-xs text-red-500 mt-0.5" : undefined}
          />
          {validationStats && (
            <>
              <KpiCard
                icon={<KpiIcon
                  bgColor={(validationStats.totalValidationWarnings || 0) > 0 ? 'bg-amber-100' : 'bg-gray-100'}
                  textColor={(validationStats.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : 'text-gray-500'}>
                  <FaExclamationTriangle className='h-5 w-5' />
                </KpiIcon>}
                label={t('outputValidationKpis.validationWarnings')}
                value={validationStats.totalValidationWarnings}
                valueColor={(validationStats.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : undefined}
              />
              <KpiCard
                icon={<KpiIcon
                  bgColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? 'bg-red-100' : 'bg-gray-100'}
                  textColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? 'text-red-600' : 'text-gray-500'}>
                  <FaExclamationTriangle className='h-5 w-5' />
                </KpiIcon>}
                label={t('outputValidationKpis.highSevWarnings')}
                value={validationStats.warningsBySeverity?.High || 0}
                valueColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? "text-red-600" : undefined}
              />
              <KpiCard
                icon={<KpiIcon bgColor="bg-sky-100" textColor="text-sky-600"> <FaBroom className='h-5 w-5' /> </KpiIcon>}
                label={t('outputValidationKpis.dataNormalizations')}
                value={validationStats.totalNormalizationsApplied}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiSection;