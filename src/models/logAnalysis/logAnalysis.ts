// src/types/logAnalysis.types.ts

export interface RequestTimings {
    startTime: string | null;
    endTime: string | null;
    durationSeconds: number | null;
    status?: 'Completed' | 'Failed' | 'Processing' | 'PartiallyCompleted' | 'Unknown';
    originalRequestId?: string;
    // Tùy chọn:
    // processedConferencesInRequest?: number;
    // conferenceKeys?: string[];
}

export interface RequestLogData {
    logs: any[]; // Nên là kiểu cụ thể hơn nếu có thể, ví dụ: PinoLogEntry[]
    startTime: number | null; // Unix timestamp (milliseconds)
    endTime: number | null;   // Unix timestamp (milliseconds)
}

export interface ReadLogResult {
    requestsData: Map<string, RequestLogData>; // Key là batchRequestId
    totalEntries: number;
    parsedEntries: number;
    parseErrors: number;
    logProcessingErrors: string[]; // Mảng các thông báo lỗi trong quá trình xử lý log
}

export interface FilteredData {
    filteredRequests: Map<string, RequestLogData>; // Key là batchRequestId
    analysisStartMillis: number | null;
    analysisEndMillis: number | null;
}

/** Thông tin chi tiết về quá trình xử lý một conference cụ thể */
export interface ConferenceAnalysisDetail {
    batchRequestId: string;
    originalRequestId?: string;
    title: string;
    acronym: string;
    status: 'unknown' | 'processing' | 'processed_ok' | 'completed' | 'failed' | 'skipped';
    startTime: string | null; // ISO string
    endTime: string | null;   // ISO string
    durationSeconds: number | null;
    crawlEndTime?: string | null; // ISO string
    crawlSucceededWithoutError?: boolean | null;
    jsonlWriteSuccess?: boolean | null;
    csvWriteSuccess?: boolean | null;
    steps: {
        search_attempted: boolean;
        search_success: boolean | null;
        search_attempts_count: number;
        search_results_count: number | null;
        search_filtered_count: number | null;

        html_save_attempted: boolean;
        html_save_success: boolean | 'skipped' | null;
        link_processing_attempted_count: number;
        link_processing_success_count: number;
        link_processing_failed_details: Array<{
            timestamp: string; // ISO string
            url?: string;
            error?: string;
            event?: string;
        }>;

        gemini_determine_attempted: boolean;
        gemini_determine_success: boolean | null;
        gemini_determine_cache_used: boolean | null;
        gemini_extract_attempted: boolean;
        gemini_extract_success: boolean | null;
        gemini_extract_cache_used: boolean | null;
        gemini_cfp_attempted?: boolean;
        gemini_cfp_success?: boolean | null;
        gemini_cfp_cache_used?: boolean | null;
    };
    errors: Array<{ timestamp: string; message: string; details?: any }>; // ISO string for timestamp
    validationIssues?: Array<{
        field: string;
        value: any;
        action: string;
        normalizedTo?: any;
        timestamp: string; // ISO string
    }>;
    finalResultPreview?: any;
    finalResult?: any;
}

export interface PlaywrightAnalysis {
    setupAttempts: number;
    setupSuccess: boolean | null;
    setupError: boolean | string | null; // Có thể là string chứa thông báo lỗi
    contextErrors: number;

    htmlSaveAttempts: number;
    successfulSaveInitiations: number;
    failedSaves: number;
    skippedSaves: number;

    linkProcessing: {
        totalLinksAttempted: number;
        successfulAccess: number;
        failedAccess: number;
        redirects: number;
    };

    otherFailures: number;
    errorsByType: { [normalizedErrorKey: string]: number };
}

// Interface GeminiApiAnalysis đã được cập nhật chi tiết
export interface GeminiApiAnalysis {
    // --- Call Stats ---
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;

    callsByType: { [apiType: string]: number };
    callsByModel: { [modelName: string]: number }; // Model chung, không phân biệt tuned/non-tuned

    // --- Retry Stats ---
    totalRetries: number;
    retriesByType: { [apiType: string]: number };
    retriesByModel: { [modelName: string]: number }; // Model chung

