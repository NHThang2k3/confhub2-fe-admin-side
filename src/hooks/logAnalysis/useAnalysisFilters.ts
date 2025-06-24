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
    tempCustomStartDate: Date | null;
    tempCustomEndDate: Date | null;
}

export interface AnalysisFilterHandlers {
    handleTimeFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    setTextFilterInput: React.Dispatch<React.SetStateAction<string>>;
    // THÊM MỚI: Hàm để áp dụng filter ngay lập tức
    setTextFilterAndApplyImmediately: (value: string) => void;
    clearActiveTextFilter: () => void;
    setActiveCrawler: React.Dispatch<React.SetStateAction<CrawlerType>>;
    setTempCustomStartDate: (date: Date | null) => void;
    setTempCustomEndDate: (date: Date | null) => void;
    applyCustomDateFilter: () => void;
}

export const useAnalysisFilters = (initialCrawler: CrawlerType = 'conference') => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    
    const [textFilterInput, setTextFilterInput] = useState<string>('');
    const [activeTextFilter, setActiveTextFilter] = useState<string | undefined>(undefined);
    
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>(initialCrawler);

    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [tempCustomStartDate, setTempCustomStartDate] = useState<Date | null>(null);
    const [tempCustomEndDate, setTempCustomEndDate] = useState<Date | null>(null);

    // Debounce này chỉ dành cho việc người dùng gõ phím
    const debouncedFilterTerm = useDebounce(textFilterInput, 400);

    // useEffect này xử lý việc cập nhật filter khi người dùng gõ phím
    useEffect(() => {
        const debouncedValue = debouncedFilterTerm.trim() || undefined;
        // Chỉ cập nhật nếu giá trị debounced khác với filter đang active
        // để tránh trigger lại khi filter được set ngay lập tức từ nơi khác.
        if (debouncedValue !== activeTextFilter) {
            setActiveTextFilter(debouncedValue);
        }
    }, [debouncedFilterTerm]); // Chỉ phụ thuộc vào giá trị đã debounce

    // useEffect xử lý filter thời gian
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

    }, [timeFilterOption, customStartDate, customEndDate]);

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newOption = event.target.value;
        setTimeFilterOption(newOption);
        if (newOption !== 'custom') {
            setCustomStartDate(null);
            setCustomEndDate(null);
        }
    };

    // CẬP NHẬT: Hàm này giờ sẽ có hiệu lực ngay lập tức
    const clearActiveTextFilter = useCallback(() => {
        setTextFilterInput('');
        setActiveTextFilter(undefined); // Cập nhật active filter ngay
    }, []);

    // THÊM MỚI: Hàm để set filter và áp dụng ngay, bỏ qua debounce
    const setTextFilterAndApplyImmediately = useCallback((value: string) => {
        const trimmedValue = value.trim() || undefined;
        setTextFilterInput(value); // Cập nhật UI input
        setActiveTextFilter(trimmedValue); // Cập nhật active filter ngay để fetch data
    }, []);

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
        setTextFilterInput, // Dùng cho ô input để có debounce
        setTextFilterAndApplyImmediately, // Dùng cho các hành động cần hiệu lực ngay
        clearActiveTextFilter,
        setActiveCrawler,
        setTempCustomStartDate,
        setTempCustomEndDate,
        applyCustomDateFilter,
    };

    return { ...state, ...handlers };
};