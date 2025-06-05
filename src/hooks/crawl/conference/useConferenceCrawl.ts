// src/hooks/crawl/useConferenceCrawl.ts
'use client';
import { useState, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import {
    Conference,
    ApiCrawlResponse,
    CrawlProgress,
    ConferenceForAction,
    ConferenceApiPayloadItem
} from '../../../models/logAnalysis/importConferenceCrawl'; // Adjust path as needed
import { appConfig } from '@/src/middleware'; // Adjust path as needed

const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;
const UPLOAD_FILE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`;
const MAX_ITEMS_PER_CRAWL_REQUEST = 50;

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
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
};

// New interface for the overall request payload
export interface CrawlRequestPayload {
    description?: string;
    items: ConferenceApiPayloadItem[];
    models: ApiModels;
}

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    apiModels: ApiModels;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedCsvRows: ConferenceForAction[];
    selectedCsvRowsCount: number;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setApiModel: (apiName: ApiName, model: CrawlModelType) => void;
    startCrawlFromCsv: (description?: string) => Promise<void>; // Modified signature
    startCrawlItems: (items: ConferenceForAction[], modelsToUse: ApiModels, description?: string) => Promise<void>; // Added description
    resetCrawl: () => void;
    onCsvSelectionChanged: (selectedRows: Conference[]) => void;
    updateActionTypeOfSelectedRows: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
    onRowSelectionChange: (selectedRows: Conference[]) => void;
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST);
    const [apiModels, setApiModels] = useState<ApiModels>({ ...initialApiModels });

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const [selectedCsvRows, setSelectedCsvRows] = useState<ConferenceForAction[]>([]);

    const parseCSV = useCallback(async (csvFile: File) => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);
        setSelectedCsvRows([]);

        const body = new FormData();
        body.append('file', csvFile);

        try {
            const response = await fetch(UPLOAD_FILE_ENDPOINT, {
                method: 'POST',
                body: body,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                let errorMsg = `Failed to upload/parse file. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.message || errorData?.error || errorMsg;
                } catch (jsonError) {
                    try {
                        const textError = await response.text();
                        if (textError) errorMsg = `${errorMsg} - Server response: ${textError.substring(0, 200)}`;
                    } catch (textParseError) { /* Ignore */ }
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                const conferencesWithDefaults: Conference[] = data.data.map((conf: any, index: number) => ({
                    ...conf,
                    id: conf.id || `${conf.acronym || 'conf'}-${Date.now()}-${index}`,
                    crawlType: 'crawl',
                }));
                setParsedData(conferencesWithDefaults);
                setCrawlMessages([`File uploaded and parsed successfully. ${conferencesWithDefaults.length} records found.`]);
            } else {
                setParsedData([]);
                throw new Error("Parsed data is not in the expected format or is empty.");
            }
        } catch (error: any) {
            console.error("Error uploading or parsing CSV file:", error);
            setParseError(error.message || "Error uploading or parsing file.");
            setParsedData(null);
        } finally {
            setIsParsing(false);
        }
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const currentFile = event.target.files?.[0];
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        setSelectedCsvRows([]);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);

        if (currentFile) {
            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                if (event.target) event.target.value = '';
                return;
            }
            setFile(currentFile);
            parseCSV(currentFile);
        }
        if (event.target) event.target.value = '';
    }, [parseCSV]);

    const onCsvSelectionChanged = useCallback((selectedRows: Conference[]) => {
        const selectedActions: ConferenceForAction[] = selectedRows.map(confData => ({
            id: confData.id,
            Title: confData.title,
            Acronym: confData.acronym,
            crawlType: confData.crawlType,
            link: confData.link,
            cfpLink: confData.cfpLink,
            impLink: confData.impLink,
        }));
        setSelectedCsvRows(selectedActions);
    }, []);

    const updateActionTypeOfSelectedRows = useCallback((
        actionType: 'crawl' | 'update',
        selectedRowsToUpdate: Conference[]
    ) => {
        if (selectedRowsToUpdate.length === 0) return;

        const selectedIds = selectedRowsToUpdate.map(row => row.id);
        let updatedCount = 0;

        const newParsedData = parsedData?.map(conf => {
            if (selectedIds.includes(conf.id)) {
                updatedCount++;
                return { ...conf, crawlType: actionType };
            }
            return conf;
        }) || null;

        if (newParsedData && updatedCount > 0) {
            setParsedData(newParsedData);

            const newSelectedCsvRows = selectedCsvRows.map(selRow => {
                if (selectedIds.includes(selRow.id)) {
                    return { ...selRow, crawlType: actionType };
                }
                return selRow;
            });
            setSelectedCsvRows(newSelectedCsvRows);

            console.log(`Updated action type to "${actionType}" for ${updatedCount} selected conferences.`);
            setCrawlMessages(prev => [`Applied action type '${actionType}' to ${updatedCount} selected conferences.`, ...prev.slice(0, 10)]);
        } else if (updatedCount === 0) {
            console.log("No matching conferences found in parsedData to update action type.");
        }
    }, [parsedData, selectedCsvRows]);

    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);

    const sendApiRequest = useCallback(async (
        items: ConferenceForAction[],
        modelsForRequest: ApiModels,
        batchContextDescription: string, // For logging, e.g., "Batch 1/5"
        overallRequestDescription?: string // User-provided description for the whole request
    ): Promise<boolean> => {
        const apiPayloadItems: ConferenceApiPayloadItem[] = [];
        for (const item of items) {
            const commonPayload = {
                Title: item.Title,
                Acronym: item.Acronym,
                originalRequestId: item.originalRequestId,
            };

            if (item.crawlType === 'update') {
                if (item.link && item.link.trim() !== '') {
                    apiPayloadItems.push({
                        ...commonPayload,
                        mainLink: item.link,
                        cfpLink: (item.cfpLink && item.cfpLink.trim() !== '') ? item.cfpLink : null,
                        impLink: (item.impLink && item.impLink.trim() !== '') ? item.impLink : null,
                    } as ConferenceApiPayloadItem);
                } else {
                    const warningMsg = `Conference "${item.Acronym}" (${item.Title}) marked for UPDATE but is missing 'link'. Sending as CRAWL.`;
                    console.warn(warningMsg);
                    setCrawlMessages(prev => [warningMsg, ...prev]);
                    apiPayloadItems.push({ // Fallback to crawl-like structure
                        ...commonPayload,
                    } as ConferenceApiPayloadItem);
                }
            } else { // 'crawl' type
                apiPayloadItems.push({
                    ...commonPayload,
                } as ConferenceApiPayloadItem);
            }
        }

        if (apiPayloadItems.length === 0) {
            if (items.length > 0) {
                setCrawlMessages(prev => [`No valid items to send for "${batchContextDescription}" after processing action types.`, ...prev]);
            }
            return items.length === 0;
        }

        const payload: CrawlRequestPayload = {
            items: apiPayloadItems,
            models: modelsForRequest,
        };
        if (overallRequestDescription) {
            payload.description = overallRequestDescription;
        }

        const params = { dataSource: 'client' }; // Models are now in the body
        const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`;
        
        let logEntryPrefix = batchContextDescription;
        if (overallRequestDescription) {
            logEntryPrefix = `Req: "${overallRequestDescription}" (${batchContextDescription})`;
        }

        try {
            const response = await axios.post<ApiCrawlResponse>(
                API_CONFERENCE_ENDPOINT,
                payload, // Send the structured payload
                {
                    params: params,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 7200000 // 2 hours
                }
            );
            console.log(`${logEntryPrefix} ${modelDesc} - Response Status:`, response.status, response.data);
            setCrawlMessages(prev => [...prev, `${logEntryPrefix} ${modelDesc}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${logEntryPrefix} ${modelDesc}:`, error);
            let errorMessage = `Error sending ${logEntryPrefix} ${modelDesc}: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${logEntryPrefix} ${modelDesc}. Details: ${errorMessage}`]);
            return false;
        }
    }, [setCrawlMessages, setCrawlError]);

    const processCrawlRequest = async (
        itemsToCrawl: ConferenceForAction[],
        modelsToUse: ApiModels,
        sourceDescription: string, // e.g., "CSV Selections"
        userProvidedDescription?: string // The optional description from the user
    ) => {
        if (itemsToCrawl.length === 0) {
            const msg = `No items from "${sourceDescription}" to process.`;
            setCrawlError(msg);
            setCrawlMessages(prev => [msg, ...prev.filter(m => !m.startsWith("No items from"))]);
            setIsCrawling(false);
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

        let effectiveChunkSize = enableChunking ? chunkSize : MAX_ITEMS_PER_CRAWL_REQUEST;
        let wasChunkingForceEnabled = false;

        if (!enableChunking && itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST) {
            wasChunkingForceEnabled = true;
            // effectiveChunkSize will be MAX_ITEMS_PER_CRAWL_REQUEST due to chunkArray logic
        } else if (!enableChunking) {
            effectiveChunkSize = itemsToCrawl.length; // Send all in one go if not chunking and within limits
        }

        if (itemsToCrawl.length > 0 && effectiveChunkSize <= 0) { // Safety net
            effectiveChunkSize = MAX_ITEMS_PER_CRAWL_REQUEST;
        }

        const needsActualChunking = enableChunking && itemsToCrawl.length > effectiveChunkSize;
        const modelDescShort = `DL:${modelsToUse.determineLinks?.[0]}, EI:${modelsToUse.extractInfo?.[0]}, EC:${modelsToUse.extractCfp?.[0]}`;
        
        let initialMessage = `Starting process for ${itemsToCrawl.length} items from "${sourceDescription}"`;
        if (userProvidedDescription) {
            initialMessage += ` (Description: "${userProvidedDescription}")`;
        }
        initialMessage += ` using models (${modelDescShort})... `;

        if (needsActualChunking) {
            initialMessage += `Processing in chunks of up to ${effectiveChunkSize}.`;
        } else if (wasChunkingForceEnabled && itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST) {
             initialMessage += `Sending in batches of up to ${MAX_ITEMS_PER_CRAWL_REQUEST} (auto-batching).`;
        } else if (itemsToCrawl.length > 0) {
            initialMessage += 'Sending all at once.';
        }

        const newMessages = [initialMessage];
        if (wasChunkingForceEnabled && itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST) {
            newMessages.push(
                `Note: Automatic batching (max ${MAX_ITEMS_PER_CRAWL_REQUEST} items per request) was applied as the number of items exceeds the limit and chunking was not explicitly enabled.`
            );
        }
        setCrawlMessages(prev => [...newMessages, ...prev.filter(m => !m.startsWith("Starting process for"))]);

        let overallSuccess = true;
        const itemsForBatches = [...itemsToCrawl];

        if (itemsForBatches.length > 0) {
            const useMultipleBatches = enableChunking || itemsForBatches.length > MAX_ITEMS_PER_CRAWL_REQUEST;

            if (useMultipleBatches) {
                const chunks = chunkArray(itemsForBatches, effectiveChunkSize);
                const totalChunks = chunks.length;
                setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });

                for (let i = 0; i < totalChunks; i++) {
                    const currentChunk = chunks[i];
                    if (currentChunk.length === 0) continue;

                    const batchContextDesc = `Batch ${i + 1}/${totalChunks} (${currentChunk.length} items, from ${sourceDescription})`;
                    setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));
                    const success = await sendApiRequest(currentChunk, modelsToUse, batchContextDesc, userProvidedDescription);
                    if (!success) {
                        setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                        overallSuccess = false;
                        break;
                    }
                }
                if (overallSuccess && totalChunks > 0) {
                    setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                    setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} batches from "${sourceDescription}" with selected models.`]);
                } else if (!overallSuccess && totalChunks > 0) {
                    setCrawlMessages(prev => [...prev, `Process from "${sourceDescription}" with selected models stopped due to an error.`]);
                }
            } else { // Single batch
                setCrawlProgress({ current: 0, total: 1, status: 'crawling', currentChunkData: itemsForBatches });
                const batchContextDesc = `Batch (${itemsForBatches.length} items from ${sourceDescription})`;
                const success = await sendApiRequest(itemsForBatches, modelsToUse, batchContextDesc, userProvidedDescription);
                setCrawlProgress(prev => ({ ...prev, current: 1 }));
                if (success) {
                    setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                    setCrawlMessages(prev => [...prev, `Successfully processed the batch of ${itemsForBatches.length} items from "${sourceDescription}" with selected models.`]);
                } else {
                    setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                    overallSuccess = false;
                }
            }
        } else {
            overallSuccess = false; 
            setCrawlMessages(prev => [`No valid items to process from "${sourceDescription}".`, ...prev]);
        }

        setIsCrawling(false);
        if (overallSuccess && crawlProgress.status !== 'success' && crawlProgress.status !== 'error' && crawlProgress.status !== 'stopped') {
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
        } else if (!overallSuccess && crawlProgress.status !== 'error' && crawlProgress.status !== 'stopped') {
            setCrawlProgress(prev => ({ ...prev, status: 'error' }));
        }
    };

    const startCrawlFromCsv = async (description?: string) => { // Accepts optional description
        if (selectedCsvRows.length === 0) {
            const msg = "No conferences selected from the CSV data to process.";
            setCrawlError(msg);
            setCrawlMessages(prev => [msg, ...prev.filter(m => !m.startsWith("No conferences selected from"))]);
            return;
        }
        await processCrawlRequest(selectedCsvRows, apiModels, "CSV Selections", description); // Pass description
    };

    const startCrawlItems = async (items: ConferenceForAction[], modelsToUse: ApiModels, description?: string) => { // Accepts optional description
        await processCrawlRequest(items, modelsToUse, "Programmatic Re-Crawl", description); // Pass description
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        setApiModels({ ...initialApiModels });
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedCsvRows([]);
        console.log("Crawl state (including API models) fully reset.");
    }, []);

    const handleRowSelectionChange = useCallback((selectedRows: Conference[]) => {
        onCsvSelectionChanged(selectedRows);
    }, [onCsvSelectionChanged]);

    const selectedCsvRowsCount = useMemo(() => selectedCsvRows.length, [selectedCsvRows]);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        apiModels,
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedCsvRows,
        selectedCsvRowsCount,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        setApiModel,
        startCrawlFromCsv,
        startCrawlItems,
        resetCrawl,
        onCsvSelectionChanged,
        updateActionTypeOfSelectedRows,
        onRowSelectionChange: handleRowSelectionChange,
    };
};