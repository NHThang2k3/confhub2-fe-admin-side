export interface Conference {
    id: string; // Crucial for AG Grid row identification and updates
    title: string;
    sources: string[];
    acronym: string;
    ranks: string[];
    researchFields: string[];
    status: string;
    updatedAt?: string | number | Date;
    link?: string;
    impLink?: string;
    cfpLink?: string;
    crawlType: 'crawl' | 'update'; // Non-optional, will be defaulted
}

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
    currentChunkData?: ConferenceForAction[]; // Changed from SendToCrawlConference
}

// Represents a conference item selected from the grid, along with its intended action
export interface ConferenceForAction {
    id: string; // From Conference.id
    Title: string;
    Acronym: string;
    crawlType: 'crawl' | 'update';
    link?: string;     // Original link from grid data (Conference.link)
    cfpLink?: string;  // Original cfpLink from grid data (Conference.cfpLink)
    impLink?: string;  // Original impLink from grid data (Conference.impLink)
    originalRequestId?: string; // If re-crawling specific items
}

// Type for the actual items sent in the API payload array
export type ConferenceApiPayloadItem =
    // For 'crawl'
    {
        Title: string;
        Acronym: string;
        originalRequestId?: string;
        
    } |
    // For 'update'
    {
        Title: string;
        Acronym: string;
        mainLink: string;       // Bắt buộc phải là string cho update
        cfpLink: string | null; // Bắt buộc phải có key, giá trị có thể là string hoặc null
        impLink: string | null; // Bắt buộc phải có key, giá trị có thể là string hoặc null
        originalRequestId?: string;
    };


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

// New interface for the overall request payload
export interface CrawlRequestPayload {
    description?: string;
    items: ConferenceApiPayloadItem[];
    models?: ApiModels;
    recordFile?: boolean;
}

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    apiModels: ApiModels;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    selectedCsvRows: ConferenceForAction[];
    selectedCsvRowsCount: number;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    setApiModel: (apiName: ApiName, model: CrawlModelType) => void;
    startCrawlFromCsv: (description?: string) => Promise<void>; // Modified signature
    startCrawlItems: (items: ConferenceForAction[], modelsToUse: ApiModels, description?: string) => Promise<void>; // Added description
    resetCrawl: () => void;
    onCsvSelectionChanged: (selectedRows: Conference[]) => void;
    updateActionTypeOfSelectedRows: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
    onRowSelectionChange: (selectedRows: Conference[]) => void;
}