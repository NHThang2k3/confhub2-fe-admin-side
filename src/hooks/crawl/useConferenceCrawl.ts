// src/hooks/crawl/useConferenceCrawl.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Conference, ApiCrawlResponse, CrawlProgress, SendToCrawlConference } from '../../models/logAnalysis/importConferenceCrawl';
import { appConfig } from '@/src/middleware';

const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;
const MAX_ITEMS_PER_CRAWL_REQUEST = 50; // Giới hạn tối đa cho mỗi request API

function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array]; // Tránh size âm hoặc 0
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
    chunkSize: number; // Sẽ được giới hạn bởi MAX_ITEMS_PER_CRAWL_REQUEST
    apiModels: ApiModels;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedCsvRows: SendToCrawlConference[];
    setSelectedCsvRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void; // Hàm này sẽ đảm bảo size <= MAX_ITEMS_PER_CRAWL_REQUEST
    setApiModel: (apiName: ApiName, model: CrawlModelType) => void;
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
    // chunkSize do người dùng cấu hình, sẽ được kẹp giữa 1 và MAX_ITEMS_PER_CRAWL_REQUEST
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST); // Mặc định là 50 (hoặc một giá trị nhỏ hơn nếu muốn)
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
            // Giữ nguyên logic resetCrawlStateOnly của bạn nếu cần
            setIsCrawling(false);
            setCrawlError(null);
            setCrawlProgress({ current: 0, total: 0, status: 'idle' });
            // Giữ lại một số message quan trọng nếu muốn
            setCrawlMessages(prev => prev.filter(msg => !msg.startsWith("Starting crawl") && !msg.startsWith("Successfully processed") && !msg.startsWith("FAILED to send")));
        }
        event.target.value = ''; // Cho phép chọn lại cùng file
    }, []); // Thêm dependencies nếu có

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

    // Điều chỉnh setChunkSize để giới hạn giá trị
    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);


    const sendApiRequest = useCallback(async (
        payload: SendToCrawlConference[],
        description: string,
        modelsForRequest: ApiModels
    ): Promise<boolean> => {
        try {
            const params = {
                dataSource: 'client',
                models: modelsForRequest
            };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 7200000 // 10 minutes
            });
            const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`;
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
        modelsToUse: ApiModels,
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

        let effectiveChunkSize: number;
        let wasChunkingForceEnabled = false; // Biến để theo dõi chunking tự động

        if (enableChunking) {
            effectiveChunkSize = chunkSize; // chunkSize đã được giới hạn
        } else {
            // Nếu không bật chunking, nhưng số lượng items lớn hơn giới hạn
            if (itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST) {
                effectiveChunkSize = MAX_ITEMS_PER_CRAWL_REQUEST;
                wasChunkingForceEnabled = true; // Đánh dấu là chunking được tự động bật
            } else {
                effectiveChunkSize = itemsToCrawl.length; // Gửi tất cả một lần nếu <= giới hạn
            }
        }
        // Đảm bảo effectiveChunkSize không bao giờ bằng 0 hoặc âm nếu itemsToCrawl có phần tử
        if (itemsToCrawl.length > 0 && effectiveChunkSize <= 0) {
            effectiveChunkSize = MAX_ITEMS_PER_CRAWL_REQUEST;
        }


        const needsActualChunking = itemsToCrawl.length > effectiveChunkSize && itemsToCrawl.length > 0;

        const modelDescShort = `DL:${modelsToUse.determineLinks?.[0]}, EI:${modelsToUse.extractInfo?.[0]}, EC:${modelsToUse.extractCfp?.[0]}`;

        let initialMessage = `Starting crawl for ${itemsToCrawl.length} items from "${sourceDescription}" using models (${modelDescShort})... `;
        if (needsActualChunking) {
            initialMessage += `Processing in chunks of up to ${effectiveChunkSize}.`;
        } else if (itemsToCrawl.length > 0) { // Chỉ thêm "Sending all at once" nếu có items
            initialMessage += 'Sending all at once.';
        }

        const newMessages = [initialMessage];

        if (wasChunkingForceEnabled) {
            newMessages.push(
                `Note: Automatic chunking (max ${MAX_ITEMS_PER_CRAWL_REQUEST} items per request) was applied as the number of items exceeds the limit.`
            );
        }

        setCrawlMessages(prev => [...newMessages, ...prev]); // Thêm message mới vào đầu


        let overallSuccess = true;

        if (needsActualChunking) {
            const chunks = chunkArray(itemsToCrawl, effectiveChunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                // Kiểm tra nếu chunk rỗng (có thể xảy ra nếu logic chunkArray hoặc effectiveChunkSize có vấn đề)
                if (currentChunk.length === 0) {
                    console.warn(`Skipping empty chunk ${i + 1}/${totalChunks}`);
                    setCrawlMessages(prev => [...prev, `Skipped empty chunk ${i + 1}/${totalChunks}.`]);
                    continue;
                }
                const description = `Chunk ${i + 1}/${totalChunks} (${currentChunk.length} items, from ${sourceDescription})`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1 }));
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
            } else if (!overallSuccess && totalChunks > 0) { // Chỉ thêm message lỗi nếu có chunks để xử lý
                setCrawlMessages(prev => [...prev, `Crawl process from "${sourceDescription}" with selected models stopped due to an error.`]);
            } else if (totalChunks === 0 && itemsToCrawl.length > 0) { // Trường hợp không có chunks nào được tạo ra dù có items
                setCrawlMessages(prev => [...prev, `Warning: No chunks were processed for "${sourceDescription}" despite having items.`]);
                overallSuccess = false; // Coi như lỗi nếu có items mà không xử lý được chunk nào
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
            }


        } else if (itemsToCrawl.length > 0) { // Chỉ gửi nếu có items để gửi
            setCrawlProgress({ current: 0, total: 1, status: 'crawling' });
            const description = `Batch (${itemsToCrawl.length} items from ${sourceDescription})`;
            const success = await sendApiRequest(itemsToCrawl, description, modelsToUse);
            setCrawlProgress(prev => ({ ...prev, current: 1 }));

            if (success) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed the batch of ${itemsToCrawl.length} items from "${sourceDescription}" with selected models.`]);
            } else {
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                overallSuccess = false;
            }
        } else {
            // Trường hợp itemsToCrawl.length === 0, đã được xử lý ở đầu hàm
            // Hoặc trường hợp không `needsActualChunking` và `itemsToCrawl.length` là 0.
            // Có thể thêm 1 log ở đây nếu cần debug.
            console.log("No items to crawl or no chunking needed for zero items.");
        }
        setIsCrawling(false);
    };

    const startCrawlFromCsv = async () => {
        if (selectedCsvRows.length === 0) {
            setCrawlError("No conferences selected from the CSV data to crawl.");
            setCrawlMessages(prev => ["No conferences selected from the CSV data.", ...prev.filter(m => !m.startsWith("No conferences selected from"))]);
            return;
        }
        await processCrawlRequest(selectedCsvRows, apiModels, "CSV Selections");
    };

    const startCrawlItems = async (items: SendToCrawlConference[], modelsToUse: ApiModels) => {
        await processCrawlRequest(items, modelsToUse, "Table Re-Crawl");
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // Giữ nguyên enableChunking và chunkSize nếu người dùng đã thiết lập
        // setEnableChunking(false); // Reset nếu muốn
        // setChunkSizeState(MAX_ITEMS_PER_CRAWL_REQUEST); // Reset chunkSize về mặc định nếu muốn
        setApiModels(initialApiModels);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedCsvRows([]);
        console.log("Crawl state (including API models) reset.");
    }, []); // Thêm dependencies nếu cần

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize, // State này đã được giới hạn
        apiModels,
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedCsvRows,
        setSelectedCsvRows,
        handleFileChange,
        setEnableChunking,
        setChunkSize, // Hàm setter này đã được cập nhật
        setApiModel,
        startCrawlFromCsv,
        startCrawlItems,
        resetCrawl,
        onCsvSelectionChanged,
    };
};