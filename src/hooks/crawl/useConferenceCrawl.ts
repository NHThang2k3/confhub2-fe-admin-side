// src/app/hooks/crawl/useConferencesCrawl.ts
'use_client'
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
// Giả sử SendToCrawlConference đã có originalRequestId?: string;
import { Conference, ApiCrawlResponse, CrawlProgress, SendToCrawlConference } from '../../models/logAnalysis/importConferenceCrawl';

import { appConfig } from '@/src/middleware'; // Đảm bảo middleware được định nghĩa đúng

// --- Configuration ---
const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;

// --- Utility Function ---
function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array]; // Trả về mảng gốc trong một chunk nếu size không hợp lệ
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export type CrawlModelType = 'non-tuned' | 'tuned';

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null; // Dữ liệu từ CSV sau khi parse ở backend
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    crawlModel: CrawlModelType; // Model mặc định hoặc được chọn cho CSV crawl
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    // selectedRows giờ đây chỉ dùng cho việc chọn từ bảng CSV đã parse, không phải là input trực tiếp cho mọi crawl
    selectedCsvRows: SendToCrawlConference[]; // Đổi tên để rõ ràng hơn: các dòng được chọn từ CSV đã parse
    setSelectedCsvRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setCrawlModel: (model: CrawlModelType) => void; // Set model mặc định
    startCrawlFromCsv: () => Promise<void>; // Đổi tên: Bắt đầu crawl từ các dòng CSV đã chọn
    startCrawlItems: (items: SendToCrawlConference[], modelToUse: CrawlModelType) => Promise<void>; // Crawl danh sách item cụ thể với model cụ thể
    resetCrawl: () => void;
    onCsvSelectionChanged: (event: any) => void; // Đổi tên: Khi lựa chọn trên bảng CSV thay đổi
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null); // Dữ liệu từ CSV
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5);
    const [crawlModel, setCrawlModel] = useState<CrawlModelType>('non-tuned'); // Model chung, có thể được override

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    // selectedCsvRows là các dòng được chọn từ bảng hiển thị dữ liệu CSV đã parse
    const [selectedCsvRows, setSelectedCsvRows] = useState<SendToCrawlConference[]>([]);

    // Endpoint để upload và parse CSV (trả về dữ liệu để hiển thị trên bảng)
    const uploadFileEndPoint = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`;

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const currentFile = event.target.files?.[0];
        if (currentFile) {
            setFile(null); // Reset file trước
            setParsedData(null);
            setIsParsing(false);
            setParseError(null);
            setIsCrawling(false);
            setCrawlError(null);
            setCrawlProgress({ current: 0, total: 0, status: 'idle' });
            setCrawlMessages([]);
            setSelectedCsvRows([]); // Reset selected rows từ CSV cũ

            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                event.target.value = ''; // Clear input để có thể chọn lại cùng file
                return;
            }
            setFile(currentFile); // Set file mới
            parseCSV(currentFile);
        } else {
            resetCrawl(); // Nếu không chọn file nào thì reset
        }
        event.target.value = ''; // Luôn clear input để có thể chọn lại cùng file
    }, []); // Thêm resetCrawl vào dependency nếu nó thay đổi

    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParseError(null); // Reset parse error trước khi parse
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
                setParsedData(data.data); // Đây là Conference[] từ CSV
                setCrawlMessages(prev => [...prev, `File uploaded and parsed successfully. ${data.data.length} records found.`]);
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
    }, [uploadFileEndPoint]); // Dependencies

    // Callback khi người dùng chọn các dòng trên bảng dữ liệu CSV đã parse
    const onCsvSelectionChanged = useCallback((event: any) => {
        // Giả sử event.api.getSelectedNodes() trả về các node được chọn
        // và node.data chứa các trường id, title, acronym từ Conference (parsedData)
        setSelectedCsvRows(event.api.getSelectedNodes().map((node: any) => ({
            // id: node.data.id, // id này có thể là index dòng hoặc một ID từ CSV
            Title: node.data.title, // Đảm bảo field name khớp với Conference model
            Acronym: node.data.acronym,
            // originalRequestId sẽ là undefined cho lần crawl đầu từ CSV
        } as SendToCrawlConference)));
    }, []);

    const sendApiRequest = useCallback(async (
        payload: SendToCrawlConference[], // items này có thể có originalRequestId
        description: string, // Mô tả chunk/batch
        modelForThisRequest: CrawlModelType // Model cụ thể cho request này
    ): Promise<boolean> => {
        try {
            const params = {
                dataSource: 'client', // Luôn là client vì frontend gửi
                model: modelForThisRequest
            };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000 // 10 phút
            });

            console.log(`${description} (${modelForThisRequest} model) - Response Status:`, response.status, response.data);
            setCrawlMessages(prev => [...prev, `${description} (${modelForThisRequest} model): ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${description} (${modelForThisRequest} model):`, error);
            let errorMessage = `Error sending ${description} (${modelForThisRequest} model): ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${description} (${modelForThisRequest} model). Details: ${errorMessage}`]);
            return false;
        }
    }, []); // API_CONFERENCE_ENDPOINT là const, không cần làm dependency

    // Hàm xử lý crawl chung, được gọi bởi startCrawlFromCsv và startCrawlItems
    const processCrawlRequest = async (
        itemsToCrawl: SendToCrawlConference[], // Danh sách các item cần crawl
        modelToUse: CrawlModelType,           // Model được sử dụng cho lần crawl này
        sourceDescription: string             // Mô tả nguồn (CSV, Table Selection)
    ) => {
        if (itemsToCrawl.length === 0) {
            setCrawlError(`No items from "${sourceDescription}" to crawl.`);
            setCrawlMessages(prev => [`No items from "${sourceDescription}" selected.`, ...prev.filter(m => !m.startsWith("No items from"))]);
            return;
        }
        if (isCrawling) {
            console.warn("Crawl is already in progress.");
            setCrawlMessages(prev => ["A crawl operation is already in progress. Please wait.", ...prev]);
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlMessages(prev => [`Starting crawl for ${itemsToCrawl.length} items from "${sourceDescription}" using ${modelToUse} model... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: itemsToCrawl.length, status: 'crawling' }); // total là tổng số item

        let overallSuccess = true;

        if (enableChunking && itemsToCrawl.length > chunkSize) { // Chỉ chunk nếu số item lớn hơn chunkSize
            const chunks = chunkArray(itemsToCrawl, chunkSize);
            const totalChunks = chunks.length;
            // Cập nhật total cho progress là số chunk
            setCrawlProgress(prev => ({ ...prev, total: totalChunks, currentChunkData: undefined }));

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks} (from ${sourceDescription})`;
                // Cập nhật current chunk cho progress
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));
                // **SỬA Ở ĐÂY: Truyền modelToUse, không phải crawlModel (state)
                const success = await sendApiRequest(currentChunk, description, modelToUse);

                if (!success) {
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    overallSuccess = false;
                    break; // Dừng nếu một chunk lỗi
                }
            }

            if (overallSuccess && totalChunks > 0) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                // **SỬA Ở ĐÂY: Sử dụng modelToUse trong message
                setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks from "${sourceDescription}" with ${modelToUse} model.`]);
            } else if (!overallSuccess) {
                // **SỬA Ở ĐÂY: Sử dụng modelToUse trong message
                setCrawlMessages(prev => [...prev, `Crawl process from "${sourceDescription}" with ${modelToUse} model stopped due to an error.`]);
            }

        } else { // Gửi tất cả nếu không chunking hoặc số item nhỏ hơn chunk size
            // Cập nhật progress: 1 batch duy nhất
            setCrawlProgress(prev => ({ ...prev, current: 1, total: 1, status: 'crawling', currentChunkData: itemsToCrawl }));
            const description = `Entire List (${itemsToCrawl.length} items from ${sourceDescription})`;
            // **SỬA Ở ĐÂY: Truyền modelToUse, không phải crawlModel (state)
            const success = await sendApiRequest(itemsToCrawl, description, modelToUse);

            if (success) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                // **SỬA Ở ĐÂY: Sử dụng modelToUse trong message
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list from "${sourceDescription}" with ${modelToUse} model.`]);
            } else {
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                overallSuccess = false;
            }
        }
        setIsCrawling(false);
    };

    // Bắt đầu crawl từ các dòng đã chọn trong bảng CSV
    const startCrawlFromCsv = async () => {
        if (selectedCsvRows.length === 0) { // Kiểm tra selectedCsvRows
            setCrawlError("No conferences selected from the CSV data to crawl.");
            setCrawlMessages(prev => ["No conferences selected from the CSV data.", ...prev.filter(m => !m.startsWith("No conferences selected from"))]);
            return;
        }
        // Sử dụng selectedCsvRows và crawlModel (state) làm model mặc định cho CSV
        await processCrawlRequest(selectedCsvRows, crawlModel, "CSV Selections");
    };

    // Bắt đầu crawl cho một danh sách items cụ thể với model cụ thể (cho "Crawl Again")
    const startCrawlItems = async (items: SendToCrawlConference[], modelToUse: CrawlModelType) => {
        // modelToUse đã được truyền vào từ component gọi (ví dụ, từ modal chọn model)
        await processCrawlRequest(items, modelToUse, "Table Re-Crawl");
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // Giữ lại các cài đặt của người dùng: enableChunking, chunkSize, crawlModel
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedCsvRows([]); // Reset selected rows từ CSV
        console.log("Crawl state (excluding user preferences) reset.");
    }, []);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        crawlModel, // Model mặc định/chung
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedCsvRows, // Các dòng chọn từ CSV
        setSelectedCsvRows,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        setCrawlModel, // Để set model mặc định
        startCrawlFromCsv, // Cho CSV
        startCrawlItems,   // Cho re-crawl từ table
        resetCrawl,
        onCsvSelectionChanged // Khi chọn trên bảng CSV
    };
};