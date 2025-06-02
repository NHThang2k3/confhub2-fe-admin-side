// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/JournalCollapsibleContent.tsx (File mới)
import React, { useState, useMemo } from 'react';
import JournalKpiSection from './JournalKpiSection'; // Component mới
import LogProcessingErrorsDisplay from '../overallSummary/LogProcessingErrorsDisplay'; // Tái sử dụng
import { BarChartData, PieChartItem } from '../utils/chartUtils';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';

// Import các tab chart mới cho Journal
import GeneralJournalCharts from './chartTabs/GeneralJournalCharts';
import BioxbioCharts from './chartTabs/BioxbioCharts';
import ScimagoCharts from './chartTabs/ScimagoCharts';
import ImageSearchCharts from './chartTabs/ImageSearchCharts'; // Có thể là một phần của GoogleSearchCharts được tùy chỉnh
import FileOutputJournalCharts from './chartTabs/FileOutputJournalCharts';

import { FaListAlt, FaDatabase, FaSearch, FaFileExport, FaCogs, FaChevronUp, FaChevronDown } from 'react-icons/fa'; // Icons cho tabs
import { useTranslations } from 'next-intl';

interface JournalCollapsibleContentProps {
  isExpanded: boolean;
  data: JournalLogAnalysisResult;
  // Props dữ liệu đã tính toán từ JournalOverallSummary
  overallJournalStatusData: PieChartItem[];
  dataSourceDistributionData: PieChartItem[];
  playwrightJournalData: PieChartItem[]; // Giả sử có
  imageSearchStatusData: PieChartItem[];
  // imageSearchApiKeyUsageData: BarChartData;
  imageSearchErrorsData: BarChartData;
  bioxbioFetchStatusData: PieChartItem[];
  bioxbioCacheData: PieChartItem[];
  bioxbioErrorsData: BarChartData;
  scimagoDetailPageStatusData: PieChartItem[];
  scimagoErrorsData: BarChartData;
  jsonlWriteStatusData: PieChartItem[];
  clientCsvParseStatusData: PieChartItem[];
  topAggregatedErrorsData: BarChartData;
}

type JournalChartTabKey = 'general' | 'bioxbio' | 'scimago' | 'imageSearch' | 'fileOutput';

