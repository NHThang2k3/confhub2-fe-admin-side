// src/hooks/useAnalysisFilters.ts
import { useState, useEffect, useCallback } from 'react';
import { CrawlerType } from './useLogAnalysisData';

export interface AnalysisFilterState {
    timeFilterOption: string;
    filterStartTime?: number;
    filterEndTime?: number;
    requestIdFilterInput: string;
    activeRequestIdFilter?: string;
    activeCrawler: CrawlerType;
}

export interface AnalysisFilterHandlers {
    handleTimeFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    setRequestIdFilterInput: React.Dispatch<React.SetStateAction<string>>;
    applyRequestIdFilterFromInput: () => void;
    clearActiveFilterAndGoToList: () => void;
    setActiveCrawler: React.Dispatch<React.SetStateAction<CrawlerType>>;
    setActiveRequestIdFilter: React.Dispatch<React.SetStateAction<string | undefined>>; // Expose this for direct setting
}

export const useAnalysisFilters = (initialCrawler: CrawlerType = 'conference') => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>(initialCrawler);

    useEffect(() => {
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = undefined;

        switch (timeFilterOption) {
            case 'last_hour': start = now - 60 * 60 * 1000; end = now; break;
            case 'last_6h': start = now - 6 * 60 * 60 * 1000; end = now; break;
            case 'last_24h': start = now - 24 * 60 * 60 * 1000; end = now; break;
            case 'last_7d': start = now - 7 * 24 * 60 * 60 * 1000; end = now; break;
            case 'latest': default: break;
        }
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
    };

    const applyRequestIdFilterFromInput = useCallback(() => {
        const trimmedInput = requestIdFilterInput.trim();
        setActiveRequestIdFilter(trimmedInput || undefined);
    }, [requestIdFilterInput]);

    const clearActiveFilterAndGoToList = useCallback(() => {
        setRequestIdFilterInput('');
        setActiveRequestIdFilter(undefined);
    }, []);

    const state: AnalysisFilterState = {
        timeFilterOption,
        filterStartTime,
        filterEndTime,
        requestIdFilterInput,
        activeRequestIdFilter,
        activeCrawler,
    };

    const handlers: AnalysisFilterHandlers = {
        handleTimeFilterChange,
        setRequestIdFilterInput,
        applyRequestIdFilterFromInput,
        clearActiveFilterAndGoToList,
        setActiveCrawler,
        setActiveRequestIdFilter,
    };

    return { ...state, ...handlers };
};