    // --- Model Usage by API Type and Crawl Model ---
    modelUsageByApiType: {
        [apiType: string]: { // 'extract', 'determine', 'cfp'
            [modelIdentifier: string]: { // e.g., "gemini-pro (non-tuned)", "models/my-tuned-model (tuned)"
                calls: number;
                retries: number;
                successes: number;
                failures: number;
                tokens: number;
                safetyBlocks: number;
            };
        };
    };

    // --- Token Usage ---
    totalTokens: number;

    // --- Error & Limit Stats ---
    blockedBySafety: number;
    rateLimitWaits: number;
    intermediateErrors: number;
    errorsByType: { [normalizedErrorKey: string]: number };

    // --- Service Initialization ---
    serviceInitialization: {
        starts: number;
        completes: number;
        failures: number;
        lazyAttempts: number;
        criticallyUninitialized: number;
    };
    apiCallSetupFailures: number;

    // --- Fallback Logic ---
    fallbackLogic: {
        attemptsWithFallbackModel: number;
        successWithFallbackModel: number;
        primaryModelFailuresLeadingToFallback: number;
        noFallbackConfigured: number;
        failedAfterFallbackAttempts: number;
    };

    // --- Few-Shot Preparation ---
    fewShotPreparation: {
        attempts: number;
        successes: number;
        failures: {
            oddPartsCount: number;
            processingError: number;
        };
        warnings: {
            missingInput: number;
            missingOutput: number;
            emptyResult: number;
        };
        configuredButNoData: number;
        disabledByConfig: number;
    };

    // --- Request Payload Logging ---
    requestPayloadLogging: {
        successes: number;
        failures: number;
    };

    // --- Generate Content (model.generateContent() calls) ---
    generateContentInternal: {
        attempts: number;
        successes: number;
    };

    // --- Cache Specifics ---
    cacheContextHits: number;
    cacheContextAttempts: number; // getOrCreate
    cacheContextMisses: number;
    cacheContextCreationSuccess: number;
    cacheContextCreationFailed: number;
    cacheContextInvalidations: number;
    cacheContextRetrievalFailures: number;
    cacheMapLoadFailures: number;
    cacheMapLoadSuccess?: boolean | null; // Có thể là null nếu chưa có event load
    cacheMapWriteSuccessCount: number;
    cacheMapWriteFailures: number;
    // cacheManagerCreateFailures đã được tính trong serviceInitialization.failures hoặc apiCallSetupFailures

    // --- Config Errors ---
    configErrors: {
        modelListMissing: number;
        // Lỗi từ fewShotPreparation.failures cũng có thể được coi là config error
    };
}


export interface GoogleSearchAnalysis {
    totalRequests: number;
    successfulSearches: number;
    failedSearches: number;
    skippedSearches: number;
    quotaErrors: number; // Có thể deprecated, dùng quotaErrorsEncountered
    keyUsage: { [apiKey: string]: number };
    errorsByType: { [normalizedErrorKey: string]: number };
    attemptIssues: number; // Tổng các lỗi "attempt_issue"
    attemptIssueDetails: Record<string, number>; // Chi tiết các loại "attempt_issue"
    quotaErrorsEncountered: number; // Tổng số lần gặp lỗi quota
    malformedResultItems: number;
    successfulSearchesWithNoItems: number;
    apiKeyLimitsReached: number; // Số lần tất cả API keys đều hết hạn ngạch (chung)
    keySpecificLimitsReached: Record<string, number>; // Số lần từng API key cụ thể hết hạn ngạch
    apiKeysProvidedCount: number;
    allKeysExhaustedEvents_GetNextKey: number; // Số lần event "all_keys_exhausted" khi gọi getNextKey
    allKeysExhaustedEvents_StatusCheck: number; // Số lần event "all_keys_exhausted" khi kiểm tra trạng thái
    apiKeyRotationsSuccess: number;
    apiKeyRotationsFailed: number;
}

export interface GoogleSearchHealthData {
  rotationsSuccess: number;
  rotationsFailed: number;
  allKeysExhaustedOnGetNextKey: number;
  maxUsageLimitsReachedTotal: number;
  successfulSearchesWithNoItems: number;
}

export interface BatchProcessingAnalysis {
    totalBatchesAttempted: number;
    successfulBatches: number;
    failedBatches: number;
    apiFailures: number;
    fileSystemFailures: number;
    logicRejections: number;
    aggregatedResultsCount: number | null;
    determineApiFailures: number;
    extractApiFailures: number;
    cfpApiFailures: number;
    apiResponseParseFailures: number;
}

