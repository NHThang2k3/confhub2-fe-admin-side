// src/hooks/crawl/conference/useConferenceCrawl.ts
'use client';
import { useCallback } from 'react';
import { Conference, ConferenceForAction } from '../../../models/logAnalysis/importConferenceCrawl';
import { useFileParser } from './useFileParser';
import { useCrawlConfig } from './useCrawlConfig';
import { useSelectionManager } from './useSelectionManager';
import { useCrawlRunner } from './useCrawlRunner';
import { ApiModels } from '@/src/models/logAnalysis/crawl.types';

export const useConferenceCrawl = () => {
    // 1. Khởi tạo các hooks con
    const {
        file, parsedData, isParsing, parseError,
        handleFileChange: performFileChange, setParsedData, reset: resetParser
    } = useFileParser();

    const {
        apiModels, enableChunking, chunkSize,
        setApiModel, setEnableChunking, setChunkSize, reset: resetConfig
    } = useCrawlConfig();

    const {
        isCrawling, crawlError, crawlProgress, crawlMessages,
        processCrawlRequest, addCrawlMessage, reset: resetRunner
    } = useCrawlRunner();

    const {
        selectedCsvRows, selectedCsvRowsCount,
        onCsvSelectionChanged, updateActionTypeOfSelectedRows: performUpdateAction, reset: resetSelection
    } = useSelectionManager(parsedData, setParsedData);

    // 2. Tạo các hàm điều phối, kết hợp logic từ các hooks con
    const resetCrawl = useCallback(() => {
        resetParser();
        resetConfig();
        resetRunner();
        resetSelection();
        console.log("Crawl state (including API models) fully reset.");
    }, [resetParser, resetConfig, resetRunner, resetSelection]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const onResetAll = () => {
            // Không reset config (apiModels) vì người dùng có thể muốn giữ lại
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
            console.log(`Updated action type to "${actionType}" for ${updatedCount} selected conferences.`);
            addCrawlMessage(`Applied action type '${actionType}' to ${updatedCount} selected conferences.`);
        } else if (selectedRows.length > 0) {
            console.log("No matching conferences found in parsedData to update action type.");
        }
    }, [performUpdateAction, addCrawlMessage]);

    const startCrawlFromCsv = useCallback(async (description?: string) => {
        if (selectedCsvRows.length === 0) {
            const msg = "No conferences selected from the CSV data to process.";
            addCrawlMessage(msg);
            // crawlError sẽ được set bên trong processCrawlRequest
        }
        await processCrawlRequest(
            selectedCsvRows,
            apiModels,
            enableChunking,
            chunkSize,
            "CSV Selections",
            description
        );
    }, [selectedCsvRows, apiModels, enableChunking, chunkSize, processCrawlRequest, addCrawlMessage]);

    const startCrawlItems = useCallback(async (
        items: ConferenceForAction[],
        modelsToUse: ApiModels,
        description?: string
    ) => {
        await processCrawlRequest(
            items,
            modelsToUse,
            enableChunking,
            chunkSize,
            "Programmatic Re-Crawl",
            description
        );
    }, [enableChunking, chunkSize, processCrawlRequest]);

    // 3. Trả về một object có cấu trúc y hệt hook ban đầu
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
        apiModels,
        setEnableChunking,
        setChunkSize,
        setApiModel,

        // Từ useCrawlRunner
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,

        // Từ useSelectionManager
        selectedCsvRows,
        selectedCsvRowsCount,
        onCsvSelectionChanged,
        onRowSelectionChange: onCsvSelectionChanged, // Alias để tương thích

        // Các hàm điều phối
        updateActionTypeOfSelectedRows,
        startCrawlFromCsv,
        startCrawlItems,
        resetCrawl,
    };
};