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

const Analysis: React.FC = () => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);

    // requestIdFilterInput: The text in the input field.
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    // activeRequestIdFilter: The ID that is currently being used to filter data.
    // This is passed to useLogAnalysisData.
    // Undefined means list view, a string means detail view for that ID.
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');
    const [isCrawlerSectionExpanded, setIsCrawlerSectionExpanded] = useState(true);

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
        activeRequestIdFilter // This is the crucial state for fetching data
    );

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
        // Optional: Decide if changing time filter should clear activeRequestIdFilter and go to list view.
        // If you want to go back to list view when time filter changes:
        // setActiveRequestIdFilter(undefined);
        // setRequestIdFilterInput(''); // Also clear the input field
    };

    // Called when "Apply" button in header is clicked OR Enter is pressed in input
    const applyRequestIdFilterFromInput = useCallback(() => {
        const trimmedInput = requestIdFilterInput.trim();
        if (trimmedInput) {
            setActiveRequestIdFilter(trimmedInput);
        } else {
            // If input is empty and apply is somehow triggered, go to list view
            setActiveRequestIdFilter(undefined);
        }
    }, [requestIdFilterInput]);

    // Called by "Clear Active Filter" (X) button in header (when a filter is active)
    // OR by "Back to List" button
    const clearActiveFilterAndGoToList = useCallback(() => {
        setRequestIdFilterInput(''); // Clear the text input
        setActiveRequestIdFilter(undefined); // Go back to list view (triggers data refetch for summary)
    }, []);

    // Called when user clicks on a request ID from the list
    const handleSelectRequestFromList = (reqId: string) => {
        setRequestIdFilterInput(reqId); // Update input field to show the selected ID
        setActiveRequestIdFilter(reqId); // Set as active filter (triggers data refetch for details)
    };

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleCrawlerSection = () => setIsCrawlerSectionExpanded(prev => !prev);


    // --- Render Logic ---
    // Initial Loading State (before any data is fetched, only show header skeleton)
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
                    clearRequestIdFilter={clearActiveFilterAndGoToList} // For "Clear Active Filter"
                />
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600">
                    <FaSyncAlt className="mr-2 animate-spin text-xl" /> Loading Analysis Data...
                </div>
            </div>
        );
    }

    // Initial Error State (fetch failed, no data ever loaded)
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
                    clearRequestIdFilter={clearActiveFilterAndGoToList} // For "Clear Active Filter"
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

    // --- Main Content (data might be present, or loading refresh, or no data found after load) ---

    // isDetailView: True if activeRequestIdFilter is set AND data is loaded AND data.filterRequestId matches.
    // This ensures we are showing details for the *correctly* fetched request.
    const isDetailView = !!activeRequestIdFilter && !!data && data.filterRequestId === activeRequestIdFilter;

    // isListView: True if activeRequestIdFilter is NOT set (meaning we want the list) AND data is loaded.
    // data.filterRequestId should be undefined or null in this case.
    const isListView = !activeRequestIdFilter && !!data && !data.filterRequestId;


    const hasOverallDataForDisplay = data && data.overall && data.overall.processedConferencesCount > 0;
    const hasConferenceDetailsForDisplay = data?.conferenceAnalysis && Object.keys(data.conferenceAnalysis).length > 0;

    const getNoDataFoundMessage = () => {
        if (isDetailView && !hasOverallDataForDisplay) { // In detail view but no data for this specific ID
            return `No analysis results found for Request ID: "${activeRequestIdFilter}".`;
        }
        if (isListView && (!data?.analyzedRequestIds || data.analyzedRequestIds.length === 0)) {
             return `No analysis requests found for the selected time period.`;
        }
        // Fallback for other "no data" scenarios
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest') {
             return `No analysis results found for the selected time period.`;
        }
        if (!loading && !hasOverallDataForDisplay) {
            return "No analysis results found. The log might be empty or processing is pending.";
        }
        return "No specific data to display for the current view."; // Generic fallback
    };


    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">
            {/* --- Section: Data Crawlers (Collapsible) --- */}
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

            {/* --- Section: Analysis Results --- */}
            <AnalysisHeader
                loading={loading}
                error={error}
                isConnected={isConnectedToSocket}
                data={data} // Pass data; header uses data.filterRequestId to show/hide "Clear Active Filter"
                timeFilterOption={timeFilterOption}
                handleFilterChange={handleTimeFilterChange}
                refetchData={refetchData}
                requestIdFilterInput={requestIdFilterInput}
                setRequestIdFilterInput={setRequestIdFilterInput}
                applyRequestIdFilter={applyRequestIdFilterFromInput}
                clearRequestIdFilter={clearActiveFilterAndGoToList} // For "Clear Active Filter" (X) button
            />

            {/* ----- Main Content: List or Detail ----- */}

            {/* Case 1: Data is loaded and we are in List View */}
            {isListView && data && (
                <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FaListAlt className="mr-2 text-blue-600" /> Available Log Analysis Requests
                    </h2>
                    {data.analyzedRequestIds && data.analyzedRequestIds.length > 0 ? (
                        <ul className="space-y-2">
                            {data.analyzedRequestIds.map((reqId) => (
                                <li key={reqId}
                                    onClick={() => handleSelectRequestFromList(reqId)}
                                    className="p-3 bg-gray-5 hover:bg-blue-100 border border-gray-200 rounded-md cursor-pointer transition-colors duration-150 flex justify-between items-center"
                                >
                                    <span className="font-medium text-gray-700">Request ID: {reqId}</span>
                                    <span className="text-xs text-blue-500 hover:text-blue-700">View Details →</span>
                                </li>
                            ))}
                        </ul>
                    ) : ( // No request IDs found in list view
                        <div className="text-center text-gray-500 py-4">
                            <FaInfoCircle size={20} className="mb-2 inline-block" />
                            <p>{getNoDataFoundMessage()}</p>
                        </div>
                    )}
                    {/* OverallSummary for the list view (all listed requests) */}
                    {hasOverallDataForDisplay && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Summary (All Listed Requests)</h3>
                            <OverallSummary data={data} isExpanded={isSummaryExpanded} onToggle={handleToggleSummary} />
                        </div>
                    )}
                </div>
            )}

            {/* Case 2: Data is loaded and we are in Detail View */}
            {isDetailView && data && (
                <div className="mt-6">
                    <button
                        onClick={clearActiveFilterAndGoToList} // Use the same function as "Clear Active Filter"
                        className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaArrowLeft className="mr-2" /> Back to List of Requests
                    </button>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FaFileAlt className="mr-2 text-green-600" /> Analysis Details for Request ID:
                        <span className="ml-2 font-mono text-blue-700">{activeRequestIdFilter}</span>
                    </h2>

                    {/* OverallSummary for the specific request */}
                    {hasOverallDataForDisplay ? (
                        <OverallSummary data={data} isExpanded={isSummaryExpanded} onToggle={handleToggleSummary} />
                    ) : !loading && ( // No data found for this specific ID in detail view
                        <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                            {getNoDataFoundMessage()}
                        </div>
                    )}

                    {/* ConferenceDetails for the specific request */}
                    {activeCrawler === 'conference' && hasConferenceDetailsForDisplay && (
                        <ConferenceDetails logAnalysisResult={data} />
                    )}
                    {/* Add similar for JournalDetails if/when ready */}

                    {activeCrawler === 'conference' && !hasConferenceDetailsForDisplay && !loading && hasOverallDataForDisplay && (
                        <div className="mt-4 text-center text-gray-500 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                            No specific Conference analysis details available for this request.
                        </div>
                    )}
                </div>
            )}

            {/* Case 3: No data loaded yet (and not initial loading/error), or data loaded but doesn't fit list/detail view criteria */}
            {/* This handles scenarios where `data` might exist but `isListView` or `isDetailView` are false,
                or if `data` is null after the initial loading states.
                Essentially, if neither list view nor detail view conditions are met, show a "no data" message.
            */}
            {!loading && data === null && !error && ( // If data is truly null after loading/error states, meaning nothing was fetched or an empty response
                 <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                    <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                    {getNoDataFoundMessage()}
                 </div>
            )}
             {!loading && data !== null && !isListView && !isDetailView && ( // Data exists but doesn't match view criteria (e.g. filter mismatch after socket update)
                 <div className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                    <FaInfoCircle size={24} className="mb-3 text-blue-500" />
                    Analysis data loaded, but current view criteria not met. Try adjusting filters or refreshing.
                    {data.filterRequestId && <p className="text-sm mt-1">Data is for: {data.filterRequestId}</p>}
                    {!data.filterRequestId && <p className="text-sm mt-1">Data is general summary.</p>}
                 </div>
            )}


            {/* General loading indicator for refreshes (when data already exists) */}
            {loading && data && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? `Refreshing details for ${activeRequestIdFilter}...` : "Refreshing analysis data..."}
                </div>
            )}
            {/* Show specific error related to a failed refresh if data was previously present */}
            {error && data && (
                 <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> Error refreshing data: {error}
                </div>
            )}
        </div>
    );
};

export default Analysis;