export interface FileOutputAnalysis {
    jsonlRecordsSuccessfullyWritten: number;
    jsonlWriteErrors: number;
    csvFileGenerated: boolean | null;
    csvRecordsAttempted: number;
    csvRecordsSuccessfullyWritten: number;
    csvWriteErrors: number;
    csvOrphanedSuccessRecords: number;
    csvPipelineFailures: number;
}

export interface OverallAnalysis {
    startTime: string | null; // ISO string
    endTime: string | null;   // ISO string
    durationSeconds: number | null;
    totalConferencesInput: number;
    processedConferencesCount: number; // Số conference có ít nhất một log entry liên quan đến xử lý (không chỉ là input)
    completedTasks: number; // Số conference có status 'completed'
    failedOrCrashedTasks: number; // Số conference có status 'failed'
    processingTasks: number; // Số conference có status 'processing' (có thể chưa kết thúc)
    skippedTasks?: number; // Số conference có status 'skipped'
    successfulExtractions: number; // Số conference mà bước gemini_extract_success là true
}

export interface ValidationStats {
    totalValidationWarnings: number;
    warningsByField: { [fieldName: string]: number };
    totalNormalizationsApplied: number;
    normalizationsByField: { [fieldName: string]: number };
}

/** Cấu trúc kết quả phân tích log tổng thể và chi tiết theo conference */
export interface LogAnalysisResult {
    analysisTimestamp: string; // ISO string
    logFilePath: string;
    status?: 'Completed' | 'Failed' | 'Processing';
    errorMessage?: string;

    filterRequestId?: string;
    analyzedRequestIds: string[];

    requests: {
        [batchRequestId: string]: RequestTimings;
    };

    totalLogEntries: number;
    parsedLogEntries: number;
    parseErrors: number;
    errorLogCount: number; // Tổng số log entry có level 'error'
    fatalLogCount: number; // Tổng số log entry có level 'fatal'

    googleSearch: GoogleSearchAnalysis;
    playwright: PlaywrightAnalysis;
    geminiApi: GeminiApiAnalysis;
    batchProcessing: BatchProcessingAnalysis;
    fileOutput: FileOutputAnalysis;
    validationStats: ValidationStats;

    overall: OverallAnalysis;

    errorsAggregated: { [normalizedErrorKey: string]: number }; // Tổng hợp tất cả các lỗi từ các module
    logProcessingErrors: string[]; // Mảng các thông báo lỗi trong quá trình phân tích log (không phải lỗi từ app)

    conferenceAnalysis: {
        [compositeKeyIncludingBatchRequestId: string]: ConferenceAnalysisDetail;
    };
}

// Hàm khởi tạo giá trị ban đầu cho từng phần của analysis
export const getInitialOverallAnalysis = (): OverallAnalysis => ({
    startTime: null,
    endTime: null,
    durationSeconds: null,
    totalConferencesInput: 0,
    processedConferencesCount: 0,
    completedTasks: 0,
    failedOrCrashedTasks: 0,
    processingTasks: 0,
    skippedTasks: 0,
    successfulExtractions: 0,
});

export const getInitialGoogleSearchAnalysis = (): GoogleSearchAnalysis => ({
    totalRequests: 0,
    successfulSearches: 0,
    failedSearches: 0,
    skippedSearches: 0,
    quotaErrors: 0,
    keyUsage: {},
    errorsByType: {},
    attemptIssues: 0,
    attemptIssueDetails: {},
    quotaErrorsEncountered: 0,
    malformedResultItems: 0,
    successfulSearchesWithNoItems: 0,
    apiKeyLimitsReached: 0,
    keySpecificLimitsReached: {},
    apiKeysProvidedCount: 0,
    allKeysExhaustedEvents_GetNextKey: 0,
    allKeysExhaustedEvents_StatusCheck: 0,
    apiKeyRotationsSuccess: 0,
    apiKeyRotationsFailed: 0,
});

export const getInitialPlaywrightAnalysis = (): PlaywrightAnalysis => ({
    setupAttempts: 0,
    setupSuccess: null,
    setupError: null,
    contextErrors: 0,
    htmlSaveAttempts: 0,
    successfulSaveInitiations: 0,
    failedSaves: 0,
    skippedSaves: 0,
    linkProcessing: {
        totalLinksAttempted: 0,
        successfulAccess: 0,
        failedAccess: 0,
        redirects: 0,
    },
    otherFailures: 0,
    errorsByType: {},
});

