import React from 'react';
import { FaTable, FaBookOpen, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { CrawlerType } from '../Analysis'; // Assuming CrawlerType is exported from Analysis.tsx

interface CrawlerToolsProps {
    isExpanded: boolean;
    onToggle: () => void;
    activeCrawler: CrawlerType;
    onSetCrawler: (crawler: CrawlerType) => void;
    ConferenceCrawlUploaderComponent: React.FC;
    JournalCrawlUploaderComponent: React.FC;
}

const CrawlerTools: React.FC<CrawlerToolsProps> = ({
    isExpanded,
    onToggle,
    activeCrawler,
    onSetCrawler,
    ConferenceCrawlUploaderComponent,
    JournalCrawlUploaderComponent
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div
                className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-5"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                aria-expanded={isExpanded}
                aria-controls="crawler-tools-content"
            >
                <h2 className="text-lg font-semibold text-gray-800">Data Crawling Tools</h2>
                <button
                    className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                    aria-label={isExpanded ? "Collapse Crawler Tools" : "Expand Crawler Tools"}
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                </button>
            </div>
            <div
                id="crawler-tools-content"
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="p-4">
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            onClick={() => onSetCrawler('conference')}
                            className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'conference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaTable className="mr-2" /> Crawl Conferences
                        </button>
                        <button
                            onClick={() => onSetCrawler('journal')}
                            className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'journal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaBookOpen className="mr-2" /> Crawl Journals
                        </button>
                    </div>
                    <div>
                        {activeCrawler === 'conference' && <ConferenceCrawlUploaderComponent />}
                        {activeCrawler === 'journal' && <JournalCrawlUploaderComponent />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrawlerTools;