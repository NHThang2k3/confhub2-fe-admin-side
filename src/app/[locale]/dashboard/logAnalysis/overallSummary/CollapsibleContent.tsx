// src/app/[locale]/dashboard/logAnalysis/overallSummary/CollapsibleContent.tsx
import React, { useState } from 'react';
import KpiSection from './KpiSection';
import LogProcessingErrorsDisplay from './LogProcessingErrorsDisplay';
import { BarChartData, PieChartItem } from '../utils/chartUtils';
import { LogAnalysisResult, GoogleSearchHealthData } from '@/src/models/logAnalysis/logAnalysis';

import GeneralCharts from './chartTabs/GeneralCharts';
import ValidationQualityCharts from './chartTabs/ValidationQualityCharts';
import GeminiApiCharts from './chartTabs/GeminiApiCharts';
import GoogleSearchCharts from './chartTabs/GoogleSearchCharts';

import { FaGoogle, FaBrain, FaShieldAlt, FaChartLine, FaListAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa'; // Thêm FaChevronUp, FaChevronDown

interface CollapsibleContentProps {
  isExpanded: boolean; // This is for the main OverallSummary expand/collapse
  data: LogAnalysisResult;
  // ... (other props remain the same)
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  topErrorsData: BarChartData;
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
  geminiApiStatusData: PieChartItem[];
  totalGeminiCallsWithRetries: number;
  geminiModelUsageDetailedData: BarChartData;
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  topGeminiErrorsData: BarChartData;
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

type ChartTabKey = 'general' | 'validation' | 'gemini' | 'googleSearch';

const chartTabs: { key: ChartTabKey; label: string; icon: React.ReactNode, dataExists: (props: CollapsibleContentProps) => boolean }[] = [
  // ... (chartTabs array remains the same)
  {
    key: 'general',
    label: 'Overall & Errors',
    icon: <FaChartLine className="mr-2" />,
    dataExists: (props) => props.overallStatusData.length > 0 || props.playwrightLinkData.length > 0 || props.topErrorsData.labels.length > 0,
  },
  {
    key: 'validation',
    label: 'Validation & Quality',
    icon: <FaShieldAlt className="mr-2" />,
    dataExists: (props) => props.warningsByFieldData.labels.length > 0 || props.warningsBySeverityData.length > 0 || props.topWarningMessagesData.labels.length > 0 || props.normalizationsByFieldData.labels.length > 0 || props.normalizationsByReasonData.length > 0,
  },
  {
    key: 'gemini',
    label: 'Gemini API',
    icon: <FaBrain className="mr-2" />,
    dataExists: (props) => props.geminiApiStatusData.length > 0 || props.geminiModelUsageDetailedData.labels.length > 0 || props.topGeminiErrorsData.labels.length > 0 || props.geminiCacheDetailedData.length > 0 || props.geminiFallbackSuccessRateData.length > 0 || props.geminiConfigErrorsData.labels.length > 0,
  },
  {
    key: 'googleSearch',
    label: 'Google Search',
    icon: <FaGoogle className="mr-2" />,
    dataExists: (props) => props.searchStatusData.length > 0 || props.apiKeyUsageData.labels.length > 0 || props.googleSearchErrorsData.labels.length > 0 || props.googleSearchAttemptIssuesData.labels.length > 0,
  },
];


const CollapsibleContent: React.FC<CollapsibleContentProps> = (props) => {
  const {
    isExpanded, // Main expand state
    data,
    overallStatusData, playwrightLinkData, topErrorsData,
    searchStatusData, apiKeyUsageData, googleSearchHealthData, googleSearchErrorsData, googleSearchAttemptIssuesData,
    geminiApiStatusData, totalGeminiCallsWithRetries, geminiModelUsageDetailedData, geminiFallbackSuccessRateData, geminiConfigErrorsData, geminiCacheDetailedData, topGeminiErrorsData,
    warningsByFieldData, warningsBySeverityData, topWarningMessagesData, normalizationsByFieldData, normalizationsByReasonData,
  } = props;

  const availableTabs = chartTabs.filter(tab => tab.dataExists(props));
  const [activeTab, setActiveTab] = useState<ChartTabKey>(availableTabs.length > 0 ? availableTabs[0].key : 'general');

  // State for Detailed Statistics expand/collapse
  const [isDetailedStatisticsExpanded, setIsDetailedStatisticsExpanded] = useState(false); // Default to expanded

  const toggleDetailedStatistics = () => {
    setIsDetailedStatisticsExpanded(prev => !prev);
  };

  // Only show Detailed Statistics section if there are tabs with data
  const showDetailedStatisticsSection = availableTabs.length > 0;

  return (
    <div
      id='overall-summary-content-area'
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[15000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible' // No padding here, applied below
      }`}
    >
      {/* Apply padding to an inner div so it collapses correctly */}
      <div className={`${isExpanded ? 'p-4' : 'p-0'}`}>
        <KpiSection
          data={data}
          googleSearchHealthData={googleSearchHealthData}
          geminiApiData={data.geminiApi}
          totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
          validationStats={data.validationStats}
        />

        {/* Detailed Statistics Section - Conditionally Rendered */}
        {showDetailedStatisticsSection && (
          <div className="my-6">
            <div
              className="flex items-center justify-between border-b border-gray-200 pb-1 cursor-pointer hover:bg-gray-5 rounded-t-md px-2 pt-2" // Added padding and hover
              onClick={toggleDetailedStatistics}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDetailedStatistics(); }}
              aria-expanded={isDetailedStatisticsExpanded}
              aria-controls="detailed-statistics-content"
            >
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaListAlt className="mr-2 text-gray-600" /> Detailed Statistics
              </h3>
              <button
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                title={isDetailedStatisticsExpanded ? 'Collapse Details' : 'Expand Details'}
                aria-label={isDetailedStatisticsExpanded ? 'Collapse Detailed Statistics' : 'Expand Detailed Statistics'}
                onClick={(e) => { e.stopPropagation(); toggleDetailedStatistics(); }}
              >
                {isDetailedStatisticsExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                <span className="sr-only">{isDetailedStatisticsExpanded ? 'Collapse' : 'Expand'}</span>
              </button>
            </div>

            {/* Collapsible content for Detailed Statistics */}
            <div
              id="detailed-statistics-content"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isDetailedStatisticsExpanded
                  ? 'max-h-[10000px] opacity-100 visible pt-3' // Added pt-3 for spacing when expanded
                  : 'max-h-0 opacity-0 invisible pt-0'
              }`}
            >
              {/* Tab Navigation */}
              <nav className="flex flex-wrap -mb-px border-b border-gray-200" aria-label="Tabs">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center py-3 px-4 border-b-2 font-medium text-sm
                      hover:text-blue-600 hover:border-blue-300 focus:outline-none
                      ${
                        activeTab === tab.key
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

              {/* Tab Content */}
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
                  <div id="tab-panel-gemini" role="tabpanel" aria-labelledby="tab-gemini">
                    <GeminiApiCharts
                      geminiApiStatusData={geminiApiStatusData}
                      geminiModelUsageDetailedData={geminiModelUsageDetailedData}
                      geminiFallbackSuccessRateData={geminiFallbackSuccessRateData}
                      geminiConfigErrorsData={geminiConfigErrorsData}
                      geminiCacheDetailedData={geminiCacheDetailedData}
                      topGeminiErrorsData={topGeminiErrorsData}
                    />
                  </div>
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