export const getInitialGeminiApiAnalysis = (): GeminiApiAnalysis => ({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    callsByType: {},
    callsByModel: {},
    totalRetries: 0,
    retriesByType: {},
    retriesByModel: {},
    modelUsageByApiType: {},
    totalTokens: 0,
    blockedBySafety: 0,
    rateLimitWaits: 0,
    intermediateErrors: 0,
    errorsByType: {},
    serviceInitialization: {
        starts: 0,
        completes: 0,
        failures: 0,
        lazyAttempts: 0,
        criticallyUninitialized: 0,
    },
    apiCallSetupFailures: 0,
    fallbackLogic: {
        attemptsWithFallbackModel: 0,
        successWithFallbackModel: 0,
        primaryModelFailuresLeadingToFallback: 0,
        noFallbackConfigured: 0,
        failedAfterFallbackAttempts: 0,
    },
    fewShotPreparation: {
        attempts: 0,
        successes: 0,
        failures: { oddPartsCount: 0, processingError: 0 },
        warnings: { missingInput: 0, missingOutput: 0, emptyResult: 0 },
        configuredButNoData: 0,
        disabledByConfig: 0,
    },
    requestPayloadLogging: { successes: 0, failures: 0 },
    generateContentInternal: { attempts: 0, successes: 0 },
    cacheContextHits: 0,
    cacheContextAttempts: 0,
    cacheContextMisses: 0,
    cacheContextCreationSuccess: 0,
    cacheContextCreationFailed: 0,
    cacheContextInvalidations: 0,
    cacheContextRetrievalFailures: 0,
    cacheMapLoadFailures: 0,
    cacheMapLoadSuccess: null,
    cacheMapWriteSuccessCount: 0,
    cacheMapWriteFailures: 0,
    configErrors: {
        modelListMissing: 0,
    },
});

export const getInitialBatchProcessingAnalysis = (): BatchProcessingAnalysis => ({
    totalBatchesAttempted: 0,
    successfulBatches: 0,
    failedBatches: 0,
    apiFailures: 0,
    fileSystemFailures: 0,
    logicRejections: 0,
    aggregatedResultsCount: null,
    determineApiFailures: 0,
    extractApiFailures: 0,
    cfpApiFailures: 0,
    apiResponseParseFailures: 0,
});

export const getInitialFileOutputAnalysis = (): FileOutputAnalysis => ({
    jsonlRecordsSuccessfullyWritten: 0,
    jsonlWriteErrors: 0,
    csvFileGenerated: null,
    csvRecordsAttempted: 0,
    csvRecordsSuccessfullyWritten: 0,
    csvWriteErrors: 0,
    csvOrphanedSuccessRecords: 0,
    csvPipelineFailures: 0,
});

export const getInitialValidationStats = (): ValidationStats => ({
    totalValidationWarnings: 0,
    warningsByField: {},
    totalNormalizationsApplied: 0,
    normalizationsByField: {},
});

// Hàm khởi tạo cho toàn bộ LogAnalysisResult
export const getInitialLogAnalysisResult = (logFilePath: string = "N/A"): LogAnalysisResult => ({
    analysisTimestamp: new Date().toISOString(),
    logFilePath: logFilePath,
    status: 'Processing', // Mặc định khi bắt đầu
    errorMessage: undefined,
    filterRequestId: undefined,
    analyzedRequestIds: [],
    requests: {},
    totalLogEntries: 0,
    parsedLogEntries: 0,
    parseErrors: 0,
    errorLogCount: 0,
    fatalLogCount: 0,
    googleSearch: getInitialGoogleSearchAnalysis(),
    playwright: getInitialPlaywrightAnalysis(),
    geminiApi: getInitialGeminiApiAnalysis(),
    batchProcessing: getInitialBatchProcessingAnalysis(),
    fileOutput: getInitialFileOutputAnalysis(),
    validationStats: getInitialValidationStats(),
    overall: getInitialOverallAnalysis(),
    errorsAggregated: {},
    logProcessingErrors: [],
    conferenceAnalysis: {},
});