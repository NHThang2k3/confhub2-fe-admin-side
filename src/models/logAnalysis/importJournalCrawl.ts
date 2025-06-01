// src/models/logAnalysis/importJournalCrawl.ts

// Interface matching the CSV structure for Journals
// Using string types for flexibility, backend can handle parsing/conversion
export interface Journal {
    Title: string;
    Type: string;
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

// Re-export or redefine shared interfaces if needed, or import from a common location
export interface ApiCrawlResponse {
    message: string;
    runtime?: number;
    data?: any;
    error?: string;
}

export interface JournalCsvImportResult {
    title: string;
    issn: string;
    crawled: boolean;
    message: string;
    lastUpdated: string | null;
}

export interface JournalCsvImportResponse {
    results: JournalCsvImportResult[];
    totalProcessed: number;
    totalExists: number;
    totalNew: number;
}

export interface CrawlProgress {
    status: 'idle' | 'crawling' | 'success' | 'error' | 'stopped';
    current?: number;
    total?: number;
}