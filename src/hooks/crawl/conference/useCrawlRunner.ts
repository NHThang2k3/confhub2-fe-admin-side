// src/hooks/crawl/conference/useCrawlRunner.ts
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {
    ApiCrawlResponse,
    CrawlProgress,
    ConferenceForAction,
    ConferenceApiPayloadItem,
    CrawlRequestPayload, // <<< IMPORT TYPE NÀY
} from '../../../models/logAnalysis/importConferenceCrawl';
import { ApiModels } from '@/src/models/logAnalysis/crawl.types';
import { chunkArray } from '../../../utils/utils';
import { API_CONFERENCE_ENDPOINT, MAX_ITEMS_PER_CRAWL_REQUEST } from '../constants';

const API_STOP_CRAWL_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/v1/crawl-conferences/stop`;

type ApiCrawlAcceptedResponse = {
    message: string;
    batchRequestId: string;
    description?: string;
};

type CrawlController = {
    chunks: ConferenceForAction[][];
    currentIndex: number;
    models: ApiModels;
    description: string | undefined;
    chunkDelay: number;
    recordFile?: boolean; // <<< THÊM VÀO CONTROLLER
    isSubmitting: boolean;
};

export const useCrawlRunner = () => {
    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);
    const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const intervalIdRef = useRef<number | null>(null);
    const crawlControllerRef = useRef<CrawlController | null>(null);

    const addCrawlMessage = useCallback((message: string) => {
        setCrawlMessages(prev => [message, ...prev.slice(0, 49)]);
    }, []);

    const sendApiRequest = useCallback(async (
        items: ConferenceForAction[],
        modelsForRequest: ApiModels,
        batchContextDescription: string,
        overallRequestDescription?: string,
        recordFile?: boolean // <<< THÊM THAM SỐ
    ): Promise<{ success: boolean; batchId: string | null }> => {
        const apiPayloadItems: ConferenceApiPayloadItem[] = [];
        for (const item of items) {
            const commonPayload = { Title: item.Title, Acronym: item.Acronym, originalRequestId: item.originalRequestId };
            if (item.crawlType === 'update') {
                if (item.link && item.link.trim() !== '') {
                    apiPayloadItems.push({ ...commonPayload, mainLink: item.link, cfpLink: (item.cfpLink && item.cfpLink.trim() !== '') ? item.cfpLink : null, impLink: (item.impLink && item.impLink.trim() !== '') ? item.impLink : null });
                } else {
                    addCrawlMessage(`WARNING: Conference "${item.Acronym}" marked for UPDATE but is missing 'link'. Sending as CRAWL.`);
                    apiPayloadItems.push({ ...commonPayload });
                }
            } else {
                apiPayloadItems.push({ ...commonPayload });
            }
        }
        if (apiPayloadItems.length === 0) {
            if (items.length > 0) addCrawlMessage(`No valid items to send for "${batchContextDescription}".`);
            return { success: items.length === 0, batchId: null };
        }

        // Xây dựng payload
        const payload: CrawlRequestPayload = {
            items: apiPayloadItems,
            models: modelsForRequest,
        };
        if (overallRequestDescription) {
            payload.description = overallRequestDescription;
        }
        // <<< LOGIC MỚI: Thêm recordFile vào payload nếu nó là true
        if (recordFile === true) {
            payload.recordFile = true;
        }

        try {
            const response = await axios.post<ApiCrawlAcceptedResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: { dataSource: 'client' },
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
            addCrawlMessage(`Batch submitted: ${response.data.message}`);
            return { success: true, batchId: response.data.batchRequestId };
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            let errorMessage = `Error submitting batch: ${error.message}`;
            if (error.response) errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || 'Unknown'})`;
            setCrawlError(errorMessage);
            addCrawlMessage(`FAILED to submit batch. Details: ${errorMessage}`);
            return { success: false, batchId: null };
        }
    }, [addCrawlMessage]);

    const clearTimers = useCallback(() => {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        if (intervalIdRef.current) clearInterval(intervalIdRef.current);
        timeoutIdRef.current = null;
        intervalIdRef.current = null;
        setCountdown(0);
    }, []);

    useEffect(() => () => clearTimers(), [clearTimers]);

    const resumeCrawl = useCallback(async (numChunks: number = 1) => {
        const controller = crawlControllerRef.current;
        if (!controller || controller.isSubmitting) return;

        controller.isSubmitting = true;
        setIsPaused(false);
        clearTimers();

        for (let i = 0; i < numChunks; i++) {
            if (controller.currentIndex >= controller.chunks.length) {
                addCrawlMessage("No more batches to submit.");
                break;
            }

            const chunkIndex = controller.currentIndex;
            const chunk = controller.chunks[chunkIndex];

            addCrawlMessage(`Submitting Batch ${chunkIndex + 1}/${controller.chunks.length}...`);
            setCrawlProgress(prev => ({ ...prev, current: chunkIndex + 1 }));

            // <<< TRUYỀN recordFile từ controller vào sendApiRequest
            const { success, batchId } = await sendApiRequest(
                chunk,
                controller.models,
                `Batch ${chunkIndex + 1}/${controller.chunks.length}`,
                controller.description,
                controller.recordFile
            );

            if (chunkIndex === 0 && batchId && !currentBatchId) {
                setCurrentBatchId(batchId);
            }

            if (!success) {
                setCrawlError("Failed to submit a batch. Process halted.");
                setIsCrawling(false);
                setIsPaused(false);
                crawlControllerRef.current = null;
                return;
            }
            controller.currentIndex++;
        }

        if (controller.currentIndex < controller.chunks.length) {
            setIsPaused(true);
            addCrawlMessage(`Submission paused. Waiting for next action or timeout.`);
            let count = controller.chunkDelay;
            setCountdown(count);
            intervalIdRef.current = setInterval(() => setCountdown(prev => Math.max(0, prev - 1)), 1000) as any as number;
            timeoutIdRef.current = setTimeout(() => resumeCrawl(1), controller.chunkDelay * 1000);
        } else {
            addCrawlMessage("All batches have been successfully submitted to the backend for processing.");
            addCrawlMessage("You can now monitor the progress on the Analysis page.");
            setIsCrawling(false);
            setIsPaused(false);
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
            crawlControllerRef.current = null;
        }

        if (crawlControllerRef.current) {
            controller.isSubmitting = false;
        }
    }, [currentBatchId, sendApiRequest, addCrawlMessage, clearTimers]);

    const stopCrawlProcess = useCallback(async () => {
        // ... (logic hàm này giữ nguyên)
        clearTimers();
        crawlControllerRef.current = null;
        setIsPaused(false);
        setIsCrawling(false);
        setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));

        if (currentBatchId) {
            addCrawlMessage(`Sending stop request for batch: ${currentBatchId}...`);
            try {
                await axios.post(API_STOP_CRAWL_ENDPOINT, { batchRequestId: currentBatchId });
                addCrawlMessage(`Successfully sent stop signal to backend.`);
            } catch (err) {
                const error = err as AxiosError<{ message?: string }>;
                addCrawlMessage(`ERROR: Failed to send stop signal. ${error.message}`);
            }
        } else {
            addCrawlMessage(`Crawl submission halted. No process was active on the backend.`);
        }
    }, [currentBatchId, addCrawlMessage, clearTimers]);

    const processCrawlRequest = useCallback(async (
        itemsToCrawl: ConferenceForAction[],
        modelsToUse: ApiModels,
        enableChunking: boolean,
        chunkSize: number,
        chunkDelayInSeconds: number,
        recordFile: boolean, // <<< THÊM THAM SỐ MỚI
        sourceDescription: string,
        userProvidedDescription?: string
    ) => {
        if (isCrawling) return;

        setIsCrawling(true);
        setIsPaused(false);
        setCrawlError(null);
        setCurrentBatchId(null);
        clearTimers();

        addCrawlMessage(`Preparing to process ${itemsToCrawl.length} items...`);
        const useMultipleBatches = enableChunking || itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST;

        if (useMultipleBatches) {
            const effectiveChunkSize = enableChunking ? chunkSize : MAX_ITEMS_PER_CRAWL_REQUEST;
            const chunks = chunkArray(itemsToCrawl, effectiveChunkSize);
            setCrawlProgress({ current: 0, total: chunks.length, status: 'crawling' });

            if (chunks.length <= 1) {
                addCrawlMessage("All items will be submitted in a single batch.");
                setCrawlProgress({ current: 1, total: 1, status: 'crawling' });
                // <<< TRUYỀN recordFile
                const { success, batchId } = await sendApiRequest(itemsToCrawl, modelsToUse, `Batch (all items)`, userProvidedDescription, recordFile);
                if (success && batchId) {
                    setCurrentBatchId(batchId);
                    addCrawlMessage("All items have been successfully submitted in a single batch.");
                    addCrawlMessage("You can now monitor the progress on the Analysis page.");
                    setIsCrawling(false);
                    setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                } else {
                    setIsCrawling(false);
                    setCrawlProgress(prev => ({ ...prev, status: 'error' }));
                }
            } else {
                // Thiết lập bộ điều khiển, bao gồm cả recordFile
                crawlControllerRef.current = {
                    chunks,
                    currentIndex: 0,
                    models: modelsToUse,
                    description: userProvidedDescription,
                    chunkDelay: chunkDelayInSeconds,
                    recordFile: recordFile, // <<< LƯU VÀO CONTROLLER
                    isSubmitting: false,
                };
                resumeCrawl(1);
            }
        } else {
            // <<< TRUYỀN recordFile
            const { success, batchId } = await sendApiRequest(itemsToCrawl, modelsToUse, `Batch (all items)`, userProvidedDescription, recordFile);
            if (success && batchId) {
                setCurrentBatchId(batchId);
                addCrawlMessage("All items have been successfully submitted in a single batch.");
                addCrawlMessage("You can now monitor the progress on the Analysis page.");
                setIsCrawling(false);
                setCrawlProgress({ current: 1, total: 1, status: 'success' });
            } else {
                setIsCrawling(false);
                setCrawlProgress({ current: 1, total: 1, status: 'error' });
            }
        }
    }, [isCrawling, sendApiRequest, addCrawlMessage, clearTimers, resumeCrawl]);

    const reset = useCallback(() => {
        // ... (logic hàm này giữ nguyên)
        clearTimers();
        crawlControllerRef.current = null;
        setIsCrawling(false);
        setIsPaused(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        setCurrentBatchId(null);
        setCountdown(0);
    }, [clearTimers]);

    return {
        isCrawling,
        isPaused,
        countdown,
        crawlError,
        crawlProgress,
        crawlMessages,
        processCrawlRequest,
        resumeCrawl,
        stopCrawlProcess,
        addCrawlMessage,
        reset,
    };
};