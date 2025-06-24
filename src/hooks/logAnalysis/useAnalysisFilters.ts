// src/hooks/logAnalysis/useAnalysisFilters.ts
import { useState, useEffect, useCallback } from 'react';
import { CrawlerType } from './useLogAnalysisData';
import { useDebounce } from '../useDebounce';

export interface AnalysisFilterState {
    timeFilterOption: string;
    filterStartTime?: number;
    filterEndTime?: number;
    textFilterInput: string;
    activeTextFilter?: string;
    activeCrawler: CrawlerType;
    // State tạm thời để người dùng chọn
    tempCustomStartDate: Date | null;
    tempCustomEndDate: Date | null;
}

export interface AnalysisFilterHandlers {
    handleTimeFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    setTextFilterInput: React.Dispatch<React.SetStateAction<string>>;
    clearActiveTextFilter: () => void;
    setActiveCrawler: React.Dispatch<React.SetStateAction<CrawlerType>>;
    // Handlers cho state tạm thời
    setTempCustomStartDate: (date: Date | null) => void;
    setTempCustomEndDate: (date: Date | null) => void;
    // Hàm để áp dụng filter
    applyCustomDateFilter: () => void;
}

export const useAnalysisFilters = (initialCrawler: CrawlerType = 'conference') => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    
    const [textFilterInput, setTextFilterInput] = useState<string>('');
    const [activeTextFilter, setActiveTextFilter] = useState<string | undefined>(undefined);
    
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>(initialCrawler);

    // State chính thức để lọc
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    // State tạm thời cho UI
    const [tempCustomStartDate, setTempCustomStartDate] = useState<Date | null>(null);
    const [tempCustomEndDate, setTempCustomEndDate] = useState<Date | null>(null);

    const debouncedFilterTerm = useDebounce(textFilterInput, 400);

    useEffect(() => {
        if (debouncedFilterTerm !== activeTextFilter) {
            setActiveTextFilter(debouncedFilterTerm.trim() || undefined);
        }
    }, [debouncedFilterTerm, activeTextFilter]);

    useEffect(() => {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = now;

        switch (timeFilterOption) {
            case 'last_hour':
                start = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'last_6h':
                start = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case 'last_24h':
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
             case 'last_7d':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'custom':
                // Luôn sử dụng giá trị từ state chính thức để lọc
                start = customStartDate;
                end = customEndDate;
                break;
            case 'latest':
            default:
                start = null;
                end = null;
                break;
        }

           setFilterStartTime(start ? start.getTime() : undefined);
        setFilterEndTime(end ? end.getTime() : undefined);

    }, [timeFilterOption, customStartDate, customEndDate]); // Chỉ phụ thuộc vào state chính thức

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newOption = event.target.value;
        setTimeFilterOption(newOption);
        // Nếu người dùng chuyển khỏi chế độ "Custom", xóa các giá trị custom đã áp dụng
        if (newOption !== 'custom') {
            setCustomStartDate(null);
            setCustomEndDate(null);
        }
    };

    const clearActiveTextFilter = useCallback(() => {
        setTextFilterInput('');
    }, []);

    // Hàm mới để áp dụng date range
    const applyCustomDateFilter = useCallback(() => {
        setCustomStartDate(tempCustomStartDate);
        setCustomEndDate(tempCustomEndDate);
    }, [tempCustomStartDate, tempCustomEndDate]);

    const state: AnalysisFilterState = {
        timeFilterOption,
        filterStartTime,
        filterEndTime,
        textFilterInput,
        activeTextFilter,
        activeCrawler,
        tempCustomStartDate,
        tempCustomEndDate,
    };

    const handlers: AnalysisFilterHandlers = {
        handleTimeFilterChange,
        setTextFilterInput,
        clearActiveTextFilter,
        setActiveCrawler,
        setTempCustomStartDate,
        setTempCustomEndDate,
        applyCustomDateFilter,
    };

    return { ...state, ...handlers };
};
