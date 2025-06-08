// src/hooks/crawl/conference/useCrawlConfig.ts
'use client';
import { useState, useCallback } from 'react';
import { MAX_ITEMS_PER_CRAWL_REQUEST } from '../constants';
import { ApiModels, ApiName, CrawlModelType } from '@/src/models/logAnalysis/crawl.types';
const initialApiModels: ApiModels = {
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
};

export const useCrawlConfig = () => {
    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST);
    const [apiModels, setApiModels] = useState<ApiModels>({ ...initialApiModels });

    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);

    const reset = useCallback(() => {
        setApiModels({ ...initialApiModels });
        // Note: chunking settings are kept as user preference, not reset with data.
        // If they should be reset, add them here.
        console.log("Crawl config (API models) reset.");
    }, []);

    return {
        enableChunking,
        chunkSize,
        apiModels,
        setEnableChunking,
        setChunkSize,
        setApiModel,
        reset,
    };
};