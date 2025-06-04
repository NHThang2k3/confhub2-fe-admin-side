// src/hooks/logAnalysis/useLogAnalysisData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';

// Conference Types
import { ConferenceLogAnalysisResult, OverallAnalysis } from '../../models/logAnalysis/index'; // Assuming index.ts exports these from analysis.types.ts
import { RequestTimings } from '../../models/logAnalysis/common.types'; // Specific import for RequestTimings

// Journal Types
import {
    JournalLogAnalysisResult,
    JournalRequestSummary,
    JournalOverallAnalysis
} from '@/src/models/logAnalysis/logAnalysisJournal.types';

import { useAuth } from '@/src/contexts/AuthContext';
import {
    fetchLogAnalysisData as apiFetchConferenceLogAnalysisData,
} from '@/src/app/api/logAnalysis/conferenceLogAnalysisApi';
import { fetchJournalLogAnalysisData as apiFetchJournalLogAnalysisData } from '@/src/app/api/logAnalysis/journalLogAnalysisApi';

import { getSocketInstance } from '@/src/utils/socket';

export type CrawlerType = 'conference' | 'journal';
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


function parseTimestamp(isoDateString?: string | null): number | null {
    if (!isoDateString) return null;
    const date = new Date(isoDateString);
    return isNaN(date.getTime()) ? null : date.getTime();
}

