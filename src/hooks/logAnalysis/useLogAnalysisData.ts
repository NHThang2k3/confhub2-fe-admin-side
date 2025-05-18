// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import io, { Socket } from 'socket.io-client';
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchLogAnalysisData as apiFetchLogAnalysisData } from '@/src/app/api/logAnalysis/logAnalysisApi'; // Renamed to avoid conflict

// --- START: Logic tính toán URL và path cho Socket.IO, adapted from useChatSocketManager ---
// Use the same environment variable as useChatSocketManager if they share the same backend.
// If LogAnalysis has a *different* backend socket server, use a different env variable.
// For this example, we assume it's the same as BACKEND_URL.
const LOG_ANALYSIS_SERVICE_URL_CONFIG = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Default from original code

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

        console.log(`[LogAnalysisSocket Init] Calculated socket base URL: ${logAnalysisSocketIoBaseUrl}`);
        console.log(`[LogAnalysisSocket Init] Calculated socket path option: ${logAnalysisSocketIoPathOption}`);
    } catch (e) {
        console.error("[LogAnalysisSocket Init] Failed to parse log analysis service URL from config:", LOG_ANALYSIS_SERVICE_URL_CONFIG, e);
        logAnalysisSocketIoBaseUrl = ''; // Invalidate
    }
} else if (!LOG_ANALYSIS_SERVICE_URL_CONFIG && typeof window !== 'undefined') {
    console.warn("[LogAnalysisSocket Init] LOG_ANALYSIS_SERVICE_URL_CONFIG (e.g., NEXT_PUBLIC_BACKEND_URL) is not configured. Socket connection will not be attempted.");
}
// --- END: Logic tính toán URL và path cho Socket.IO ---

