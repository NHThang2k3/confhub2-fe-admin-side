import React, { useState, useEffect } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData'; // Adjust path
import {
    FaExclamationTriangle, FaSyncAlt, FaTable, FaBookOpen,
    FaChevronUp, FaChevronDown
} from 'react-icons/fa';

// Import child components
import ConferenceCrawlUploader from './ConferenceCrawlUploader';
import JournalCrawlUploader from './JournalCrawlUploader';
import AnalysisHeader from './AnalysisHeader';
import OverallSummary from './OverallSummary';
import ConferenceDetails from './ConferenceDetails';
import JournalDetails from './JournalDetails'; // <-- Import the new component

type CrawlerType = 'conference' | 'journal';

const Analysis: React.FC = () => {
    // --- States ---
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference'); // Determines which crawler AND analysis to show
    const [isCrawlerSectionExpanded, setIsCrawlerSectionExpanded] = useState(true);

    // --- Calculate time filters ---
    useEffect(() => {
        // ... (time filter logic remains the same)
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = now;

        switch (timeFilterOption) {
            case 'last_hour': start = now - 60 * 60 * 1000; break;
            case 'last_6h': start = now - 6 * 60 * 60 * 1000; break;
            case 'last_24h': start = now - 24 * 60 * 60 * 1000; break;
            case 'last_7d': start = now - 7 * 24 * 60 * 60 * 1000; break;
            case 'latest':
            default: start = undefined; end = undefined; break;
        }
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    // --- Fetch Data ---
    // Assume useLogAnalysisData fetches ALL relevant analysis data (overall, conference, journal)
    // Or modify the hook if it needs to fetch selectively based on a parameter
    const { data, loading, error, isConnectedToSocket, refetchData } = useLogAnalysisData(filterStartTime, filterEndTime);

    // --- Handlers ---
    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
    };
    const handleToggleSummary = () => {
        setIsSummaryExpanded(prev => !prev);
    };
    const handleToggleCrawlerSection = () => {
        setIsCrawlerSectionExpanded(prev => !prev);
    };

    // --- Render Logic ---
    // 1. Initial Loading / Error States
    if (loading && !data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                <AnalysisHeader
                    loading={true}
                    error={null}
                    isConnected={isConnectedToSocket} // <--- SỬA Ở ĐÂY
                    data={null}
                    timeFilterOption={timeFilterOption}
                    handleFilterChange={handleFilterChange}
                    refetchData={refetchData} />
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600"><FaSyncAlt className="mr-2 animate-spin" /> Loading Analysis Data...</div>
            </div>
        );
    }
    if (error && !data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-red-50 min-h-screen font-sans">
                <AnalysisHeader
                    loading={false}
                    error={error}
                    isConnected={isConnectedToSocket} // <--- SỬA Ở ĐÂY
                    data={null}
                    timeFilterOption={timeFilterOption}
                    handleFilterChange={handleFilterChange}
                    refetchData={refetchData} />
                <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600 font-semibold">
                    <FaExclamationTriangle size={32} className="mb-4 text-red-500" />
                    Error loading analysis data:
                    <p className="text-sm mt-2 text-center max-w-md">{error}</p>
                    <span className="text-xs text-gray-500 mt-4">(Check console or try refreshing)</span>
                </div>
            </div>
        );
    }


    // 3. Has Data or No Data State
    // Check if there's *any* overall data to potentially show header/summary
    const hasOverallData = data && data.overall;
    // Specific checks for detailed data presence
    const hasConferenceDetailsData = data?.conferenceAnalysis && Object.keys(data.conferenceAnalysis).length > 0;
    // const hasJournalDetailsData = data?.journalAnalysis && Object.keys(data.journalAnalysis).length > 0;


    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">

            {/* --- Section: Data Crawlers (Collapsible) --- */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                {/* Header with Toggle */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Data Crawling Tools</h2>
                    <button onClick={handleToggleCrawlerSection} className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full hover:bg-gray-100" aria-label={isCrawlerSectionExpanded ? "Collapse" : "Expand"}>
                        {isCrawlerSectionExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                    </button>
                </div>
                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCrawlerSectionExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4">
                        {/* Conference/Journal Toggle */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button onClick={() => setActiveCrawler('conference')} className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'conference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <FaTable className="mr-2" /> Crawl Conferences
                            </button>
                            <button onClick={() => setActiveCrawler('journal')} className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'journal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <FaBookOpen className="mr-2" /> Crawl Journals
                            </button>
                        </div>
                        {/* Conditional Uploader */}
                        <div>
                            {activeCrawler === 'conference' && <ConferenceCrawlUploader />}
                            {activeCrawler === 'journal' && <JournalCrawlUploader />}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Section: Analysis Results --- */}
            {/* Header is always shown if not in initial error/loading */}
            <AnalysisHeader
                loading={loading && !hasOverallData} // Show header loading only if NO data exists yet
                error={error} // Show error if fetch failed
                isConnected={isConnectedToSocket} // Truyền giá trị đúng
                data={data} // Pass data for potential header info
                timeFilterOption={timeFilterOption}
                handleFilterChange={handleFilterChange}
                refetchData={refetchData}
            />

            {/* Render Summary only if overall data exists */}
            {hasOverallData ? (
                <OverallSummary
                    data={data}
                    timeFilterOption={timeFilterOption}
                    isExpanded={isSummaryExpanded}
                    onToggle={handleToggleSummary}
                />
            ) : (
                // Show message if loading finished but no data at all was found
                !loading && (
                    <div className="mt-6 text-center text-gray-500 bg-white p-6 rounded-lg shadow border border-gray-200">
                        No analysis results found for the selected time period or current logs.
                        <br />
                        {error && <span className='text-red-500 text-sm'>(Last fetch attempt failed: {error})</span>}
                    </div>
                )
            )}

            {/* --- Dynamically Render Details Based on activeCrawler --- */}
            {/* Show Conference details only if active and data exists */}
            {activeCrawler === 'conference' && hasConferenceDetailsData && (
                <ConferenceDetails conferenceAnalysis={data.conferenceAnalysis} />
            )}

            {/* Show Journal details only if active and data exists */}
            {/* {activeCrawler === 'journal' && hasJournalDetailsData && (
                <JournalDetails journalAnalysis={data.journalAnalysis} />
            )} */}

            {/* Show specific 'No Data' message if the active section lacks data but overall data might exist */}
            {activeCrawler === 'conference' && hasOverallData && !hasConferenceDetailsData && !loading && (
                <div className="mt-6 text-center text-gray-500 bg-white p-4 rounded-lg shadow border border-gray-200">
                    No specific Conference analysis data available for this period.
                </div>
            )}
            {/* {activeCrawler === 'journal' && hasOverallData && !hasJournalDetailsData && !loading && (
                 <div className="mt-6 text-center text-gray-500 bg-white p-4 rounded-lg shadow border border-gray-200">
                      No specific Journal analysis data available for this period.
                 </div>
            )} */}


            {/* Show loading indicator only when refreshing existing data */}
            {loading && hasOverallData && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" /> Refreshing analysis data...
                </div>
            )}
        </div>
    );
};

export default Analysis;