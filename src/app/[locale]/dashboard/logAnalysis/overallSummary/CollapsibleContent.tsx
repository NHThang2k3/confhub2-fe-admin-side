// src/app/[locale]/dashboard/logAnalysis/overallSummary/CollapsibleContent.tsx
import React, { useState, useMemo } from 'react'; // Import useMemo
import KpiSection from './KpiSection';
import LogProcessingErrorsDisplay from './LogProcessingErrorsDisplay';
import { BarChartData, PieChartItem } from '../utils/chartUtils';
import { ConferenceLogAnalysisResult, GoogleSearchHealthData, GeminiApiAnalysis } from '@/src/models/logAnalysis';

import GeneralCharts from './chartTabs/GeneralCharts';
import ValidationQualityCharts from './chartTabs/ValidationQualityCharts';
import GeminiApiCharts from './chartTabs/GeminiApiCharts';
import GoogleSearchCharts from './chartTabs/GoogleSearchCharts';

import { FaGoogle, FaBrain, FaShieldAlt, FaChartLine, FaListAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface CollapsibleContentProps {
  isExpanded: boolean;
  data: ConferenceLogAnalysisResult;
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
  // Gemini API - Thêm props mới
  geminiApiStatusData: PieChartItem[];
  totalGeminiCallsWithRetries: number;
  geminiModelUsageRawData: GeminiApiAnalysis['modelUsageByApiType'];
  geminiOrchestrationData: PieChartItem[];
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  geminiResponseProcessingData: BarChartData;
  topGeminiErrorsData: BarChartData;
  // Validation & Normalization
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

type ChartTabKey = 'general' | 'validation' | 'gemini' | 'googleSearch';

const CollapsibleContent: React.FC<CollapsibleContentProps> = (props) => {
  // Khởi tạo t với namespace 'CollapsibleContent'
  const t = useTranslations('CollapsibleContent');

  const {
    isExpanded, // Main expand state
    data,
    overallStatusData, playwrightLinkData, topErrorsData,
    searchStatusData, apiKeyUsageData, googleSearchHealthData, googleSearchErrorsData, googleSearchAttemptIssuesData,
    geminiApiStatusData,
    totalGeminiCallsWithRetries,
    geminiModelUsageRawData,
    geminiOrchestrationData,
    geminiFallbackSuccessRateData,
    geminiConfigErrorsData,
    geminiCacheDetailedData,
    geminiResponseProcessingData,
    topGeminiErrorsData,

    warningsByFieldData, warningsBySeverityData, topWarningMessagesData, normalizationsByFieldData, normalizationsByReasonData,
  } = props;

  // Di chuyển chartTabs vào trong component và sử dụng useMemo để có thể dùng t()
  const chartTabs = useMemo(() => ([
    {
      key: 'general' as ChartTabKey,
      label: t('chartTabs.general'),
      icon: <FaChartLine className="mr-2" />,
      dataExists: (currentProps: CollapsibleContentProps) => currentProps.overallStatusData.length > 0 || currentProps.playwrightLinkData.length > 0 || currentProps.topErrorsData.labels.length > 0,
    },
    {
      key: 'validation' as ChartTabKey,
      label: t('chartTabs.validation'),
      icon: <FaShieldAlt className="mr-2" />,
      dataExists: (currentProps: CollapsibleContentProps) => currentProps.warningsByFieldData.labels.length > 0 || currentProps.warningsBySeverityData.length > 0 || currentProps.topWarningMessagesData.labels.length > 0 || currentProps.normalizationsByFieldData.labels.length > 0 || currentProps.normalizationsByReasonData.length > 0,
    },
    {
      key: 'gemini' as ChartTabKey,
      label: t('chartTabs.gemini'),
      icon: <FaBrain className="mr-2" />,
      dataExists: (currentProps: CollapsibleContentProps) => {
          const hasRawModelUsageData = Object.keys(currentProps.geminiModelUsageRawData).some(apiType =>
              Object.keys(currentProps.geminiModelUsageRawData[apiType]).length > 0
          );
          return (
              currentProps.geminiApiStatusData.length > 0 ||
              hasRawModelUsageData ||
              currentProps.geminiOrchestrationData.length > 0 ||
              currentProps.geminiConfigErrorsData.labels.length > 0 ||
              currentProps.geminiCacheDetailedData.length > 0 ||
              currentProps.geminiResponseProcessingData.labels.length > 0 ||
              currentProps.topGeminiErrorsData.labels.length > 0
          );
      },
    },
    {
      key: 'googleSearch' as ChartTabKey,
      label: t('chartTabs.googleSearch'),
      icon: <FaGoogle className="mr-2" />,
      dataExists: (currentProps: CollapsibleContentProps) => currentProps.searchStatusData.length > 0 || currentProps.apiKeyUsageData.labels.length > 0 || currentProps.googleSearchErrorsData.labels.length > 0 || currentProps.googleSearchAttemptIssuesData.labels.length > 0,
    },
  ]), [t]); // Thêm t vào dependency array của useMemo

  const availableTabs = chartTabs.filter(tab => tab.dataExists(props));
  const [activeTab, setActiveTab] = useState<ChartTabKey>(availableTabs.length > 0 ? availableTabs[0].key : 'general');
  const [isDetailedStatisticsExpanded, setIsDetailedStatisticsExpanded] = useState(false);
  const toggleDetailedStatistics = () => {
    setIsDetailedStatisticsExpanded(prev => !prev);
  };

  const showDetailedStatisticsSection = availableTabs.length > 0;

  return (
    <div
      id='overall-summary-content-area'
      className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[15000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        }`}
    >
      <div className={`${isExpanded ? 'p-4' : 'p-0'}`}>
        <KpiSection
          data={data}
          googleSearchHealthData={googleSearchHealthData}
          geminiApiData={data.geminiApi}
          validationStats={data.validationStats}
        />

        {showDetailedStatisticsSection && (
          <div className="my-6">
            <div
              className="flex items-center justify-between border-b border-gray-200 pb-1 cursor-pointer hover:bg-gray-5 rounded-t-md px-2 pt-2"
              onClick={toggleDetailedStatistics}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDetailedStatistics(); }}
              aria-expanded={isDetailedStatisticsExpanded}
              aria-controls="detailed-statistics-content"
            >
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaListAlt className="mr-2 text-gray-600" /> {t('detailedStatisticsTitle')}
              </h3>
              <button
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                title={isDetailedStatisticsExpanded ? t('collapseDetailsTitle') : t('expandDetailsTitle')}
                aria-label={isDetailedStatisticsExpanded ? t('collapseDetailedStatisticsAriaLabel') : t('expandDetailedStatisticsAriaLabel')}
                onClick={(e) => { e.stopPropagation(); toggleDetailedStatistics(); }}
              >
                {isDetailedStatisticsExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                <span className="sr-only">{isDetailedStatisticsExpanded ? t('srOnly.collapse') : t('srOnly.expand')}</span>
              </button>
            </div>

            <div
              id="detailed-statistics-content"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailedStatisticsExpanded
                  ? 'max-h-[10000px] opacity-100 visible pt-3'
                  : 'max-h-0 opacity-0 invisible pt-0'
                }`}
            >
              <nav className="flex flex-wrap -mb-px border-b border-gray-200" aria-label={t('chartTabsAriaLabel')}>
                {availableTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center py-3 px-4 border-b-2 font-medium text-sm
                      hover:text-blue-600 hover:border-blue-300 focus:outline-none
                      ${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }
                    `}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`tab-panel-${tab.key}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6">
                {activeTab === 'general' && (
                  <div id="tab-panel-general" role="tabpanel" aria-labelledby="tab-general">
                    <GeneralCharts
                      overallStatusData={overallStatusData}
                      playwrightLinkData={playwrightLinkData}
                      topErrorsData={topErrorsData}
                    />
                  </div>
                )}
                {activeTab === 'validation' && (
                  <div id="tab-panel-validation" role="tabpanel" aria-labelledby="tab-validation">
                    <ValidationQualityCharts
                      warningsByFieldData={warningsByFieldData}
                      warningsBySeverityData={warningsBySeverityData}
                      topWarningMessagesData={topWarningMessagesData}
                      normalizationsByFieldData={normalizationsByFieldData}
                      normalizationsByReasonData={normalizationsByReasonData}
                    />
                  </div>
                )}
                {activeTab === 'gemini' && (
                  <GeminiApiCharts
                    geminiApiStatusData={geminiApiStatusData}
                    geminiModelUsageRawData={geminiModelUsageRawData}
                    geminiOrchestrationData={geminiOrchestrationData}
                    geminiFallbackSuccessRateData={geminiFallbackSuccessRateData}
                    geminiConfigErrorsData={geminiConfigErrorsData}
                    geminiCacheDetailedData={geminiCacheDetailedData}
                    geminiResponseProcessingData={geminiResponseProcessingData}
                    topGeminiErrorsData={topGeminiErrorsData}
                  />
                )}
                {activeTab === 'googleSearch' && (
                  <div id="tab-panel-googleSearch" role="tabpanel" aria-labelledby="tab-googleSearch">
                    <GoogleSearchCharts
                      searchStatusData={searchStatusData}
                      apiKeyUsageData={apiKeyUsageData}
                      googleSearchHealthData={googleSearchHealthData}
                      googleSearchErrorsData={googleSearchErrorsData}
                      googleSearchAttemptIssuesData={googleSearchAttemptIssuesData}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <LogProcessingErrorsDisplay
          logProcessingErrors={data.logProcessingErrors}
          parseErrors={data.parseErrors}
          totalLogEntries={data.totalLogEntries}
        />
      </div>
    </div>
  );
};

export default CollapsibleContent;