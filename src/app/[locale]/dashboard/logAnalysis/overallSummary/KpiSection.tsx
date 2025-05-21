// src/app/[locale]/dashboard/logAnalysis/overallSummary/KpiSection.tsx

import React from 'react';
import { FaExclamationTriangle, FaClipboardCheck, FaKey, FaSyncAlt, FaBan, FaThumbsUp, FaSearch, FaGoogle } from 'react-icons/fa'; // Thêm FaSearch, FaGoogle
import KpiCard from './KpiCard';
import { LogAnalysisResult } from '@/src/models/logAnalysis/logAnalysis';
import { formatDuration } from '../utils/commonUtils';
import { GoogleSearchHealthData } from './CollapsibleContent';

const KpiIcon: React.FC<{ bgColor: string; textColor: string; children: React.ReactNode }> = ({ bgColor, textColor, children }) => (
  <div className={`rounded-full p-3 ${bgColor} ${textColor}`}>
    {children}
  </div>
);

interface KpiSectionProps {
  data: LogAnalysisResult;
  totalGeminiCallsWithRetries: number;
  googleSearchHealthData: GoogleSearchHealthData | null;
}

const KpiSection: React.FC<KpiSectionProps> = ({ data, totalGeminiCallsWithRetries, googleSearchHealthData }) => {
  const overall = data.overall;
  const validationStats = data.validationStats;
  const fileOutput = data.fileOutput;
  const gSearchHealth = googleSearchHealthData;
  const gSearchStats = data.googleSearch; // Lấy thêm thông tin tổng quan của Google Search

  return (
    <div className="space-y-6"> {/* Sử dụng space-y để tạo khoảng cách giữa các nhóm */}
      {/* --- General KPIs --- */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'> {/* Điều chỉnh số cột cho nhóm này */}
        <KpiCard
          icon={
            <KpiIcon bgColor="bg-blue-100" textColor="text-blue-600">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </KpiIcon>
          }
          label="Total Duration"
          value={formatDuration(overall?.durationSeconds)}
        />
        <KpiCard
          icon={
            <KpiIcon bgColor="bg-green-100" textColor="text-green-600">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </KpiIcon>
          }
          label={data.filterRequestId ? 'Tasks in Request' : 'Conferences Processed'}
          value={overall?.processedConferencesCount ?? 0}
          valueDenominator={data.filterRequestId ? undefined : (overall?.totalConferencesInput ?? '?')}
        />
         <KpiCard
          icon={
             <KpiIcon bgColor="bg-purple-100" textColor="text-purple-600">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 1.73 16.557 1 17.657 1s3.607.73 4.671 2C24.5 5 25 8 25 10c2 1 2.657 1.343 2.657 2.657A8 8 0 0117.657 18.657z' /></svg>
            </KpiIcon>
          }
          label="Gemini Calls (incl. Retries)"
          value={totalGeminiCallsWithRetries}
        />
      </div>

      {/* --- Google Search KPIs --- */}
      {(gSearchStats || gSearchHealth) && ( // Chỉ hiển thị nếu có dữ liệu
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> Google Search Metrics
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'> {/* Điều chỉnh số cột */}
            <KpiCard
              icon={
                <KpiIcon bgColor="bg-teal-100" textColor="text-teal-600">
                  <FaSearch className='h-5 w-5' />
                </KpiIcon>
              }
              label="GS Total Requests"
              value={gSearchStats?.totalRequests ?? 0}
            />
             {gSearchHealth && (
              <>
                <KpiCard
                    icon={
                    <KpiIcon 
                        bgColor={gSearchHealth.rotationsSuccess > 0 ? "bg-sky-100" : "bg-gray-100"} 
                        textColor={gSearchHealth.rotationsSuccess > 0 ? "text-sky-600" : "text-gray-500"}
                    >
                        <FaSyncAlt className='h-5 w-5' />
                    </KpiIcon>
                    }
                    label="GS Key Rotations"
                    value={gSearchHealth.rotationsSuccess}
                    valueDenominator={gSearchHealth.rotationsSuccess + gSearchHealth.rotationsFailed}
                    subText={gSearchHealth.rotationsFailed > 0 ? `${gSearchHealth.rotationsFailed} Failed` : undefined}
                    subTextColor={gSearchHealth.rotationsFailed > 0 ? "text-xs text-red-500" : undefined}
                />
                <KpiCard
                    icon={
                    <KpiIcon 
                        bgColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "bg-orange-100" : "bg-gray-100"} 
                        textColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "text-orange-600" : "text-gray-500"}
                    >
                        <FaBan className='h-5 w-5' />
                    </KpiIcon>
                    }
                    label="GS All Keys Exhausted"
                    value={gSearchHealth.allKeysExhaustedOnGetNextKey}
                    valueColor={gSearchHealth.allKeysExhaustedOnGetNextKey > 0 ? "text-orange-600" : undefined}
                />
                <KpiCard
                    icon={
                    <KpiIcon 
                        bgColor={gSearchHealth.maxUsageLimitsReachedTotal > 0 ? "bg-yellow-100" : "bg-gray-100"} 
                        textColor={gSearchHealth.maxUsageLimitsReachedTotal > 0 ? "text-yellow-600" : "text-gray-500"}
                    >
                        <FaKey className='h-5 w-5' />
                    </KpiIcon>
                    }
                    label="GS Key Max Usage (Internal)"
                    value={gSearchHealth.maxUsageLimitsReachedTotal}
                    valueColor={gSearchHealth.maxUsageLimitsReachedTotal > 0 ? "text-yellow-600" : undefined}
                />
                 {/* <KpiCard
                    icon={
                    <KpiIcon bgColor="bg-indigo-100" textColor="text-indigo-600">
                        <FaThumbsUp className='h-5 w-5' /> 
                    </KpiIcon>
                    }
                    label="GS Successful (No Items)"
                    value={gSearchHealth.successfulSearchesWithNoItems}
                /> */}
                {/* GS Successful (No Items) sẽ được hiển thị cùng với Pie Chart trong ChartsSection */}
              </>
            )}
          </div>
        </div>
      )}

      {/* --- Output & Validation KPIs --- */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Output & Validation</h3>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'> {/* Điều chỉnh số cột */}
          <KpiCard
            icon={
              <KpiIcon
                bgColor={(validationStats?.totalValidationWarnings || 0) > 0 ? 'bg-amber-100' : 'bg-gray-100'}
                textColor={(validationStats?.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : 'text-gray-500'}
              >
                <FaClipboardCheck className='h-6 w-6' />
              </KpiIcon>
            }
            label="Validation Warnings"
            value={validationStats?.totalValidationWarnings ?? 0}
            valueColor={(validationStats?.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : 'text-gray-800'}
          />
          <KpiCard
            icon={
              <KpiIcon
                bgColor={fileOutput?.csvFileGenerated === true ? 'bg-teal-100' : fileOutput?.csvFileGenerated === false ? 'bg-red-100' : 'bg-gray-100'}
                textColor={fileOutput?.csvFileGenerated === true ? 'text-teal-600' : fileOutput?.csvFileGenerated === false ? 'text-red-600' : 'text-gray-500'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </KpiIcon>
            }
            label="CSV Records Written"
            value={fileOutput?.csvRecordsSuccessfullyWritten ?? 0}
            valueDenominator={fileOutput?.csvRecordsAttempted ?? 0}
            subText={fileOutput?.csvFileGenerated === false ? "CSV Generation Failed" : undefined}
            subTextColor={fileOutput?.csvFileGenerated === false ? "text-xs text-red-500 mt-0.5" : undefined}
          />
          <KpiCard
            icon={
              <KpiIcon
                bgColor={(data.errorLogCount || 0) > 0 ? 'bg-red-100' : 'bg-gray-100'}
                textColor={(data.errorLogCount || 0) > 0 ? 'text-red-600' : 'text-gray-500'}
              >
                <FaExclamationTriangle className='h-6 w-6' />
              </KpiIcon>
            }
            label="Errors Logged (Total)"
            value={data.errorLogCount || 0}
            valueColor={(data.errorLogCount || 0) > 0 ? 'text-red-600' : 'text-gray-800'}
          />
        </div>
      </div>
    </div>
  );
};

export default KpiSection;