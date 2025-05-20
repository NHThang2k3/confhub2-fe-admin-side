// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis'; // Adjust path if needed
import { useAuth } from '@/src/contexts/AuthContext'; // Adjust path if needed
import { fetchLogAnalysisData as apiFetchLogAnalysisData } from '@/src/app/api/logAnalysis/logAnalysisApi'; // Adjust path
import { getSocketInstance, disconnectSocket } from '@/src/utils/socket'; // Adjust path

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
    const isMountedRef = useRef(true);
    const socketListenersRef = useRef<(() => void)[]>([]); // Ref to store cleanup functions for socket listeners

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // --- Đã loại bỏ 'data' khỏi dependencies ---
    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, ReqID=${filterRequestId}`);
        // Chỉ hiển thị loading nếu chưa có dữ liệu hoặc là refresh thủ công hoặc khi filter thay đổi
        // Thêm điều kiện kiểm tra nếu filterRequestId thay đổi và đang fetch
        if (!data || isManualRefresh || loadingData) { // Kiểm tra loadingData để tránh race condition khi fetch nhanh
             setLoadingData(true);
        }
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
            // Chỉ tắt loading nếu không phải là refresh thủ công và không có data
            // Hoặc nếu là manual refresh VÀ đã có data
            if (isMountedRef.current && (!isManualRefresh || data)) {
                 setLoadingData(false);
             }
             // Nếu là manual refresh VÀ CHƯA có data, loading sẽ vẫn true cho đến khi socket update hoặc fetch lại
        }
    }, [filterStartTime, filterEndTime, filterRequestId, getToken, loadingData]); // Added loadingData dependency

    // --- Loại bỏ useEffect đầu tiên gọi fetchData, chuyển logic xuống effect quản lý socket ---
    // useEffect(() => {
    //     if (!isAuthInitializing && isLoggedIn) {
    //         fetchData(false); // Fetch initial data on mount/login
    //     } else if (!isAuthInitializing && !isLoggedIn) {
    //         // Clear data and state if logged out
    //         if (isMountedRef.current) {
    //             setData(null);
    //             setLoadingData(false); // Ensure loading is false
    //             setFetchError(null);
    //             setSocketError(null);
    //             setIsConnected(false);
    //              disconnectSocket(); // Call disconnectSocket from the singleton module on logout
    //         }
    //     }
    // }, [fetchData, isAuthInitializing, isLoggedIn]); // Đã loại bỏ fetchData

    // Effect for managing socket listeners AND initial/filter-based data fetching
    useEffect(() => {
        // --- Logic kiểm tra trạng thái Auth và Token ---
        if (isAuthInitializing) {
             if (isMountedRef.current) setLoadingData(true); // Show loading while auth is initializing
             return;
        }

         if (!isLoggedIn) {
             // Clear data and state if logged out
             if (isMountedRef.current) {
                 setData(null);
                 setLoadingData(false); // Ensure loading is false
                 setFetchError(null);
                 setSocketError(null);
                 setIsConnected(false);
                  disconnectSocket(); // Call disconnectSocket from the singleton module on logout
             }
             return; // Stop here if not logged in
         }

        // --- Logic Fetch Data (Khi auth sẵn sàng, logged in, và dependencies fetch thay đổi) ---
         // Gọi fetchData ở đây. Điều này sẽ chạy khi isLoggedIn thay đổi (từ false sang true)
         // VÀ khi filterStartTime, filterEndTime, filterRequestId thay đổi.
         console.log('[useLogAnalysisData] Triggering fetchData due to dependency change.');
        fetchData(false);


        // --- Logic Kết nối và quản lý Socket ---
        const currentToken = getToken();
        const socket = getSocketInstance(currentToken);

        const cleanupSocketListeners = () => {
            socketListenersRef.current.forEach(removeListener => removeListener());
            socketListenersRef.current = [];
        };

        if (!socket) {
            // If no socket instance can be created (e.g., URL config missing)
            cleanupSocketListeners();
             if (isMountedRef.current) {
                 setIsConnected(false);
                 if (!socketError) { // Avoid overwriting specific auth errors
                     setSocketError("Socket instance not available (check config).");
                 }
             }
            return; // Stop socket logic if no instance
        }

        // Log initial connection status if it hasn't been set yet or needs update
         if (isMountedRef.current) {
              // Chỉ cập nhật isConnected nếu trạng thái hiện tại khác với socket.connected
             if (isConnected !== socket.connected) {
                setIsConnected(socket.connected);
             }
             // Có thể set một thông báo trạng thái kết nối nếu cần, nhưng cẩn thận không ghi đè lỗi
             // if (!socket.connected && !socketError && isConnected) {
             //      setSocketError("Connecting...");
             // }
         }


        // Remove previous listeners before adding new ones
        cleanupSocketListeners();

        // Add listeners and store their removal functions
        const handleConnect = () => {
            console.log('[Socket] Connected!');
            if (isMountedRef.current) {
                 setIsConnected(true);
                 setSocketError(null);
                 // Optional: Re-fetch full data on reconnect if needed, though socket updates should handle it
                 // fetchData(false);
            }
        };
        const handleDisconnect = (reason: Socket.DisconnectReason) => {
            console.log('[Socket] Disconnected:', reason);
            if (isMountedRef.current) {
                setIsConnected(false);
                // Set error only if not a client-initiated disconnect
                if (reason !== 'io client disconnect') {
                    setSocketError(`Socket disconnected: ${reason}.`);
                } else {
                    // Clear error if it was a client-initiated disconnect
                    if (socketError && socketError.includes('Socket disconnected')) {
                         setSocketError(null);
                    }
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
                if (message.toLowerCase().includes('authentication') || errorData?.code === 'AUTH_FAILED') {
                     console.error("Socket Authentication Failed. Consider logging out.");
                     // Handle auth error: The singleton socket module's getSocketInstance might handle this
                     // or you might handle it centrally in your auth context.
                }
            }
        };
        const handleAuthError = (authError: { message: string }) => {
             console.error('[Socket] Auth Error:', authError.message);
             if (isMountedRef.current) {
                setSocketError(`Socket Auth Error: ${authError.message}.`);
                setIsConnected(false);
                 console.error("Socket Authentication Failed. Consider logging out.");
                 // Handle auth error: The singleton socket module's getSocketInstance might handle this
                 // or you might handle it centrally in your auth context.
             }
        };
        const handleLogAnalysisUpdate = (updatedData: LogAnalysisResult) => {
            console.log('[Socket] Update received.');
            if (isMountedRef.current) {
                const currentFilter = filterRequestId;
                const updateMatchesFilter = (currentFilter === updatedData.filterRequestId) || (!currentFilter && !updatedData.filterRequestId);

                if (!updateMatchesFilter) {
                     console.log(`[Socket Update] Ignored: Mismatch. Filter: "${currentFilter || 'none'}", Update for: "${updatedData.filterRequestId || 'none'}"`);
                     return;
                }

                console.log('[Socket Update] Applying update.');
                setData(updatedData);
                setFetchError(null);
                setLoadingData(false);
                 // State for socket connection should be managed by connect/disconnect/error handlers,
                 // but confirming connected status here might be okay if you trust the update implies connection
                 // setIsConnected(true); // Optional: uncomment if you want to confirm connection on successful update
                 setSocketError(null); // Clear socket errors on successful update
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('auth_error', handleAuthError);
        socket.on('log_analysis_update', handleLogAnalysisUpdate);


        socketListenersRef.current = [
            () => socket.off('connect', handleConnect),
            () => socket.off('disconnect', handleDisconnect),
            () => socket.off('connect_error', handleConnectError),
            () => socket.off('auth_error', handleAuthError),
            () => socket.off('log_analysis_update', handleLogAnalysisUpdate),
        ];

        // Return cleanup function that removes only the listeners added by THIS hook instance
        return () => {
             console.log('[useLogAnalysisData] Cleaning up socket listeners.');
             cleanupSocketListeners();
        };

        // Dependencies for THIS effect:
        // - isAuthInitializing, isLoggedIn: để trigger fetch data và socket connection khi trạng thái auth thay đổi.
        // - filterStartTime, filterEndTime, filterRequestId: để trigger fetch data khi filter thay đổi.
        // - getToken: dependency của fetchData và getSocketInstance.
        // - fetchData: dependency của chính effect này vì nó gọi fetchData. (Cần cẩn thận với dependency này)
        // --> Cách tốt nhất là tách logic fetch data ra khỏi effect này nếu có thể,
        //     hoặc đảm bảo fetchData chỉ thay đổi khi dependencies fetch (filter, token) thay đổi.
        //     Với useCallback đã có các dependencies đó, nên fetchData chỉ thay đổi khi filter hoặc token thay đổi.
        //     Việc thêm fetchData vào dependencies ở đây là đúng.
        // - isConnected, socketError: Có thể thêm vào để useEffect phản ứng với thay đổi trạng thái socket,
        //    nhưng cẩn thận tránh loop. Hiện tại, logic trong handlers là đủ.
        // - data: Không cần dependency 'data' ở đây.
    }, [isAuthInitializing, isLoggedIn, filterStartTime, filterEndTime, filterRequestId, getToken, fetchData, isConnected, socketError]); // Giữ fetchData làm dependency


    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true); // Force manual refresh
        const socket = getSocketInstance(getToken());
        if (socket && !socket.connected) {
            console.log('[useLogAnalysisData] Attempting to manually connect socket.');
            socket.connect(); // Explicitly connect if not connected
        }
    }, [fetchData, getToken]);

    // Overall loading includes auth initialization, initial data fetch when needed
    // Also consider loading when filter changes and data is being fetched
    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);

    const combinedError = fetchError || socketError;

    // Clear data on error if needed, or handle specific errors
    // useEffect(() => {
    //     if (combinedError && !data) {
    //          // Có thể clear data ở đây nếu lỗi nghiêm trọng và không có data
    //     }
    // }, [combinedError, data]);


    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};