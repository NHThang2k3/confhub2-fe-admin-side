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
 * Bao gồm lựa chọn model, cài đặt chunking, và độ trễ giữa các chunk.
 */
export const useCrawlConfig = () => {
    // --- State hiện có ---
    const [enableChunking, setEnableChunking] = useState<boolean>(true); // Mặc định bật chunking để các cài đặt liên quan hiển thị
    const [chunkSize, setChunkSizeState] = useState<number>(MAX_ITEMS_PER_CRAWL_REQUEST);
    const [apiModels, setApiModels] = useState<ApiModels>({ ...initialApiModels });

    // --- State mới cho độ trễ giữa các chunk ---
    const [chunkDelay, setChunkDelayState] = useState<number>(DEFAULT_CHUNK_DELAY);

    const setApiModel = useCallback((apiName: ApiName, model: CrawlModelType) => {
        setApiModels(prev => ({ ...prev, [apiName]: model }));
    }, []);

    const setChunkSize = useCallback((size: number) => {
        const newSize = Math.max(1, Math.min(size, MAX_ITEMS_PER_CRAWL_REQUEST));
        setChunkSizeState(newSize);
    }, []);

    // --- Hàm setter mới cho độ trễ, đã bao gồm validation ---
    const setChunkDelay = useCallback((delayInSeconds: number) => {
        // Đảm bảo giá trị luôn nằm trong khoảng cho phép
        const newDelay = Math.max(MIN_CHUNK_DELAY, Math.min(delayInSeconds, MAX_CHUNK_DELAY));
        setChunkDelayState(newDelay);
    }, []);

    const reset = useCallback(() => {
        setApiModels({ ...initialApiModels });
        // Reset cả các cài đặt chunking về mặc định
        setEnableChunking(true);
        setChunkSizeState(MAX_ITEMS_PER_CRAWL_REQUEST);
        setChunkDelayState(DEFAULT_CHUNK_DELAY);
        console.log("Crawl config (API models, chunking settings, delay) has been reset.");
    }, []);

    return {
        // State và hàm hiện có
        enableChunking,
        chunkSize,
        apiModels,
        setEnableChunking,
        setChunkSize,
        setApiModel,
        
        // State và hàm mới
        chunkDelay,
        setChunkDelay,

        // Hàm reset đã được cập nhật
        reset,
    };
};