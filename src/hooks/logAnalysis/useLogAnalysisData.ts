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
    filterRequestId?: string
) => {
    const { isLoggedIn, isInitializing: isAuthInitializing, getToken } = useAuth();
    const [data, setData] = useState<LogAnalysisResultUnion | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    // const socketListenersRef = useRef<(() => void)[]>([]); // Không cần nữa nếu quản lý trong effect socket
    const initialFetchDoneRef = useRef(false);
    const socketRef = useRef<Socket | null>(null); // Tham chiếu đến socket instance

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Cân nhắc việc cleanup socket listeners ở đây nếu socketRef.current vẫn tồn tại
            // và component unmount hoàn toàn. Tuy nhiên, việc disconnect khi logout đã xử lý.
        };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false, currentCrawlerType: CrawlerType) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching for ${currentCrawlerType}. Manual: ${isManualRefresh}, Start=${filterStartTime}, End=${filterEndTime}, ReqID=${filterRequestId}`);

        setLoadingData(true);
        setFetchError(null);
        const currentToken = getToken();

        if (!currentToken) {
            if (isMountedRef.current) {
                setFetchError("Authentication required.");
                setLoadingData(false);
                setData(null); // Clear data khi không có token
            }
            return;
        }
        try {
            let result: LogAnalysisResultUnion | null = null;
            if (currentCrawlerType === 'conference') {
                result = await apiFetchConferenceLogAnalysisData(filterStartTime, filterEndTime, filterRequestId);
            } else if (currentCrawlerType === 'journal') {
                result = await apiFetchJournalLogAnalysisData(filterStartTime, filterEndTime, filterRequestId);
            }

            if (isMountedRef.current) {
                setData(result);
                setFetchError(null);
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setFetchError(err.message || 'Failed to fetch data');
                // setData(null); // Cân nhắc clear data khi fetch lỗi
            }
        } finally {
            if (isMountedRef.current) {
                setLoadingData(false);
                if (!isManualRefresh) {
                    initialFetchDoneRef.current = true;
                }
            }
        }
    }, [filterStartTime, filterEndTime, filterRequestId, getToken]); // Bỏ crawlerType ra khỏi đây, sẽ truyền vào khi gọi

    // Effect để fetch data khi filter, crawlerType, hoặc login status thay đổi
    useEffect(() => {
        if (isAuthInitializing) {
            if (isMountedRef.current) setLoadingData(true);
            return;
        }
        if (!isLoggedIn) {
            if (isMountedRef.current) {
                setData(null); // Clear data khi logout
                setLoadingData(false);
                setFetchError(null);
                initialFetchDoneRef.current = false;
            }
            return;
        }
        // Chỉ fetch khi đã login và không còn initializing
        console.log(`[useLogAnalysisData] Triggering fetchData (from data effect) for ${crawlerType}.`);
        fetchData(false, crawlerType);

    }, [isAuthInitializing, isLoggedIn, crawlerType, fetchData]); // fetchData ở đây thay đổi khi filter/token thay đổi

    // Effect riêng để quản lý vòng đời của socket
    useEffect(() => {
        if (isAuthInitializing || !isLoggedIn) {
            // Nếu đang init auth hoặc chưa login, đảm bảo socket bị ngắt và cleanup
            if (socketRef.current) {
                console.log('[useLogAnalysisData SocketEffect] Disconnecting socket due to auth state change.');
                // Không cần gọi disconnectSocket() từ utils nữa nếu quản lý instance ở đây
                socketRef.current.disconnect();
                socketRef.current = null; // Xóa tham chiếu
                if (isMountedRef.current) {
                    setIsConnected(false);
                    setSocketError(null);
                }
            }
            return;
        }

        // Đã login và auth đã init xong
        const currentToken = getToken();
        if (!currentToken) { // Trường hợp hiếm, nhưng để an toàn
            if (socketRef.current) socketRef.current.disconnect();
            socketRef.current = null;
            if (isMountedRef.current) setIsConnected(false);
            return;
        }

        // Lấy hoặc tạo socket instance
        // Việc getSocketInstance có thể cần được điều chỉnh để không tạo instance mới nếu đã có trong socketRef.current
        // Hoặc, chúng ta sẽ quản lý instance hoàn toàn trong hook này.
        // Để đơn giản, giả sử getSocketInstance từ utils vẫn hoạt động tốt và trả về cùng instance nếu token không đổi.
        const socket = getSocketInstance(currentToken);
        socketRef.current = socket; // Lưu tham chiếu

        if (!socket) {
            if (isMountedRef.current) {
                setIsConnected(false);
                if (!socketError) setSocketError("Socket instance not available (check config or token).");
            }
            return;
        }

        // Cập nhật trạng thái isConnected ban đầu
        if (isMountedRef.current && isConnected !== socket.connected) {
            setIsConnected(socket.connected);
        }


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

         const handleGenericLogAnalysisUpdate = (updatedDataWithCrawlerType: LogAnalysisResultUnion & { crawlerType: CrawlerType }) => {
            console.log('[Socket] Generic Update received for crawler:', updatedDataWithCrawlerType.crawlerType);
            if (isMountedRef.current) {
                // QUAN TRỌNG: crawlerType ở đây là crawlerType hiện tại của hook instance này
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
                setData(updatedDataWithCrawlerType);
                setFetchError(null);
                setLoadingData(false); // Dữ liệu đã được cập nhật, không còn loading
                setSocketError(null);
            }
        };

        // Gắn listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('auth_error', handleAuthError);
        socket.on('log_analysis_update', handleGenericLogAnalysisUpdate);

        // Kết nối nếu chưa kết nối
        if (!socket.connected) {
            console.log('[useLogAnalysisData SocketEffect] Attempting to connect socket.');
            socket.connect();
        }

        return () => {
            console.log('[useLogAnalysisData SocketEffect] Cleaning up socket listeners for this hook instance.');
            // Gỡ listeners khi component unmount hoặc dependencies thay đổi
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('auth_error', handleAuthError);
            socket.off('log_analysis_update', handleGenericLogAnalysisUpdate);

            // Không ngắt kết nối socket ở đây trừ khi logout (đã xử lý ở đầu effect)
            // hoặc component unmount hoàn toàn (sẽ được xử lý bởi disconnectSocket() trong return của useEffect chính của component cha nếu cần)
            // Việc giữ kết nối socket khi crawlerType thay đổi là mong muốn.
        };
        // Dependencies cho effect này: chỉ những gì liên quan trực tiếp đến việc thiết lập và quản lý socket.
        // `crawlerType` và `filterRequestId` được thêm vào để `handleGenericLogAnalysisUpdate` luôn có giá trị closure đúng.
    }, [isAuthInitializing, isLoggedIn, getToken, crawlerType, filterRequestId]); // Thêm crawlerType và filterRequestId

    const refetchDataAndTryReconnectSocket = useCallback(async () => {
        await fetchData(true, crawlerType); // Truyền crawlerType hiện tại
        // const socket = getSocketInstance(getToken()); // Lấy lại instance nếu cần
        if (socketRef.current && !socketRef.current.connected) {
            console.log('[useLogAnalysisData] Manually attempting to connect socket.');
            socketRef.current.connect();
        }
    }, [fetchData, getToken, crawlerType]); // Thêm crawlerType

    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return { data, loading: overallLoading, error: combinedError, isConnectedToSocket: isConnected, refetchData: refetchDataAndTryReconnectSocket };
};