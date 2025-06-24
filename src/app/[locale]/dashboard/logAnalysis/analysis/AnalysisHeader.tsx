import React from 'react';
import { FaFilter, FaSyncAlt, FaExclamationTriangle, FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { useTranslations } from 'next-intl';
import DatePicker from 'react-datepicker';

// --- REFACTORED PROPS INTERFACE ---
// Nhóm các props liên quan vào các object để dễ quản lý
interface FilterControls {
    timeFilterOption: string;
    handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    textFilterInput: string;
    setTextFilterInput: (value: string) => void;
    tempCustomStartDate: Date | null;
    setTempCustomStartDate: (date: Date | null) => void;
    tempCustomEndDate: Date | null;
    setTempCustomEndDate: (date: Date | null) => void;
    applyCustomDateFilter: () => void;
}

interface AnalysisHeaderProps {
    // Trạng thái chung
    loading: boolean;
    error: string | null;
    isConnected: boolean;

    // Dữ liệu và thông tin
    data: LogAnalysisResultUnion | null;
    crawlerType: CrawlerType;

    // Hành động và bộ lọc
    controls: FilterControls;
    refetchData: () => void;

    // Các trạng thái UI phụ
    allRequestsFilteredOut?: boolean;
    overallAnalysisErrorMessage?: string;
}

// --- RE-DESIGNED COMPONENT ---
const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
    loading, error, isConnected, data, crawlerType,
    controls, refetchData,
    allRequestsFilteredOut, overallAnalysisErrorMessage
}) => {
    const t = useTranslations('AnalysisHeader');
    const tCommon = useTranslations('Common');

    const {
        timeFilterOption, handleFilterChange, textFilterInput, setTextFilterInput,
        tempCustomStartDate, setTempCustomStartDate, tempCustomEndDate, setTempCustomEndDate,
        applyCustomDateFilter
    } = controls;

    const isLoadingInitial = loading && !data;

    // --- Helper Functions (Không thay đổi logic) ---
    const getHeaderText = () => {
        if (isLoadingInitial) return t('headerText.loading');
        if (error && !data) return t('headerText.errorLoading');
        if (!data && !loading) return t('headerText.noData');
        if (crawlerType === 'conference') return t('headerText.analysisTitleConference');
        if (crawlerType === 'journal') return t('headerText.analysisTitleJournal');
        return t('headerText.analysisTitle');
    };
    const getLastAnalysisText = () => !data?.analysisTimestamp || isLoadingInitial ? tCommon('na') : new Date(data.analysisTimestamp).toLocaleString();
    const getLogFilePathText = () => {
        if (isLoadingInitial) return tCommon('unknown');
        if (data?.filterRequestId && data.logFilePath) return data.logFilePath;
        if (!data?.filterRequestId && data?.logFilePath === undefined) return t('logFileAggregate');
        return data?.logFilePath || tCommon('unknown');
    };

    // --- UI State Classes (Không thay đổi logic) ---
    const headerBorderColor = error && !data ? 'border-red-500' : 'border-blue-600';
    const connectionBgColor = isConnected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';
    const connectionPingClass = isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400';
    const connectionDotClass = isConnected ? 'bg-green-500' : 'bg-red-500';
    const showClearInputButton = !!textFilterInput && !loading;

    return (
        <header className={`flex flex-col gap-4 mb-6 bg-white p-4 rounded-lg shadow-lg border-l-4 ${headerBorderColor}`}>
            {/* === SECTION 1: Main Title & Status === */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 truncate min-w-0">
                    {getHeaderText()}
                </h1>
                {!(isLoadingInitial || (error && !data)) && (
                    <div className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-2 shrink-0 whitespace-nowrap ${connectionBgColor}`}>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className={`absolute inline-flex h-full w-full rounded-full ${connectionPingClass}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connectionDotClass}`}></span>
                        </span>
                        {t('realtime')}: <span className="font-bold">{isConnected ? t('connectionStatus.connected') : t('connectionStatus.disconnected')}</span>
                    </div>
                )}
            </div>

            {/* Optional Info/Error Message */}
            {allRequestsFilteredOut && overallAnalysisErrorMessage && !isLoadingInitial && !(error && !data) && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm flex items-center">
                    <FaInfoCircle className="inline mr-2 flex-shrink-0" />
                    <span>{overallAnalysisErrorMessage}</span>
                </div>
            )}

            {/* === SECTION 2: Action Toolbar === */}
            {!(isLoadingInitial || (error && !data)) && (
                <div className="flex flex-wrap items-center gap-3">
                    {/* Text Search Filter */}
                    <div className="relative flex-grow min-w-[250px]">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" title={t('filter.textSearchTitle')} />
                        <input
                            type="text"
                            placeholder={t('filter.textSearchPlaceholder')}
                            value={textFilterInput}
                            onChange={(e) => setTextFilterInput(e.target.value)}
                            disabled={loading}
                            className={`p-2 pl-10 w-full border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100' : 'text-gray-700'}`}
                        />
                        {showClearInputButton && (
                            <button onClick={() => setTextFilterInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700" title={t('filter.clearInputTitle')}>
                                <FaTimes className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Time Filter */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <FaFilter className="text-gray-500" title={t('filter.timeFilterTitle')} />
                        <select value={timeFilterOption} onChange={handleFilterChange} disabled={loading}
                            className={`p-2 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100' : 'text-gray-700'}`}>
                            <option value="latest">{t('timeOptions.allTime')}</option>
                            <option value="last_hour">{t('timeOptions.lastHour')}</option>
                            <option value="last_6h">{t('timeOptions.last6Hours')}</option>
                            <option value="last_24h">{t('timeOptions.last24Hours')}</option>
                            <option value="last_7d">{t('timeOptions.last7Days')}</option>
                            <option value="custom">{t('timeOptions.custom')}</option>
                        </select>
                    </div>

                    {/* Custom Date Range Filter (Conditional) */}
                    {timeFilterOption === 'custom' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <DatePicker selected={tempCustomStartDate} onChange={(date) => setTempCustomStartDate(date)} selectsStart startDate={tempCustomStartDate} endDate={tempCustomEndDate} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="Pp" placeholderText={t('filter.startDatePlaceholder')} isClearable disabled={loading} className="w-40" />
                            <span className="text-gray-500">-</span>
                            <DatePicker selected={tempCustomEndDate} onChange={(date) => setTempCustomEndDate(date)} selectsEnd startDate={tempCustomStartDate} endDate={tempCustomEndDate} minDate={tempCustomStartDate ?? undefined} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="Pp" placeholderText={t('filter.endDatePlaceholder')} isClearable disabled={loading} className="w-40" />
                            <button onClick={applyCustomDateFilter} disabled={loading || !tempCustomStartDate || !tempCustomEndDate} className="px-3 py-2 text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed" title={t('filter.applyFilterTitle')}>
                                {t('filter.applyButton')}
                            </button>
                        </div>
                    )}

                    {/* Refresh Button - Part of the toolbar now */}
                    <button onClick={refetchData} disabled={loading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white whitespace-nowrap md:ml-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                        title={loading ? t('refreshButton.refreshingTitle') : t('refreshButton.refreshDataTitle')}>
                        <FaSyncAlt className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? t('refreshButton.refreshing') : t('refreshButton.refreshNow')}
                    </button>
                </div>
            )}

            {/* === SECTION 3: Metadata & Secondary Info === */}
            {!(isLoadingInitial || (error && !data)) && (
                <div className="flex flex-wrap text-xs text-gray-500 gap-x-4 gap-y-1 pt-2 border-t border-gray-200">
                    <span className="flex items-center gap-1">
                        <FaSyncAlt /> {t('lastAnalysis')}: <span className="font-medium text-gray-700">{getLastAnalysisText()}</span>
                    </span>
                    <p className="min-w-0 break-words" title={getLogFilePathText()}>
                        {t('logFile')}: <span className="font-mono text-gray-700">{getLogFilePathText()}</span>
                    </p>
                    {error && !isLoadingInitial && data && (
                        <span className="text-red-600 flex items-center gap-1" title={error}>
                            <FaExclamationTriangle /> {t('errorLabel')}: {error}
                        </span>
                    )}
                </div>
            )}
        </header>
    );
};

export default AnalysisHeader;