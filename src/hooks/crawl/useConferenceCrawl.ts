// src/app/hooks/crawl/useConferencesCrawl.ts
'use_client'
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Conference, ApiCrawlResponse, CrawlProgress, SendToCrawlConference } from '../../models/logAnalysis/importConferenceCrawl'; // Điều chỉnh đường dẫn nếu cần

import { appConfig } from '@/src/middleware';

// --- Configuration ---
const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;

// --- Utility Function ---
function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array];
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// ++ ADDED: Define model types
export type CrawlModelType = 'non-tuned' | 'tuned';

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    crawlModel: CrawlModelType; // ++ ADDED
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedRows: SendToCrawlConference[];
    setSelectedRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setCrawlModel: (model: CrawlModelType) => void; // ++ ADDED
    startCrawl: () => Promise<void>;
    resetCrawl: () => void;
    onSelectionChanged: (event: any) => void;
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5);
    const [crawlModel, setCrawlModel] = useState<CrawlModelType>('non-tuned'); // ++ ADDED: Default to non-tuned

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const [selectedRows, setSelectedRows] = useState<SendToCrawlConference[]>([]);

    const uploadFileEndPoint = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`;

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const currentFile = event.target.files?.[0];

        if (currentFile) {
            setFile(null);
            setParsedData(null);
            setIsParsing(false);
            setParseError(null);
            setIsCrawling(false);
            setCrawlError(null);
            setCrawlProgress({ current: 0, total: 0, status: 'idle' });
            setCrawlMessages([]);
            setSelectedRows([]);

            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                event.target.value = '';
                return;
            }
            setFile(currentFile);
            parseCSV(currentFile);
        } else {
            resetCrawl();
        }
        event.target.value = '';
    }, []);

    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        const body = new FormData();
        body.append('file', csvFile);

        fetch(uploadFileEndPoint, {
            method: 'POST',
            body: body,
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMsg = errorData?.message || errorData?.error || `Failed to upload file. Status: ${response.status}`;
                    throw new Error(errorMsg);
                }
                return response.json();
            })
            .then((data) => {
                console.log("File uploaded successfully:", data);
                if (data.data && Array.isArray(data.data)) {
                    setParsedData(data.data);
                    setCrawlMessages(prev => [...prev, `File uploaded successfully. ${data.data.length} records parsed.`]);
                } else {
                    setParsedData([]);
                    throw new Error("Parsed data is not in the expected format.");
                }
                setIsParsing(false);
            })
            .catch((error) => {
                console.error("Error uploading or parsing file:", error);
                setParseError(error.message || "Error uploading or parsing file. Please try again.");
                setParsedData(null);
                setIsParsing(false);
            });
    }, [uploadFileEndPoint]);

    const onSelectionChanged = useCallback((event: any) => {
        setSelectedRows(event.api.getSelectedNodes().map((node: any) => ({
            id: node.data.id,
            Title: node.data.title,
            Acronym: node.data.acronym
        })));
    }, [])


    // ++ MODIFIED: sendApiRequest to include crawlModel
    const sendApiRequest = useCallback(async (
        payload: SendToCrawlConference[],
        description: string,
        currentCrawlModel: CrawlModelType // ++ ADDED parameter
    ): Promise<boolean> => {
        try {
            const params = {
                dataSource: 'client',
                model: currentCrawlModel // ++ ADDED: Pass model type as query param
            };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description} (${currentCrawlModel} model): ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${description} (${currentCrawlModel} model):`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${description} (${currentCrawlModel} model). Details: ${errorMessage}`]);
            return false;
        }
    }, []); // No dependencies on crawlModel state here, it's passed as an argument


    const startCrawl = async () => {
        if (selectedRows.length === 0) {
            setCrawlError("No conferences selected to crawl. Please select rows from the table.");
            setCrawlMessages(prev => ["No conferences selected. Please select rows from the table.", ...prev.filter(m => !m.startsWith("No conferences selected."))]);
            return;
        }
        if (isCrawling) {
            console.warn("Crawl is already in progress.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        // ++ MODIFIED: Include crawlModel in log message
        setCrawlMessages(prev => [`Starting crawl process using ${crawlModel} model... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: 0, status: 'crawling' });

        let overallSuccess = true;

        if (enableChunking) {
            const chunks = chunkArray(selectedRows, chunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress(prev => ({ ...prev, total: totalChunks }));

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks}`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));
                // ++ MODIFIED: Pass crawlModel to sendApiRequest
                const success = await sendApiRequest(currentChunk, description, crawlModel);

                if (!success) {
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    overallSuccess = false;
                    break;
                }
            }

            if (overallSuccess && totalChunks > 0) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks with ${crawlModel} model.`]);
            } else if (!overallSuccess) {
                 setCrawlMessages(prev => [...prev, `Crawl process with ${crawlModel} model stopped due to an error in one of the chunks.`]);
            }

        } else {
            setCrawlProgress(prev => ({ ...prev, current: 1, total: 1, status: 'crawling', currentChunkData: selectedRows }));
            const description = "Entire List";
            // ++ MODIFIED: Pass crawlModel to sendApiRequest
            const success = await sendApiRequest(selectedRows, description, crawlModel);

            if (success) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list with ${crawlModel} model.`]);
            } else {
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                overallSuccess = false;
            }
        }

        setIsCrawling(false);
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // setEnableChunking(false); // User preference, keep
        // setChunkSize(5); // User preference, keep
        // setCrawlModel('non-tuned'); // User preference, keep
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedRows([]);
        console.log("Crawl state reset.");
    }, []);


    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        crawlModel, // ++ EXPOSED
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedRows,
        setSelectedRows,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        setCrawlModel, // ++ EXPOSED
        startCrawl,
        resetCrawl,
        onSelectionChanged
    };
};