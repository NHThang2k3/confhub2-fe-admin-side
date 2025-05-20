// src/app/[locale]/logAnalysis/Analysis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData';
import {
    FaExclamationTriangle, FaSyncAlt, FaTable, FaBookOpen,
    FaChevronUp, FaChevronDown, FaInfoCircle, FaListAlt, FaFileAlt, FaArrowLeft
} from 'react-icons/fa';

import ConferenceCrawlUploader from './ConferenceCrawlUploader';
import JournalCrawlUploader from './JournalCrawlUploader';
import AnalysisHeader from './AnalysisHeader'; // Your updated header
import OverallSummary from './OverallSummary';
import ConferenceDetails from './ConferenceDetails';
// import JournalDetails from './JournalDetails';

type CrawlerType = 'conference' | 'journal';

const formatDateTime = (isoString: string | null | undefined): string => {
    if (!isoString) {
        return 'N/A';
    }
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const datePart = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timePart = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return `${datePart} ${timePart}`;
    } catch (e) {
        return 'Invalid Date String';
    }
};

const Analysis: React.FC = () => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false); // For OverallSummary content
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');
    const [isCrawlerSectionExpanded, setIsCrawlerSectionExpanded] = useState(false);
    // THÊM MỚI: State cho việc mở/đóng phần Log Analysis Requests
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true); // Mặc định mở

    useEffect(() => {
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = undefined;

        switch (timeFilterOption) {
            case 'last_hour': start = now - 60 * 60 * 1000; end = now; break;
            case 'last_6h': start = now - 6 * 60 * 60 * 1000; end = now; break;
            case 'last_24h': start = now - 24 * 60 * 60 * 1000; end = now; break;
            case 'last_7d': start = now - 7 * 24 * 60 * 60 * 1000; end = now; break;
            case 'latest': default: break;
        }
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    const { data, loading, error, isConnectedToSocket, refetchData } = useLogAnalysisData(
        filterStartTime,
        filterEndTime,
        activeRequestIdFilter
    );

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
    };

    const applyRequestIdFilterFromInput = useCallback(() => {
        const trimmedInput = requestIdFilterInput.trim();
        if (trimmedInput) {
            setActiveRequestIdFilter(trimmedInput);
        } else {
            setActiveRequestIdFilter(undefined);
        }
    }, [requestIdFilterInput]);

    const clearActiveFilterAndGoToList = useCallback(() => {
        setRequestIdFilterInput('');
        setActiveRequestIdFilter(undefined);
    }, []);

    const handleSelectRequestFromList = (reqId: string) => {
        setRequestIdFilterInput(reqId);
        setActiveRequestIdFilter(reqId);
    };

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleCrawlerSection = () => setIsCrawlerSectionExpanded(prev => !prev);
    // THÊM MỚI: Hàm xử lý mở/đóng Log Analysis Requests
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);


    // --- Render Logic ---
    if (loading && !data && !error) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                <AnalysisHeader
                    loading={true} error={null} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                />
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600">
                    <FaSyncAlt className="mr-2 animate-spin text-xl" /> Loading Analysis Data...
                </div>
            </div>
        );
    }

    if (error && !data && !loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-red-50 min-h-screen font-sans">
                <AnalysisHeader
                    loading={false} error={error} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                />
                <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600 font-semibold">
                    <FaExclamationTriangle size={32} className="mb-4 text-red-500" />
                    Error loading analysis data:
                    <p className="text-sm mt-2 text-center max-w-md">{error}</p>
                    <button onClick={refetchData} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center">
                        <FaSyncAlt className="mr-2" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    const isDetailView = !!activeRequestIdFilter && !!data && data.filterRequestId === activeRequestIdFilter;
    const isListView = !activeRequestIdFilter && !!data && !data.filterRequestId;
    const hasOverallDataForDisplay = data && data.overall && data.overall.processedConferencesCount > 0;
    const hasConferenceDetailsForDisplay = data?.conferenceAnalysis && Object.keys(data.conferenceAnalysis).length > 0;

    const getNoDataFoundMessage = () => {
        if (isDetailView && !hasOverallDataForDisplay) {
            return `No analysis results found for Request ID: "${activeRequestIdFilter}".`;
        }
        if (isListView && (!data?.analyzedRequestIds || data.analyzedRequestIds.length === 0)) {
            return `No analysis requests found for the selected time period.`;
        }
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest') {
            return `No analysis results found for the selected time period.`;
        }
        if (!loading && !hasOverallDataForDisplay) {
            return "No analysis results found. The log might be empty or processing is pending.";
        }
        return "No specific data to display for the current view.";
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">
            {!isDetailView && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-5" onClick={handleToggleCrawlerSection}>
                        <h2 className="text-lg font-semibold text-gray-800">Data Crawling Tools</h2>
                        <button className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full" aria-label={isCrawlerSectionExpanded ? "Collapse" : "Expand"}>
                            {isCrawlerSectionExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                        </button>
                    </div>
                    <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isCrawlerSectionExpanded ? 'max-h-[1500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                        <div className="p-4">
                            <div className="flex border-b border-gray-200 mb-4">
                                <button onClick={() => setActiveCrawler('conference')} className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'conference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <FaTable className="mr-2" /> Crawl Conferences
                                </button>
                                <button onClick={() => setActiveCrawler('journal')} className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'journal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <FaBookOpen className="mr-2" /> Crawl Journals
                                </button>
                            </div>
                            <div>
                                {activeCrawler === 'conference' && <ConferenceCrawlUploader />}
                                {activeCrawler === 'journal' && <JournalCrawlUploader />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AnalysisHeader
                loading={loading} error={error} isConnected={isConnectedToSocket} data={data}
                timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                refetchData={refetchData}
                requestIdFilterInput={requestIdFilterInput}
                setRequestIdFilterInput={setRequestIdFilterInput}
                applyRequestIdFilter={applyRequestIdFilterFromInput}
                clearRequestIdFilter={clearActiveFilterAndGoToList}
            />

            {/* Case 1: Data is loaded and we are in List View */}
            {isListView && data && (
                // THAY ĐỔI: Bọc trong div mới và thêm header/content có thể thu gọn
                <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div
                        className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-5"
                        onClick={handleToggleLogRequests} // THÊM MỚI: onClick handler
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-0 flex items-center"> {/* Bỏ mb-4 ở đây */}
                            <FaListAlt className="mr-2 text-blue-600" /> Available Log Analysis Requests
                        </h2>
                        <button // THÊM MỚI: Nút expand/collapse
                            className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                            aria-label={isLogRequestsExpanded ? "Collapse Log Requests" : "Expand Log Requests"}
                        >
                            {isLogRequestsExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                        </button>
                    </div>

                    {/* THAY ĐỔI: Phần nội dung có thể thu gọn */}
                    <div
                        className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isLogRequestsExpanded ? 'max-h-[2500px] opacity-100 visible p-4 sm:p-6' : 'max-h-0 opacity-0 invisible'}`}
                    >
                        {data.analyzedRequestIds && data.analyzedRequestIds.length > 0 ? (
                            <ul className="space-y-3">
                                {data.analyzedRequestIds.map((reqId) => {
                                    const requestDetails = data.requests?.[reqId];
                                    return (
                                        <li key={reqId}
                                            onClick={() => handleSelectRequestFromList(reqId)}
                                            className="p-4 bg-gray-5 hover:bg-blue-100 border border-gray-200 rounded-lg cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow pr-2">
                                                    <span className="block font-semibold text-gray-800 text-sm">
                                                        Request ID: {reqId}
                                                    </span>
                                                </div>
                                                <span className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                                                    View Details →
                                                </span>
                                            </div>
                                            {requestDetails ? (
                                                <div className="mt-2 text-xs text-gray-700 space-y-0.5">
                                                    <p>
                                                        <span className="font-medium text-gray-500">Start Time:</span> {formatDateTime(requestDetails.startTime)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-500">End Time:</span> {formatDateTime(requestDetails.endTime)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-500">Duration:</span> {requestDetails.durationSeconds} seconds
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Time details not available for this request.
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                <FaInfoCircle size={20} className="mb-2 inline-block" />
                                <p>{getNoDataFoundMessage()}</p>
                            </div>
                        )}
                        {/* OverallSummary cho list view cũng nằm trong phần có thể thu gọn này */}
                        {hasOverallDataForDisplay && (
                            <div className="mt-6 border-t pt-4">
                                <OverallSummary data={data} isExpanded={isSummaryExpanded} onToggle={handleToggleSummary} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Case 2: Data is loaded and we are in Detail View */}
            {isDetailView && data && (
                <div className="mt-6">
                    <button
                        onClick={clearActiveFilterAndGoToList}
                        className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaArrowLeft className="mr-2" /> Back to List of Requests
                    </button>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FaFileAlt className="mr-2 text-green-600" /> Analysis Details
                        <span className='text-sm text-blue-600 ml-2'>
                            (Request ID: {activeRequestIdFilter})
                        </span>
                    </h2>

                    {hasOverallDataForDisplay ? (
                        <OverallSummary data={data} isExpanded={isSummaryExpanded} onToggle={handleToggleSummary} />
                    ) : !loading && (
                        <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                            {getNoDataFoundMessage()}
                        </div>
                    )}

                    {activeCrawler === 'conference' && hasConferenceDetailsForDisplay && (
                        <ConferenceDetails logAnalysisResult={data} />
                    )}

                    {activeCrawler === 'conference' && !hasConferenceDetailsForDisplay && !loading && hasOverallDataForDisplay && (
                        <div className="mt-4 text-center text-gray-500 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                            No specific Conference analysis details available for this request.
                        </div>
                    )}
                </div>
            )}

            {!loading && data === null && !error && (
                <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                    <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                    {getNoDataFoundMessage()}
                </div>
            )}
            {!loading && data !== null && !isListView && !isDetailView && (
                <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                    <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                    Analysis data loaded, but current view criteria not met. Try adjusting filters or refreshing.
                    {data.filterRequestId && <p className="text-sm mt-1">Data is for: {data.filterRequestId}</p>}
                    {!data.filterRequestId && <p className="text-sm mt-1">Data is general summary.</p>}
                </div>
            )}

            {loading && data && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? `Refreshing details for ${activeRequestIdFilter}...` : "Refreshing analysis data..."}
                </div>
            )}
            {error && data && (
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> Error refreshing data: {error}
                </div>
            )}
        </div>
    );
};

export default Analysis;