function filterDataByTimeAndRecalculateOverall(
    rawData: LogAnalysisResultUnion | null,
    crawlerType: CrawlerType,

    filterStartTimeMs?: number,
    filterEndTimeMs?: number
): LogAnalysisResultUnion | null {
    if (!rawData) return null;

    if (filterStartTimeMs === undefined && filterEndTimeMs === undefined) {
        return rawData;
    }

    const filteredRequests: LogAnalysisResultUnion['requests'] = {};
    const filteredAnalyzedRequestIds: string[] = [];

    const rawAnalyzedIds = rawData.analyzedRequestIds || [];
    for (const reqId of rawAnalyzedIds) {
        const requestSummary = rawData.requests[reqId];
        if (!requestSummary) continue;

        const reqStartTimeMs = parseTimestamp(requestSummary.startTime);
        let includeRequest = true;

        if (reqStartTimeMs === null) {
            if (filterStartTimeMs !== undefined || filterEndTimeMs !== undefined) {
                includeRequest = false;
            }
        } else {
            if (filterStartTimeMs !== undefined && reqStartTimeMs < filterStartTimeMs) {
                includeRequest = false;
            }
            if (filterEndTimeMs !== undefined && reqStartTimeMs > filterEndTimeMs) {
                includeRequest = false;
            }
        }

        if (includeRequest) {
            filteredRequests[reqId] = requestSummary;
            filteredAnalyzedRequestIds.push(reqId);
        }
    }

    const filteredData = JSON.parse(JSON.stringify(rawData)) as LogAnalysisResultUnion;
    filteredData.requests = filteredRequests;
    filteredData.analyzedRequestIds = filteredAnalyzedRequestIds;

    if (rawData.filterRequestId && filteredAnalyzedRequestIds.length === 0) {
        if (crawlerType === 'conference' && 'conferenceAnalysis' in filteredData) {
            delete (filteredData as ConferenceLogAnalysisResult).conferenceAnalysis;
        } else if (crawlerType === 'journal' && 'journalAnalysis' in filteredData) {
            delete (filteredData as JournalLogAnalysisResult).journalAnalysis;
        }
    }

    let earliestTs: number | null = null;
    let latestTs: number | null = null;
    const statusCounts: { [status: string]: number } = {};

    for (const reqId of filteredAnalyzedRequestIds) {
        const req = filteredRequests[reqId];
        if (!req) continue;

        const status = req.status?.toLowerCase() || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        const reqStartTs = parseTimestamp(req.startTime);
        const reqEndTs = parseTimestamp(req.endTime); // Using endTime for overall latest time

        if (reqStartTs) {
            if (earliestTs === null || reqStartTs < earliestTs) earliestTs = reqStartTs;
        }
        // For latestTs, consider endTime of request if available, otherwise startTime
        const relevantTimeForLatest = reqEndTs || reqStartTs;
        if (relevantTimeForLatest) {
            if (latestTs === null || relevantTimeForLatest > latestTs) latestTs = relevantTimeForLatest;
        }
    }


    if (crawlerType === 'conference') {
        const newOverall: OverallAnalysis = {
            startTime: null,
            endTime: null,
            durationSeconds: null,
            totalConferencesInput: 0,
            processedConferencesCount: 0,
            completedTasks: 0,
            failedOrCrashedTasks: 0,
            processingTasks: 0,
            skippedTasks: 0,
            successfulExtractions: (rawData.overall as OverallAnalysis)?.successfulExtractions || 0,
        };

        for (const reqId of filteredAnalyzedRequestIds) {
            const req = filteredRequests[reqId] as RequestTimings; // Conference requests are RequestTimings
            if (!req) continue;
            newOverall.totalConferencesInput += req.totalConferencesInputForRequest || 0;
            newOverall.processedConferencesCount += req.processedConferencesCountForRequest || 0;
        }

        newOverall.completedTasks = statusCounts['completed'] || 0;
        // Interpretation: completedwitherrors and partiallycompleted are not "fully successful" tasks for this metric
        newOverall.failedOrCrashedTasks = statusCounts['failed'] || 0;
        newOverall.processingTasks = statusCounts['processing'] || 0;
        newOverall.skippedTasks = statusCounts['skipped'] || 0;

        if (earliestTs !== null) newOverall.startTime = new Date(earliestTs).toISOString();
        if (latestTs !== null) newOverall.endTime = new Date(latestTs).toISOString();
        if (earliestTs !== null && latestTs !== null && latestTs >= earliestTs) {
            newOverall.durationSeconds = (latestTs - earliestTs) / 1000;
        }

        filteredData.overall = newOverall;

    } else if (crawlerType === 'journal') {
        const newOverall: JournalOverallAnalysis = {
            startTime: null,
            endTime: null,
            durationSeconds: null,
            totalRequestsAnalyzed: 0,
            dataSourceCounts: { scimago: 0, client: 0, unknown: 0 },
            totalJournalsInput: 0,
            totalJournalsProcessed: 0,
            totalJournalsFailed: 0,
            totalJournalsSkipped: 0,
            processedJournalsWithBioxbioSuccess: (rawData.overall as JournalOverallAnalysis)?.processedJournalsWithBioxbioSuccess || 0,
            processedJournalsWithScimagoDetailsSuccess: (rawData.overall as JournalOverallAnalysis)?.processedJournalsWithScimagoDetailsSuccess || 0,
            processedJournalsWithImageSearchSuccess: (rawData.overall as JournalOverallAnalysis)?.processedJournalsWithImageSearchSuccess || 0,
        };

        newOverall.totalRequestsAnalyzed = filteredAnalyzedRequestIds.length;

        for (const reqId of filteredAnalyzedRequestIds) {
            const req = filteredRequests[reqId] as JournalRequestSummary;
            if (!req) continue;
            newOverall.totalJournalsInput += req.totalJournalsInputForRequest || 0;
            newOverall.totalJournalsProcessed += req.processedJournalsCountForRequest || 0;

            if (req.dataSource) {
                const ds = req.dataSource.toLowerCase();
                if (ds === 'scimago') newOverall.dataSourceCounts.scimago++;
                else if (ds === 'client') newOverall.dataSourceCounts.client++;
                else newOverall.dataSourceCounts.unknown++; // Or handle other specific known sources
            }
        }

        newOverall.totalJournalsFailed = statusCounts['failed'] || 0;
        newOverall.totalJournalsSkipped = statusCounts['skipped'] || 0;
        // Note: JournalOverallAnalysis doesn't have granular completed/processing counts like Conference's OverallAnalysis.
        // It has totalRequestsAnalyzed, totalJournalsProcessed, totalJournalsFailed, totalJournalsSkipped.

        if (earliestTs !== null) newOverall.startTime = new Date(earliestTs).toISOString();
        if (latestTs !== null) newOverall.endTime = new Date(latestTs).toISOString();
        if (earliestTs !== null && latestTs !== null && latestTs >= earliestTs) {
            newOverall.durationSeconds = (latestTs - earliestTs) / 1000;
        }
        filteredData.overall = newOverall;
    }
    return filteredData;
}


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
    const initialFetchDoneRef = useRef(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false, currentCrawlerType: CrawlerType) => {
        if (!isMountedRef.current) return;
        console.log(`[useLogAnalysisData] Fetching for ${currentCrawlerType}. Manual: ${isManualRefresh}, StartTs=${filterStartTime}, EndTs=${filterEndTime}, ReqID=${filterRequestId}`);

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
            let rawResult: LogAnalysisResultUnion | null = null;
            if (currentCrawlerType === 'conference') {
                rawResult = await apiFetchConferenceLogAnalysisData(filterRequestId);
            } else if (currentCrawlerType === 'journal') {
                rawResult = await apiFetchJournalLogAnalysisData(filterRequestId);
            }

            const filteredResult = filterDataByTimeAndRecalculateOverall(
                rawResult,
                currentCrawlerType,
                filterStartTime,
                filterEndTime
            );

            if (isMountedRef.current) {
                setData(filteredResult);
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
    }, [filterStartTime, filterEndTime, filterRequestId, getToken]);

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
                initialFetchDoneRef.current = false;
            }
            return;
        }
        console.log(`[useLogAnalysisData] Triggering fetchData (from data effect) for ${crawlerType}.`);
        fetchData(false, crawlerType);

    }, [isAuthInitializing, isLoggedIn, crawlerType, fetchData]);

    useEffect(() => {
        if (isAuthInitializing || !isLoggedIn) {
            if (socketRef.current) {
                console.log('[useLogAnalysisData SocketEffect] Disconnecting socket due to auth state change.');
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
        if (!currentToken) {
            if (socketRef.current) socketRef.current.disconnect();
            socketRef.current = null;
            if (isMountedRef.current) setIsConnected(false);
            return;
        }

        const socket = getSocketInstance(currentToken);
        socketRef.current = socket;

        if (!socket) {
            if (isMountedRef.current) {
                setIsConnected(false);
                if (!socketError) setSocketError("Socket instance not available (check config or token).");
            }
            return;
        }

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