const JournalCollapsibleContent: React.FC<JournalCollapsibleContentProps> = (props) => {
  const t = useTranslations('JournalCollapsibleContent'); // Namespace mới
  const {
    isExpanded, data,
    overallJournalStatusData, dataSourceDistributionData, playwrightJournalData,
    imageSearchStatusData, imageSearchErrorsData,
    bioxbioFetchStatusData, bioxbioCacheData, bioxbioErrorsData,
    scimagoDetailPageStatusData, scimagoErrorsData,
    jsonlWriteStatusData, clientCsvParseStatusData,
    topAggregatedErrorsData,
  } = props;

  const journalChartTabs = useMemo(() => ([
    {
      key: 'general' as JournalChartTabKey,
      label: t('chartTabs.general'), // "General"
      icon: <FaCogs className="mr-2" />,
      dataExists: (p: JournalCollapsibleContentProps) => p.overallJournalStatusData.length > 0 || p.dataSourceDistributionData.length > 0 || p.topAggregatedErrorsData.labels.length > 0 || p.playwrightJournalData.length > 0,
    },
    {
      key: 'bioxbio' as JournalChartTabKey,
      label: t('chartTabs.bioxbio'), // "Bioxbio"
      icon: <FaDatabase className="mr-2" />, // Thay icon phù hợp
      dataExists: (p: JournalCollapsibleContentProps) => p.bioxbioFetchStatusData.length > 0 || p.bioxbioCacheData.length > 0 || p.bioxbioErrorsData.labels.length > 0,
    },
    {
      key: 'scimago' as JournalChartTabKey,
      label: t('chartTabs.scimago'), // "Scimago"
      icon: <FaListAlt className="mr-2" />, // Thay icon phù hợp
      dataExists: (p: JournalCollapsibleContentProps) => p.scimagoDetailPageStatusData.length > 0 || p.scimagoErrorsData.labels.length > 0,
    },
    // {
    //   key: 'imageSearch' as JournalChartTabKey,
    //   label: t('chartTabs.imageSearch'), // "Image Search"
    //   icon: <FaSearch className="mr-2" />,
    //   dataExists: (p: JournalCollapsibleContentProps) => p.imageSearchStatusData.length > 0 || p.imageSearchApiKeyUsageData.labels.length > 0 || p.imageSearchErrorsData.labels.length > 0,
    // },
    {
      key: 'fileOutput' as JournalChartTabKey,
      label: t('chartTabs.fileOutput'), // "File Output"
      icon: <FaFileExport className="mr-2" />,
      dataExists: (p: JournalCollapsibleContentProps) => p.jsonlWriteStatusData.length > 0 || p.clientCsvParseStatusData.length > 0,
    },
  ]), [t]);

  const availableJournalTabs = journalChartTabs.filter(tab => tab.dataExists(props));
  const [activeJournalTab, setActiveJournalTab] = useState<JournalChartTabKey>(availableJournalTabs.length > 0 ? availableJournalTabs[0].key : 'general');
  const [isDetailedStatisticsExpanded, setIsDetailedStatisticsExpanded] = useState(false);
  const toggleDetailedStatistics = () => setIsDetailedStatisticsExpanded(prev => !prev);

  const showDetailedStatisticsSection = availableJournalTabs.length > 0;

  return (
    <div
      id='journal-overall-summary-content-area' // ID khác với conference
      className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[15000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
    >
      <div className={`${isExpanded ? 'p-4' : 'p-0'}`}>
        <JournalKpiSection data={data} /> {/* Truyền data gốc cho KPI section */}

        {showDetailedStatisticsSection && (
          <div className="my-6">
            <div
              className="flex items-center justify-between border-b border-gray-200 pb-1 cursor-pointer hover:bg-gray-5 rounded-t-md px-2 pt-2"
              onClick={toggleDetailedStatistics}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDetailedStatistics(); }}
              aria-expanded={isDetailedStatisticsExpanded} aria-controls="journal-detailed-statistics-content"
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
              id="journal-detailed-statistics-content"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailedStatisticsExpanded ? 'max-h-[10000px] opacity-100 visible pt-3' : 'max-h-0 opacity-0 invisible pt-0'}`}
            >
              <nav className="flex flex-wrap -mb-px border-b border-gray-200" aria-label={t('chartTabsAriaLabel')}>
                {availableJournalTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveJournalTab(tab.key)}
                    className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 focus:outline-none ${activeJournalTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    role="tab" aria-selected={activeJournalTab === tab.key} aria-controls={`journal-tab-panel-${tab.key}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                {activeJournalTab === 'general' && (
                  <GeneralJournalCharts
                    overallJournalStatusData={overallJournalStatusData}
                    dataSourceDistributionData={dataSourceDistributionData}
                    playwrightJournalData={playwrightJournalData}
                    topAggregatedErrorsData={topAggregatedErrorsData}
                  />
                )}
                {activeJournalTab === 'bioxbio' && (
                  <BioxbioCharts
                    fetchStatusData={bioxbioFetchStatusData}
                    cacheData={bioxbioCacheData}
                    errorsData={bioxbioErrorsData}
                  />
                )}
                {activeJournalTab === 'scimago' && (
                  <ScimagoCharts
                    detailPageStatusData={scimagoDetailPageStatusData}
                    errorsData={scimagoErrorsData}
                  />
                )}
                {activeJournalTab === 'imageSearch' && (
                  <ImageSearchCharts // Hoặc một phiên bản tùy chỉnh của GoogleSearchCharts
                    searchStatusData={imageSearchStatusData}
                    // apiKeyUsageData={imageSearchApiKeyUsageData}
                    errorsData={imageSearchErrorsData}
                    // googleSearchHealthData có thể không liên quan trực tiếp đến image search
                  />
                )}
                {activeJournalTab === 'fileOutput' && (
                  <FileOutputJournalCharts
                    jsonlWriteStatusData={jsonlWriteStatusData}
                    clientCsvParseStatusData={clientCsvParseStatusData}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <LogProcessingErrorsDisplay
          logProcessingErrors={data.logProcessingErrors || []}
          parseErrors={data.parseErrors || 0}
          totalLogEntries={data.totalLogEntries || 0}
        />
      </div>
    </div>
  );
};

export default JournalCollapsibleContent;