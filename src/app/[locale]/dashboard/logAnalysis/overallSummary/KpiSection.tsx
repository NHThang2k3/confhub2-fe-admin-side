// src/app/[locale]/dashboard/logAnalysis/overallSummary/KpiSection.tsx
import React from 'react';
import {
    FaExclamationTriangle, FaClipboardCheck, FaKey, FaSyncAlt, FaBan,
    FaSearch, FaGoogle, FaBrain, FaCodeBranch, FaArchive, FaTools, FaCogs, FaBroom // << THÊM FaBroom
} from 'react-icons/fa';
import KpiCard from './KpiCard';
import {
    LogAnalysisResult,
    GoogleSearchHealthData,
    GeminiApiAnalysis,
    ValidationStats // << IMPORT ValidationStats
} from '@/src/models/logAnalysis/logAnalysis';
import { formatDuration } from '../utils/commonUtils';

const KpiIcon: React.FC<{ bgColor: string; textColor: string; children: React.ReactNode }> = ({ bgColor, textColor, children }) => (
  <div className={`rounded-full p-2.5 ${bgColor} ${textColor}`}> {/* Giảm padding một chút cho icon nhỏ hơn */}
    {children}
  </div>
);

interface KpiSectionProps {
  data: LogAnalysisResult;
  googleSearchHealthData: GoogleSearchHealthData | null;
  geminiApiData: GeminiApiAnalysis | undefined;
  totalGeminiCallsWithRetries: number;
  validationStats?: ValidationStats; // << THÊM validationStats, có thể là undefined ban đầu
}

