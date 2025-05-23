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

// This was previously SendToCrawlConference, renamed for clarity if needed elsewhere,
// but ConferenceForAction is more descriptive for the hook's selected items.
// For simplicity, we'll primarily use ConferenceForAction in the hook.