// src/hooks/crawl/journal/useJournalDbChecker.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { JournalWithStatus, DbCheckImportResponse, DbCheckImportResult } from '@/src/models/logAnalysis/importJournalCrawl';

import { API_DB_CHECK_ENDPOINT } from '../constants';

export const useJournalDbChecker = () => {
    const [isCheckingDB, setIsCheckingDB] = useState(false);
    const [checkDBError, setCheckDBError] = useState<string | null>(null);
    const [parsedDataForSelectionTable, setParsedDataForSelectionTable] = useState<JournalWithStatus[] | null>(null);
    const [dbCheckSummary, setDbCheckSummary] = useState<{ totalProcessed?: number; totalExists?: number; totalNew?: number; } | null>(null);
    const [dbCheckMessages, setDbCheckMessages] = useState<string[]>([]);

    const addMessage = useCallback((msg: string) => {
        setDbCheckMessages(prev => [msg, ...prev.slice(0, 49)]);
    }, []);

    const checkJournalsInDb = useCallback(async (file: File) => {
        setIsCheckingDB(true);
        setCheckDBError(null);
        setParsedDataForSelectionTable(null);
        setDbCheckSummary(null);
        addMessage("Checking journals against database...");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post<DbCheckImportResponse>(API_DB_CHECK_ENDPOINT, formData, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' }
            });

            const data = response.data;
            if (data.results && Array.isArray(data.results)) {
                const journalsForTable: JournalWithStatus[] = data.results.map((journal: DbCheckImportResult) => ({
                    Title: journal.title,
                    Issn: journal.issn,
                    Publisher: journal.publisher || '',
                    Type: journal.crawled ? 'Already in DB' : 'New to DB',
                    Country: journal.country || '',
                    Region: journal.region || '',
                    lastUpdated: journal.lastUpdated,
                    message: journal.message,
                    crawled: journal.crawled,
                    actionType: journal.crawled ? 'update' : 'crawl'
                }));
                setParsedDataForSelectionTable(journalsForTable);
                setDbCheckSummary({
                    totalProcessed: data.totalProcessed,
                    totalExists: data.totalExists,
                    totalNew: data.totalNew
                });
                addMessage(`Database check complete. ${journalsForTable.length} records processed.`);
            } else {
                throw new Error("DB check response data is not in the expected format or is empty.");
            }
        } catch (error: any) {
            const axiosError = error as AxiosError<any>;
            let errorMsg = `DB Check API Error: ${axiosError.message}`;
            if (axiosError.response) {
                errorMsg = `DB Check API Error: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.response.data?.error || 'Server error'}`;
            }
            console.error("Error during DB check:", error);
            setCheckDBError(errorMsg);
            addMessage(errorMsg);
            setParsedDataForSelectionTable(null);
        } finally {
            setIsCheckingDB(false);
        }
    }, [addMessage]);

    const reset = useCallback(() => {
        setIsCheckingDB(false);
        setCheckDBError(null);
        setParsedDataForSelectionTable(null);
        setDbCheckSummary(null);
        setDbCheckMessages([]);
    }, []);

    return {
        isCheckingDB,
        checkDBError,
        parsedDataForSelectionTable,
        dbCheckSummary,
        dbCheckMessages,
        checkJournalsInDb,
        addMessage,
        reset,
    };
};