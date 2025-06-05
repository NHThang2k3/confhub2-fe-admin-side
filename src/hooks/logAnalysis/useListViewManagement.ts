// src/app/[locale]/dashboard/logAnalysis/hooks/useListViewManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { SortConfig } from '@/src/app/[locale]/dashboard/logAnalysis/analysis/LogRequestsList';
import { RequestSortableKey } from '@/src/app/[locale]/dashboard/logAnalysis/analysis/RequestsTable';

const DEFAULT_SORT_CONFIG: SortConfig = { key: 'startTime', direction: 'descending' };

export interface ListViewState {
    currentPage: number;
    sortConfig: SortConfig;
    selectedRequestIds: string[];
}

export interface ListViewHandlers {
    handlePageChange: (page: number) => void;
    handleSort: (key: RequestSortableKey) => void;
    handleToggleRequestSelection: (requestId: string) => void;
    handleUpdateSelectedIds: (idsToSelect: string[], idsToDeselect: string[]) => void;
    setSelectedRequestIds: React.Dispatch<React.SetStateAction<string[]>>; // Expose for direct manipulation if needed
    resetListView: () => void; // To reset pagination, sort, selection
}

interface UseListViewManagementProps {
    // Dependencies that trigger reset
    timeFilterOption: string;
    activeRequestIdFilter?: string;
    activeCrawler: string;
    isDetailView: boolean;
    hasData: boolean;
}

export const useListViewManagement = ({
    timeFilterOption,
    activeRequestIdFilter,
    activeCrawler,
    isDetailView,
    hasData,
}: UseListViewManagementProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT_CONFIG);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

    const resetListViewStates = useCallback(() => {
        setCurrentPage(1);
        setSortConfig(DEFAULT_SORT_CONFIG);
        setSelectedRequestIds([]);
    }, []);

    useEffect(() => {
        resetListViewStates();
    }, [timeFilterOption, activeRequestIdFilter, activeCrawler, resetListViewStates]);

    useEffect(() => {
        if (isDetailView || !hasData) {
            setSelectedRequestIds([]);
        }
    }, [isDetailView, hasData]);


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (key: RequestSortableKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending'; // Allow toggling back to ascending if clicked again
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleToggleRequestSelection = useCallback((requestId: string) => {
        setSelectedRequestIds(prevSelected =>
            prevSelected.includes(requestId)
                ? prevSelected.filter(id => id !== requestId)
                : [...prevSelected, requestId]
        );
    }, []);

    const handleUpdateSelectedIds = useCallback((idsToSelect: string[], idsToDeselect: string[]) => {
        setSelectedRequestIds(prevSelected => {
            let newSelected = [...prevSelected];
            idsToSelect.forEach(id => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
            newSelected = newSelected.filter(id => !idsToDeselect.includes(id));
            return newSelected;
        });
    }, []);

    const state: ListViewState = { currentPage, sortConfig, selectedRequestIds };
    const handlers: ListViewHandlers = {
        handlePageChange,
        handleSort,
        handleToggleRequestSelection,
        handleUpdateSelectedIds,
        setSelectedRequestIds,
        resetListView: resetListViewStates,
    };

    return { ...state, ...handlers };
};