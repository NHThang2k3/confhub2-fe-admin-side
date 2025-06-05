// src/hooks/crawl/journal/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse'; // Keep for local parsing for preview if desired, or just for raw content reading
import {
    JournalWithStatus, // For data from DB check, used in UI selection table
    DbCheckImportResponse,
    DbCheckImportResult,
    BackendCrawlApiResponse,
    BackendCrawlProgress,
    ScimagoJournal, // For typing the preview data if we parse SCImago locally
    UiProgress
} from '../../../models/logAnalysis/importJournalCrawl'; // Adjust path
import { appConfig } from '@/src/middleware';

// --- Configuration ---
const API_DB_CHECK_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals/check-import`;
const API_BACKEND_CRAWL_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-journals`; // Old endpoint

export interface UseJournalCrawlReturn {
    file: File | null;
    rawCsvContent: string | null; // For sending to backend crawl API

    // States for local file reading and parsing for preview (optional, SCImago format)
    isReadingFile: boolean;
    fileReadError: string | null;
    scimagoPreviewData: ScimagoJournal[] | null; // Optional: if you want a local preview of SCImago structure

    // States for DB Check API (/check-import)
    isCheckingDB: boolean;
    checkDBError: string | null;
    parsedDataForSelectionTable: JournalWithStatus[] | null; // Data from DB Check for UI table
    dbCheckSummary: { // Summary from DB check
        totalProcessed?: number;
        totalExists?: number;
        totalNew?: number;
    } | null;
    dbCheckMessages: string[];


    // States for Backend Crawl API (/crawl-journals)
    isCrawlingBackend: boolean;
    crawlBackendError: string | null;
    crawlBackendProgress: BackendCrawlProgress;
    crawlBackendMessages: string[];

    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    startBackendCrawl: (selectedJournals: JournalWithStatus[]) => Promise<void>; // Modified to accept selected journals
    resetAll: () => void; // Renamed from resetCrawl
}

