import React from 'react';
import { FaFilter, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import { LogAnalysisResult } from '../../../../models/logAnalysis/logAnalysis';


interface AnalysisHeaderProps {
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    data: LogAnalysisResult | null; // Cho phép null nếu chưa có data
    timeFilterOption: string;
    handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    refetchData: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
    loading,
    error,
    isConnected,
    data,
    timeFilterOption,
    handleFilterChange,
    refetchData
}) => {

    const isLoadingInitial = loading && !data; // Loading lần đầu, chưa có data cũ
    const isRefreshing = loading && data; // Đang refresh nhưng có data cũ để hiển thị

    const getHeaderText = () => {
        if (isLoadingInitial) return "Loading Analysis...";
        if (error && !data) return "Error Loading Data";
        if (!data) return "No Analysis Data Available";
        return "Crawl Process Analysis";
    };

    const getLastAnalysisText = () => {
        if (isLoadingInitial) return "Loading...";
        if (error && !data) return "Error";
        if (!data?.analysisTimestamp) return "N/A";
        return new Date(data.analysisTimestamp).toLocaleString();
    };

    const getLogFilePathText = () => {
        if (isLoadingInitial) return "Loading...";
        if (!data?.logFilePath) return "Unknown";
        return data.logFilePath;
    }

    const headerBorderColor = error && !data ? 'border-red-500' : 'border-blue-500';
    const connectionBgColor = isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    const connectionPingClass = isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400';
    const connectionDotClass = isConnected ? 'bg-green-500' : 'bg-red-500';

    return (
        <header className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 ${headerBorderColor} gap-y-3 md:gap-y-0`}>
            {/* Left Side: Title & Meta Info */}
            <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{getHeaderText()}</h1>
                <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                    <span>
                        Last Analysis: {getLastAnalysisText()}
                    </span>
                    {/* Chỉ hiển thị lỗi fetch cuối nếu có lỗi *và* không đang loading initial */}
                    {error && !isLoadingInitial && <span className="text-red-500 text-xs flex items-center gap-1" title={error}> <FaExclamationTriangle/> Last fetch failed</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate" title={getLogFilePathText()}>
                    Log File: {getLogFilePathText()}
                </p>
            </div>

            {/* Right Side: Controls & Status */}
            {/* Chỉ hiển thị controls nếu không phải lỗi initial hoặc loading initial mà chưa có gì */}
            { !(isLoadingInitial || (error && !data)) && (
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 md:mt-0 shrink-0">
                    {/* Filter Control */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-600" title="Filter Time Range" />
                        <select
                            value={timeFilterOption}
                            onChange={handleFilterChange}
                            // disabled={loading} đã xử lý đúng việc disable khi loading (initial hoặc refresh)
                            disabled={loading}
                            className={`p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                        >
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={refetchData}
                            // disabled={loading} đã xử lý đúng
                            disabled={loading}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} ...`}
                            title={loading ? "Refreshing..." : "Refresh data now"} // Cập nhật title động
                        >
                            <FaSyncAlt className={`mr-1.5 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                    </div>

                    {/* Connection Status */}
                    <div className={`text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shrink-0 ${connectionBgColor}`}>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className={`absolute inline-flex h-full w-full rounded-full ${connectionPingClass}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connectionDotClass}`}></span>
                        </span>
                        Realtime: {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            )}
        </header>
    );
};

export default AnalysisHeader;