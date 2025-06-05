// src/app/[locale]/dashboard/logAnalysis/analysis/CrawlerTypeSelector.tsx
import React from 'react';
import { FaUsers, FaBookOpen } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';

interface CrawlerTypeSelectorProps {
    activeCrawler: CrawlerType;
    onSelectCrawler: (crawlerType: CrawlerType) => void;
}

const CrawlerTypeSelector: React.FC<CrawlerTypeSelectorProps> = ({
    activeCrawler,
    onSelectCrawler,
}) => {
    const t = useTranslations('AnalysisPage');

    return (
        <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm bg-white border border-gray-300" role="group">
                <button
                    type="button"
                    onClick={() => onSelectCrawler('conference')}
                    className={`px-6 py-3 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out
                        ${activeCrawler === 'conference'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-300'
                        }`}
                >
                    <FaUsers className="inline mr-2" /> {t('crawlerTypes.conference')}
                </button>
                <button
                    type="button"
                    onClick={() => onSelectCrawler('journal')}
                    className={`px-6 py-3 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out
                        ${activeCrawler === 'journal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-300'
                        }`}
                >
                    <FaBookOpen className="inline mr-2" /> {t('crawlerTypes.journal')}
                </button>
            </div>
        </div>
    );
};

export default CrawlerTypeSelector;