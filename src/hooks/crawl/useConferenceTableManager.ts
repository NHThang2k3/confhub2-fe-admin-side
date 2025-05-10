// src/hooks/logAnalysis/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConferenceAnalysisDetail } from '@/src/models/logAnalysis/logAnalysis';
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences';

// --- EXPORT CÁC TYPE CẦN THIẾT ---
export type SortableColumn = 'title' | 'acronym' | 'status' | 'durationSeconds' | 'errorCount' | 'validationWarningCount';
export type SortDirection = 'asc' | 'desc'; // Export nếu cần ở nơi khác
export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error'; // Export nếu cần
export type RowSaveStatus = 'idle' | 'success' | 'error'; // Export nếu cần

// --- Interface ConferenceTableData (đã cập nhật) ---
export interface ConferenceTableData extends ConferenceAnalysisDetail {
    title: string;
    acronym: string;
    errorCount: number;
    validationWarningCount: number;
    hasValidationWarnings: boolean;
    validationWarnings?: ConferenceAnalysisDetail['validationIssues'];
}

export interface UseConferenceTableManagerProps {
    initialData: Record<string, ConferenceAnalysisDetail> | null | undefined;
}

export const useConferenceTableManager = ({ initialData }: UseConferenceTableManagerProps) => {
    const [expandedConference, setExpandedConference] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [selectedConferences, setSelectedConferences] = useState<Record<string, boolean>>({});
    const [mainSaveStatus, setMainSaveStatus] = useState<MainSavingStatus>('idle');
    const [rowSaveStatus, setRowSaveStatus] = useState<Record<string, RowSaveStatus>>({});
    const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>({});

    // --- CẬP NHẬT Data Preparation ---
    const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
        if (!initialData) return [];
        return Object.entries(initialData).map(([keyTitle, data]) => {
            // Tính toán các chỉ số validation
            const validationIssuesArray = data.validationIssues || []; // Đảm bảo là mảng
            const validationWarningCount = validationIssuesArray.length;
            const hasValidationWarnings = validationWarningCount > 0;

            return {
                ...data, // Bao gồm tất cả các trường từ ConferenceAnalysisDetail gốc
                title: keyTitle, // Sử dụng key làm title chính
                errorCount: data.errors?.length || 0,
                acronym: data.acronym || '',
                // --- Gán các giá trị validation đã tính toán ---
                validationWarningCount: validationWarningCount,
                hasValidationWarnings: hasValidationWarnings,
                validationWarnings: validationIssuesArray, // Giữ mảng gốc
                // ---------------------------------------------
            };
        });
    }, [initialData]);

    // Effect to initialize/reset row statuses (giữ nguyên)
    useEffect(() => {
        const initialStatus: Record<string, RowSaveStatus> = {};
        conferenceDataArray.forEach(conf => {
            initialStatus[conf.title] = 'idle';
        });
        setRowSaveStatus(initialStatus);
        setRowSaveErrors({});
        setSelectedConferences({});
        setMainSaveStatus('idle');
        setExpandedConference(null);
    }, [conferenceDataArray]);


    // --- CẬP NHẬT Sorting ---
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
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
                    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                case 'durationSeconds':
                case 'errorCount':
                // --- THÊM CASE SORT CHO VALIDATION WARNING COUNT ---
                case 'validationWarningCount':
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                // -----------------------------------------------
                default:
                    return 0;
            }
        });
    }, [conferenceDataArray, sortColumn, sortDirection]);

    // handleSort (cập nhật type SortableColumn đã đủ)
     const handleSort = useCallback((column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);


    // --- Selection ---
    const selectedTitles = useMemo(() => {
        return Object.entries(selectedConferences)
            .filter(([, isSelected]) => isSelected)
            .map(([title]) => title);
    }, [selectedConferences]);

    const handleRowSelectToggle = useCallback((title: string) => {
        setSelectedConferences(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    }, []);

    const handleSelectAll = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { newSelection[conf.title] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    const handleDeselectAll = useCallback(() => {
        setSelectedConferences({});
    }, []);

    const handleSelectNoError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        // Lọc dựa trên errorCount đã tính
        sortedData.forEach(conf => { if (conf.errorCount === 0) newSelection[conf.title] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    const handleSelectError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
         // Lọc dựa trên errorCount đã tính
        sortedData.forEach(conf => { if (conf.errorCount > 0) newSelection[conf.title] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    // --- THÊM HÀM CHỌN THEO WARNING ---
    const handleSelectWarning = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
         // Lọc dựa trên hasValidationWarnings đã tính
        sortedData.forEach(conf => { if (conf.hasValidationWarnings) newSelection[conf.title] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    const handleSelectNoWarning = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
         // Lọc dựa trên hasValidationWarnings đã tính
        sortedData.forEach(conf => { if (!conf.hasValidationWarnings) newSelection[conf.title] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);
    // ----------------------------------

    // --- Expand/Collapse (giữ nguyên) ---
    const toggleExpand = useCallback((title: string) => {
        setExpandedConference(prev => (prev === title ? null : title));
    }, []);

    // --- CẬP NHẬT Saving Logic ---
    // Tính toán xem có hàng nào được chọn mà có lỗi HOẶC warning không
    const isSelectedWithProblem = useMemo(() => {
        if (selectedTitles.length === 0) return false;
        const selectedData = sortedData.filter(conf => selectedConferences[conf.title]);
        // Trả về true nếu có bất kỳ hàng nào được chọn có errorCount > 0 HOẶC hasValidationWarnings === true
        return selectedData.some(conf => conf.errorCount > 0 || conf.hasValidationWarnings);
    }, [selectedTitles, selectedConferences, sortedData]);

    // Cập nhật isSaveEnabled để kiểm tra isSelectedWithProblem
    const isSaveEnabled = useMemo(() => {
        // Chỉ bật khi có hàng được chọn, không có hàng nào có vấn đề (lỗi hoặc warning), và không đang lưu
        return selectedTitles.length > 0 && !isSelectedWithProblem && mainSaveStatus !== 'saving';
    }, [selectedTitles.length, isSelectedWithProblem, mainSaveStatus]); // Thay đổi dependencies

    // Effect to reset main save status (giữ nguyên)
    useEffect(() => {
        if (mainSaveStatus === 'error' || mainSaveStatus === 'success') {
            setMainSaveStatus('idle');
        }
    }, [selectedConferences, mainSaveStatus]);

    // handleBulkSave (logic bên trong không cần thay đổi nhiều, vì isSaveEnabled đã lọc trước)
     const handleBulkSave = async () => {
        if (!isSaveEnabled) return; // Guard đã bao gồm cả check warning

        setMainSaveStatus('saving');
        const nextRowStatus = { ...rowSaveStatus };
        const nextRowErrors = { ...rowSaveErrors };
        selectedTitles.forEach(title => {
            nextRowStatus[title] = 'idle';
            delete nextRowErrors[title];
        });
        setRowSaveStatus(nextRowStatus);
        setRowSaveErrors(nextRowErrors);

        console.log(`Starting bulk save for: ${selectedTitles.join(', ')}`);

        // Filter items to save based on current selection
        const itemsToSave = conferenceDataArray.filter(conf => selectedConferences[conf.title]);
        // --- QUAN TRỌNG: Truyền dữ liệu cần thiết cho API ---
        // API `saveConferenceToJson` có thể cần toàn bộ `conf` hoặc chỉ một phần
        // Ví dụ: chỉ truyền title và finalResultPreview (nếu có) hoặc toàn bộ object
        const savePromises = itemsToSave.map(conf =>
            // Giả sử API chỉ cần title và dữ liệu preview (hoặc toàn bộ conf nếu cần)
            // Đảm bảo API của bạn nhận đúng dữ liệu bạn muốn lưu
             saveConferenceToJson(conf.title, conf.finalResult || {}) // Ví dụ: chỉ lưu preview
           // saveConferenceToJson(conf.title, conf) // Hoặc lưu toàn bộ conf
        );

        const results = await Promise.allSettled(savePromises);
        console.log(`Bulk save results:`, JSON.stringify( results));
        // Process results (logic này vẫn đúng để cập nhật row status)
        const finalRowStatus: Record<string, RowSaveStatus> = { ...nextRowStatus };
        const finalRowErrors: Record<string, string> = { ...nextRowErrors };
        let overallSuccess = true;
        let successfulSaves = 0;
        let failedSaves = 0;

        results.forEach((result, index) => { // Sử dụng index để lấy title từ itemsToSave nếu API không trả về
            const currentTitle = itemsToSave[index].title; // Lấy title từ mảng gốc để đảm bảo

            if (result.status === 'rejected') {
                overallSuccess = false;
                failedSaves++;
                // Cố gắng lấy message lỗi một cách an toàn hơn
                const errorMessage = typeof result.reason === 'object' && result.reason !== null && 'message' in result.reason
                                     ? String(result.reason.message)
                                     : String(result.reason);
                finalRowStatus[currentTitle] = 'error';
                finalRowErrors[currentTitle] = errorMessage;
                console.error(`Bulk Save Error (Rejected): ${currentTitle}`, errorMessage);
            } else if (result.status === 'fulfilled') {
                 // API có thể trả về { success: boolean, title: string, message?: string }
                 const response = result.value as { success: boolean, title?: string, message?: string }; // Type assertion
                 const titleFromResponse = response.title ?? currentTitle; // Ưu tiên title từ response nếu có

                if (!response.success) {
                    overallSuccess = false;
                    failedSaves++;
                    finalRowStatus[titleFromResponse] = 'error';
                    finalRowErrors[titleFromResponse] = response.message || 'Save operation failed (no specific message).';
                    console.error(`Bulk Save Error (Fulfilled, Backend Fail): ${titleFromResponse}`, response.message);
                } else {
                    successfulSaves++;
                    finalRowStatus[titleFromResponse] = 'success';
                    console.log(`Bulk Save Success: ${titleFromResponse}`);
                }
            }
        });

        setRowSaveStatus(finalRowStatus);
        setRowSaveErrors(finalRowErrors);

        if (overallSuccess) {
            setMainSaveStatus('success');
            console.log(`Bulk save completed successfully for ${successfulSaves} items.`);
            handleDeselectAll();
            // setTimeout(() => setMainSaveStatus('idle'), 3000);
        } else {
            setMainSaveStatus('error');
            console.error(`Bulk save completed with ${failedSaves} error(s) out of ${selectedTitles.length} selected items.`);
        }
    }


    // Mock Crawl Again Logic (giữ nguyên)
    const handleCrawlAgain = useCallback(() => {
        if (selectedTitles.length === 0) return;
        console.log("--- MOCK CRAWL AGAIN ---");
        console.log("Would trigger crawl for:", selectedTitles.join(', '));
        alert(`Mock: Triggering crawl again for ${selectedTitles.length} conference(s):\n${selectedTitles.join('\n')}`);
    }, [selectedTitles]);


     // --- CẬP NHẬT Return state and handlers ---
     // Đảm bảo hook trả về các hàm đã được định nghĩa trong phạm vi của nó
     // với các kiểu đã export ở trên
     return {
        sortedData,
        conferenceDataArray,
        sortColumn,
        sortDirection,
        handleSort, // Hàm này sử dụng SortableColumn đã export
        selectedConferences,
        selectedTitles,
        handleRowSelectToggle,
        handleSelectAll,
        handleSelectNoError,
        handleSelectError,
        handleSelectWarning,
        handleSelectNoWarning,
        handleDeselectAll,
        expandedConference,
        toggleExpand,
        mainSaveStatus,
        isSaveEnabled,
        handleBulkSave,
        rowSaveStatus,
        rowSaveErrors,
        handleCrawlAgain,
     };
};