// src/hooks/crawl/useConferenceCrawl.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Conference, ApiCrawlResponse, CrawlProgress, SendToCrawlConference } from '../../models/logAnalysis/importConferenceCrawl';
import { appConfig } from '@/src/middleware';

const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;

function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array];
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export type CrawlModelType = 'non-tuned' | 'tuned';
export type ApiName = "determineLinks" | "extractInfo" | "extractCfp";

export interface ApiModels {
    determineLinks: CrawlModelType | null;
    extractInfo: CrawlModelType | null;
    extractCfp: CrawlModelType | null;
}

const initialApiModels: ApiModels = {
    determineLinks: null, // Hoặc 'non-tuned' nếu muốn có giá trị mặc định sẵn
    extractInfo: null,
    extractCfp: null,
};

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    apiModels: ApiModels; // Models cho từng API
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedCsvRows: SendToCrawlConference[];
    setSelectedCsvRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setApiModel: (apiName: ApiName, model: CrawlModelType) => void; // Set model cho từng API
    startCrawlFromCsv: () => Promise<void>;
    startCrawlItems: (items: SendToCrawlConference[], modelsToUse: ApiModels) => Promise<void>;
    resetCrawl: () => void;
    onCsvSelectionChanged: (event: any) => void;
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5);
    const [apiModels, setApiModels] = useState<ApiModels>(initialApiModels);

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);
    const [selectedCsvRows, setSelectedCsvRows] = useState<SendToCrawlConference[]>([]);

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
            setSelectedCsvRows([]);

            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                event.target.value = '';
                return;
            }
            setFile(currentFile);
            parseCSV(currentFile);
        } else {
            resetCrawlStateOnly();
        }
        event.target.value = '';
    }, []); // Dependencies for resetCrawlStateOnly if it changes internal state used by handleFileChange

    const resetCrawlStateOnly = useCallback(() => { // Helper to reset only crawl-related state
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages(prev => prev.filter(msg => !msg.startsWith("Starting crawl") && !msg.startsWith("Successfully processed") && !msg.startsWith("FAILED to send") )); // Keep some messages like parse success
    }, []);


    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParseError(null);
        const body = new FormData();
        body.append('file', csvFile);

        fetch(uploadFileEndPoint, {
            method: 'POST',
            body: body,
            headers: { 'Accept': 'application/json' }
        })
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
                const errorMsg = errorData?.message || errorData?.error || `Failed to upload file. Status: ${response.status}`;
                throw new Error(errorMsg);
            }
            return response.json();
        })
        .then((data) => {
            if (data.data && Array.isArray(data.data)) {
                setParsedData(data.data);
                setCrawlMessages(prev => [`File uploaded and parsed successfully. ${data.data.length} records found.`]);
            } else {
                setParsedData([]);
                throw new Error("Parsed data is not in the expected format or is empty.");
            }
            setIsParsing(false);
        })
        .catch((error) => {
            console.error("Error uploading or parsing CSV file:", error);
            setParseError(error.message || "Error uploading or parsing file.");
            setParsedData(null);
            setIsParsing(false);
        });
    }, [uploadFileEndPoint]);

    const onCsvSelectionChanged = useCallback((event: any) => {
        setSelectedCsvRows(event.api.getSelectedNodes().map((node: any) => ({
            Title: node.data.title,
            Acronym: node.data.acronym,
        } as SendToCrawlConference)));
    }, []);

    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const sendApiRequest = useCallback(async (
        payload: SendToCrawlConference[],
        description: string,
        modelsForRequest: ApiModels
    ): Promise<boolean> => {
        try {
            // Assuming backend expects models for each step like this
            const params = {
                dataSource: 'client',
                models: modelsForRequest
            };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000
            });
            const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`; // Short description
            console.log(`${description} ${modelDesc} - Response Status:`, response.status, response.data);
            setCrawlMessages(prev => [...prev, `${description} ${modelDesc}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`;
            console.error(`API Error during ${description} ${modelDesc}:`, error);
            let errorMessage = `Error sending ${description} ${modelDesc}: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${description} ${modelDesc}. Details: ${errorMessage}`]);
            return false;
        }
    }, []);

    const processCrawlRequest = async (
        itemsToCrawl: SendToCrawlConference[],
        modelsToUse: ApiModels, // Changed from CrawlModelType
        sourceDescription: string
    ) => {
        if (itemsToCrawl.length === 0) {
            setCrawlError(`No items from "${sourceDescription}" to crawl.`);
            setCrawlMessages(prev => [`No items from "${sourceDescription}" selected.`, ...prev.filter(m => !m.startsWith("No items from"))]);
            return;
        }

        const allModelsSelected = Object.values(modelsToUse).every(model => model !== null);
        if (!allModelsSelected) {
            const missingModels = Object.entries(modelsToUse)
                .filter(([, model]) => model === null)
                .map(([apiName]) => apiName)
                .join(', ');
            const errorMsg = `Model selection incomplete. Please select a model for: ${missingModels}.`;
            setCrawlError(errorMsg);
            setCrawlMessages(prev => [errorMsg, ...prev]);
            setIsCrawling(false);
            return;
        }

        if (isCrawling) {
            console.warn("Crawl is already in progress.");
            setCrawlMessages(prev => ["A crawl operation is already in progress. Please wait.", ...prev]);
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        const modelDescShort = `DL:${modelsToUse.determineLinks?.[0]}, EI:${modelsToUse.extractInfo?.[0]}, EC:${modelsToUse.extractCfp?.[0]}`;
        setCrawlMessages(prev => [`Starting crawl for ${itemsToCrawl.length} items from "${sourceDescription}" using models (${modelDescShort})... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: itemsToCrawl.length, status: 'crawling' });

        let overallSuccess = true;

        if (enableChunking && itemsToCrawl.length > chunkSize) {
            const chunks = chunkArray(itemsToCrawl, chunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress(prev => ({ ...prev, total: totalChunks, currentChunkData: undefined }));

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks} (from ${sourceDescription})`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));
                const success = await sendApiRequest(currentChunk, description, modelsToUse);

                if (!success) {
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    overallSuccess = false;
                    break;
                }
            }

            if (overallSuccess && totalChunks > 0) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks from "${sourceDescription}" with selected models.`]);
            } else if (!overallSuccess) {
                setCrawlMessages(prev => [...prev, `Crawl process from "${sourceDescription}" with selected models stopped due to an error.`]);
            }

        } else {
            setCrawlProgress(prev => ({ ...prev, current: 1, total: 1, status: 'crawling', currentChunkData: itemsToCrawl }));
            const description = `Entire List (${itemsToCrawl.length} items from ${sourceDescription})`;
            const success = await sendApiRequest(itemsToCrawl, description, modelsToUse);

            if (success) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list from "${sourceDescription}" with selected models.`]);
            } else {
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                overallSuccess = false;
            }
        }
        setIsCrawling(false);
    };

    const startCrawlFromCsv = async () => {
        if (selectedCsvRows.length === 0) {
            setCrawlError("No conferences selected from the CSV data to crawl.");
            setCrawlMessages(prev => ["No conferences selected from the CSV data.", ...prev.filter(m => !m.startsWith("No conferences selected from"))]);
            return;
        }
        // apiModels state is used here
        await processCrawlRequest(selectedCsvRows, apiModels, "CSV Selections");
    };

    // modelsToUse will now be ApiModels, passed from the component (e.g., from a modal)
    const startCrawlItems = async (items: SendToCrawlConference[], modelsToUse: ApiModels) => {
        await processCrawlRequest(items, modelsToUse, "Table Re-Crawl");
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // User preferences for chunking are kept
        // Reset API models to initial state (requiring selection again)
        setApiModels(initialApiModels);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedCsvRows([]);
        console.log("Crawl state (including API models) reset.");
    }, []);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        apiModels, // Expose current API models
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedCsvRows,
        setSelectedCsvRows,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        setApiModel, // Expose setter for individual API models
        startCrawlFromCsv,
        startCrawlItems,
        resetCrawl,
        onCsvSelectionChanged,
    };
};