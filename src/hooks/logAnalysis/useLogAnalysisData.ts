// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
// *** THAY ĐỔI: Import cả hai kiểu dữ liệu và tạo Union Type ***
import { ConferenceLogAnalysisResult, JournalLogAnalysisResult } from '../../models/logAnalysis'; // Adjust path
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
    crawlerType: CrawlerType, // *** THÊM: crawlerType ***
    filterStartTime?: number,
    filterEndTime?: number,
    filterRequestId?: string
) => {
    const { isLoggedIn, isInitializing: isAuthInitializing, getToken } = useAuth();
    // *** THAY ĐỔI: Kiểu dữ liệu của state data ***
    const [data, setData] = useState<LogAnalysisResultUnion | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const socketListenersRef = useRef<(() => void)[]>([]);
    const initialFetchDoneRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching for ${crawlerType}. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, ReqID=${filterRequestId}`);

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
            // *** THAY ĐỔI: Gọi API fetch dựa trên crawlerType ***
            if (crawlerType === 'conference') {
                result = await apiFetchConferenceLogAnalysisData(filterStartTime, filterEndTime, filterRequestId);
            } else if (crawlerType === 'journal') {
                // Giả sử bạn đã tạo hàm này và import ở trên
                result = await apiFetchJournalLogAnalysisData(filterStartTime, filterEndTime, filterRequestId);
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
                if (!isManualRefresh) {
                    initialFetchDoneRef.current = true;
                }
            }
        }
    }, [crawlerType, filterStartTime, filterEndTime, filterRequestId, getToken]); // *** THÊM: crawlerType vào dependencies ***

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
                setSocketError(null);
                setIsConnected(false);
                initialFetchDoneRef.current = false;
            }
            disconnectSocket();
            return;
        }

        console.log(`[useLogAnalysisData] Triggering fetchData for ${crawlerType} due to dependency change (login/filter/crawlerType).`);
        fetchData(false); // fetchData sẽ được gọi lại nếu crawlerType thay đổi

        const currentToken = getToken();
        const socket = getSocketInstance(currentToken);

        const cleanupExistingSocketListeners = () => {
            socketListenersRef.current.forEach(removeListener => removeListener());
            socketListenersRef.current = [];
        };

        if (!socket) {
            cleanupExistingSocketListeners();
            if (isMountedRef.current) {
                setIsConnected(false);
                if (!socketError) {
                    setSocketError("Socket instance not available (check config or token).");
                }
            }
            return;
        }

        if (isMountedRef.current && isConnected !== socket.connected) {
            setIsConnected(socket.connected);
        }

        cleanupExistingSocketListeners();

        const handleConnect = () => {
            console.log('[Socket] Connected!');
            if (isMountedRef.current) {
                setIsConnected(true);
                setSocketError(null);
            }
        };
        const handleDisconnect = (reason: Socket.DisconnectReason) => {
            console.log('[Socket] Disconnected:', reason);
            if (isMountedRef.current) {
                setIsConnected(false);
                if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
                    setSocketError(`Socket disconnected: ${reason}. Will attempt to reconnect.`);
                } else if (socketError && socketError.startsWith('Socket disconnected:')) {
                    setSocketError(null);
                }
            }
        };
        const handleConnectError = (err: Error) => {
            console.error('[Socket] Connect Error:', err);
            if (isMountedRef.current) {
                setIsConnected(false);
                const errorData = (err as any).data;
                const message = errorData?.message || err.message || "Unknown connection error";
                setSocketError(`Socket Error: ${message}`);
            }
        };
        const handleAuthError = (authError: { message: string }) => {
            console.error('[Socket] Auth Error:', authError.message);
            if (isMountedRef.current) {
                setSocketError(`Socket Auth Error: ${authError.message}.`);
                setIsConnected(false);
            }
        };

        // *** THAY ĐỔI: Xử lý update từ socket ***
        // Cách 1: Backend gửi event riêng biệt
        // const handleConferenceLogAnalysisUpdate = (updatedData: ConferenceLogAnalysisResult) => { ... };
        // const handleJournalLogAnalysisUpdate = (updatedData: JournalLogAnalysisResult) => { ... };
        // socket.on('conference_log_analysis_update', handleConferenceLogAnalysisUpdate);
        // socket.on('journal_log_analysis_update', handleJournalLogAnalysisUpdate);

        // Cách 2: Backend gửi event chung với trường crawlerType (giả sử cách này)
        const handleGenericLogAnalysisUpdate = (updatedDataWithCrawlerType: LogAnalysisResultUnion & { crawlerType: CrawlerType }) => {
            console.log('[Socket] Generic Update received for crawler:', updatedDataWithCrawlerType.crawlerType);
            if (isMountedRef.current) {
                // Chỉ cập nhật nếu crawlerType của update khớp với crawlerType hiện tại của hook
                if (updatedDataWithCrawlerType.crawlerType !== crawlerType) {
                    console.log(`[Socket Update] Ignored: CrawlerType mismatch. Hook for "${crawlerType}", Update for "${updatedDataWithCrawlerType.crawlerType}"`);
                    return;
                }

                const currentFilter = filterRequestId;
                const updateMatchesFilter = (currentFilter === updatedDataWithCrawlerType.filterRequestId) || (!currentFilter && !updatedDataWithCrawlerType.filterRequestId);

                if (!updateMatchesFilter) {
                    console.log(`[Socket Update] Ignored: Filter mismatch. Filter: "${currentFilter || 'none'}", Update for: "${updatedDataWithCrawlerType.filterRequestId || 'none'}"`);
                    return;
                }
                console.log('[Socket Update] Applying update.');
                setData(updatedDataWithCrawlerType); // updatedDataWithCrawlerType đã là LogAnalysisResultUnion
                setFetchError(null);
                setLoadingData(false);
                setSocketError(null);
            }
        };
        // Giả sử backend gửi event 'log_analysis_update' với payload có trường 'crawlerType'
        socket.on('log_analysis_update', handleGenericLogAnalysisUpdate);


        socketListenersRef.current = [
            () => socket.off('connect', handleConnect),
            () => socket.off('disconnect', handleDisconnect),
            () => socket.off('connect_error', handleConnectError),
            () => socket.off('auth_error', handleAuthError),
            // () => socket.off('conference_log_analysis_update', handleConferenceLogAnalysisUpdate), // Nếu dùng event riêng
            // () => socket.off('journal_log_analysis_update', handleJournalLogAnalysisUpdate),       // Nếu dùng event riêng
            () => socket.off('log_analysis_update', handleGenericLogAnalysisUpdate), // Nếu dùng event chung
        ];

        if (!socket.connected) {
            console.log('[useLogAnalysisData] Attempting to connect socket.');
            socket.connect();
        }

        return () => {
            console.log('[useLogAnalysisData] Cleaning up socket listeners for this hook instance.');
            cleanupExistingSocketListeners();
        };
    }, [isAuthInitializing, isLoggedIn, fetchData, getToken, filterRequestId, crawlerType]); // *** THÊM: crawlerType vào dependencies ***

    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true);
        const socket = getSocketInstance(getToken());
        if (socket && !socket.connected) {
            console.log('[useLogAnalysisData] Manually attempting to connect socket.');
            socket.connect();
        }
    }, [fetchData, getToken]);

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};