export const useLogAnalysisData = (
    filterStartTime?: number,
    filterEndTime?: number
) => {
    const {
        isLoggedIn,
        isInitializing: isAuthInitializing,
        getToken
    } = useAuth();

    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const socketInstanceRef = useRef<Socket | null>(null); // Ref to hold the socket instance
    const isMountedRef = useRef(true); // To prevent state updates on unmounted component

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching log analysis data. Manual: ${isManualRefresh}, Filters: Start=${filterStartTime}, End=${filterEndTime}`);
        setLoadingData(true);
        setFetchError(null);

        const currentToken = getToken();
        if (!currentToken) {
            console.warn("[useLogAnalysisData] Cannot fetch data: Auth token missing.");
            if (isMountedRef.current) {
                setFetchError("Authentication required to fetch data.");
                setLoadingData(false);
                setData(null); // Clear data if no token
            }
            return;
        }

        try {
            const result = await apiFetchLogAnalysisData(filterStartTime, filterEndTime); // Assuming apiFetchLogAnalysisData handles token internally or you pass it
            console.log("[useLogAnalysisData] Fetch successful, updating data.");
            if (isMountedRef.current) setData(result);
        } catch (err: any) {
            console.error("[useLogAnalysisData] Fetch failed:", err);
            if (isMountedRef.current) setFetchError(err.message || 'Failed to fetch log analysis data');
        } finally {
            if (isMountedRef.current) setLoadingData(false);
        }
    }, [filterStartTime, filterEndTime, getToken]);

    useEffect(() => {
        if (!isAuthInitializing && isLoggedIn) {
            console.log("[useLogAnalysisData] Auth initialized and user logged in. Proceeding to fetch initial data.");
            fetchData(false);
        } else if (!isAuthInitializing && !isLoggedIn) {
            console.log("[useLogAnalysisData] Auth initialized but user not logged in. Skipping data fetch.");
            if (isMountedRef.current) {
                setData(null);
                setLoadingData(false);
                // setFetchError("Please log in to view log analysis data."); // Optional: set an error
            }
        } else {
            console.log("[useLogAnalysisData] Waiting for auth to complete before fetching initial data.");
        }
    }, [fetchData, isAuthInitializing, isLoggedIn]);

    useEffect(() => {
        // Cleanup function for the previous socket instance if dependencies change
        const cleanupPreviousSocket = () => {
            if (socketInstanceRef.current) {
                console.log(`[LogAnalysisSocket Effect] Cleaning up previous socket: ${socketInstanceRef.current.id}`);
                socketInstanceRef.current.off('connect');
                socketInstanceRef.current.off('disconnect');
                socketInstanceRef.current.off('connect_error');
                socketInstanceRef.current.off('log_analysis_update');
                socketInstanceRef.current.off('auth_error'); // Assuming a custom auth_error event
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                if (isMountedRef.current) setIsConnected(false);
            }
        };

        if (isAuthInitializing) {
            console.log("[LogAnalysisSocket Effect] Auth is initializing. Disconnecting any existing socket.");
            cleanupPreviousSocket();
            return;
        }

        if (!logAnalysisSocketIoBaseUrl) {
            console.warn("[LogAnalysisSocket Effect] Socket Base URL is not valid for Log Analysis. Skipping connection.");
            cleanupPreviousSocket();
            if (isMountedRef.current) setSocketError("Socket service not configured correctly.");
            return;
        }

        if (isLoggedIn) {
            const currentToken = getToken();
            if (currentToken) {
                // If there's an existing socket, disconnect it before creating a new one to ensure fresh connection with latest token/config
                // This also handles cases where token might change (though getToken is a dependency, so effect re-runs)
                if (socketInstanceRef.current) {
                     console.log("[LogAnalysisSocket Effect] Disconnecting existing socket before creating new one (e.g. token change or re-login).");
                     cleanupPreviousSocket();
                }

                console.log(`[LogAnalysisSocket Effect] User logged in with token. Attempting Socket.IO connection to ${logAnalysisSocketIoBaseUrl} with path ${logAnalysisSocketIoPathOption}`);
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
                        console.log('[LogAnalysisSocket] Socket.IO Connected:', newSocket.id);
                        setIsConnected(true);
                        setSocketError(null);
                    }
                });

                newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        console.log('[LogAnalysisSocket] Socket.IO Disconnected:', reason);
                        setIsConnected(false);
                        if (reason === 'io server disconnect') {
                            setSocketError('Real-time server disconnected.');
                        } else if (reason !== 'io client disconnect') { // Don't show error for manual disconnect
                            setSocketError(`Real-time connection lost: ${reason}.`);
                        }
                    }
                });

                newSocket.on('connect_error', (err) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        console.error('[LogAnalysisSocket] Socket.IO Connection Error:', err.message, (err as any).data);
                        setIsConnected(false);
                        const errorData = err as any;
                        const message = errorData.data?.message || err.message || "Unknown connection error";
                        if (message.toLowerCase().includes('authentication') || errorData.data?.code === 'AUTH_FAILED') {
                            setSocketError(`Real-time Auth Error: ${message}.`);
                            // Critical auth error, consider full disconnect without auto-reconnect for this instance
                            newSocket.disconnect();
                        } else {
                            setSocketError(`Socket Connection Error: ${message}`);
                        }
                    }
                });

                // Assuming your server emits 'auth_error' for token issues post-connection
                newSocket.on('auth_error', (authError: { message: string }) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        console.error('[LogAnalysisSocket] Socket.IO Auth Error from server:', authError.message);
                        setSocketError(`Authentication Error: ${authError.message}.`);
                        setIsConnected(false);
                        newSocket.disconnect(); // Disconnect on auth error
                    }
                });

                newSocket.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        console.log('[LogAnalysisSocket] Received log_analysis_update via Socket.');
                        setData(updatedData);
                        setFetchError(null); // Clear fetch error if socket provides data
                        setLoadingData(false); // Stop loading if socket provides data
                    }
                });

            } else {
                console.warn('[LogAnalysisSocket Effect] User logged in, but no token found for Socket.IO.');
                cleanupPreviousSocket();
                if (isMountedRef.current) {
                    setSocketError('Real-time updates disabled: Auth token missing.');
                    setIsConnected(false);
                }
            }
        } else { // Not logged in
            console.log('[LogAnalysisSocket Effect] User is not logged in. Disconnecting any existing socket.');
            cleanupPreviousSocket();
            if (isMountedRef.current) {
                 // Clear any previous socket error if user logs out
                // setSocketError(null); // Or set a message like "Login to enable real-time updates"
            }
        }

        return () => {
            console.log(`[LogAnalysisSocket Effect Cleanup] Running cleanup. Current Socket ID: ${socketInstanceRef.current?.id}`);
            cleanupPreviousSocket();
        };
    }, [isAuthInitializing, isLoggedIn, getToken]); // getToken ensures re-evaluation if token changes

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return {
        data,
        loading: overallLoading,
        error: combinedError,
        isConnectedToSocket: isConnected,
        refetchData: () => fetchData(true)
    };
};