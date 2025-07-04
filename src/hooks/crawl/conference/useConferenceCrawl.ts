// src/hooks/crawl/conference/useConferenceCrawl.ts
'use client';
import { useCallback } from 'react';
import { Conference, ConferenceForAction } from '../../../models/logAnalysis/importConferenceCrawl';
import { useFileParser } from './useFileParser';
import { useCrawlConfig } from './useCrawlConfig';
import { useSelectionManager } from './useSelectionManager';
import { useCrawlRunner } from './useCrawlRunner';

/**
 * Hook tổng hợp, điều phối toàn bộ quy trình crawl conference.
 */
export const useConferenceCrawl = () => {
    // 1. Khởi tạo các hooks con
    const {
        file, parsedData, isParsing, parseError,
        handleFileChange: performFileChange, setParsedData, reset: resetParser
    } = useFileParser();

    // Lấy tất cả các cấu hình, bao gồm cả recordFile
    const {
        apiModels, enableChunking, chunkSize, chunkDelay, recordFile, // <<< LẤY STATE MỚI
        setApiModel, setEnableChunking, setChunkSize, setChunkDelay, setRecordFile, // <<< LẤY SETTER MỚI
        reset: resetConfig
    } = useCrawlConfig();

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
    const resetCrawl = useCallback(() => {
        resetParser();
        resetConfig();
        resetRunner();
        resetSelection();
        console.log("Crawl state (including all configurations) has been fully reset.");
    }, [resetParser, resetConfig, resetRunner, resetSelection]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const onResetAll = () => {
            resetParser();
            resetRunner();
            resetSelection();
        };
        performFileChange(event, addCrawlMessage, onResetAll);
    }, [performFileChange, addCrawlMessage, resetParser, resetRunner, resetSelection]);

    const updateActionTypeOfSelectedRows = useCallback((
        actionType: 'crawl' | 'update',
        selectedRows: Conference[]
    ) => {
        const { updatedCount } = performUpdateAction(actionType, selectedRows);
        if (updatedCount > 0) {
            addCrawlMessage(`Applied action type '${actionType}' to ${updatedCount} selected conferences.`);
        }
    }, [performUpdateAction, addCrawlMessage]);

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
        chunkDelay,
        recordFile, // <<< EXPORT MỚI
        apiModels,
        setEnableChunking,
        setChunkSize,
        setChunkDelay,
        setRecordFile, // <<< EXPORT MỚI
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
        onRowSelectionChange: onCsvSelectionChanged,

        // Các hàm điều phối cấp cao
        updateActionTypeOfSelectedRows,
        resetCrawl,
    };
};