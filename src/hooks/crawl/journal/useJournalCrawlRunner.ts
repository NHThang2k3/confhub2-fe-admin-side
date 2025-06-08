// src/hooks/crawl/journal/useJournalCrawlRunner.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse';
import { JournalWithStatus, BackendCrawlApiResponse, BackendCrawlProgress } from '@/src/models/logAnalysis/importJournalCrawl';

import { API_BACKEND_CRAWL_ENDPOINT } from '../constants';

export const useJournalCrawlRunner = () => {
    const [isCrawlingBackend, setIsCrawlingBackend] = useState(false);
    const [crawlBackendError, setCrawlBackendError] = useState<string | null>(null);
    const [crawlBackendProgress, setCrawlBackendProgress] = useState<BackendCrawlProgress>({ status: 'idle' });
    const [crawlBackendMessages, setCrawlBackendMessages] = useState<string[]>([]);

    const addMessage = useCallback((msg: string) => {
        setCrawlBackendMessages(prev => [msg, ...prev.slice(0, 49)]);
    }, []);

    const startCrawl = useCallback(async (selectedJournals: JournalWithStatus[], originalParsedData: any[]) => {
        if (!originalParsedData.length) {
            const errorMsg = "Cannot start backend crawl: No original parsed CSV data available.";
            setCrawlBackendError(errorMsg);
            addMessage(errorMsg);
            return;
        }
        if (isCrawlingBackend) {
            addMessage("Backend crawl already in progress.");
            return;
        }

        setIsCrawlingBackend(true);
        setCrawlBackendError(null);
        addMessage(`Filtering and sending ${selectedJournals.length} selected journal(s) to backend...`);
        setCrawlBackendProgress({ status: 'crawling' });

        try {
            // ==================================================================
            // LOGIC LỌC DỮ LIỆU ĐƯỢC GIỮ NGUYÊN 100% TỪ CODE GỐC
            // ==================================================================
            const selectedJournalsByIndex = new Map(
                selectedJournals.map(journal => {
                    // Find the index of this journal in the original parsed CSV data
                    const index = originalParsedData.findIndex(
                        (row: any) => {
                            // Check if the ISSNs match (handling multiple ISSNs)
                            const rowIssns = (row.Issn || '').split(',').map((issn: string) => issn.trim());
                            const journalIssns = (journal.Issn || '').split(',').map((issn: string) => issn.trim());
                            
                            // Check if any of the ISSNs match
                            const hasMatchingIssn = rowIssns.some((rowIssn: string) => 
                                journalIssns.some(journalIssn => journalIssn === rowIssn && journalIssn !== '')
                            );
                            
                            // Also check the title as a backup
                            const hasMatchingTitle = (row.Title || '').trim() === (journal.Title || '').trim();
                            
                            return hasMatchingIssn || hasMatchingTitle;
                        }
                    );
                    
                    // Trả về cặp [key, value] đúng chuẩn cho Map
                    return [index.toString(), journal];
                })
            );

            // Filter the data to only include selected journals using their index
            const filteredData = originalParsedData.filter((row: any, index: number) => 
                selectedJournalsByIndex.has(index.toString())
            );
            // ==================================================================
            // KẾT THÚC LOGIC GIỮ NGUYÊN
            // ==================================================================
            
            if (filteredData.length === 0) {
                throw new Error('No matching data found for selected journals in the original CSV content.');
            }

            if (filteredData.length !== selectedJournals.length) {
                addMessage(`Warning: Filtered data count (${filteredData.length}) doesn't match selected journals count (${selectedJournals.length}). This may be due to duplicate entries or matching issues.`);
            }

            // Convert filtered data back to CSV string
            const filteredCsv = Papa.unparse(filteredData, {
                delimiter: ";",
                header: true
            });

            const params = { dataSource: 'client' };

            const response = await axios.post<BackendCrawlApiResponse>(API_BACKEND_CRAWL_ENDPOINT, filteredCsv, {
                params: params,
                headers: { 'Content-Type': 'text/csv' },
                timeout: 600000 // 10 minutes
            });

            addMessage(`Backend Crawl: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`);

            if (response.data.error) {
                setCrawlBackendError(`Backend error: ${response.data.error}`);
                setCrawlBackendProgress({ status: 'error' });
            } else {
                setCrawlBackendProgress({ status: 'success' });
            }

        } catch (err) {
            const error = err as AxiosError<BackendCrawlApiResponse>;
            console.error(`API Error during Backend Crawl:`, error);
            let errorMessage = `Error during backend crawl: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlBackendError(errorMessage);
            addMessage(`FAILED backend crawl. ${errorMessage}`);
            setCrawlBackendProgress({ status: 'error' });
        } finally {
            setIsCrawlingBackend(false);
        }
    }, [addMessage, isCrawlingBackend]);

    const reset = useCallback(() => {
        setIsCrawlingBackend(false);
        setCrawlBackendError(null);
        setCrawlBackendProgress({ status: 'idle' });
        setCrawlBackendMessages([]);
    }, []);

    return {
        isCrawlingBackend,
        crawlBackendError,
        crawlBackendProgress,
        crawlBackendMessages,
        startCrawl,
        reset,
    };
};