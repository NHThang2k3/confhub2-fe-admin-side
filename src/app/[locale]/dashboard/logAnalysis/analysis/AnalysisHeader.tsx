// src/app/[locale]/logAnalysis/AnalysisHeader.tsx
import React from 'react';
import { FaFilter, FaSyncAlt, FaExclamationTriangle, FaSearch, FaTimes } from 'react-icons/fa'; // Add FaTimes
import { LogAnalysisResult } from '../../../../../models/logAnalysis'; // Adjust path

interface AnalysisHeaderProps {
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    data: LogAnalysisResult | null;
    timeFilterOption: string;
    handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    refetchData: () => void;
    requestIdFilterInput: string;
    setRequestIdFilterInput: (value: string) => void;
    applyRequestIdFilter: () => void;
    clearRequestIdFilter: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
    loading, error, isConnected, data, timeFilterOption, handleFilterChange, refetchData,
    requestIdFilterInput, setRequestIdFilterInput, applyRequestIdFilter, clearRequestIdFilter
}) => {
    const isLoadingInitial = loading && !data;
    const getHeaderText = () => {
        if (isLoadingInitial) return "Loading Analysis...";
        if (error && !data) return "Error Loading Data";
        if (!data && !loading) return "No Analysis Data";
        return "Crawl Process Analysis";
    };
    const getLastAnalysisText = () => !data?.analysisTimestamp || isLoadingInitial ? "N/A" : new Date(data.analysisTimestamp).toLocaleString();
    const getLogFilePathText = () => !data?.logFilePath || isLoadingInitial ? "Unknown" : data.logFilePath;

    const headerBorderColor = error && !data ? 'border-red-500' : 'border-blue-600';
    const connectionBgColor = isConnected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';
    const connectionPingClass = isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400';
    const connectionDotClass = isConnected ? 'bg-green-500' : 'bg-red-500';

    const handleRequestIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setRequestIdFilterInput(event.target.value);
    const handleRequestIdKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') applyRequestIdFilter(); };

    // Calculate the right offset for buttons based on whether clear filter button is present
    const rightOffset = data?.filterRequestId ? 'right-3' : (requestIdFilterInput.trim() ? 'right-3' : '');
    const clearInputRightOffset = data?.filterRequestId ? 'right-10' : 'right-3'; // Adjusted right offset for clear input button

    return (
        <header className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-5 rounded-lg shadow-lg border-l-4 ${headerBorderColor} gap-y-4 md:gap-y-0`}>
            <div className="flex-grow min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 truncate">{getHeaderText()}</h1>
                <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><FaSyncAlt className="text-gray-400" /> Last Analysis: {getLastAnalysisText()}</span>
                    {error && !isLoadingInitial && <span className="text-red-600 text-xs flex items-center gap-1" title={error}><FaExclamationTriangle /> Error: {error}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate" title={getLogFilePathText()}>Log File: <span className="font-mono">{getLogFilePathText()}</span></p>
                {/* {data?.filterRequestId && (
                    <p className="text-xs text-blue-700 mt-1 font-semibold">
                        Filtered by Request ID: <span className="font-bold">{data.filterRequestId}</span>
                    </p>
                )} */}
            </div>

            {!(isLoadingInitial || (error && !data)) && (
                 <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 mt-4 md:mt-0 shrink-0 w-full xl:w-auto">
                    {/* Request ID Filter Group */}
                    {/* Adjusted width classes */}
                    <div className="flex items-center gap-2 w-full sm:w-auto relative">
                        <FaSearch className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" title="Filter by Request ID" />
                        <input
                            type="text"
                            placeholder="Filter by Request ID..."
                            value={requestIdFilterInput}
                            onChange={handleRequestIdInputChange}
                            onKeyPress={handleRequestIdKeyPress}
                            disabled={loading}
                            // Adjusted width classes: Increased default width and responsiveness
                            className={`p-2 pl-10 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 md:w-80 lg:w-96 ${loading ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'text-gray-700'}`}
                        />
                        {/* Clear Input Button */}
                        {requestIdFilterInput && !loading && (
                             <button
                                onClick={() => { setRequestIdFilterInput(''); if(data?.filterRequestId) clearRequestIdFilter(); }}
                                className={`absolute ${clearInputRightOffset} top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none`}
                                title="Clear input"
                            >
                                <FaTimes className="h-3 w-3" />
                            </button>
                        )}
                         {/* Clear Active Filter Button */}
                         {data?.filterRequestId && !loading && (
                            <button
                                onClick={clearRequestIdFilter}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 focus:outline-none`}
                                title="Clear Active Request ID Filter"
                            >
                                <FaTimes className="h-3 w-3" />
                            </button>
                        )}
                         {/* Apply Button */}
                         {!data?.filterRequestId && requestIdFilterInput.trim() && (
                            <button
                                onClick={applyRequestIdFilter}
                                disabled={loading || !requestIdFilterInput.trim()}
                                // Adjusted right offset for apply button
                                className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-md shadow-sm text-white whitespace-nowrap ${loading || !requestIdFilterInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                                title={!requestIdFilterInput.trim() ? "Enter a Request ID" : "Apply Filter"}
                            >
                                Apply
                            </button>
                        )}

                    </div>
                    {/* Time Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" title="Filter Time Range" />
                        <select value={timeFilterOption} onChange={handleFilterChange} disabled={loading}
                            className={`p-2 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'text-gray-700'}`}>
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                        </select>
                    </div>
                    {/* Refresh Button */}
                    <div className="flex items-center gap-2">
                        <button onClick={refetchData} disabled={loading}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white whitespace-nowrap ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                            title={loading ? "Refreshing..." : "Refresh data"}>
                            <FaSyncAlt className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                    </div>
                    {/* Connection Status */}
                    <div className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-2 shrink-0 whitespace-nowrap ${connectionBgColor}`}>
                        <span className="relative flex h-2.5 w-2.5"><span className={`absolute inline-flex h-full w-full rounded-full ${connectionPingClass}`}></span><span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connectionDotClass}`}></span></span>
                        Realtime: <span className="font-bold">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
            )}
        </header>
    );
};
export default AnalysisHeader;