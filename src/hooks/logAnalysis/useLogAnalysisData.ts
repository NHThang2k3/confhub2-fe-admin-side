// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client'; // Nếu hook này được dùng trong client components

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis'; // Điều chỉnh đường dẫn nếu cần
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { fetchLogAnalysisData } from '@/src/app/api/logAnalysis/logAnalysisApi';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const useLogAnalysisData = (
    filterStartTime?: number,
    filterEndTime?: number
) => {
    // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
    // isInitializing là trạng thái khởi tạo của AuthProvider
    // isLoading (đổi tên thành isAuthActionLoading) là khi có action bất đồng bộ từ useAuth (ít dùng ở đây)
    const {
        isLoggedIn,
        isInitializing: isAuthInitializing, // Đổi tên từ isLoading của useAuthApi cũ
        getToken // Lấy hàm getToken từ context
    } = useAuth();

    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        console.log(`[useLogAnalysisData] Fetching log analysis data. Manual: ${isManualRefresh}, Filters: Start=${filterStartTime}, End=${filterEndTime}`);
        setLoadingData(true);
        setFetchError(null);

        // Lấy token MỖI LẦN fetch để đảm bảo token mới nhất được sử dụng
        const currentToken = getToken();
        if (!currentToken) {
            console.warn("[useLogAnalysisData] Cannot fetch data: Auth token missing.");
            setFetchError("Authentication required to fetch data.");
            setLoadingData(false);
            return;
        }

        try {
            // fetchLogAnalysisData cần được cập nhật để nhận token và truyền vào header
            const result = await fetchLogAnalysisData(filterStartTime, filterEndTime);
            console.log("[useLogAnalysisData] Fetch successful, updating data.");
            setData(result);
        } catch (err: any) {
            console.error("[useLogAnalysisData] Fetch failed:", err);
            setFetchError(err.message || 'Failed to fetch log analysis data');
        } finally {
            setLoadingData(false);
        }
    }, [filterStartTime, filterEndTime, getToken]); // Thêm getToken vào dependencies

    // Effect cho việc fetch dữ liệu ban đầu và khi filter thay đổi
    useEffect(() => {
        // Chỉ fetch data nếu quá trình xác thực ban đầu đã hoàn tất VÀ người dùng đã đăng nhập
        if (!isAuthInitializing && isLoggedIn) {
            console.log("[useLogAnalysisData] Auth initialized and user logged in. Proceeding to fetch initial data.");
            fetchData(false);
        } else if (!isAuthInitializing && !isLoggedIn) {
            console.log("[useLogAnalysisData] Auth initialized but user not logged in. Skipping data fetch.");
            setData(null); // Xóa data cũ nếu người dùng logout
            setLoadingData(false); // Đảm bảo loading là false
            setFetchError("Please log in to view log analysis data."); // Set lỗi nếu muốn hiển thị
        } else {
            console.log("[useLogAnalysisData] Waiting for auth to complete before fetching initial data.");
        }
    }, [fetchData, isAuthInitializing, isLoggedIn]); // Chạy lại khi fetchData, isAuthInitializing, hoặc isLoggedIn thay đổi

    // Effect cho Socket.IO connection
    useEffect(() => {
        let socketInstance: Socket | null = null;

        if (!SOCKET_URL) {
            console.error("[useLogAnalysisData] Socket URL is not defined.");
            setSocketError("Socket URL is not defined.");
            return;
        }

        if (!isAuthInitializing) {
            if (isLoggedIn) {
                const currentToken = getToken();

                if (currentToken) {
                    console.log('[useLogAnalysisData] Auth ready, user logged in. Attempting Socket.IO connection.');
                    setSocketError(null);

                    socketInstance = io(SOCKET_URL, {
                        transports: ['websocket'],
                        reconnectionAttempts: 3,
                        reconnectionDelay: 2000,
                        auth: { token: currentToken }
                    });

                    // Gán instance vào một ref để truy cập trong cleanup nếu cần,
                    // nhưng kiểm tra trực tiếp thường đủ dùng cho trường hợp này.
                    // const socketRef = { current: socketInstance };


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
                        } else if (reason !== 'io client disconnect') {
                            setSocketError(`Real-time connection lost: ${reason}.`);
                        }
                    });

                    socketInstance.on('connect_error', (err) => {
                        console.error('[useLogAnalysisData] Socket.IO Connection Error:', err);
                        setIsConnected(false);
                        const errorData = err as any;
                        const message = errorData.data?.message || err.message;
                        if (errorData.data?.code === 'AUTH_FAILED' || message.toLowerCase().includes('authentication')) {
                            setSocketError(`Real-time Auth Error: ${message}.`);
                            // <<<< SỬA LỖI Ở ĐÂY >>>>
                            if (socketInstance && typeof socketInstance.disconnect === 'function') {
                                socketInstance.disconnect();
                            }
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

                    socketInstance.on('auth_error', (authErrorMsg: { message: string }) => { // Đổi tên biến để tránh nhầm lẫn
                        console.error('[useLogAnalysisData] Socket.IO Auth Error from server logic:', authErrorMsg.message);
                        setSocketError(`Authentication Error: ${authErrorMsg.message}.`);
                        setIsConnected(false);
                        // <<<< SỬA LỖI Ở ĐÂY >>>>
                        if (socketInstance && typeof socketInstance.disconnect === 'function') {
                            socketInstance.disconnect();
                        }
                    });

                } else {
                    console.warn('[useLogAnalysisData] User logged in, but no token found for Socket.IO.');
                    setSocketError('Real-time updates disabled: Auth token missing.');
                    setIsConnected(false);
                }
            } else {
                console.log('[useLogAnalysisData] Auth ready, but user is not logged in. No Socket.IO connection.');
                setIsConnected(false);
                // Không cần ngắt socket ở đây vì nó chưa được tạo trong nhánh này.
                // Nếu nó được tạo từ lần render trước, hàm cleanup sẽ xử lý.
            }
        } else {
            console.log('[useLogAnalysisData] Waiting for auth to complete before Socket.IO.');
            setIsConnected(false);
        }

        return () => {
            // <<<< SỬA LỖI TRONG CLEANUP >>>>
            // Capture a reference to the socketInstance at the time the effect ran.
            const currentSocketInstance = socketInstance;
            if (currentSocketInstance && typeof currentSocketInstance.disconnect === 'function') {
                console.log(`[useLogAnalysisData - Socket Effect Cleanup] Disconnecting socket. ID: ${currentSocketInstance.id}.`);
                currentSocketInstance.off('connect');
                currentSocketInstance.off('disconnect');
                currentSocketInstance.off('connect_error');
                currentSocketInstance.off('log_analysis_update');
                currentSocketInstance.off('auth_error');
                currentSocketInstance.disconnect();
            } else {
                // console.log(`[useLogAnalysisData - Socket Effect Cleanup] No valid socketInstance to disconnect or already disconnected.`);
            }
        };
    }, [isAuthInitializing, isLoggedIn, getToken]); // Dependencies vẫn giữ nguyên


    // Quyết định loading tổng thể của hook
    const overallLoading = isAuthInitializing || (!isAuthInitializing && isLoggedIn && loadingData);
    const combinedError = fetchError || socketError;

    return {
        data,
        loading: overallLoading,
        error: combinedError,
        isConnectedToSocket: isConnected,
        refetchData: () => fetchData(true) // fetchData đã bao gồm logic lấy token
    };
};