// src/hooks/crawl/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConferenceAnalysisDetail, LogAnalysisResult } from '@/src/models/logAnalysis/logAnalysis'; // Adjust path
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences'; // Adjust path

export type SortableColumn = 'title' | 'acronym' | 'status' | 'durationSeconds' | 'errorCount' | 'validationWarningCount' | 'requestId'; // Thêm requestId
export type SortDirection = 'asc' | 'desc';
export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';
export type RowSaveStatus = 'idle' | 'success' | 'error';

export interface ConferenceTableData extends ConferenceAnalysisDetail {
    uniqueRowId: string; // Key duy nhất cho mỗi dòng trong bảng (title + requestId)
    title: string; // Vẫn giữ title gốc
    acronym: string;
    requestId: string; // ID của request đã tạo ra entry này
    errorCount: number;
    validationWarningCount: number;
    hasValidationWarnings: boolean;
    validationWarnings?: ConferenceAnalysisDetail['validationIssues'];
}

export interface UseConferenceTableManagerProps {
    // Thay vì initialData, nhận toàn bộ LogAnalysisResult để có thể truy cập requestId
    logAnalysisResult: LogAnalysisResult | null | undefined;
}

export const useConferenceTableManager = ({ logAnalysisResult }: UseConferenceTableManagerProps) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null); // Sẽ sử dụng uniqueRowId
    const [sortColumn, setSortColumn] = useState<SortableColumn | null>('title'); // Default sort by title
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({}); // Key là uniqueRowId
    const [mainSaveStatus, setMainSaveStatus] = useState<MainSavingStatus>('idle');
    const [rowSaveStatus, setRowSaveStatus] = useState<Record<string, RowSaveStatus>>({}); // Key là uniqueRowId
    const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>({}); // Key là uniqueRowId

    const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
        if (!logAnalysisResult?.conferenceAnalysis) return [];

        const { conferenceAnalysis, filterRequestId, analyzedRequestIds } = logAnalysisResult;

        return Object.entries(conferenceAnalysis).map(([confKey, data]) => {
            // Xác định requestId cho entry này
            // Ưu tiên data.requestId nếu backend đã cung cấp
            // Nếu không, nếu filterRequestId tồn tại, sử dụng nó.
            // Nếu không, và chỉ có một analyzedRequestId, sử dụng nó.
            // Nếu không, để là 'unknown' hoặc một giá trị mặc định.
            const entryRequestId = data.requestId || filterRequestId || (analyzedRequestIds?.length === 1 ? analyzedRequestIds[0] : 'N/A');
            const uniqueRowId = `${confKey}_${entryRequestId}`; // Tạo ID duy nhất

            const validationIssuesArray = data.validationIssues || [];
            const validationWarningCount = validationIssuesArray.length;
            const hasValidationWarnings = validationWarningCount > 0;

            return {
                ...data,
                uniqueRowId,
                title: data.title || confKey.split(' - ')[1] || confKey, // Lấy title từ data hoặc key
                acronym: data.acronym || confKey.split(' - ')[0] || '', // Lấy acronym từ data hoặc key
                requestId: entryRequestId,
                errorCount: data.errors?.length || 0,
                validationWarningCount,
                hasValidationWarnings,
                validationWarnings: validationIssuesArray,
            };
        });
    }, [logAnalysisResult]);

    useEffect(() => {
        const initialStatus: Record<string, RowSaveStatus> = {};
        conferenceDataArray.forEach(conf => {
            initialStatus[conf.uniqueRowId] = 'idle';
        });
        setRowSaveStatus(initialStatus);
        setRowSaveErrors({});
        setSelectedRows({});
        setMainSaveStatus('idle');
        setExpandedRow(null);
    }, [conferenceDataArray]); // Phụ thuộc vào conferenceDataArray

    const sortedData = useMemo(() => {
        if (!sortColumn) return conferenceDataArray;
        return [...conferenceDataArray].sort((a, b) => {
            let aValue: any = a[sortColumn];
            let bValue: any = b[sortColumn];
            const handleNull = (val: any) => (val === null || val === undefined);
            if (handleNull(aValue) && handleNull(bValue)) return 0;
            if (handleNull(aValue)) return sortDirection === 'asc' ? 1 : -1;
            if (handleNull(bValue)) return sortDirection === 'asc' ? -1 : 1;

            switch (sortColumn) {
                case 'acronym':
                case 'title':
                case 'status':
                case 'requestId': // Thêm sorting cho requestId
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
                    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                case 'durationSeconds':
                case 'errorCount':
                case 'validationWarningCount':
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                default: return 0;
            }
        });
    }, [conferenceDataArray, sortColumn, sortDirection]);

    const handleSort = useCallback((column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    const selectedRowIds = useMemo(() => {
        return Object.entries(selectedRows)
            .filter(([, isSelected]) => isSelected)
            .map(([uniqueRowId]) => uniqueRowId);
    }, [selectedRows]);

    const handleRowSelectToggle = useCallback((uniqueRowId: string) => {
        setSelectedRows(prev => ({ ...prev, [uniqueRowId]: !prev[uniqueRowId] }));
    }, []);

    const handleSelectAll = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { newSelection[conf.uniqueRowId] = true; });
        setSelectedRows(newSelection);
    }, [sortedData]);

    const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

    const handleSelectNoError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (conf.errorCount === 0) newSelection[conf.uniqueRowId] = true; });
        setSelectedRows(newSelection);
    }, [sortedData]);

    const handleSelectError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (conf.errorCount > 0) newSelection[conf.uniqueRowId] = true; });
        setSelectedRows(newSelection);
    }, [sortedData]);

    const handleSelectWarning = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true; });
        setSelectedRows(newSelection);
    }, [sortedData]);

    const handleSelectNoWarning = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (!conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true; });
        setSelectedRows(newSelection);
    }, [sortedData]);

    const toggleExpand = useCallback((uniqueRowId: string) => {
        setExpandedRow(prev => (prev === uniqueRowId ? null : uniqueRowId));
    }, []);

    const isSelectedWithProblem = useMemo(() => {
        if (selectedRowIds.length === 0) return false;
        const selectedData = sortedData.filter(conf => selectedRows[conf.uniqueRowId]);
        return selectedData.some(conf => conf.errorCount > 0 || conf.hasValidationWarnings);
    }, [selectedRowIds, selectedRows, sortedData]);

    const isSaveEnabled = useMemo(() => {
        return selectedRowIds.length > 0 && !isSelectedWithProblem && mainSaveStatus !== 'saving';
    }, [selectedRowIds.length, isSelectedWithProblem, mainSaveStatus]);

    useEffect(() => {
        if (mainSaveStatus === 'error' || mainSaveStatus === 'success') {
            // Giữ trạng thái lâu hơn một chút để người dùng thấy, hoặc xóa khi deselected
            // setTimeout(() => setMainSaveStatus('idle'), 3000);
        }
    }, [mainSaveStatus]);


    const handleBulkSave = async () => {
        if (!isSaveEnabled) return;
        setMainSaveStatus('saving');
        // Reset status cho các hàng được chọn
        const nextRowStatus = { ...rowSaveStatus };
        const nextRowErrors = { ...rowSaveErrors };
        selectedRowIds.forEach(id => {
            nextRowStatus[id] = 'idle'; // Chuẩn bị cho lần lưu mới
            delete nextRowErrors[id];
        });
        setRowSaveStatus(nextRowStatus);
        setRowSaveErrors(nextRowErrors);

        const itemsToSave = conferenceDataArray.filter(conf => selectedRows[conf.uniqueRowId]);

        // Truyền đúng các tham số: acronym, title, và finalResult (hoặc finalResultPreview)
        const savePromises = itemsToSave.map(conf =>
            saveConferenceToJson(conf.acronym, conf.title, conf.finalResultPreview || conf.finalResult)
        );

        const results = await Promise.allSettled(savePromises); // Promise.allSettled vẫn ổn
        const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
        const finalRowErrorsUpdate: Record<string, string> = {};
        let overallSuccess = true;

        results.forEach((settledResult, index) => {
            const item = itemsToSave[index];
            const rowId = item.uniqueRowId;

            // Vì saveConferenceToJson giờ luôn resolve, chúng ta chỉ cần kiểm tra result.value
            if (settledResult.status === 'fulfilled') {
                const apiResult = settledResult.value; // Đây là SaveConferenceResult
                if (apiResult.success) {
                    finalRowStatusUpdate[rowId] = 'success';
                } else {
                    overallSuccess = false;
                    finalRowStatusUpdate[rowId] = 'error';
                    finalRowErrorsUpdate[rowId] = apiResult.message || 'Save failed (unknown reason).';
                }
            } else {
                // Trường hợp này không nên xảy ra nếu saveConferenceToJson luôn resolve
                // Nhưng để an toàn, vẫn xử lý:
                overallSuccess = false;
                finalRowStatusUpdate[rowId] = 'error';
                finalRowErrorsUpdate[rowId] = (settledResult.reason as Error)?.message || 'Promise rejected unexpectedly.';
            }
        });

        setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
        setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));
        setMainSaveStatus(overallSuccess ? 'success' : 'error');
        if (overallSuccess) {
            handleDeselectAll();
        }
    };


    const handleCrawlAgain = useCallback(() => {
        if (selectedRowIds.length === 0) return;
        const titlesToCrawl = sortedData
            .filter(conf => selectedRows[conf.uniqueRowId])
            .map(conf => `${conf.title} (from Request: ${conf.requestId.substring(0, 8)}...)`);
        alert(`Mock: Triggering crawl again for ${selectedRowIds.length} item(s):\n${titlesToCrawl.join('\n')}`);
    }, [selectedRowIds, sortedData, selectedRows]);

    return {
        sortedData,
        conferenceDataArray, // Có thể không cần trả về cái này nếu sortedData là đủ
        sortColumn,
        sortDirection,
        handleSort,
        selectedRows, // Trả về selectedRows thay vì selectedConferences
        selectedRowIds, // Trả về selectedRowIds thay vì selectedTitles
        handleRowSelectToggle,
        handleSelectAll,
        handleSelectNoError,
        handleSelectError,
        handleSelectWarning,
        handleSelectNoWarning,
        handleDeselectAll,
        expandedRow, // Trả về expandedRow thay vì expandedConference
        toggleExpand,
        mainSaveStatus,
        isSaveEnabled,
        handleBulkSave,
        rowSaveStatus,
        rowSaveErrors,
        handleCrawlAgain,
    };
};