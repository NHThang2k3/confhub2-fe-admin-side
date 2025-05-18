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

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedRows: SendToCrawlConference[];
    setSelectedRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
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

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const [selectedRows, setSelectedRows] = useState<SendToCrawlConference[]>([]);

    const uploadFileEndPoint = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`;

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        // Không gọi resetCrawl ở đây nữa để giữ lại lỗi parse nếu có khi người dùng chọn lại file
        const currentFile = event.target.files?.[0];

        if (currentFile) {
            // Reset các state liên quan đến parse và crawl của file CŨ trước khi xử lý file MỚI
            setFile(null); // Xoá file cũ ngay
            setParsedData(null);
            setIsParsing(false); // Đảm bảo reset parsing state
            setParseError(null);
            // Reset crawl states
            setIsCrawling(false);
            setCrawlError(null);
            setCrawlProgress({ current: 0, total: 0, status: 'idle' });
            setCrawlMessages([]);
            setSelectedRows([]); // Xóa selection cũ

            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                // setFile(null); // Đã set ở trên
                // setParsedData(null); // Đã set ở trên
                event.target.value = ''; // Reset input để có thể chọn lại cùng file nếu cần
                return;
            }
            setFile(currentFile); // Set file mới
            // setParseError(null); // Đã set ở trên
            parseCSV(currentFile);
        } else {
            // User hủy chọn file, reset mọi thứ liên quan đến file và crawl
            resetCrawl();
        }
        // Reset input value để có thể chọn lại cùng file (quan trọng nếu người dùng chọn lại file giống hệt)
        event.target.value = '';
    }, []); // Thêm resetCrawl vào deps nếu nó thay đổi state mà handleFileChange cần biết

    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        // setParsedData(null); // Đã được reset trong handleFileChange
        // setParseError(null); // Đã được reset trong handleFileChange
        // setCrawlMessages([]); // Đã được reset trong handleFileChange
        const body = new FormData();
        body.append('file', csvFile);

        fetch(uploadFileEndPoint, {
            method: 'POST',
            body: body,
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(async (response) => { // Thêm async để await response.json() trong trường hợp lỗi
                if (!response.ok) {
                    // Cố gắng đọc nội dung lỗi từ server nếu có
                    const errorData = await response.json().catch(() => null); // Tránh lỗi nếu body không phải JSON
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
                    setParsedData([]); // Set mảng rỗng nếu data.data không hợp lệ
                    throw new Error("Parsed data is not in the expected format.");
                }
                setIsParsing(false);
            })
            .catch((error) => {
                console.error("Error uploading or parsing file:", error);
                setParseError(error.message || "Error uploading or parsing file. Please try again.");
                setParsedData(null); // Đảm bảo không có data cũ hiển thị khi có lỗi parse
                setIsParsing(false);
            });
    }, [uploadFileEndPoint]);

    const onSelectionChanged = useCallback((event: any) => {
        // console.log("on changed", JSON.stringify(event.api.getSelectedNodes().map((node: any) => ({
        //     Title: node.data.title,
        //     Acronym: node.data.acronym
        // }))));
        setSelectedRows(event.api.getSelectedNodes().map((node: any) => ({ // Sử dụng event.api.getSelectedNodes() cho AG Grid
            id: node.data.id,
            Title: node.data.title,
            Acronym: node.data.acronym
        })));
    }, [])


    const sendApiRequest = useCallback(async (payload: SendToCrawlConference[], description: string): Promise<boolean> => {
        // Không reset crawlError ở đây, để startCrawl quản lý việc reset lỗi tổng thể
        try {
            const params = { dataSource: 'client' };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${description}:`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                console.error('Server Response Status:', error.response.status);
                console.error('Server Response Data:', error.response.data);
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage); // Set lỗi cho lần crawl hiện tại
            setCrawlMessages(prev => [...prev, `FAILED to send ${description}. Details: ${errorMessage}`]);
            return false;
        }
    }, []);


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
        setCrawlError(null); // Xóa lỗi crawl cũ khi bắt đầu một lần crawl mới
        setCrawlMessages(prev => [`Starting crawl process... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
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
                const success = await sendApiRequest(currentChunk, description);

                if (!success) {
                    // crawlError đã được set bởi sendApiRequest
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    overallSuccess = false;
                    break; // Dừng xử lý các chunk tiếp theo
                }
            }

            if (overallSuccess && totalChunks > 0) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks.`]);
            } else if (!overallSuccess) {
                // Lỗi đã được ghi nhận, status là 'stopped'
                 setCrawlMessages(prev => [...prev, `Crawl process stopped due to an error in one of the chunks.`]);
            }
            // Trường hợp không có chunk nào (selectedRows rỗng nhưng đã qua check ở trên) thì không làm gì thêm.

        } else { // Send All Mode
            setCrawlProgress(prev => ({ ...prev, current: 1, total: 1, status: 'crawling', currentChunkData: selectedRows }));
            const description = "Entire List";
            const success = await sendApiRequest(selectedRows, description); // SỬ DỤNG sendApiRequest

            if (success) {
                setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list.`]);
            } else {
                // crawlError đã được set bởi sendApiRequest
                setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                overallSuccess = false;
            }
        }

        setIsCrawling(false); // Đặt isCrawling thành false SAU KHI tất cả hoạt động hoàn tất hoặc có lỗi
    };

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // Giữ lại cài đặt chunking của người dùng
        // setEnableChunking(false);
        // setChunkSize(5);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setSelectedRows([]); // Quan trọng: reset cả các hàng đã chọn
        console.log("Crawl state reset.");
    }, []);


    return {
        file,
        parsedData,
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        selectedRows,
        setSelectedRows,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        startCrawl,
        resetCrawl,
        onSelectionChanged
    };
};