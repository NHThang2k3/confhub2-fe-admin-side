// src/app/[locale]/dashboard/logAnalysis/analysis/AnalysisHeader.tsx
import React from 'react';
import { FaFilter, FaSyncAlt, FaExclamationTriangle, FaSearch, FaTimes } from 'react-icons/fa';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { useTranslations } from 'next-intl';

interface AnalysisHeaderProps {
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    data: LogAnalysisResultUnion | null;
    timeFilterOption: string;
    handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    refetchData: () => void;
    requestIdFilterInput: string;
    setRequestIdFilterInput: (value: string) => void;
    applyRequestIdFilter: () => void;
    clearRequestIdFilter: () => void;
    crawlerType: CrawlerType;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
    loading, error, isConnected, data, timeFilterOption, handleFilterChange, refetchData,
    requestIdFilterInput, setRequestIdFilterInput, applyRequestIdFilter, clearRequestIdFilter,
    crawlerType
}) => {
    const t = useTranslations('AnalysisHeader');

    const isLoadingInitial = loading && !data;

    const getHeaderText = () => {
        if (isLoadingInitial) return t('headerText.loading');
        if (error && !data) return t('headerText.errorLoading');
        if (!data && !loading) return t('headerText.noData');

        if (crawlerType === 'conference') {
            return t('headerText.analysisTitleConference');
        } else if (crawlerType === 'journal') {
            return t('headerText.analysisTitleJournal');
        }
        return t('headerText.analysisTitle');
    };

    const getLastAnalysisText = () => !data?.analysisTimestamp || isLoadingInitial ? t('common.na') : new Date(data.analysisTimestamp).toLocaleString();
    const getLogFilePathText = () => !data?.logFilePath || isLoadingInitial ? t('common.unknown') : data.logFilePath;

    const headerBorderColor = error && !data ? 'border-red-500' : 'border-blue-600';
    const connectionBgColor = isConnected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';
    const connectionPingClass = isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400';
    const connectionDotClass = isConnected ? 'bg-green-500' : 'bg-red-500';

    const handleRequestIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setRequestIdFilterInput(event.target.value);
    const handleRequestIdKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') applyRequestIdFilter(); };

    const clearInputRightOffset = data?.filterRequestId ? 'right-10' : 'right-3';

    return (
        <header className={`flex flex-col mb-6 bg-white p-4 rounded-lg shadow-lg border-l-4 ${headerBorderColor} `}>
            {/* Hàng trên cùng: Tiêu đề và Connection Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-y-3 md:gap-y-0">
                <div className="flex-grow min-w-0">
                    {/* Tiêu đề được cập nhật bởi getHeaderText() */}
                    <h1 className="text-xl md:text-xl font-extrabold text-gray-900 truncate">{getHeaderText()}</h1>
                    {/* Các thông tin phụ "Last Analysis" và "Log File Path" đã được di chuyển xuống */}
                </div>

                {!(isLoadingInitial || (error && !data)) && (
                    <div className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-2 shrink-0 whitespace-nowrap ${connectionBgColor} mt-3 md:mt-0`}>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className={`absolute inline-flex h-full w-full rounded-full ${connectionPingClass}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connectionDotClass}`}></span>
                        </span>
                        {t('realtime')}: <span className="font-bold">{isConnected ? t('connectionStatus.connected') : t('connectionStatus.disconnected')}</span>
                    </div>
                )}
            </div>

            {/* Hàng dưới: Thông tin phụ, các bộ lọc và nút Refresh */}
            {!(isLoadingInitial || (error && !data)) && (
                 <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 mt-4 shrink-0 w-full xl:w-auto">
                    {/* Thông tin Last Analysis và Log File Path */}
                    {/* ĐÃ CHỈNH SỬA: Luôn xếp theo cột */}
                    <div className="flex flex-col gap-y-1 shrink-0 text-sm">
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1"><FaSyncAlt /> {t('lastAnalysis')}: {getLastAnalysisText()}</span>
                            {error && !isLoadingInitial && <span className="text-red-600 text-xs flex items-center gap-1" title={error}><FaExclamationTriangle /> {t('errorLabel')}: {error}</span>}
                        </div>
                        <p className="text-xs truncate" title={getLogFilePathText()}>{t('logFile')}: <span className="font-mono">{getLogFilePathText()}</span></p>
                    </div>

                    {/* Request ID Filter Group */}
                    <div className="flex items-center gap-2 w-full sm:w-auto relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" title={t('filter.requestIdFilterTitle')} />
                        <input
                            type="text"
                            placeholder={t('filter.requestIdPlaceholder')}
                            value={requestIdFilterInput}
                            onChange={handleRequestIdInputChange}
                            onKeyPress={handleRequestIdKeyPress}
                            disabled={loading}
                            className={`p-2 pl-10 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 md:w-72 lg:w-80 ${loading ? 'cursor-not-allowed bg-gray-100' : 'text-gray-700'}`}
                        />
                        {requestIdFilterInput && !loading && (
                             <button
                                onClick={() => { setRequestIdFilterInput(''); if(data?.filterRequestId) clearRequestIdFilter(); }}
                                className={`absolute ${clearInputRightOffset} top-1/2 -translate-y-1/2 p-1 hover:text-gray-700 focus:outline-none`}
                                title={t('filter.clearInputTitle')}
                            >
                                <FaTimes className="h-3 w-3" />
                            </button>
                        )}
                         {data?.filterRequestId && !loading && (
                            <button
                                onClick={clearRequestIdFilter}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 focus:outline-none`}
                                title={t('filter.clearActiveFilterTitle')}
                            >
                                <FaTimes className="h-3 w-3" />
                            </button>
                        )}
                         {!data?.filterRequestId && requestIdFilterInput.trim() && (
                            <button
                                onClick={applyRequestIdFilter}
                                disabled={loading || !requestIdFilterInput.trim()}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-md shadow-sm text-white whitespace-nowrap ${loading || !requestIdFilterInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                                title={!requestIdFilterInput.trim() ? t('filter.enterRequestIdTitle') : t('filter.applyFilterTitle')}
                            >
                                {t('filter.applyButton')}
                            </button>
                        )}
                    </div>
                    {/* Time Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-500" title={t('filter.timeFilterTitle')} />
                        <select value={timeFilterOption} onChange={handleFilterChange} disabled={loading}
                            className={`p-2 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100' : 'text-gray-700'}`}>
                            <option value="latest">{t('timeOptions.allTime')}</option>
                            <option value="last_hour">{t('timeOptions.lastHour')}</option>
                            <option value="last_6h">{t('timeOptions.last6Hours')}</option>
                            <option value="last_24h">{t('timeOptions.last24Hours')}</option>
                            <option value="last_7d">{t('timeOptions.last7Days')}</option>
                        </select>
                    </div>
                    {/* Refresh Button */}
                    <div className="flex items-center gap-2">
                        <button onClick={refetchData} disabled={loading}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white whitespace-nowrap ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                            title={loading ? t('refreshButton.refreshingTitle') : t('refreshButton.refreshDataTitle')}>
                            <FaSyncAlt className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? t('refreshButton.refreshing') : t('refreshButton.refreshNow')}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};
export default AnalysisHeader;