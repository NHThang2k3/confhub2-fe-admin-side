// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis'; // Adjust path if needed
import { useAuth } from '@/src/contexts/AuthContext'; // Adjust path if needed
import { fetchLogAnalysisData as apiFetchLogAnalysisData } from '@/src/app/api/logAnalysis/logAnalysisApi'; // Adjust path

// --- START: Logic tính toán URL và path cho Socket.IO ---
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
// --- END: Logic tính toán URL và path cho Socket.IO ---

export const useLogAnalysisData = (
    filterStartTime?: number,
    filterEndTime?: number,
    filterRequestId?: string
) => {
    const { isLoggedIn, isInitializing: isAuthInitializing, getToken } = useAuth();
    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const socketInstanceRef = useRef<Socket | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, ReqID=${filterRequestId}`);
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
            const result = await apiFetchLogAnalysisData(filterStartTime, filterEndTime, filterRequestId);
            if (isMountedRef.current) setData(result);
        } catch (err: any) {
            if (isMountedRef.current) setFetchError(err.message || 'Failed to fetch data');
        } finally {
            if (isMountedRef.current) setLoadingData(false);
        }
    }, [filterStartTime, filterEndTime, filterRequestId, getToken]);

    useEffect(() => {
        if (!isAuthInitializing && isLoggedIn) {
            fetchData(false);
        } else if (!isAuthInitializing && !isLoggedIn) {
            if (isMountedRef.current) {
                setData(null);
                setLoadingData(false);
            }
        }
    }, [fetchData, isAuthInitializing, isLoggedIn]);

    useEffect(() => {
        const cleanupPreviousSocket = () => {
            if (socketInstanceRef.current) {
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                if (isMountedRef.current) setIsConnected(false);
            }
        };

        if (isAuthInitializing || !logAnalysisSocketIoBaseUrl || !isLoggedIn) {
            cleanupPreviousSocket();
            if (!logAnalysisSocketIoBaseUrl && isLoggedIn && !isAuthInitializing && isMountedRef.current) {
                setSocketError("Socket service not configured.");
            }
            return;
        }

        const currentToken = getToken();
        if (!currentToken) {
            cleanupPreviousSocket();
            if (isMountedRef.current) setSocketError('Auth token missing for socket.');
            return;
        }
        
        // Ensure previous socket is cleaned before creating a new one
        cleanupPreviousSocket();
        if (isMountedRef.current) setSocketError(null);

        const newSocket = io(logAnalysisSocketIoBaseUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            auth: { token: currentToken },
            ...(logAnalysisSocketIoPathOption && logAnalysisSocketIoPathOption !== '/socket.io/' && { path: logAnalysisSocketIoPathOption }),
        });
        socketInstanceRef.current = newSocket;

        newSocket.on('connect', () => {
            if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                setIsConnected(true); setSocketError(null);
            }
        });
        newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
            if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                setIsConnected(false);
                if (reason !== 'io client disconnect' && !isAuthInitializing) {
                    setSocketError(`Socket disconnected: ${reason}.`);
                }
            }
        });
        newSocket.on('connect_error', (err) => {
            if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                setIsConnected(false);
                const errorData = err as any;
                const message = errorData.data?.message || err.message || "Unknown connection error";
                setSocketError(`Socket Error: ${message}`);
                if (message.toLowerCase().includes('authentication') || errorData.data?.code === 'AUTH_FAILED') {
                    newSocket.disconnect(); // Prevent further attempts if auth fails
                }
            }
        });
        newSocket.on('auth_error', (authError: { message: string }) => {
             if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                setSocketError(`Socket Auth Error: ${authError.message}.`);
                setIsConnected(false);
                newSocket.disconnect();
            }
        });
        newSocket.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
            if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                // Conditional update based on active filterRequestId
                const currentFilter = filterRequestId; // Capture current filter value
                if (currentFilter && updatedData.filterRequestId !== currentFilter) {
                     console.log(`[Socket Update] Ignored: Mismatch. Filter: ${currentFilter}, Update for: ${updatedData.filterRequestId}`);
                     return;
                }
                if (!currentFilter && updatedData.filterRequestId) {
                    console.log(`[Socket Update] Ignored: General view, update for specific ReqID: ${updatedData.filterRequestId}`);
                    return;
                }
                setData(updatedData);
                setFetchError(null); setLoadingData(false); setIsConnected(true); setSocketError(null);
            }
        });
        return () => { cleanupPreviousSocket(); };
    }, [isAuthInitializing, isLoggedIn, getToken, filterRequestId]); // filterRequestId dependency for socket update logic

    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true);
        if (socketInstanceRef.current && !socketInstanceRef.current.connected) {
            socketInstanceRef.current.connect();
        }
    }, [fetchData]);

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};