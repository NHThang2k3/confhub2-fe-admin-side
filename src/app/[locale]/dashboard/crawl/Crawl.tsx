// src/app/[locale]/dashboard/crawl/Crawl.tsx
import React, { useState } from 'react';
// *** THAY ĐỔI: Import types từ hook hoặc nơi định nghĩa chung ***
import {
    CrawlerType, // Import CrawlerType từ hook
} from '../../../../hooks/logAnalysis/useLogAnalysisData'; // Adjust path

import ConferenceCrawlUploader from './ConferenceCrawlUploader'; // Component để upload file conference
import JournalCrawlUploader from './JournalCrawlUploader';   // Component để upload file journal

import CrawlerTools from './CrawlerTools'; // Component chứa UI chọn crawler và uploader

import { useTranslations } from 'next-intl';

const Crawl: React.FC = () => {
    const t = useTranslations('CrawlPage'); // Namespace cho trang Crawl

    // State cho việc chọn loại crawler
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');




    return (
        <div className="p-4 md:p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">
            <CrawlerTools
                // isExpanded và onToggle có thể không cần nếu CrawlerTools luôn mở
                isExpanded={true}
                onToggle={() => {}}
                activeCrawler={activeCrawler}
                onSetCrawler={setActiveCrawler} // Hàm để thay đổi activeCrawler
                ConferenceCrawlUploaderComponent={ConferenceCrawlUploader}
                JournalCrawlUploaderComponent={JournalCrawlUploader}
            />

    
        </div>
    );
};

export default Crawl;