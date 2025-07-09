'use client';

import React, { useState } from 'react';
import { useChatbotAnalysisData } from '@/src/hooks/logAnalysis/useChatbotAnalysisData';
import { AnalyzedChatbotRequest } from '@/src/app/api/logAnalysis/logAnalysisChatbot.types';

// Import các component con (giờ đã tồn tại)
import { SummaryCards } from './SummaryCards';
import { RequestsTable } from './RequestsTable';
import { RequestDetailModal } from './RequestDetailModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

export default function ChatbotAnalysis() {
    const { data, isLoading, error, refetchData } = useChatbotAnalysisData();
    const [selectedRequest, setSelectedRequest] = useState<AnalyzedChatbotRequest | null>(null);

    const handleViewDetails = (request: AnalyzedChatbotRequest) => {
        setSelectedRequest(request);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    // Xử lý trạng thái Loading
    if (isLoading) {
        return <LoadingSpinner text="Analyzing chatbot performance logs..." />;
    }

    // Xử lý lỗi fetch (ví dụ: mạng, server 500)
    if (error) {
        return <ErrorDisplay message={error} onRetry={() => refetchData(true)} />;
    }

    // Xử lý trường hợp có dữ liệu trả về nhưng status không phải 'success'
    // hoặc không có dữ liệu
    if (!data || data.status !== 'success') {
        return <ErrorDisplay message={data?.errorMessage || "No analysis data available."} onRetry={() => refetchData(true)} />;
    }

    // Hiển thị giao diện chính khi có dữ liệu
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-20 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    Chatbot Performance Analysis
                </h1>
                <button
                    onClick={() => refetchData(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Phần 1: Các thẻ tóm tắt */}
            <SummaryCards summary={data.summary} />

            {/* Phần 2: Bảng chi tiết các request */}
            <RequestsTable 
                requests={data.analyzedRequests} 
                onViewDetails={handleViewDetails} 
            />

            {/* Phần 3: Modal hiển thị chi tiết */}
            {selectedRequest && (
                <RequestDetailModal 
                    request={selectedRequest} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
}