import React from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { useTranslations } from 'next-intl';
import CrawlerTabs from './CrawlerTabs';

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
    const t = useTranslations('CrawlerTools');

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
                <h2 className="text-lg font-semibold text-gray-800">{t('dataCrawlingToolsTitle')}</h2>
                <button
                    className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                    aria-label={isExpanded ? t('collapseCrawlerToolsLabel') : t('expandCrawlerToolsLabel')}
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                </button>
            </div>
            <div
                id="crawler-tools-content"
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="p-4">
                    <CrawlerTabs activeCrawler={activeCrawler} onSetCrawler={onSetCrawler} />
                    
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