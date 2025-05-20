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
    const [loadingData, setLoadingData] = useState<boolean>(true); // Bắt đầu là true cho lần fetch đầu tiên
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const socketListenersRef = useRef<(() => void)[]>([]);
    const initialFetchDoneRef = useRef(false); // Theo dõi lần fetch đầu tiên

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, ReqID=${filterRequestId}`);

        // Chỉ set loading nếu đây là lần fetch đầu tiên, manual refresh, hoặc filter thay đổi (ngụ ý qua việc fetchData được gọi lại)
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
            if (isMountedRef.current) {
                setData(result);
                setFetchError(null); // Clear fetch error on success
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setFetchError(err.message || 'Failed to fetch data');
                // setData(null); // Cân nhắc có nên clear data khi fetch lỗi không
            }
        } finally {
            if (isMountedRef.current) {
                setLoadingData(false);
                if (!isManualRefresh) {
                    initialFetchDoneRef.current = true;
                }
            }
        }
    }, [filterStartTime, filterEndTime, filterRequestId, getToken]); // Loại bỏ loadingData

    // Effect for managing socket listeners AND initial/filter-based data fetching
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
                initialFetchDoneRef.current = false; // Reset
            }
            disconnectSocket(); // Ngắt kết nối và dọn dẹp socket instance
            return;
        }

        // Fetch data khi login, hoặc khi filter thay đổi
        // `fetchData` sẽ chỉ thay đổi (tham chiếu) khi filter hoặc token thay đổi
        console.log('[useLogAnalysisData] Triggering fetchData due to dependency change (login/filter).');
        fetchData(false);

        const currentToken = getToken();
        const socket = getSocketInstance(currentToken); // Lấy hoặc tạo instance (nếu null)

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

        // Cập nhật trạng thái isConnected ban đầu từ socket instance
        if (isMountedRef.current && isConnected !== socket.connected) {
            setIsConnected(socket.connected);
        }

        cleanupExistingSocketListeners(); // Dọn dẹp listener cũ TRƯỚC KHI gắn listener mới

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
                if (reason !== 'io client disconnect' && reason !== 'io server disconnect') { // server disconnect cũng là chủ động từ server
                    setSocketError(`Socket disconnected: ${reason}. Will attempt to reconnect.`);
                } else if (socketError && socketError.startsWith('Socket disconnected:')) { // Clear error nếu là client/server chủ động ngắt
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

        // Chỉ kết nối nếu socket chưa kết nối.
        // Việc gọi connect() trên socket đang trong quá trình kết nối (sau lần gọi connect() đầu tiên)
        // hoặc đã kết nối thường là no-op và được thư viện xử lý.
        if (!socket.connected) { // <--- SỬA Ở ĐÂY: Loại bỏ !socket.connecting
            console.log('[useLogAnalysisData] Attempting to connect socket.');
            socket.connect();
        }

        return () => {
            console.log('[useLogAnalysisData] Cleaning up socket listeners for this hook instance.');
            cleanupExistingSocketListeners();
            // Không ngắt kết nối socket ở đây trừ khi component unmount hoàn toàn và bạn muốn ngắt global socket
            // Việc ngắt kết nối khi logout đã được xử lý ở trên
        };
        // Dependencies: isAuthInitializing, isLoggedIn, fetchData (thay đổi khi filter/token thay đổi), getToken
        // Loại bỏ isConnected, socketError khỏi dependencies
    }, [isAuthInitializing, isLoggedIn, fetchData, getToken, filterRequestId]); // filterRequestId thêm vào để xử lý logic update cho đúng filter

    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true);
        const socket = getSocketInstance(getToken());
        if (socket && !socket.connected) { // <--- SỬA Ở ĐÂY: Loại bỏ !socket.connecting
            console.log('[useLogAnalysisData] Manually attempting to connect socket.');
            socket.connect();
        }
    }, [fetchData, getToken]);

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};