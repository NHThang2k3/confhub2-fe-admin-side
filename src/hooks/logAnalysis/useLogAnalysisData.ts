// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
// *** THAY ĐỔI: Import cả hai kiểu dữ liệu và tạo Union Type ***
import { ConferenceLogAnalysisResult } from '../../models/logAnalysis/index'; // Adjust path
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';

import { useAuth } from '@/src/contexts/AuthContext'; // Adjust path
// *** THAY ĐỔI: Import hàm fetch chung hoặc hai hàm riêng biệt ***
import {
    fetchLogAnalysisData as apiFetchConferenceLogAnalysisData,
    // Giả sử bạn có hàm fetch cho journal, ví dụ:
    // fetchJournalLogAnalysisData as apiFetchJournalLogAnalysisData
} from '@/src/app/api/logAnalysis/conferenceLogAnalysisApi'; // Adjust path
// *** TẠM THỜI: Giả sử có một hàm fetch cho journal API ***
import { fetchJournalLogAnalysisData as apiFetchJournalLogAnalysisData } from '@/src/app/api/logAnalysis/journalLogAnalysisApi';

import { getSocketInstance, disconnectSocket } from '@/src/utils/socket'; // Adjust path

// *** THÊM: Định nghĩa CrawlerType ***
export type CrawlerType = 'conference' | 'journal';

// *** THÊM: Union type cho kết quả phân tích ***
export type LogAnalysisResultUnion = ConferenceLogAnalysisResult | JournalLogAnalysisResult;


// --- Logic tính toán URL và path (giữ nguyên) ---
const LOG_ANALYSIS_SERVICE_URL_CONFIG = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
let logAnalysisSocketIoBaseUrl: string = '';
let logAnalysisSocketIoPathOption: string | undefined = undefined;

if (typeof window !== 'undefined' && LOG_ANALYSIS_SERVICE_URL_CONFIG) {
    try {
        const serviceUrlParsed = new URL(LOG_ANALYSIS_SERVICE_URL_CONFIG);
        const socketProtocol = serviceUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:';
        logAnalysisSocketIoBaseUrl = `${socketProtocol}//${serviceUrlParsed.hostname}${serviceUrlParsed.port ? `:${serviceUrlParsed.port}` : ''}`;
        let normalizedServicePath = serviceUrlParsed.pathname.startsWith('/') ? serviceUrlParsed.pathname : '/' + serviceUrlParsed.pathname;
        if (normalizedServicePath !== '/' && !normalizedServicePath.endsWith('/')) {
            normalizedServicePath += '/';
        }
        logAnalysisSocketIoPathOption = normalizedServicePath + 'socket.io/';
    } catch (e) {
        console.error("[LogAnalysisSocket Init] Failed to parse log analysis service URL from config:", LOG_ANALYSIS_SERVICE_URL_CONFIG, e);
        logAnalysisSocketIoBaseUrl = '';
    }
} else if (!LOG_ANALYSIS_SERVICE_URL_CONFIG && typeof window !== 'undefined') {
    console.warn("[LogAnalysisSocket Init] LOG_ANALYSIS_SERVICE_URL_CONFIG is not configured. Socket connection will not be attempted.");
}
// --- Kết thúc Logic tính toán URL và path ---

export const useLogAnalysisData = (
    crawlerType: CrawlerType,
    filterStartTime?: number,
    filterEndTime?: number,
    // ĐỔI TÊN: từ filterRequestId thành textFilter
    textFilter?: string
) => {
    const { isLoggedIn, isInitializing: isAuthInitializing, getToken } = useAuth();
    const [data, setData] = useState<LogAnalysisResultUnion | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false, currentCrawlerType: CrawlerType) => {
        if (!isMountedRef.current) return;
        // CẬP NHẬT LOG
        console.log(`[useLogAnalysisData] Fetching for ${currentCrawlerType}. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, TextFilter=${textFilter}`);

        setLoadingData(true);
        setFetchError(null);
        const currentToken = getToken();

        if (!currentToken) {
            if (isMountedRef.current) {
                setFetchError("Authentication required.");
                setLoadingData(false);
                setData(null);
            }
            return;
        }
        try {
            let result: LogAnalysisResultUnion | null = null;
            // CẬP NHẬT LỜI GỌI API
            if (currentCrawlerType === 'conference') {
                result = await apiFetchConferenceLogAnalysisData(filterStartTime, filterEndTime, textFilter);
            } else if (currentCrawlerType === 'journal') {
                result = await apiFetchJournalLogAnalysisData(filterStartTime, filterEndTime, textFilter);
            }

            if (isMountedRef.current) {
                setData(result);
                setFetchError(null);
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setFetchError(err.message || 'Failed to fetch data');
            }
        } finally {
            if (isMountedRef.current) {
                setLoadingData(false);
            }
        }
    }, [filterStartTime, filterEndTime, textFilter, getToken]); // Thêm textFilter vào dependencies

    // Effect để fetch data khi filter, crawlerType, hoặc login status thay đổi
    useEffect(() => {
        if (isAuthInitializing) {
            if (isMountedRef.current) setLoadingData(true);
            return;
        }
        if (!isLoggedIn) {
            if (isMountedRef.current) {
                setData(null);
                setLoadingData(false);
                setFetchError(null);
            }
            return;
        }
        fetchData(false, crawlerType);
    }, [isAuthInitializing, isLoggedIn, crawlerType, fetchData]);

    // Effect riêng để quản lý vòng đời của socket
    useEffect(() => {
        if (isAuthInitializing || !isLoggedIn) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                if (isMountedRef.current) {
                    setIsConnected(false);
                    setSocketError(null);
                }
            }
            return;
        }

        const currentToken = getToken();
        if (!currentToken) return;

        const socket = getSocketInstance(currentToken);
        socketRef.current = socket;
        if (!socket) return;

        if (isMountedRef.current && isConnected !== socket.connected) {
            setIsConnected(socket.connected);
        }

        const handleConnect = () => {
            if (isMountedRef.current) {
                setIsConnected(true);
                setSocketError(null); // <-- SỬA ĐỔI QUAN TRỌNG: Xóa lỗi socket khi kết nối thành công
            }
        };
        const handleDisconnect = () => isMountedRef.current && setIsConnected(false);
        const handleConnectError = (err: Error) => isMountedRef.current && setSocketError(`Socket Error: ${err.message}`);

        const handleGenericLogAnalysisUpdate = (updatedData: LogAnalysisResultUnion & { crawlerType: CrawlerType }) => {
            if (isMountedRef.current && updatedData.crawlerType === crawlerType) {
                const currentFilter = textFilter;
                const updateMatchesFilter = (currentFilter === updatedData.filterRequestId) || (!currentFilter && !updatedData.filterRequestId);
                if (updateMatchesFilter) {
                    setData(updatedData);
                }
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('log_analysis_update', handleGenericLogAnalysisUpdate);

        if (!socket.connected) socket.connect();

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('log_analysis_update', handleGenericLogAnalysisUpdate);
        };
    }, [isAuthInitializing, isLoggedIn, getToken, crawlerType, textFilter]);

    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true, crawlerType);
        if (socketRef.current && !socketRef.current.connected) {
            socketRef.current.connect();
        }
    }, [fetchData, crawlerType]);

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};