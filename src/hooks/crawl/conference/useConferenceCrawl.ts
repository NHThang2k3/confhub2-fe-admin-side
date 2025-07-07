// src/hooks/crawl/conference/useConferenceCrawl.ts
'use client';
import { useCallback } from 'react';
import { Conference } from '../../../models/logAnalysis/importConferenceCrawl';
import { useFileParser } from './useFileParser';
import { useCrawlConfig } from './useCrawlConfig';
import { useSelectionManager } from './useSelectionManager';
import { useCrawlRunner } from './useCrawlRunner';

/**
 * Hook tổng hợp, điều phối toàn bộ quy trình crawl conference.
 * Hook này tích hợp các hook con để quản lý file, cấu hình, lựa chọn và thực thi crawl.
 */
export const useConferenceCrawl = () => {
    // 1. Khởi tạo các hooks con
    const {
        file,
        parsedData,
        isParsing,
        parseError,
        processDataForUpload: performDataUpload, // Lấy hàm xử lý upload mới
        setParsedData,
        reset: resetParser
    } = useFileParser();

    const {
        apiModels,
        enableChunking,
        chunkSize,
        chunkDelay,
        recordFile,
        setApiModel,
        setEnableChunking,
        setChunkSize,
        setChunkDelay,
        setRecordFile,
        reset: resetConfig
    } = useCrawlConfig();

    const {
        isCrawling,
        isPaused,
        countdown,
        crawlError,
        crawlProgress,
        crawlMessages,
        processCrawlRequest,
        resumeCrawl,
        stopCrawlProcess,
        addCrawlMessage,
        reset: resetRunner
    } = useCrawlRunner();

    const {
        selectedCsvRows,
        selectedCsvRowsCount,
        onCsvSelectionChanged,
        updateActionTypeOfSelectedRows: performUpdateAction,
        reset: resetSelection
    } = useSelectionManager(parsedData, setParsedData);

    // 2. Tạo các hàm điều phối cấp cao

    /**
     * <<< THÊM HÀM MỚI >>>
     * Reset các state cần thiết khi bắt đầu một lượt upload file mới.
     * Điều này đảm bảo không có dữ liệu cũ nào ảnh hưởng đến luồng mới.
     */
    const resetForNewUpload = useCallback(() => {
        console.log("Resetting parser and selection states for a new file upload.");
        resetParser();
        resetSelection();
    }, [resetParser, resetSelection]);


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
     * Hàm nhận dữ liệu đã được người dùng review và định dạng, sau đó
     * chuyển cho file parser để tạo file CSV mới và upload lên server.
     * @param data - Mảng các đối tượng Conference đã được định dạng.
     * @param originalFile - File gốc người dùng đã chọn.
     */
    const processDataForUpload = useCallback((data: Conference[], originalFile: File) => {
        const onResetAll = () => {
            // Reset các trạng thái liên quan trước khi bắt đầu một lần upload mới
            resetParser();
            resetRunner();
            resetSelection();
        };
        // Gọi hàm thực thi từ hook con
        performDataUpload(data, originalFile, addCrawlMessage, onResetAll);
    }, [performDataUpload, addCrawlMessage, resetParser, resetRunner, resetSelection]);

    /**
     * Cập nhật loại hành động ('crawl' hoặc 'update') cho các hàng đã được chọn.
     * @param actionType - Loại hành động.
     * @param selectedRows - Các hàng được áp dụng hành động.
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

    // 3. Trả về một object có cấu trúc, bao gồm tất cả các state và hàm cần thiết cho UI
    return {
        // Từ useFileParser
        file,
        parsedData,
        isParsing,
        parseError,
        setParsedData, // Dùng khi user chọn "Skip" và không upload


          // <<< THÊM HÀM MỚI VÀO ĐÂY >>>
        resetForNewUpload,
        
        // Từ useCrawlConfig
        enableChunking,
        chunkSize,
        chunkDelay,
        recordFile,
        apiModels,
        setEnableChunking,
        setChunkSize,
        setChunkDelay,
        setRecordFile,
        setApiModel,

        // Từ useCrawlRunner
        isCrawling,
        isPaused,
        countdown,
        crawlError,
        crawlProgress,
        crawlMessages,
        processCrawlRequest,
        resumeCrawl,
        stopCrawl: stopCrawlProcess,

        // Từ useSelectionManager
        selectedCsvRows,
        selectedCsvRowsCount,
        onCsvSelectionChanged,
        onRowSelectionChange: onCsvSelectionChanged, // Alias cho nhất quán

        // Các hàm điều phối cấp cao
        processDataForUpload, // Hàm chính cho bước 1
        updateActionTypeOfSelectedRows,
        resetCrawl,
    };
};