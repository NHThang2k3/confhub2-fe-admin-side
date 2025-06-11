// src/hooks/crawl/conference/useConferenceCrawl.ts
'use client';
import { useCallback } from 'react';
import { Conference, ConferenceForAction } from '../../../models/logAnalysis/importConferenceCrawl';
import { useFileParser } from './useFileParser';
import { useCrawlConfig } from './useCrawlConfig';
import { useSelectionManager } from './useSelectionManager';
import { useCrawlRunner } from './useCrawlRunner';
import { ApiModels } from '@/src/models/logAnalysis/crawl.types';

/**
 * Hook tổng hợp, điều phối toàn bộ quy trình crawl conference.
 * Nó kết hợp các hook con chuyên biệt để quản lý từng phần của quy trình:
 * - useFileParser: Xử lý việc tải lên và phân tích file.
 * - useCrawlConfig: Quản lý các cài đặt cho việc crawl (models, chunking, delay).
 * - useSelectionManager: Quản lý việc lựa chọn các conference từ dữ liệu đã phân tích.
 * - useCrawlRunner: Thực thi và điều khiển tiến trình gọi API crawl.
 */
export const useConferenceCrawl = () => {
    // 1. Khởi tạo các hooks con
    const {
        file, parsedData, isParsing, parseError,
        handleFileChange: performFileChange, setParsedData, reset: resetParser
    } = useFileParser();

    // Lấy tất cả các cấu hình, bao gồm cả chunkDelay
    const {
        apiModels, enableChunking, chunkSize, chunkDelay,
        setApiModel, setEnableChunking, setChunkSize, setChunkDelay, reset: resetConfig
    } = useCrawlConfig();

    // Lấy tất cả các state và hàm điều khiển từ runner
    const {
        isCrawling, isPaused, countdown, crawlError, crawlProgress, crawlMessages,
        processCrawlRequest,
        resumeCrawl,
        stopCrawlProcess,
        addCrawlMessage,
        reset: resetRunner
    } = useCrawlRunner();

    const {
        selectedCsvRows, selectedCsvRowsCount,
        onCsvSelectionChanged, updateActionTypeOfSelectedRows: performUpdateAction, reset: resetSelection
    } = useSelectionManager(parsedData, setParsedData);

    // 2. Tạo các hàm điều phối cấp cao

    /**
     * Reset toàn bộ trạng thái của quy trình crawl về ban đầu.
     */
    const resetCrawl = useCallback(() => {
        resetParser();
        resetConfig();
        resetRunner();
        resetSelection();
        console.log("Crawl state (including all configurations) has been fully reset.");
    }, [resetParser, resetConfig, resetRunner, resetSelection]);

    /**
     * Xử lý sự kiện thay đổi file, reset các trạng thái liên quan nhưng giữ lại cấu hình.
     */
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const onResetAll = () => {
            // Không reset config (apiModels, chunking) vì người dùng có thể muốn giữ lại
            resetParser();
            resetRunner();
            resetSelection();
        };
        performFileChange(event, addCrawlMessage, onResetAll);
    }, [performFileChange, addCrawlMessage, resetParser, resetRunner, resetSelection]);

    /**
     * Cập nhật loại hành động ('crawl' hoặc 'update') cho các dòng đã chọn.
     */
    const updateActionTypeOfSelectedRows = useCallback((
        actionType: 'crawl' | 'update',
        selectedRows: Conference[]
    ) => {
        const { updatedCount } = performUpdateAction(actionType, selectedRows);
        if (updatedCount > 0) {
            addCrawlMessage(`Applied action type '${actionType}' to ${updatedCount} selected conferences.`);
        }
    }, [performUpdateAction, addCrawlMessage]);

    // LƯU Ý: Các hàm startCrawlFromCsv và startCrawlItems đã được loại bỏ.
    // Component cha (ConferenceCrawlUploader) giờ đây sẽ gọi trực tiếp `processCrawlRequest`
    // với đầy đủ các tham số, mang lại sự linh hoạt cao hơn.

    // 3. Trả về một object có cấu trúc, bao gồm tất cả các phần cần thiết cho UI
    return {
        // Từ useFileParser
        file,
        parsedData,
        isParsing,
        parseError,
        handleFileChange,

        // Từ useCrawlConfig
        enableChunking,
        chunkSize,
        chunkDelay, // <<< EXPORT MỚI
        apiModels,
        setEnableChunking,
        setChunkSize,
        setChunkDelay, // <<< EXPORT MỚI
        setApiModel,

        // Từ useCrawlRunner
        isCrawling,
        isPaused, // <<< EXPORT MỚI
        countdown, // <<< EXPORT MỚI
        crawlError,
        crawlProgress,
        crawlMessages,
        processCrawlRequest, // <<< EXPORT HÀM GỐC
        resumeCrawl, // <<< EXPORT MỚI
        stopCrawl: stopCrawlProcess, // Alias cho ngắn gọn

        // Từ useSelectionManager
        selectedCsvRows,
        selectedCsvRowsCount,
        onCsvSelectionChanged,
        onRowSelectionChange: onCsvSelectionChanged, // Alias để tương thích

        // Các hàm điều phối cấp cao
        updateActionTypeOfSelectedRows,
        resetCrawl,
    };
};