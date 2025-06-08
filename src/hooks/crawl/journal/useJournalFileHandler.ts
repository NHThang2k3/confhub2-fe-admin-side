// src/hooks/crawl/journal/useJournalFileHandler.ts
'use client';
import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { ScimagoJournal } from '@/src/models/logAnalysis/importJournalCrawl';

export const useJournalFileHandler = () => {
    const [file, setFile] = useState<File | null>(null);
    const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);
    const [parsedCsvData, setParsedCsvData] = useState<any[]>([]);
    const [isReadingFile, setIsReadingFile] = useState(false);
    const [fileReadError, setFileReadError] = useState<string | null>(null);
    const [scimagoPreviewData, setScimagoPreviewData] = useState<ScimagoJournal[] | null>(null);

    const readFile = useCallback(async (selectedFile: File): Promise<{ success: boolean, rawContent: string | null, parsedData: any[] }> => {
        setIsReadingFile(true);
        setFileReadError(null);
        setRawCsvContent(null);
        setParsedCsvData([]);
        setScimagoPreviewData(null);
        setFile(selectedFile);

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                if (!fileContent) {
                    const errorMsg = "Could not read file content.";
                    setFileReadError(errorMsg);
                    setIsReadingFile(false);
                    resolve({ success: false, rawContent: null, parsedData: [] });
                    return;
                }

                setRawCsvContent(fileContent);

                Papa.parse(fileContent, {
                    header: true,
                    delimiter: ";",
                    skipEmptyLines: true,
                    transformHeader: header => header.trim(),
                    transform: (value) => value.trim(),
                    complete: (results) => {
                        if (results.data) {
                            setParsedCsvData(results.data);
                            // Assuming ScimagoJournal has the same structure for preview
                            setScimagoPreviewData(results.data as ScimagoJournal[]);
                        }
                        setIsReadingFile(false);
                        resolve({ success: true, rawContent: fileContent, parsedData: results.data });
                    },
                    error: (error: Error) => {
                        setFileReadError(`CSV parsing error: ${error.message}`);
                        setIsReadingFile(false);
                        resolve({ success: false, rawContent: fileContent, parsedData: [] });
                    }
                });
            };
            reader.onerror = () => {
                const errorMsg = `Error reading file: ${reader.error?.message}`;
                setFileReadError(errorMsg);
                setIsReadingFile(false);
                resolve({ success: false, rawContent: null, parsedData: [] });
            };
            reader.readAsText(selectedFile);
        });
    }, []);

    const reset = useCallback(() => {
        setFile(null);
        setRawCsvContent(null);
        setParsedCsvData([]);
        setIsReadingFile(false);
        setFileReadError(null);
        setScimagoPreviewData(null);
    }, []);

    return {
        file,
        rawCsvContent,
        parsedCsvData,
        isReadingFile,
        fileReadError,
        scimagoPreviewData,
        readFile,
        reset,
    };
};