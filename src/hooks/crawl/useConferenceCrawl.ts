// src/hooks/crawl/useConferenceCrawl.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import {
    Conference,
    ApiCrawlResponse,
    CrawlProgress,
    ConferenceForAction,
    ConferenceApiPayloadItem
} from '../../models/logAnalysis/importConferenceCrawl'; // Adjust path as needed
import { appConfig } from '@/src/middleware'; // Adjust path as needed
import { SelectionChangedEvent } from 'ag-grid-community';

const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;
const UPLOAD_FILE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`; // Ensure this env var is set
const MAX_ITEMS_PER_CRAWL_REQUEST = 50;

function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array]; // Return as a single chunk if size is invalid
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
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setApiModel: (apiName: ApiName, model: CrawlModelType) => void;
    startCrawlFromCsv: () => Promise<void>;
    // startCrawlItems might be useful for other scenarios, keeping it
    startCrawlItems: (items: ConferenceForAction[], modelsToUse: ApiModels) => Promise<void>;
    resetCrawl: () => void;
    onCsvSelectionChanged: (event: SelectionChangedEvent<Conference>) => void;
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    // Configuration States (Step 3)
    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST);
    const [apiModels, setApiModels] = useState<ApiModels>({ ...initialApiModels }); // Use spread for a new object

    // Processing States (Step 3)
    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    // Selection State (Step 2)
    const [selectedCsvRows, setSelectedCsvRows] = useState<ConferenceForAction[]>([]);

    const parseCSV = useCallback(async (csvFile: File) => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null); // Clear previous parsed data before new parse
        setSelectedCsvRows([]); // Clear selections if new file is parsed

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
                    // If JSON parsing fails, try to get text
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
                    crawlType: 'crawl', // Default action type
                }));
                setParsedData(conferencesWithDefaults);
                // Reset messages related to previous crawls if any, add new success message
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
    }, []); // No dependencies needed if UPLOAD_FILE_ENDPOINT is constant

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const currentFile = event.target.files?.[0];

        // Reset states related to the previous file and any ongoing/completed crawl
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        setSelectedCsvRows([]);

        // Reset crawl/processing specific states as new file implies a new full process
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        // Note: apiModels, enableChunking, chunkSize are intentionally NOT reset here
        // to allow users to keep their preferred configurations when changing files.
        // They are reset by the `resetCrawl` function if a full reset is desired.

        if (currentFile) {
            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                if (event.target) event.target.value = ''; // Clear the input
                return;
            }
            setFile(currentFile);
            parseCSV(currentFile); // Call parsing logic
        }
        if (event.target) event.target.value = ''; // Allow re-selecting the same file
    }, [parseCSV]);

    const onCsvSelectionChanged = useCallback((event: SelectionChangedEvent<Conference>) => {
        const selectedNodes = event.api.getSelectedNodes();
        // LOGGING POINT 1: Kiểm tra dữ liệu thô từ các node đã chọn
        console.log("AG Grid Selected Nodes Raw Data:", selectedNodes.map(node => node.data));

        const selectedActions: ConferenceForAction[] = selectedNodes.map(node => {
            const confData = node.data as Conference; // confData là một object Conference từ AG Grid

            // LOGGING POINT 2: Kiểm tra từng confData trước khi map
            console.log("Node Data (confData) being mapped:", JSON.stringify(confData));

            return {
                id: confData.id, // Quan trọng: id phải có và duy nhất
                Title: confData.title,
                Acronym: confData.acronym,
                crawlType: confData.crawlType, // Lấy từ cell đã chỉnh sửa trong grid
                link: confData.link,         // <--- Lấy link từ confData
                cfpLink: confData.cfpLink,   // <--- Lấy cfpLink từ confData
                impLink: confData.impLink,   // <--- Lấy impLink từ confData
                // originalRequestId: confData.originalRequestId, // Nếu có
            };
        });
        // LOGGING POINT 3: Kiểm tra mảng selectedActions đã được tạo
        console.log("Generated selectedActions (to become selectedCsvRows):", JSON.stringify(selectedActions));

        setSelectedCsvRows(selectedActions); // Cập nhật state với đầy đủ thông tin
    }, []); // Dependencies: setSelectedCsvRows (thường ổn định từ useState)


    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);

    const sendApiRequest = useCallback(async (
        items: ConferenceForAction[],
        description: string,
        modelsForRequest: ApiModels
    ): Promise<boolean> => {
        const apiPayloadItems: ConferenceApiPayloadItem[] = [];
        for (const item of items) {
            // Base payload common to both crawl and update
            const commonPayload = {
                Title: item.Title,
                Acronym: item.Acronym,
                originalRequestId: item.originalRequestId,
            };

            if (item.crawlType === 'update') {
                // For 'update', mainLink is required.
                if (item.link && item.link.trim() !== '') {
                    apiPayloadItems.push({
                        ...commonPayload,
                        mainLink: item.link, // item.link is a non-empty string here
                        // cfpLink and impLink will always be present, value will be string or null
                        cfpLink: (item.cfpLink && item.cfpLink.trim() !== '') ? item.cfpLink : null,
                        impLink: (item.impLink && item.impLink.trim() !== '') ? item.impLink : null,
                    });
                } else {
                    // Fallback to 'crawl' if mainLink is missing for an 'update' type
                    const warningMsg = `Conference "${item.Acronym}" (${item.Title}) marked for UPDATE but is missing 'link'. Sending as CRAWL.`;
                    console.warn(warningMsg);
                    setCrawlMessages(prev => [warningMsg, ...prev]);
                    apiPayloadItems.push({
                        ...commonPayload,
                        // Explicitly set link fields to undefined for 'crawl' type for type safety,
                        // or ensure they are not part of the 'crawl' object structure.
                        // Based on the updated ConferenceApiPayloadItem, these should not be present or be undefined.
                        mainLink: undefined,
                        cfpLink: undefined,
                        impLink: undefined,
                    });
                }
            } else { // 'crawl'
                apiPayloadItems.push({
                    ...commonPayload,
                    // Explicitly set link fields to undefined for 'crawl' type for type safety
                    mainLink: undefined,
                    cfpLink: undefined,
                    impLink: undefined,
                });
            }
        }

        if (apiPayloadItems.length === 0) {
            if (items.length > 0) {
                setCrawlMessages(prev => [`No valid items to send for "${description}" after processing action types.`, ...prev]);
            }
            return items.length === 0;
        }

        const params = { dataSource: 'client', models: modelsForRequest };
        const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`;
        try {
            // Type assertion to ensure TypeScript understands the payload structure,
            // though the logic above should already build it correctly.
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, apiPayloadItems as any[], {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 7200000 // 2 hours
            });
            console.log(`${description} ${modelDesc} - Response Status:`, response.status, response.data);
            setCrawlMessages(prev => [...prev, `${description} ${modelDesc}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
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
        // Thêm dependencies nếu có, ví dụ: setCrawlMessages, setCrawlError
    }, [setCrawlMessages, setCrawlError]);


    const processCrawlRequest = async (
        itemsToCrawl: ConferenceForAction[],
        modelsToUse: ApiModels,
        sourceDescription: string
    ) => {
        if (itemsToCrawl.length === 0) {
            const msg = `No items from "${sourceDescription}" to process.`;
            setCrawlError(msg); // Use crawlError for user-facing primary errors
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
        setCrawlError(null); // Clear previous primary error
        // Consider clearing specific messages or just appending
        // setCrawlMessages([]); // Option: clear all old messages for a fresh log

        let effectiveChunkSize = enableChunking ? chunkSize : MAX_ITEMS_PER_CRAWL_REQUEST;
        let wasChunkingForceEnabled = false;

        if (!enableChunking && itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST) {
            // effectiveChunkSize is already MAX_ITEMS_PER_CRAWL_REQUEST
            wasChunkingForceEnabled = true;
        } else if (!enableChunking) {
            effectiveChunkSize = itemsToCrawl.length; // Process all at once if below threshold
        }

        // Ensure effectiveChunkSize is at least 1 if there are items
        if (itemsToCrawl.length > 0 && effectiveChunkSize <= 0) {
            effectiveChunkSize = MAX_ITEMS_PER_CRAWL_REQUEST;
        }


        const needsActualChunking = itemsToCrawl.length > 0 && itemsToCrawl.length > effectiveChunkSize && enableChunking; // Only chunk if enabled and needed
        const modelDescShort = `DL:${modelsToUse.determineLinks?.[0]}, EI:${modelsToUse.extractInfo?.[0]}, EC:${modelsToUse.extractCfp?.[0]}`;
        let initialMessage = `Starting process for ${itemsToCrawl.length} items from "${sourceDescription}" using models (${modelDescShort})... `;

        if (needsActualChunking) {
            initialMessage += `Processing in chunks of up to ${effectiveChunkSize}.`;
        } else if (wasChunkingForceEnabled) {
            initialMessage += `Sending in batches of up to ${MAX_ITEMS_PER_CRAWL_REQUEST} (auto-batching).`;
        }
        else if (itemsToCrawl.length > 0) {
            initialMessage += 'Sending all at once.';
        }

        const newMessages = [initialMessage];
        if (wasChunkingForceEnabled) {
            newMessages.push(
                `Note: Automatic batching (max ${MAX_ITEMS_PER_CRAWL_REQUEST} items per request) was applied as the number of items exceeds the limit and chunking was not explicitly enabled.`
            );
        }
        // Prepend new messages, clear old "Starting process..." message
        setCrawlMessages(prev => [...newMessages, ...prev.filter(m => !m.startsWith("Starting process for"))]);

        let overallSuccess = true;
        const itemsForBatches = [...itemsToCrawl]; // Create a copy for manipulation if needed

        if (itemsForBatches.length > 0) {
            // Determine if we send in one batch or multiple
            const useMultipleBatches = enableChunking || itemsForBatches.length > MAX_ITEMS_PER_CRAWL_REQUEST;

            if (useMultipleBatches) {
                const chunks = chunkArray(itemsForBatches, effectiveChunkSize);
                const totalChunks = chunks.length;
                setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });

                for (let i = 0; i < totalChunks; i++) {
                    const currentChunk = chunks[i];
                    if (currentChunk.length === 0) continue;

                    const description = `Batch ${i + 1}/${totalChunks} (${currentChunk.length} items, from ${sourceDescription})`;
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
                    setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} batches from "${sourceDescription}" with selected models.`]);
                } else if (!overallSuccess && totalChunks > 0) {
                    setCrawlMessages(prev => [...prev, `Process from "${sourceDescription}" with selected models stopped due to an error.`]);
                }
            } else { // Single batch
                setCrawlProgress({ current: 0, total: 1, status: 'crawling', currentChunkData: itemsForBatches });
                const description = `Batch (${itemsForBatches.length} items from ${sourceDescription})`;
                const success = await sendApiRequest(itemsForBatches, description, modelsToUse);
                setCrawlProgress(prev => ({ ...prev, current: 1 }));
                if (success) {
                    setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                    setCrawlMessages(prev => [...prev, `Successfully processed the batch of ${itemsForBatches.length} items from "${sourceDescription}" with selected models.`]);
                } else {
                    setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                    overallSuccess = false;
                }
            }
        } else { // Should have been caught by initial itemsToCrawl.length === 0 check
            overallSuccess = false; // No items to process
        }

        setIsCrawling(false);
    };

    const startCrawlFromCsv = async () => {
        if (selectedCsvRows.length === 0) {
            const msg = "No conferences selected from the CSV data to process.";
            setCrawlError(msg);
            setCrawlMessages(prev => [msg, ...prev.filter(m => !m.startsWith("No conferences selected from"))]);
            return;
        }
        await processCrawlRequest(selectedCsvRows, apiModels, "CSV Selections");
    };

    const startCrawlItems = async (items: ConferenceForAction[], modelsToUse: ApiModels) => {
        await processCrawlRequest(items, modelsToUse, "Programmatic Re-Crawl");
    };

    const resetCrawl = useCallback(() => {
        // Resets everything to initial state, as if the component just mounted
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);

        setApiModels({ ...initialApiModels }); // Reset model selections
        // Optionally reset chunking config, or leave it as user preference
        // setEnableChunking(false);
        // setChunkSizeState(MAX_ITEMS_PER_CRAWL_REQUEST);

        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedCsvRows([]);
        console.log("Crawl state (including API models) fully reset.");
    }, []); // No dependencies if initialApiModels is stable

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
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        setApiModel,
        startCrawlFromCsv,
        startCrawlItems,
        resetCrawl,
        onCsvSelectionChanged,
    };
};