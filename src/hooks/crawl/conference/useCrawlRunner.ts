// src/hooks/crawl/conference/useCrawlRunner.ts
'use client';
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import {
    ApiCrawlResponse,
    CrawlProgress,
    ConferenceForAction,
    ConferenceApiPayloadItem,
} from '../../../models/logAnalysis/importConferenceCrawl';
import { ApiModels } from '@/src/models/logAnalysis/crawl.types';
import { CrawlRequestPayload } from '../../../models/logAnalysis/importConferenceCrawl';
import { chunkArray } from '../../../utils/arrayUtils';
import { API_CONFERENCE_ENDPOINT, MAX_ITEMS_PER_CRAWL_REQUEST } from '../constants';

export const useCrawlRunner = () => {
    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const addCrawlMessage = useCallback((message: string) => {
        setCrawlMessages(prev => [message, ...prev.slice(0, 49)]); // Keep last 50 messages
    }, []);

    const sendApiRequest = useCallback(async (
        items: ConferenceForAction[],
        modelsForRequest: ApiModels,
        batchContextDescription: string,
        overallRequestDescription?: string
    ): Promise<boolean> => {
        const apiPayloadItems: ConferenceApiPayloadItem[] = [];
        for (const item of items) {
            const commonPayload = { Title: item.Title, Acronym: item.Acronym, originalRequestId: item.originalRequestId };
            if (item.crawlType === 'update') {
                if (item.link && item.link.trim() !== '') {
                    apiPayloadItems.push({ ...commonPayload, mainLink: item.link, cfpLink: (item.cfpLink && item.cfpLink.trim() !== '') ? item.cfpLink : null, impLink: (item.impLink && item.impLink.trim() !== '') ? item.impLink : null });
                } else {
                    const warningMsg = `Conference "${item.Acronym}" (${item.Title}) marked for UPDATE but is missing 'link'. Sending as CRAWL.`;
                    console.warn(warningMsg);
                    addCrawlMessage(warningMsg);
                    apiPayloadItems.push({ ...commonPayload });
                }
            } else {
                apiPayloadItems.push({ ...commonPayload });
            }
        }

        if (apiPayloadItems.length === 0) {
            if (items.length > 0) addCrawlMessage(`No valid items to send for "${batchContextDescription}" after processing action types.`);
            return items.length === 0;
        }

        const payload: CrawlRequestPayload = { items: apiPayloadItems, models: modelsForRequest };
        if (overallRequestDescription) payload.description = overallRequestDescription;

        const modelDesc = `(Models: DL-${modelsForRequest.determineLinks?.[0]}, EI-${modelsForRequest.extractInfo?.[0]}, EC-${modelsForRequest.extractCfp?.[0]})`;
        let logEntryPrefix = batchContextDescription;
        if (overallRequestDescription) logEntryPrefix = `Req: "${overallRequestDescription}" (${batchContextDescription})`;

        try {
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: { dataSource: 'client' },
                headers: { 'Content-Type': 'application/json' },
                timeout: 7200000 // 2 hours
            });
            console.log(`${logEntryPrefix} ${modelDesc} - Response Status:`, response.status, response.data);
            addCrawlMessage(`${logEntryPrefix} ${modelDesc}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`);
            return true;
        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${logEntryPrefix} ${modelDesc}:`, error);
            let errorMessage = `Error sending ${logEntryPrefix} ${modelDesc}: ${error.message}`;
            if (error.response) errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            else if (error.request) errorMessage += ' (No response received from server)';
            setCrawlError(errorMessage);
            addCrawlMessage(`FAILED to send ${logEntryPrefix} ${modelDesc}. Details: ${errorMessage}`);
            return false;
        }
    }, [addCrawlMessage]);

    const processCrawlRequest = useCallback(async (
        itemsToCrawl: ConferenceForAction[],
        modelsToUse: ApiModels,
        enableChunking: boolean,
        chunkSize: number,
        sourceDescription: string,
        userProvidedDescription?: string
    ) => {
        if (itemsToCrawl.length === 0) {
            const msg = `No items from "${sourceDescription}" to process.`;
            setCrawlError(msg);
            addCrawlMessage(msg);
            setIsCrawling(false);
            return;
        }

        if (!Object.values(modelsToUse).every(model => model !== null)) {
            const missingModels = Object.entries(modelsToUse).filter(([, model]) => model === null).map(([apiName]) => apiName).join(', ');
            const errorMsg = `Model selection incomplete. Please select a model for: ${missingModels}.`;
            setCrawlError(errorMsg);
            addCrawlMessage(errorMsg);
            setIsCrawling(false);
            return;
        }

        if (isCrawling) {
            console.warn("Crawl is already in progress.");
            addCrawlMessage("A crawl operation is already in progress. Please wait.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);

        let effectiveChunkSize = enableChunking ? chunkSize : MAX_ITEMS_PER_CRAWL_REQUEST;
        let wasChunkingForceEnabled = !enableChunking && itemsToCrawl.length > MAX_ITEMS_PER_CRAWL_REQUEST;
        if (!enableChunking) effectiveChunkSize = itemsToCrawl.length;
        if (itemsToCrawl.length > 0 && effectiveChunkSize <= 0) effectiveChunkSize = MAX_ITEMS_PER_CRAWL_REQUEST;

        const modelDescShort = `DL:${modelsToUse.determineLinks?.[0]}, EI:${modelsToUse.extractInfo?.[0]}, EC:${modelsToUse.extractCfp?.[0]}`;
        let initialMessage = `Starting process for ${itemsToCrawl.length} items from "${sourceDescription}"`;
        if (userProvidedDescription) initialMessage += ` (Description: "${userProvidedDescription}")`;
        initialMessage += ` using models (${modelDescShort})... `;

        if (enableChunking && itemsToCrawl.length > effectiveChunkSize) initialMessage += `Processing in chunks of up to ${effectiveChunkSize}.`;
        else if (wasChunkingForceEnabled) initialMessage += `Sending in batches of up to ${MAX_ITEMS_PER_CRAWL_REQUEST} (auto-batching).`;
        else if (itemsToCrawl.length > 0) initialMessage += 'Sending all at once.';
        
        addCrawlMessage(initialMessage);
        if (wasChunkingForceEnabled) addCrawlMessage(`Note: Automatic batching (max ${MAX_ITEMS_PER_CRAWL_REQUEST} items per request) was applied as the number of items exceeds the limit and chunking was not explicitly enabled.`);

        let overallSuccess = true;
        const itemsForBatches = [...itemsToCrawl];

        if (itemsForBatches.length > 0) {
            const useMultipleBatches = enableChunking || itemsForBatches.length > MAX_ITEMS_PER_CRAWL_REQUEST;
            if (useMultipleBatches) {
                const chunks = chunkArray(itemsForBatches, effectiveChunkSize);
                setCrawlProgress({ current: 0, total: chunks.length, status: 'crawling' });
                for (let i = 0; i < chunks.length; i++) {
                    const currentChunk = chunks[i];
                    if (currentChunk.length === 0) continue;
                    setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));
                    const success = await sendApiRequest(currentChunk, modelsToUse, `Batch ${i + 1}/${chunks.length} (${currentChunk.length} items, from ${sourceDescription})`, userProvidedDescription);
                    if (!success) {
                        setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                        overallSuccess = false;
                        break;
                    }
                }
                if (overallSuccess && chunks.length > 0) {
                    setCrawlProgress(prev => ({ ...prev, status: 'success' }));
                    addCrawlMessage(`Successfully processed all ${chunks.length} batches from "${sourceDescription}" with selected models.`);
                } else if (!overallSuccess && chunks.length > 0) {
                    addCrawlMessage(`Process from "${sourceDescription}" with selected models stopped due to an error.`);
                }
            } else {
                setCrawlProgress({ current: 0, total: 1, status: 'crawling', currentChunkData: itemsForBatches });
                const success = await sendApiRequest(itemsForBatches, modelsToUse, `Batch (${itemsForBatches.length} items from ${sourceDescription})`, userProvidedDescription);
                setCrawlProgress(prev => ({ ...prev, current: 1, status: success ? 'success' : 'error' }));
                if (success) addCrawlMessage(`Successfully processed the batch of ${itemsForBatches.length} items from "${sourceDescription}" with selected models.`);
                overallSuccess = success;
            }
        } else {
            overallSuccess = false;
            addCrawlMessage(`No valid items to process from "${sourceDescription}".`);
        }

        setIsCrawling(false);
        if (overallSuccess && crawlProgress.status !== 'success' && crawlProgress.status !== 'error' && crawlProgress.status !== 'stopped') {
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
        } else if (!overallSuccess && crawlProgress.status !== 'error' && crawlProgress.status !== 'stopped') {
            setCrawlProgress(prev => ({ ...prev, status: 'error' }));
        }
    }, [isCrawling, addCrawlMessage, sendApiRequest]);

    const reset = useCallback(() => {
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
    }, []);

    return {
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        processCrawlRequest,
        addCrawlMessage,
        reset,
    };
};