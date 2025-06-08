// src/hooks/crawl/journal/useJournalCrawl.ts
'use client';
import { useCallback } from 'react';
import { useJournalFileHandler } from './useJournalFileHandler';
import { useJournalDbChecker } from './useJournalDbChecker';
import { useJournalCrawlRunner } from './useJournalCrawlRunner';
import { JournalWithStatus, ScimagoJournal, BackendCrawlProgress } from '@/src/models/logAnalysis/importJournalCrawl';
// Giữ lại interface export để không làm ảnh hưởng đến các component đang sử dụng
export interface UseJournalCrawlReturn {
    file: File | null;
    rawCsvContent: string | null; // For sending to backend crawl API

    // States for local file reading and parsing for preview (optional, SCImago format)
    isReadingFile: boolean;
    fileReadError: string | null;
    scimagoPreviewData: ScimagoJournal[] | null; // Optional: if you want a local preview of SCImago structure

    // States for DB Check API (/check-import)
    isCheckingDB: boolean;
    checkDBError: string | null;
    parsedDataForSelectionTable: JournalWithStatus[] | null; // Data from DB Check for UI table
    dbCheckSummary: { // Summary from DB check
        totalProcessed?: number;
        totalExists?: number;
        totalNew?: number;
    } | null;
    dbCheckMessages: string[];


    // States for Backend Crawl API (/crawl-journals)
    isCrawlingBackend: boolean;
    crawlBackendError: string | null;
    crawlBackendProgress: BackendCrawlProgress;
    crawlBackendMessages: string[];

    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    startBackendCrawl: (selectedJournals: JournalWithStatus[]) => Promise<void>; // Modified to accept selected journals
    resetAll: () => void; // Renamed from resetCrawl
}

export const useJournalCrawl = () => {
    // 1. Khởi tạo các hooks con
    const fileHandler = useJournalFileHandler();
    const dbChecker = useJournalDbChecker();
    const crawlRunner = useJournalCrawlRunner();

    // 2. Tạo các hàm điều phối
    const resetAll = useCallback(() => {
        fileHandler.reset();
        dbChecker.reset();
        crawlRunner.reset();
        console.log("All journal states reset.");
    }, [fileHandler, dbChecker, crawlRunner]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        resetAll();
        const selectedFile = event.target.files?.[0];
        if (event.target) event.target.value = ''; // Allow re-selecting the same file

        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                dbChecker.addMessage("Error: Invalid file type. Please select a CSV file.");
                return;
            }

            dbChecker.addMessage("Reading file...");
            const { success } = await fileHandler.readFile(selectedFile);

            if (success) {
                dbChecker.addMessage(`File read successfully. Parsed ${fileHandler.parsedCsvData.length} rows.`);
                // Now, proceed with DB check
                await dbChecker.checkJournalsInDb(selectedFile);
            } else {
                dbChecker.addMessage(`Error: ${fileHandler.fileReadError || 'Failed to read or parse file.'}`);
            }
        }
    }, [resetAll, fileHandler, dbChecker]);

    const startBackendCrawl = useCallback(async (selectedJournals: JournalWithStatus[]) => {
        // Cung cấp dữ liệu đã parse ban đầu cho runner để nó có thể lọc
        await crawlRunner.startCrawl(selectedJournals, fileHandler.parsedCsvData);
    }, [crawlRunner, fileHandler.parsedCsvData]);

    // 3. Trả về một object có cấu trúc y hệt hook ban đầu
    return {
        // Từ useJournalFileHandler
        file: fileHandler.file,
        rawCsvContent: fileHandler.rawCsvContent,
        isReadingFile: fileHandler.isReadingFile,
        fileReadError: fileHandler.fileReadError,
        scimagoPreviewData: fileHandler.scimagoPreviewData,

        // Từ useJournalDbChecker
        isCheckingDB: dbChecker.isCheckingDB,
        checkDBError: dbChecker.checkDBError,
        parsedDataForSelectionTable: dbChecker.parsedDataForSelectionTable,
        dbCheckSummary: dbChecker.dbCheckSummary,
        dbCheckMessages: dbChecker.dbCheckMessages,

        // Từ useJournalCrawlRunner
        isCrawlingBackend: crawlRunner.isCrawlingBackend,
        crawlBackendError: crawlRunner.crawlBackendError,
        crawlBackendProgress: crawlRunner.crawlBackendProgress,
        crawlBackendMessages: crawlRunner.crawlBackendMessages,

        // Các hàm điều phối
        handleFileChange,
        startBackendCrawl,
        resetAll,
    };
};