export const useJournalCrawl = (): UseJournalCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);
    const [parsedCsvData, setParsedCsvData] = useState<any[]>([]); // Store parsed CSV data

    const [isReadingFile, setIsReadingFile] = useState(false);
    const [fileReadError, setFileReadError] = useState<string | null>(null);
    const [scimagoPreviewData, setScimagoPreviewData] = useState<ScimagoJournal[] | null>(null);


    const [isCheckingDB, setIsCheckingDB] = useState(false);
    const [checkDBError, setCheckDBError] = useState<string | null>(null);
    const [parsedDataForSelectionTable, setParsedDataForSelectionTable] = useState<JournalWithStatus[] | null>(null);
    const [dbCheckSummary, setDbCheckSummary] = useState<UseJournalCrawlReturn['dbCheckSummary']>(null);
    const [dbCheckMessages, setDbCheckMessages] = useState<string[]>([]);

    const [isCrawlingBackend, setIsCrawlingBackend] = useState(false);
    const [crawlBackendError, setCrawlBackendError] = useState<string | null>(null);
    const [crawlBackendProgress, setCrawlBackendProgress] = useState<BackendCrawlProgress>({ status: 'idle' });
    const [crawlBackendMessages, setCrawlBackendMessages] = useState<string[]>([]);

    const resetAll = useCallback(() => {
        setFile(null);
        setRawCsvContent(null);
        setParsedCsvData([]); // Reset parsed data
        setIsReadingFile(false);
        setFileReadError(null);
        setScimagoPreviewData(null);

        setIsCheckingDB(false);
        setCheckDBError(null);
        setParsedDataForSelectionTable(null);
        setDbCheckSummary(null);
        setDbCheckMessages([]);

        setIsCrawlingBackend(false);
        setCrawlBackendError(null);
        setCrawlBackendProgress({ status: 'idle' });
        setCrawlBackendMessages([]);
        console.log("All journal states reset.");
    }, []);

    const readFileContentAndCheckDB = useCallback(async (selectedFile: File) => {
        setIsReadingFile(true);
        setFileReadError(null);
        setRawCsvContent(null);
        setParsedCsvData([]); // Reset parsed data
        setScimagoPreviewData(null); // Reset preview
        setDbCheckMessages(prev => [...prev, "Reading file..."]);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileContent = event.target?.result as string;
            if (!fileContent) {
                setFileReadError("Could not read file content.");
                setIsReadingFile(false);
                setDbCheckMessages(prev => [...prev, "Error: Could not read file content."]);
                return;
            }
            console.log('Raw file content length:', fileContent.length);
            setRawCsvContent(fileContent); // Store raw content for backend crawl
            setDbCheckMessages(prev => [...prev, `File read successfully (${fileContent.length} chars). Stored for backend crawl.`]);

            // Parse CSV and store the data
            Papa.parse(fileContent, {
                header: true,
                delimiter: ";",
                skipEmptyLines: true,
                transformHeader: header => header.trim(),
                transform: (value) => value.trim(),
                complete: (results) => {
                    if (results.data) {
                        console.log('CSV Parsing Results:', {
                            totalRows: results.data.length,
                            headers: results.meta.fields,
                            firstRow: results.data[0],
                            lastRow: results.data[results.data.length - 1]
                        });
                        setParsedCsvData(results.data);
                        setDbCheckMessages(prev => [...prev, `Parsed ${results.data.length} rows from CSV.`]);
                    }
                    if (results.errors.length > 0) {
                        console.error('CSV Parsing Errors:', results.errors);
                        setDbCheckMessages(prev => [...prev, `CSV parsing errors: ${results.errors.length} errors found.`]);
                    }
                },
                error: (error: Error) => {
                    console.error('CSV Parsing Error:', error);
                    setDbCheckMessages(prev => [...prev, `CSV parsing error: ${error.message}.`]);
                }
            });

            // Now, proceed with DB check API
            setIsReadingFile(false); // File reading part is done
            setIsCheckingDB(true);
            setCheckDBError(null);
            setParsedDataForSelectionTable(null);
            setDbCheckSummary(null);
            setDbCheckMessages(prev => [...prev, "Checking journals against database..."]);


            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await axios.post<DbCheckImportResponse>(API_DB_CHECK_ENDPOINT, formData, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' }
                });

                const data = response.data;
                if (data.results && Array.isArray(data.results)) {
                    const journalsForTable: JournalWithStatus[] = data.results.map((journal: DbCheckImportResult) => ({
                        // Map DbCheckImportResult to JournalWithStatus
                        Title: journal.title,
                        Issn: journal.issn,
                        Publisher: journal.publisher || '',
                        Type: journal.crawled ? 'Already in DB' : 'New to DB', // Or use journal.type
                        Country: journal.country || '',
                        Region: journal.region || '',
                        lastUpdated: journal.lastUpdated,
                        message: journal.message,
                        crawled: journal.crawled,
                        actionType: journal.crawled ? 'update' : 'crawl' // Default action
                    }));
                    setParsedDataForSelectionTable(journalsForTable);
                    setDbCheckSummary({
                        totalProcessed: data.totalProcessed,
                        totalExists: data.totalExists,
                        totalNew: data.totalNew
                    });
                    setDbCheckMessages(prev => [...prev, `Database check complete. ${journalsForTable.length} records processed.`]);
                } else {
                    throw new Error("DB check response data is not in the expected format or is empty.");
                }
            } catch (error: any) {
                const axiosError = error as AxiosError<any>;
                let errorMsg = `DB Check API Error: ${axiosError.message}`;
                if (axiosError.response) {
                    errorMsg = `DB Check API Error: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.response.data?.error || 'Server error'}`;
                }
                console.error("Error during DB check:", error);
                setCheckDBError(errorMsg);
                setDbCheckMessages(prev => [...prev, errorMsg]);
                setParsedDataForSelectionTable(null);
            } finally {
                setIsCheckingDB(false);
            }
        };
        reader.onerror = () => {
            setFileReadError(`Error reading file: ${reader.error?.message}`);
            setDbCheckMessages(prev => [...prev, `Error: Failed to read file - ${reader.error?.message}`]);
            setIsReadingFile(false);
        };
        reader.readAsText(selectedFile); // Read as text to get rawCsvContent

    }, []);


    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetAll();
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                setFileReadError("Invalid file type. Please select a CSV file.");
                setDbCheckMessages(["Error: Invalid file type. Please select a CSV file."]);
                setFile(null);
                return;
            }
            setFile(selectedFile);
            readFileContentAndCheckDB(selectedFile);
        } else {
            setFile(null);
        }
        if (event.target) event.target.value = ''; // Allow re-selecting the same file
    }, [resetAll, readFileContentAndCheckDB]);


    const startBackendCrawl = useCallback(async (selectedJournals: JournalWithStatus[]) => {
        if (!parsedCsvData.length) {
            const errorMsg = "Cannot start backend crawl: No parsed CSV data available.";
            console.warn(errorMsg);
            setCrawlBackendError(errorMsg);
            setCrawlBackendMessages(prev => [errorMsg, ...prev]);
            return;
        }
        if (isCrawlingBackend) {
            console.warn("Backend crawl already in progress.");
            return;
        }

        setIsCrawlingBackend(true);
        setCrawlBackendError(null);
        setCrawlBackendMessages([`Filtering and sending selected journal data to backend for crawling...`]);
        setCrawlBackendProgress({ status: 'crawling' });

        try {
            // Create a map of selected journals by their index in the original data
            const selectedJournalsByIndex = new Map(
                selectedJournals.map(journal => {
                    // Find the index of this journal in the original parsed CSV data
                    const index = parsedCsvData.findIndex(
                        (row: any) => {
                            // Check if the ISSNs match (handling multiple ISSNs)
                            const rowIssns = row.Issn.split(',').map((issn: string) => issn.trim());
                            const journalIssns = journal.Issn.split(',').map((issn: string) => issn.trim());
                            
                            // Check if any of the ISSNs match
                            const hasMatchingIssn = rowIssns.some((rowIssn: string) => 
                                journalIssns.some(journalIssn => journalIssn === rowIssn)
                            );
                            
                            // Also check the title as a backup
                            const hasMatchingTitle = row.Title.trim() === journal.Title.trim();
                            
                            return hasMatchingIssn || hasMatchingTitle;
                        }
                    );
                    
                    return [index.toString(), journal];
                })
            );

            // Filter the data to only include selected journals using their index
            const filteredData = parsedCsvData.filter((row: any, index: number) => 
                selectedJournalsByIndex.has(index.toString())
            );
            
            if (filteredData.length === 0) {
                throw new Error('No matching data found for selected journals');
            }

            if (filteredData.length !== selectedJournals.length) {
                console.warn(`Warning: Filtered data count (${filteredData.length}) doesn't match selected journals count (${selectedJournals.length})`);
            }

            // Convert filtered data back to CSV string
            const filteredCsv = Papa.unparse(filteredData, {
                delimiter: ";",
                header: true
            });

            const params = { dataSource: 'client' };

            const response = await axios.post<BackendCrawlApiResponse>(API_BACKEND_CRAWL_ENDPOINT, filteredCsv, {
                params: params,
                headers: { 'Content-Type': 'text/csv' },
                timeout: 600000 // 10 minutes
            });

            setCrawlBackendMessages(prev => [...prev, `Backend Crawl: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);

            if (response.data.error) {
                setCrawlBackendError(`Backend error: ${response.data.error}`);
                setCrawlBackendProgress({ status: 'error' });
            } else {
                setCrawlBackendProgress({ status: 'success' });
            }

        } catch (err) {
            const error = err as AxiosError<BackendCrawlApiResponse>;
            console.error(`API Error during Backend Crawl:`, error);
            let errorMessage = `Error during backend crawl: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlBackendError(errorMessage);
            setCrawlBackendMessages(prev => [...prev, `FAILED backend crawl. ${errorMessage}`]);
            setCrawlBackendProgress({ status: 'error' });
        } finally {
            setIsCrawlingBackend(false);
        }
    }, [parsedCsvData, isCrawlingBackend, API_BACKEND_CRAWL_ENDPOINT]);
    return {
        file,
        rawCsvContent,
        isReadingFile,
        fileReadError,
        scimagoPreviewData, // if you want to display this
        isCheckingDB,
        checkDBError,
        parsedDataForSelectionTable,
        dbCheckSummary,
        dbCheckMessages,
        isCrawlingBackend,
        crawlBackendError,
        crawlBackendProgress,
        crawlBackendMessages,
        handleFileChange,
        startBackendCrawl,
        resetAll,
    };
};