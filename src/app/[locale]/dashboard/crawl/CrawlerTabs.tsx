import React from 'react';
import { FaTable, FaBookOpen } from 'react-icons/fa';
import { CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { useTranslations } from 'next-intl';

interface CrawlerTabsProps {
    activeCrawler: CrawlerType;
    onSetCrawler: (crawler: CrawlerType) => void;
}

const CrawlerTabs: React.FC<CrawlerTabsProps> = ({ activeCrawler, onSetCrawler }) => {
    const t = useTranslations('CrawlerTools');

    return (
        <div className="flex border-b border-gray-200 mb-4">
            <button
                onClick={() => onSetCrawler('conference')}
                className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${
                    activeCrawler === 'conference'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <FaTable className="mr-2" /> {t('crawlConferencesButton')}
            </button>
            <button
                onClick={() => onSetCrawler('journal')}
                className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${
                    activeCrawler === 'journal'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <FaBookOpen className="mr-2" /> {t('crawlJournalsButton')}
            </button>
        </div>
    );
};

export default CrawlerTabs;