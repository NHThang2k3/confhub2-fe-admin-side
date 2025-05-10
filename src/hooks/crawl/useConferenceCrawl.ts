'use_client'
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Conference, ApiCrawlResponse, CrawlProgress, SendToCrawlConference } from '../../models/logAnalysis/importConferenceCrawl'; // Điều chỉnh đường dẫn nếu cần

import { appConfig } from '@/src/middleware';

// --- Configuration ---
const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;

// --- Utility Function ---
function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array]; // Trả về mảng gốc nếu size không hợp lệ
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
    selectedRows: SendToCrawlConference[]; // Thêm selectedRows vào return
    setSelectedRows: React.Dispatch<React.SetStateAction<SendToCrawlConference[]>>; // Thêm setSelectedRows vào return
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    startCrawl: () => Promise<void>;
    resetCrawl: () => void; // Thêm hàm reset
    onSelectionChanged: (event: any) => void; // Thêm hàm xử lý sự kiện chọn hàng
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5); // Default chunk size

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const [selectedRows, setSelectedRows] = useState<SendToCrawlConference[]>([]); // State cho selected rows

    const uploadFileEndPoint = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin-conference/upload-file-csv`;

    // --- File Handling and Parsing ---
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetCrawl(); // Reset trạng thái crawl cũ khi chọn file mới
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                setFile(null);
                setParsedData(null);
                return;
            }
            setFile(selectedFile);
            setParseError(null);
            parseCSV(selectedFile);
        } else {
            setFile(null);
            setParsedData(null);
        }
        // Reset input value để có thể chọn lại cùng file
        event.target.value = '';
    }, []); // Bỏ resetCrawl khỏi dependency array để tránh loop nếu resetCrawl thay đổi state

    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParsedData(null); // Xóa data cũ
        setParseError(null);
        setCrawlMessages([]); // Xóa message cũ
        const body = new FormData();
        body.append('file', csvFile);

        fetch(uploadFileEndPoint, {
            method: 'POST',
            body: body,
            headers: {
                'Accept': 'application/json',
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to upload file');
            }
            return response.json();
        })
        .then((data) => {
            console.log("File uploaded successfully:", data);
            setParsedData(data.data); // Giả sử API trả về dữ liệu đã phân tích
            setCrawlMessages(prev => [...prev, `File uploaded successfully. ${data.data.length} records parsed.`]);
            setIsParsing(false);
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
            setParseError("Error uploading file. Please try again.");
            setIsParsing(false);
        });
    }, []);

    const onSelectionChanged = useCallback( (event : any) => {
        console.log("on chsnged" , JSON.stringify(event.selectedNodes.map((node : any) => ({
            Title : node.data.title,
            Acronym : node.data.acronym
        }))));
        setSelectedRows(event.selectedNodes.map((node : any) => ({
            id : node.data.id,
            Title : node.data.title,
            Acronym : node.data.acronym
        })));
      } , [])


    // --- API Call Logic ---
    const sendApiRequest = useCallback(async (payload: SendToCrawlConference[], description: string): Promise<boolean> => {
        setCrawlError(null); // Clear previous error for this request
        try {
            const params = { dataSource: 'client' };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000 // Tăng timeout (vd: 10 phút) cho các request lớn/chunk
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>; // Type assertion
            console.error(`API Error during ${description}:`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                console.error('Server Response Status:', error.response.status);
                console.error('Server Response Data:', error.response.data);
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage); // Set error cho cả lần crawl
            setCrawlMessages(prev => [...prev, `FAILED to send ${description}. See error details.`]); // Thêm message lỗi
            return false;
        }
    }, []);


    // --- Crawl Execution Logic ---
    const startCrawl = async () => {
        if (selectedRows.length === 0  || isCrawling) {
            console.warn("Cannot start crawl: No data parsed, data is empty, or already crawling.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlMessages(prev => [`Starting crawl process... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: 0, status: 'crawling' }); // Reset progress

        if (enableChunking) {
            // --- Chunked Mode ---
            const chunks = chunkArray(selectedRows, chunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });
            console.log(`Starting crawl in chunked mode. Total chunks: ${totalChunks}`);

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks}`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk })); // Cập nhật progress trước khi gửi
                const success = await sendApiRequest(currentChunk, description);
                // const success = await fetch(
                //     appConfig.NEXT_PUBLIC_BACKEND_URL +"/api/v1/crawl-conferences?dataSource=client" , {
                //         method : "POST" , 
                //         body : JSON.stringify(currentChunk),
                //         headers : {
                //             'Content-Type' : 'application/json'
                //         }
                //     })
                
                if (!success) {
                    console.error(`Crawl stopped due to error in ${description}.`);
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    setIsCrawling(false);
                    return; // Stop processing further chunks
                }
                 // Optional delay between chunks if needed
                 // await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
            }

            console.log("Finished sending all chunks successfully.");
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
            setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks.`]);

        } else {
            // --- Send All Mode ---
            console.log("Starting crawl in 'send all' mode.");
            setCrawlProgress({ current: 1, total: 1, status: 'crawling', currentChunkData: selectedRows }); // Progress là 1/1
            const description = "Entire List";
            
            const params = { dataSource: 'client' };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, selectedRows , {
                    params: params,
                    method : "POST" , 
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                })

            if (response.status === 200) {
                console.log("Finished sending entire list successfully.");
                setCrawlProgress({ current: 1, total: 1, status: 'success' });
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list.`]);
            } else {
                 console.error(`Crawl failed when sending the entire list.`);
                setCrawlProgress({ current: 1, total: 1, status: 'error' });
                // Lỗi đã được set trong sendApiRequest
            }
        }

        setIsCrawling(false); // Mark crawling as finished (success, error, or stopped)

    }

    // --- Reset Function ---
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