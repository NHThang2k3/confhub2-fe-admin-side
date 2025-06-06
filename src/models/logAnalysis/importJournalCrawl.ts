// src/models/logAnalysis/importJournalCrawl.ts

// --- From OLD version (for SCImago CSV and Backend Crawl API) ---
export interface ScimagoJournal { // Renamed to avoid conflict if new Journal is very different
    Rank: string;
    Sourceid: string;
    Title: string;
    Type: string;
    Issn: string;
    SJR: string;
    'SJR Best Quartile': string;
    'H index': string;
    'Total Docs. (2024)': string;
    'Total Docs. (3years)': string;
    'Total Refs.': string;
    'Total Cites (3years)': string;
    'Citable Docs. (3years)': string;
    'Cites / Doc. (2years)': string;
    'Ref. / Doc.': string;
    '%Female': string;
    Overton: string;
    SDG: string;
    Country: string;
    Region: string;
    Publisher: string;
    Coverage: string;
    Categories: string;
    Areas: string;
}

export interface BackendCrawlApiResponse { // Renamed from ApiCrawlResponse
    message: string;
    runtime?: number;
    data?: any; // Or ScimagoJournal[] if backend returns parsed data
    error?: string;
}

export interface BackendCrawlProgress { // Renamed from CrawlProgress
    status: 'idle' | 'crawling' | 'success' | 'error' | 'stopped';
    // Old version simplified progress, so current/total might not be used for this specific call
    // current?: number;
    // total?: number;
    // currentChunkData?: ScimagoJournal[];
}


// --- From NEW version (for DB Check/Import API and UI Selection) ---
export interface Journal { // This is the new Journal structure
    Title: string;
    Type: string; // e.g., "Crawled", "Not Crawled" from DB check
    Issn: string;
    Publisher: string;
    Country: string;
    Region: string;
    Image?: string;
    Image_Context?: string;
    SJR?: number;
    Coverage?: string;
    Scope?: string;
    Information?: {
        Homepage?: string;
        'How to publish in this journal'?: string;
        Mail?: string;
    };
    Areas?: string;
    'Subject Area and Category'?: {
        Topics?: string[];
    };
    SupplementaryTable?: Array<{
        Year: string;
        Quartile: string;
        Category: string;
    }>;
    bioxbio?: Array<{
        Year: string;
        Impact_factor: string;
    }>;
    Thumbnail?: string;
}

// Extended Journal interface for the DB check API response data
export interface JournalWithStatus extends Journal {
    lastUpdated: string | null;
    message: string; // Message from DB check
    actionType?: 'crawl' | 'update'; // UI-driven action type
    crawled: boolean; // From DB check
}

export interface DbCheckImportResult { // Renamed from JournalCsvImportResult
    title: string;
    issn: string;
    crawled: boolean; // Whether it's already in DB and crawled
    message: string;
    lastUpdated: string | null;
    // Include other fields from the new Journal interface if the DB check API returns them
    publisher?: string;
    country?: string;
    region?: string;
    type?: string;
}

export interface DbCheckImportResponse { // Renamed from JournalCsvImportResponse
    results: DbCheckImportResult[];
    totalProcessed: number;
    totalExists: number;
    totalNew: number; // Or similar summary stats from DB check
}

// This progress can be for the DB check operation if it's a single step,
// or could be a more generic UI progress.
// The new hook had a specific structure for this.
export interface UiProgress {
    status: 'idle' | 'parsing' | 'checking_db' | 'db_success' | 'db_error' | 'stopped';
    totalProcessed?: number; // From DbCheckImportResponse
    totalExists?: number;   // From DbCheckImportResponse
    totalNew?: number;      // From DbCheckImportResponse
}