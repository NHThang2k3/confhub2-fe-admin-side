// src/models/logAnalysis/importJournalCrawl.ts

// Interface matching the CSV structure for Journals
// Using string types for flexibility, backend can handle parsing/conversion
export interface Journal {
    Rank: string;
    Sourceid: string;
    Title: string;
    Type: string;
    Issn: string;
    SJR: string; // Keep as string due to potential comma as decimal separator
    'SJR Best Quartile': string; // Use quotes for keys with spaces/special chars
    'H index': string;
    'Total Docs. (2023)': string;
    'Total Docs. (3years)': string;
    'Total Refs.': string;
    'Total Cites (3years)': string;
    'Citable Docs. (3years)': string;
    'Cites / Doc. (2years)': string; // Keep as string due to potential comma
    'Ref. / Doc.': string; // Keep as string due to potential comma
    '%Female': string; // Keep as string due to potential comma
    Overton: string; // Assuming string, adjust if known otherwise
    SDG: string;     // Assuming string, adjust if known otherwise
    Country: string;
    Region: string;
    Publisher: string;
    Coverage: string;
    Categories: string;
    Areas: string;
}

// Re-export or redefine shared interfaces if needed, or import from a common location
export interface ApiCrawlResponse {
    message: string;
    runtime?: number;
    data?: any;
    error?: string;
}

export interface CrawlProgress {
    current: number;
    total: number;
    status: 'idle' | 'parsing' | 'crawling' | 'success' | 'error' | 'stopped';
    currentChunkData?: Journal[]; // Use Journal type here
}