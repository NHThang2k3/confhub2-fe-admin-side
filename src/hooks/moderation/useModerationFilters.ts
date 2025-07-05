// src/hooks/useModerationFilters.ts

import { useState, useCallback } from 'react';
import { ConferenceStatus, SortKey, SortDirection } from '@/src/types';

/**
 * Custom hook to manage all filter and sort states for the Moderation page.
 * @returns An object containing all filter/sort states, their setters, and handlers.
 */
export const useModerationFilters = () => {
    const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSortByTitle = useCallback(() => {
        if (sortKey === 'title') {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('title');
            setSortDirection('asc');
        }
    }, [sortKey]);

    const handleSortByDate = useCallback((key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    }, [sortKey]);

    const handleClearDateFilter = useCallback(() => {
        setFilterStartDate(null);
        setFilterEndDate(null);
    }, []);

    return {
        filterStatus,
        setFilterStatus,
        searchTerm,
        setSearchTerm,
        filterStartDate,
        setFilterStartDate,
        filterEndDate,
        setFilterEndDate,
        sortKey,
        sortDirection,
        handleSortByTitle,
        handleSortByDate,
        handleClearDateFilter,
    };
};