import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchLogAnalysisData } from '../../app/api/logAnalysis/logAnalysisApi'; // Điều chỉnh đường dẫn nếu cần
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis'; // Điều chỉnh đường dẫn nếu cần
import useAuthApi, { getToken } from '../auth/useAuthApi'; // Import hook useAuthApi và hàm getToken

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const useLogAnalysisData = (
    filterStartTime?: number,
    filterEndTime?: number
) => {
    // Sử dụng useAuthApi để lấy trạng thái xác thực và loading của auth
    const { isLoggedIn, isLoading: isLoadingAuth } = useAuthApi();

    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true); // Loading cho việc fetch data ban đầu
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // fetchData cho HTTP GET request
    const fetchData = useCallback(async (isManualRefresh = false) => {
        console.log(`[useLogAnalysisData] Fetching log analysis data. Manual: ${isManualRefresh}, Filters: Start=${filterStartTime}, End=${filterEndTime}`);
        setLoadingData(true);
        setFetchError(null);
        // setData(null); // Cân nhắc có nên xóa data cũ khi fetch mới

        try {
            const result = await fetchLogAnalysisData(filterStartTime, filterEndTime);
            console.log("[useLogAnalysisData] Fetch successful, updating data.");
            setData(result);
        } catch (err: any) {
            console.error("[useLogAnalysisData] Fetch failed:", err);
            setFetchError(err.message || 'Failed to fetch log analysis data');
        } finally {
            setLoadingData(false);
        }
    }, [filterStartTime, filterEndTime]);

    // Effect cho việc fetch dữ liệu ban đầu và khi filter thay đổi
    useEffect(() => {
        // Chỉ fetch data nếu quá trình xác thực ban đầu đã hoàn tất
        // Điều này tránh việc fetch data khi chưa biết user có quyền hay không,
        // hoặc khi app đang trong quá trình chuyển hướng/logout do token không hợp lệ.
        if (!isLoadingAuth) {
            console.log("[useLogAnalysisData] Auth loading finished. Proceeding to fetch initial data.");
            fetchData(false);
        } else {
            console.log("[useLogAnalysisData] Waiting for auth to complete before fetching initial data.");
        }
    }, [fetchData, isLoadingAuth]); // Chạy lại khi fetchData (filter) thay đổi HOẶC khi isLoadingAuth thay đổi

    // Effect cho Socket.IO connection - CHỈ KẾT NỐI KHI AUTH HOÀN TẤT VÀ ĐÃ LOGIN
    // Effect cho Socket.IO connection
    useEffect(() => {
        let socketInstance: Socket | null = null; // Đổi tên để tránh nhầm lẫn với biến socket toàn cục nếu có

        if (!SOCKET_URL) {
            console.error("[useLogAnalysisData] Socket URL is not defined.");
            setSocketError("Socket URL is not defined.");
            return; // Thoát sớm
        }

        // Chỉ thực hiện các hành động liên quan đến socket khi auth đã xong
        if (!isLoadingAuth) {
            if (isLoggedIn) {
                // Người dùng đã đăng nhập VÀ auth đã xong
                const currentToken = getToken();

                if (currentToken) {
                    console.log('[useLogAnalysisData] Auth ready, user logged in. Attempting Socket.IO connection.');
                    setSocketError(null);

                    socketInstance = io(SOCKET_URL, { // Gán cho biến cục bộ của effect
                        transports: ['websocket'],
                        reconnectionAttempts: 3,
                        reconnectionDelay: 2000,
                        auth: {
                            token: currentToken
                        }
                    });

                    socketInstance.on('connect', () => {
                        console.log('[useLogAnalysisData] Socket.IO Connected:', socketInstance?.id);
                        setIsConnected(true);
                        setSocketError(null);
                    });

                    socketInstance.on('disconnect', (reason) => {
                        console.log('[useLogAnalysisData] Socket.IO Disconnected:', reason);
                        setIsConnected(false);
                        if (reason === 'io server disconnect') {
                            setSocketError('Real-time server disconnected. Might be auth or server issue.');
                        } else if (reason !== 'io client disconnect') { // Không báo lỗi nếu client tự ngắt
                            setSocketError(`Real-time connection lost: ${reason}.`);
                        }
                    });

                    socketInstance.on('connect_error', (err) => {
                        console.error('[useLogAnalysisData] Socket.IO Connection Error:', err);
                        setIsConnected(false);
                        const errorData = err as any; // Type assertion để truy cập err.data
                        const message = errorData.data?.message || err.message;
                        if (errorData.data?.code === 'AUTH_FAILED' || message.toLowerCase().includes('authentication')) {
                            setSocketError(`Real-time Auth Error: ${message}. Please log in again.`);
                            socketInstance?.disconnect(); // Ngắt nếu lỗi auth
                        } else {
                            setSocketError(`Socket Connection Error: ${message}`);
                        }
                    });

                    socketInstance.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
                        console.log('[useLogAnalysisData] Received log_analysis_update via Socket.');
                        setData(updatedData);
                        setFetchError(null);
                        setLoadingData(false);
                    });

                    socketInstance.on('auth_error', (authError: { message: string }) => {
                        console.error('[useLogAnalysisData] Socket.IO Auth Error from server logic:', authError.message);
                        setSocketError(`Authentication Error: ${authError.message}.`);
                        setIsConnected(false);
                        socketInstance?.disconnect();
                    });

                } else {
                    console.warn('[useLogAnalysisData] User logged in, but no token found for Socket.IO.');
                    setSocketError('Real-time updates disabled: Auth token missing.');
                    setIsConnected(false);
                }
            } else {
                // Auth đã xong, NHƯNG người dùng KHÔNG đăng nhập
                console.log('[useLogAnalysisData] Auth ready, but user is not logged in. No Socket.IO connection.');
                setIsConnected(false); // Đảm bảo isConnected là false
                // Không cần làm gì với socketInstance ở đây vì nó chưa được tạo trong nhánh này
                // Việc ngắt socket cũ (nếu có từ lần render trước khi isLoggedIn là true) sẽ được xử lý bởi hàm cleanup.
            }
        } else {
            // Auth đang trong quá trình xử lý
            console.log('[useLogAnalysisData] Waiting for auth to complete before Socket.IO.');
            setIsConnected(false);
        }

         return () => {
        if (socketInstance) {
            console.log(`[useLogAnalysisData - Socket Effect Cleanup] Disconnecting socket. ID: ${socketInstance.id}. isLoadingAuth: ${isLoadingAuth}, isLoggedIn: ${isLoggedIn} (state at cleanup time)`);
            socketInstance.disconnect();
        } else {
            console.log(`[useLogAnalysisData - Socket Effect Cleanup] No socketInstance to disconnect. isLoadingAuth: ${isLoadingAuth}, isLoggedIn: ${isLoggedIn} (state at cleanup time)`);
        }
    };
}, [isLoadingAuth, isLoggedIn]);


    // Quyết định loading tổng thể của hook
    // Hook được coi là loading nếu:
    // 1. Auth đang loading (isLoadingAuth)
    // 2. HOẶC data đang được fetch (loadingData) (chỉ khi auth đã xong)
    const overallLoading = isLoadingAuth || (!isLoadingAuth && loadingData);
    const combinedError = fetchError || socketError;

    return {
        data,
        loading: overallLoading,
        error: combinedError,
        isConnectedToSocket: isConnected, // Đổi tên để rõ ràng hơn là của socket
        refetchData: () => fetchData(true)
    };
};