// src/hooks/crawl/conference/useCrawlConfig.ts
'use client';
import { useState, useCallback } from 'react';
import { MAX_ITEMS_PER_CRAWL_REQUEST } from '../constants';
import { ApiModels, ApiName, CrawlModelType } from '@/src/models/logAnalysis/crawl.types';

// --- Hằng số mới cho cấu hình độ trễ ---
const DEFAULT_CHUNK_DELAY = 10; // 10 giây
const MIN_CHUNK_DELAY = 5;      // 5 giây
const MAX_CHUNK_DELAY = 300;    // 5 phút

const initialApiModels: ApiModels = {
    determineLinks: null,
    extractInfo: null,
    extractCfp: null,
};

/**
 * Hook quản lý tất cả các cấu hình liên quan đến việc thực thi crawl.
 * Bao gồm lựa chọn model, cài đặt chunking, độ trễ, và tùy chọn lưu file.
 */
export const useCrawlConfig = () => {
    // --- State hiện có ---
    const [enableChunking, setEnableChunking] = useState<boolean>(true);
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST);
    const [apiModels, setApiModels] = useState<ApiModels>({ ...initialApiModels });
    const [chunkDelay, setChunkDelayState] = useState<number>(DEFAULT_CHUNK_DELAY);

    // --- STATE MỚI CHO VIỆC LƯU FILE ---
    const [recordFile, setRecordFile] = useState<boolean>(false); // Mặc định là false

    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);

    const setChunkDelay = useCallback((delayInSeconds: number) => {
        const newDelay = Math.max(MIN_CHUNK_DELAY, Math.min(delayInSeconds, MAX_CHUNK_DELAY));
        setChunkDelayState(newDelay);
    }, []);

    const reset = useCallback(() => {
        setApiModels({ ...initialApiModels });
        setEnableChunking(true);
        setChunkSizeState(MAX_ITEMS_PER_CRAWL_REQUEST);
        setChunkDelayState(DEFAULT_CHUNK_DELAY);
        setRecordFile(false); // Reset cả state mới
        console.log("Crawl config (API models, chunking, delay, recordFile) has been reset.");
    }, []);

    return {
        // State và hàm hiện có
        enableChunking,
        chunkSize,
        apiModels,
        chunkDelay,
        setEnableChunking,
        setChunkSize,
        setApiModel,
        setChunkDelay,

        // State và hàm mới
        recordFile,
        setRecordFile,

        // Hàm reset đã được cập nhật
        reset,
    };
};