const KpiSection: React.FC<KpiSectionProps> = ({
    data,
    googleSearchHealthData,
    geminiApiData,
    totalGeminiCallsWithRetries,
    validationStats // << Thêm vào props
}) => {
  const overall = data.overall;
  // const validationStats = data.validationStats; // Lấy từ props thay vì data trực tiếp
  const fileOutput = data.fileOutput;
  const gSearchHealth = googleSearchHealthData;
  const gSearchStats = data.googleSearch;

  const geminiInit = geminiApiData?.serviceInitialization;
  const geminiFallback = geminiApiData?.fallbackLogic;
  // const geminiFewShot = geminiApiData?.fewShotPreparation; // Không dùng trực tiếp ở đây nữa
  const geminiConfig = geminiApiData?.configErrors;

  const geminiInitFailures = geminiInit?.failures || 0;
  const geminiFallbackPrimaryFails = geminiFallback?.primaryModelFailuresLeadingToFallback || 0;

  // totalGeminiConfigErrors sẽ được tính từ geminiConfigErrorsData trong OverallSummary
  // và có thể truyền vào đây nếu cần hiển thị KPI riêng cho config errors

  return (
    <div className="space-y-6">
      {/* --- General KPIs --- */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'> {/* Điều chỉnh grid cho phù hợp */}
        <KpiCard
          icon={
            <KpiIcon bgColor="bg-blue-100" textColor="text-blue-600">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </KpiIcon>
          }
          label="Total Duration"
          value={formatDuration(overall?.durationSeconds)}
        />
        <KpiCard
          icon={
            <KpiIcon bgColor="bg-green-100" textColor="text-green-600">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </KpiIcon>
          }
          label={data.filterRequestId ? 'Tasks in Request' : 'Conferences Processed'}
          value={overall?.processedConferencesCount ?? 0}
          valueDenominator={data.filterRequestId ? undefined : (overall?.totalConferencesInput ?? undefined)}
        />
         <KpiCard
          icon={
            <KpiIcon bgColor="bg-red-100" textColor="text-red-600">
                <FaExclamationTriangle className='h-5 w-5' />
            </KpiIcon>
          }
          label="Failed Tasks"
          value={overall?.failedOrCrashedTasks || 0}
          valueColor={(overall?.failedOrCrashedTasks || 0) > 0 ? "text-red-600" : undefined}
        />
        <KpiCard
          icon={
            <KpiIcon bgColor="bg-purple-100" textColor="text-purple-600">
              <FaBrain className='h-5 w-5' />
            </KpiIcon>
          }
          label="Gemini Calls (Total)"
          value={totalGeminiCallsWithRetries}
        />
      </div>

      {/* --- Gemini API KPIs --- */}
      {geminiApiData && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaBrain className="mr-2 text-purple-500" /> Gemini API Health
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            <KpiCard
              icon={<KpiIcon bgColor="bg-indigo-100" textColor="text-indigo-600"><FaCogs className='h-5 w-5' /></KpiIcon>}
              label="Service Inits"
              value={geminiInit?.completes || 0}
              valueDenominator={geminiInit?.starts || 0}
              subText={geminiInitFailures > 0 ? `${geminiInitFailures} Failed` : undefined}
              subTextColor={geminiInitFailures > 0 ? "text-xs text-red-500" : undefined}
            />
            <KpiCard
              icon={<KpiIcon bgColor="bg-cyan-100" textColor="text-cyan-600"><FaCodeBranch className='h-5 w-5' /></KpiIcon>}
              label="Fallback Calls Made"
              value={geminiFallback?.attemptsWithFallbackModel || 0}
              subText={geminiFallbackPrimaryFails > 0 ? `${geminiFallbackPrimaryFails} Primary Fails` : undefined}
            />
             <KpiCard
              icon={<KpiIcon bgColor="bg-pink-100" textColor="text-pink-600"><FaBan className='h-5 w-5' /></KpiIcon>}
              label="Safety Blocks"
              value={geminiApiData.blockedBySafety || 0}
              valueColor={(geminiApiData.blockedBySafety || 0) > 0 ? "text-pink-600" : undefined}
            />
            <KpiCard
                icon={<KpiIcon bgColor="bg-lime-100" textColor="text-lime-600"><FaArchive className='h-5 w-5' /></KpiIcon>}
                label="Total Tokens Used"
                value={geminiApiData.totalTokens !== undefined ? (geminiApiData.totalTokens / 1000).toFixed(1) + 'k' : '0k'}
            />
          </div>
        </div>
      )}


      {/* --- Google Search KPIs --- */}
      {(gSearchStats || gSearchHealth) && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> Google Search Metrics
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'> {/* Điều chỉnh grid */}
            <KpiCard
              icon={<KpiIcon bgColor="bg-teal-100" textColor="text-teal-600"><FaSearch className='h-5 w-5' /></KpiIcon>}
              label="GS Total Requests"
              value={gSearchStats?.totalRequests ?? 0}
            />
            <KpiCard
                icon={<KpiIcon
                        bgColor={(gSearchStats?.quotaErrorsEncountered || 0) > 0 ? "bg-red-100" : "bg-gray-100"}
                        textColor={(gSearchStats?.quotaErrorsEncountered || 0) > 0 ? "text-red-600" : "text-gray-500"}>
                        <FaBan className='h-5 w-5' />
                      </KpiIcon>}
                label="GS Quota Errors"
                value={gSearchStats?.quotaErrorsEncountered || 0}
                valueColor={(gSearchStats?.quotaErrorsEncountered || 0) > 0 ? "text-red-600" : undefined}
            />
             {gSearchHealth && (
              <>
                <KpiCard
                    icon={<KpiIcon
                            bgColor={gSearchHealth.rotationsSuccess > 0 ? "bg-sky-100" : "bg-gray-100"}
                            textColor={gSearchHealth.rotationsSuccess > 0 ? "text-sky-600" : "text-gray-500"}>
                            <FaSyncAlt className='h-5 w-5' />
                          </KpiIcon>}
                    label="GS Key Rotations"
                    value={gSearchHealth.rotationsSuccess}
                    valueDenominator={gSearchHealth.rotationsSuccess + gSearchHealth.rotationsFailed}
                    subText={gSearchHealth.rotationsFailed > 0 ? `${gSearchHealth.rotationsFailed} Failed` : undefined}
                    subTextColor={gSearchHealth.rotationsFailed > 0 ? "text-xs text-red-500" : undefined}
                />
                <KpiCard
                    icon={<KpiIcon
                            bgColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "bg-orange-100" : "bg-gray-100"}
                            textColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "text-orange-600" : "text-gray-500"}>
                            <FaBan className='h-5 w-5' />
                          </KpiIcon>}
                    label="GS All Keys Exhausted"
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
        <h3 className="text-md font-semibold mb-3 text-gray-700">Output & Data Quality</h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'> {/* Điều chỉnh grid */}
          <KpiCard
            icon={<KpiIcon
                    bgColor={fileOutput?.csvFileGenerated === true ? 'bg-emerald-100' : fileOutput?.csvFileGenerated === false ? 'bg-red-100' : 'bg-gray-100'}
                    textColor={fileOutput?.csvFileGenerated === true ? 'text-emerald-600' : fileOutput?.csvFileGenerated === false ? 'text-red-600' : 'text-gray-500'}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </KpiIcon>}
            label="CSV Records Written"
            value={fileOutput?.csvRecordsSuccessfullyWritten ?? 0}
            valueDenominator={fileOutput?.csvRecordsAttempted ?? undefined} // Chỉ hiển thị nếu > 0
            subText={fileOutput?.csvPipelineFailures ?? 0 > 0 ? `${fileOutput?.csvPipelineFailures} Pipeline Fails` : undefined}
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
                label="Validation Warnings"
                value={validationStats.totalValidationWarnings}
                valueColor={(validationStats.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : undefined}
              />
              <KpiCard
                icon={<KpiIcon
                        bgColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? 'bg-red-100' : 'bg-gray-100'}
                        textColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? 'text-red-600' : 'text-gray-500'}>
                        <FaExclamationTriangle className='h-5 w-5' />
                      </KpiIcon>}
                label="High Sev. Warnings"
                value={validationStats.warningsBySeverity?.High || 0}
                valueColor={(validationStats.warningsBySeverity?.High || 0) > 0 ? "text-red-600" : undefined}
              />
              <KpiCard
                icon={<KpiIcon bgColor="bg-sky-100" textColor="text-sky-600"> <FaBroom className='h-5 w-5' /> </KpiIcon>}
                label="Data Normalizations"
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