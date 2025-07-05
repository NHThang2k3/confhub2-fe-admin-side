// src/components/Moderation/ModerationControls.tsx
'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateRangeInput from './DateRangeInput';
import { useTranslations } from 'next-intl';
import { ConferenceStatus, SortKey, SortDirection } from '@/src/types';
import { Search, X } from 'lucide-react';

interface ModerationControlsProps {
    filterStatus: ConferenceStatus | 'all';
    setFilterStatus: (status: ConferenceStatus | 'all') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterStartDate: Date | null;
    setFilterStartDate: (date: Date | null) => void;
    filterEndDate: Date | null;
    setFilterEndDate: (date: Date | null) => void;
    handleClearDateFilter: () => void;
    sortKey: SortKey;
    sortDirection: SortDirection;
    handleSortByName: () => void;
    handleSortByCreationDate: () => void;
    handleSortByUpdateDate: () => void;
    counts: { all: number; pending: number; approved: number; rejected: number; };
    isLoading?: boolean;
}

const ModerationControls: React.FC<ModerationControlsProps> = ({
    filterStatus, setFilterStatus,
    searchTerm, setSearchTerm,
    filterStartDate, setFilterStartDate,
    filterEndDate, setFilterEndDate,
    handleClearDateFilter,
    sortKey, sortDirection,
    handleSortByName, handleSortByCreationDate, handleSortByUpdateDate,
    counts, isLoading,
}) => {
    const t = useTranslations('ModerationControls');

    const tabs = [
        { name: t('Status_All', { count: counts.all }), value: 'all' },
        { name: t('Status_Pending', { count: counts.pending }), value: 'PENDING' },
        { name: t('Status_Approved', { count: counts.approved }), value: 'APPROVED' },
        { name: t('Status_Rejected', { count: counts.rejected }), value: 'REJECTED' },
    ];

    return (
        <div>
            {/* Status Filter Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => !isLoading && setFilterStatus(tab.value as any)}
                            disabled={isLoading}
                            className={`
                                whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors
                                ${filterStatus === tab.value
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                }
                                disabled:cursor-not-allowed disabled:opacity-50
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search, Date, and Sort Controls */}
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search Input */}
                <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('SearchByTitle_Placeholder')}
                        className="block w-full rounded-md border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={isLoading}
                    />
                </div>

                {/* Other Filters and Sorters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selected={filterStartDate}
                            onChange={(dates: [Date | null, Date | null]) => {
                                const [start, end] = dates;
                                setFilterStartDate(start);
                                setFilterEndDate(end);
                            }}
                            startDate={filterStartDate}
                            endDate={filterEndDate}
                            selectsRange
                            customInput={<DateRangeInput placeholder={t('DateRangeInput_Placeholder')} />}
                            dateFormat="yyyy/MM/dd"
                            disabled={isLoading}
                        />
                        {(filterStartDate || filterEndDate) && (
                            <button
                                onClick={handleClearDateFilter}
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-200 text-sm text-slate-600 hover:bg-slate-300 disabled:opacity-50"
                                disabled={isLoading}
                                aria-label={t('ClearDates_Button')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort Buttons */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">{t('SortBy_Label')}:</span>
                        <button onClick={handleSortByName} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${sortKey === 'title' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'} disabled:opacity-50`} disabled={isLoading}>{t('SortBy_Title_Button')}</button>
                        <button onClick={handleSortByCreationDate} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${sortKey === 'createdAt' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'} disabled:opacity-50`} disabled={isLoading}>{t('SortBy_AddedDate_Button')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModerationControls;