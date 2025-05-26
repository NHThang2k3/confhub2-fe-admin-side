// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartsSection.tsx
import React from 'react';
import ChartCard from './ChartCard';
import {
  getBarChartOption,
  getPieChartOption,
  BarChartData,
  PieChartItem
} from '../utils/chartUtils';
import { GoogleSearchHealthData } from '@/src/models/logAnalysis';
import { FaGoogle, FaBrain, FaShieldAlt, FaBroom } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface ChartsSectionProps {
  // General
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  topErrorsData: BarChartData;
  // Google Search
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
  // Gemini API
  geminiApiStatusData: PieChartItem[];
  geminiModelUsageDetailedData: BarChartData;
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  topGeminiErrorsData: BarChartData;
  // Validation & Normalization
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  // General
  overallStatusData,
  playwrightLinkData,
  topErrorsData,
  // Google Search
  searchStatusData,
  apiKeyUsageData,
  googleSearchHealthData,
  googleSearchErrorsData,
  googleSearchAttemptIssuesData,
  // Gemini API
  geminiApiStatusData,
  geminiModelUsageDetailedData,
  geminiFallbackSuccessRateData,
  geminiConfigErrorsData,
  geminiCacheDetailedData,
  topGeminiErrorsData,
  // Validation & Normalization
  warningsByFieldData,
  warningsBySeverityData,
  topWarningMessagesData,
  normalizationsByFieldData,
  normalizationsByReasonData,
}) => {
  // Khởi tạo t với namespace 'ChartsSection'
  const t = useTranslations('ChartsSection');

  const geminiPieColors = ['#80FFA5', '#FF6384', '#FFCD56', '#36A2EB', '#9966FF'];
  const geminiBarColors = ['#9A60B4', '#60B49A', '#B49A60', '#609AB4'];
  const validationPieColors = ['#FF6384', '#FF9F40', '#FFCD56']; // High, Medium, Low for warnings
  const normalizationPieColors = ['#4BC0C0', '#36A2EB', '#9966FF'];


  const hasValidationData = warningsByFieldData.labels.length > 0 ||
                            warningsBySeverityData.length > 0 ||
                            topWarningMessagesData.labels.length > 0;

  const hasNormalizationData = normalizationsByFieldData.labels.length > 0 ||
                               normalizationsByReasonData.length > 0;

  return (
    <div className="space-y-8">
      {/* --- General Charts (Bao gồm Top Aggregated Errors) --- */}
      <div className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('generalCharts.title')}</h3>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ChartCard
            option={getPieChartOption(t('generalCharts.taskStatusDistribution'), overallStatusData, ['#91cc75', '#5470c6', '#ee6666', '#fccb67', '#73c0de'])}
            dataExists={overallStatusData.length > 0}
            noDataMessage={t('generalCharts.noTaskStatusData')}
          />
          <ChartCard
            option={getPieChartOption(t('generalCharts.playwrightLinkProcessing'), playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])}
            dataExists={playwrightLinkData.length > 0}
            noDataMessage={t('generalCharts.noLinkProcessingData')}
          />
          <ChartCard
            option={getBarChartOption(t('generalCharts.topAggregatedErrors'), topErrorsData.labels, topErrorsData.values, t('common.count'), '#ee6666')}
            dataExists={topErrorsData.labels.length > 0}
            noDataMessage={t('generalCharts.noAggregatedErrors')}
          />
        </div>
      </div>


      {/* --- Data Validation & Normalization Charts --- */}
      {(hasValidationData || hasNormalizationData) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaShieldAlt className="mr-2 text-orange-500" /> {t('validationNormalizationCharts.title')}
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <ChartCard
                option={getBarChartOption(t('validationNormalizationCharts.validationWarningsByField'), warningsByFieldData.labels, warningsByFieldData.values, t('common.warnings'), '#f59e0b')}
                dataExists={warningsByFieldData.labels.length > 0}
                noDataMessage={t('validationNormalizationCharts.noWarningsByField')}
            />
            <ChartCard
                option={getPieChartOption(t('validationNormalizationCharts.validationWarningsBySeverity'), warningsBySeverityData, validationPieColors)}
                dataExists={warningsBySeverityData.length > 0}
                noDataMessage={t('validationNormalizationCharts.noWarningsBySeverity')}
            />
             <ChartCard
                option={getBarChartOption(t('validationNormalizationCharts.topValidationMessages'), topWarningMessagesData.labels, topWarningMessagesData.values, t('common.count'), '#fdba74')}
                dataExists={topWarningMessagesData.labels.length > 0}
                noDataMessage={t('validationNormalizationCharts.noTopWarningMessages')}
            />
          </div>
          {hasNormalizationData && (
            <>
              <h4 className="text-lg font-medium mt-8 mb-3 text-gray-700 flex items-center">
                <FaBroom className="mr-2 text-sky-500" /> {t('validationNormalizationCharts.dataNormalizations')}
              </h4>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
                <ChartCard
                    option={getBarChartOption(t('validationNormalizationCharts.normalizationsByField'), normalizationsByFieldData.labels, normalizationsByFieldData.values, t('common.count'), '#38bdf8')}
                    dataExists={normalizationsByFieldData.labels.length > 0}
                    noDataMessage={t('validationNormalizationCharts.noNormalizationsByField')}
                />
                <ChartCard
                    option={getPieChartOption(t('validationNormalizationCharts.normalizationsByReason'), normalizationsByReasonData, normalizationPieColors)}
                    dataExists={normalizationsByReasonData.length > 0}
                    noDataMessage={t('validationNormalizationCharts.noNormalizationsByReason')}
                />
              </div>
            </>
          )}
        </div>
      )}


      {/* --- Gemini API Charts --- */}
      {(geminiApiStatusData.length > 0 || geminiModelUsageDetailedData.labels.length > 0 || topGeminiErrorsData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaBrain className="mr-2 text-purple-500" /> {t('geminiApiCharts.title')}
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <ChartCard
              option={getPieChartOption(t('geminiApiCharts.geminiApiCallStatus'), geminiApiStatusData, geminiPieColors)}
              dataExists={geminiApiStatusData.length > 0}
              noDataMessage={t('geminiApiCharts.noGeminiApiStatusData')}
            />
            <ChartCard
              option={getPieChartOption(t('geminiApiCharts.geminiCacheDetails'), geminiCacheDetailedData, ['#3ba272', '#fc8452', '#ee6666', '#fac858'])}
              dataExists={geminiCacheDetailedData.length > 0}
              noDataMessage={t('geminiApiCharts.noGeminiCacheData')}
            />
            <ChartCard
              option={getPieChartOption(t('geminiApiCharts.geminiFallbackSuccessRate'), geminiFallbackSuccessRateData, ['#91cc75', '#ee6666'])}
              dataExists={geminiFallbackSuccessRateData.length > 0 && geminiFallbackSuccessRateData.some(d => d.value > 0)}
              noDataMessage={t('geminiApiCharts.noFallbackDataOrNoFallbacksAttempted')}
            />
            <ChartCard
              option={getBarChartOption(t('geminiApiCharts.geminiModelUsage'), geminiModelUsageDetailedData.labels, geminiModelUsageDetailedData.values, t('common.totalAttempts'), geminiBarColors[0])}
              dataExists={geminiModelUsageDetailedData.labels.length > 0}
              noDataMessage={t('geminiApiCharts.noGeminiModelUsageData')}
              className="md:col-span-2 lg:col-span-3"
            />
             <ChartCard
              option={getBarChartOption(t('geminiApiCharts.topGeminiApiErrors'), topGeminiErrorsData.labels, topGeminiErrorsData.values, t('common.count'), '#FF6384')}
              dataExists={topGeminiErrorsData.labels.length > 0}
              noDataMessage={t('geminiApiCharts.noGeminiApiErrorData')}
            />
            <ChartCard
              option={getBarChartOption(t('geminiApiCharts.geminiConfigurationErrors'), geminiConfigErrorsData.labels, geminiConfigErrorsData.values, t('common.count'), '#FF9F40')}
              dataExists={geminiConfigErrorsData.labels.length > 0}
              noDataMessage={t('geminiApiCharts.noGeminiConfigurationErrors')}
            />
          </div>
        </div>
      )}

      {/* --- Google Search Charts --- */}
      {(searchStatusData.length > 0 || apiKeyUsageData.labels.length > 0 || googleSearchErrorsData.labels.length > 0 || googleSearchAttemptIssuesData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> {t('googleSearchCharts.title')}
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
            <ChartCard
              option={getPieChartOption(
                t('googleSearchCharts.googleSearchStatus'),
                searchStatusData,
                ['#91cc75', '#ee6666', '#fccb67', '#73c0de'],
                googleSearchHealthData && googleSearchHealthData.successfulSearchesWithNoItems > 0
                ? t('googleSearchCharts.successfulNoItemsSubText', { count: googleSearchHealthData.successfulSearchesWithNoItems })
                : undefined
              )}
              dataExists={searchStatusData.length > 0}
              noDataMessage={t('googleSearchCharts.noSearchStatusData')}
            />
            <ChartCard
              option={getBarChartOption(t('googleSearchCharts.googleApiKeyUsage'), apiKeyUsageData.labels, apiKeyUsageData.values, t('common.requests'), '#ea7ccc')}
              dataExists={apiKeyUsageData.labels.length > 0}
              noDataMessage={t('googleSearchCharts.noKeyUsageData')}
            />
            <ChartCard
              option={getBarChartOption(t('googleSearchCharts.topGoogleSearchErrors'), googleSearchErrorsData.labels, googleSearchErrorsData.values, t('common.count'), '#ff6384')}
              dataExists={googleSearchErrorsData.labels.length > 0}
              noDataMessage={t('googleSearchCharts.noGoogleSearchErrorData')}
              className="md:col-span-1"
            />
            <ChartCard
              option={getBarChartOption(t('googleSearchCharts.topGoogleSearchAttemptIssues'), googleSearchAttemptIssuesData.labels, googleSearchAttemptIssuesData.values, t('common.count'), '#ff9f40')}
              dataExists={googleSearchAttemptIssuesData.labels.length > 0}
              noDataMessage={t('googleSearchCharts.noGoogleSearchAttemptIssueData')}
              className="md:col-span-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;