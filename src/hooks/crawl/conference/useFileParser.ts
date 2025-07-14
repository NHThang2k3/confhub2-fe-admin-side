// src/hooks/crawl/conference/useFileParser.ts
'use client';
import { useState, useCallback } from 'react';
import Papa from 'papaparse'; // Cần import papaparse ở đây
import { Conference } from '../../../models/logAnalysis/importConferenceCrawl';
import { UPLOAD_FILE_ENDPOINT } from '../constants';


// --- THÊM MỚI: Định nghĩa các header chuẩn hóa ---
// Đây là danh sách các key header chính xác mà backend sẽ nhận được.
// Thứ tự trong mảng này sẽ quyết định thứ tự các cột trong file CSV.
const NORMALIZED_CSV_HEADERS = [
    'title',
    'acronym',
    'source',
    'rank',
    'fieldOfResearch1',
    'fieldOfResearch2',
    'fieldOfResearch3'
];


export const useFileParser = () => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const parseAndUploadFile = useCallback(async (csvFile: File): Promise<{ data: Conference[] | null, message: string }> => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);
        setFile(csvFile); // Lưu file đang được xử lý

        const body = new FormData();
        body.append('file', csvFile);

        try {
            const response = await fetch(UPLOAD_FILE_ENDPOINT, {
                method: 'POST',
                body: body,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // ... logic xử lý lỗi giữ nguyên ...
                let errorMsg = `Failed to upload/parse file. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.message || errorData?.error || errorMsg;
                } catch (jsonError) { /* ignore */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            if (result.data && Array.isArray(result.data)) {
                const conferencesWithDefaults: Conference[] = result.data.map((conf: any, index: number) => ({
                    ...conf,
                    id: conf.id || `${conf.acronym || 'conf'}-${Date.now()}-${index}`,
                    crawlType: 'crawl',
                }));
                setParsedData(conferencesWithDefaults);
                return { data: conferencesWithDefaults, message: `File uploaded and parsed successfully. ${conferencesWithDefaults.length} records found.` };
            } else {
                setParsedData([]);
                throw new Error("Parsed data is not in the expected format or is empty.");
            }
        } catch (error: any) {
            console.error("Error uploading or parsing CSV file:", error);
            setParseError(error.message || "Error uploading or parsing file.");
            setParsedData(null);
            throw error;
        } finally {
            setIsParsing(false);
        }
    }, []);

    // HÀM MỚI: Nhận dữ liệu đã được cấu trúc, chuyển nó thành CSV và upload
    const processDataForUpload = useCallback(async (
        data: Conference[],
        originalFile: File,
        onSuccess: (message: string) => void,
        onReset: () => void
    ) => {
        onReset(); // Reset các state cũ
        setFile(originalFile); // Lưu file gốc để hiển thị tên

        // --- THAY ĐỔI CHÍNH Ở ĐÂY ---
        // Sử dụng Papa.unparse với tùy chọn `columns` để đảm bảo header
        // và thứ tự cột luôn được chuẩn hóa.
        data = data.map((item: any) => ({
            ...item,
            fieldOfResearch1: item['field Of Research1'] || '',
            fieldOfResearch2: item['field Of Research2'] || '',
            fieldOfResearch3: item['field Of Research3'] || '',
        }));
        const csvString = Papa.unparse(data, {
            columns: NORMALIZED_CSV_HEADERS,
            header: true // Đảm bảo dòng header được tạo ra
        });

        // 2. Tạo một đối tượng File mới từ chuỗi CSV
        const newCsvFile = new File([csvString], originalFile.name, { type: 'text/csv' });

        // 3. Gọi hàm upload với file mới này
        try {
            const { message } = await parseAndUploadFile(newCsvFile);
            onSuccess(message);
        } catch (e) {
            // Lỗi đã được set trong parseAndUploadFile
        }
    }, [parseAndUploadFile]);

    const reset = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
    }, []);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        processDataForUpload, // Export hàm mới
        setParsedData,
        reset,
    };
};