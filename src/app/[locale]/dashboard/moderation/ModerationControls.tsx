// src/components/Moderation/ModerationControls.tsx

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateRangeInput from './DateRangeInput';

// Import types - make sure these are updated in src/types.ts
import { ConferenceStatus, SortKey, SortDirection } from '@/src/types';

interface ModerationControlsProps {
    // Filter Props
    filterStatus: ConferenceStatus | 'all';
    setFilterStatus: (status: ConferenceStatus | 'all') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterStartDate: Date | null;
    setFilterStartDate: (date: Date | null) => void;
    filterEndDate: Date | null;
    setFilterEndDate: (date: Date | null) => void;
    handleClearDateFilter: () => void;

    // Sort Props
    sortKey: SortKey; // This can be 'title', 'createdAt', 'updatedAt'
    sortDirection: SortDirection;
    handleSortByName: () => void; // This handler is for sorting by title
    handleSortByCreationDate: () => void;
    handleSortByUpdateDate: () => void;

    // Data for counts
    allConferencesCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;

    // Loading state
    isLoading?: boolean;
}

const ModerationControls: React.FC<ModerationControlsProps> = ({
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    handleClearDateFilter,
    sortKey,
    sortDirection,
    handleSortByName, // Handler for title sort
    handleSortByCreationDate,
    handleSortByUpdateDate,
    allConferencesCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading,
}) => {
    const getDateSortLabel = (key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' (Oldest First)' : ' (Newest First)';
        }
        return ' (Newest First)';
    };

     const getTitleSortLabel = () => {
         if (sortKey === 'title') {
              return sortDirection === 'asc' ? ' (A-Z)' : ' (Z-A)';
         }
         return ' (A-Z)';
     };


    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:flex-wrap gap-4">
            {/* Filter Control */}
            <div className="flex items-center shrink-0">
                <label htmlFor="statusFilter" className="mr-2 text-gray-700 text-sm">Filter by Status:</label>
                <select
                    id="statusFilter"
                    value={filterStatus}
                    // Value is uppercase, fetch logic converts to lowercase if needed by API filter param
                    onChange={(e) => setFilterStatus(e.target.value as ConferenceStatus | 'all')}
                    className="rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    <option value="all">All ({allConferencesCount})</option>
                    <option value="PENDING">Pending ({pendingCount})</option> {/* Uppercase */}
                    <option value="APPROVED">Approved ({approvedCount})</option> {/* Uppercase */}
                    <option value="REJECTED">Rejected ({rejectedCount})</option> {/* Uppercase */}
                </select>
            </div>

            {/* Search Control - Searching by Title */}
            <div className="flex items-center flex-grow">
                <label htmlFor="conferenceSearch" className="mr-2 text-gray-700 text-sm shrink-0">Search by Title:</label>
                <input
                    id="conferenceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter conference title..."
                    className="w-full rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                />
            </div>

            {/* Date Filter Control */}
            <div className="flex items-center gap-2 shrink-0">
                <label className="text-gray-700 text-sm shrink-0">Added Date Range:</label> {/* Filtering on request createdAt */}
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
                    customInput={<DateRangeInput placeholder="Select date range"/>}
                    dateFormat="yyyy/MM/dd"
                    disabled={isLoading}
                />
                {(filterStartDate || filterEndDate) && (
                    <button
                        onClick={handleClearDateFilter}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Clear Dates
                    </button>
                )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <label className="text-gray-700 text-sm shrink-0">Sort by:</label>
                <button
                    onClick={handleSortByName} // Call handler for title sort
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'title' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    Title{' '}
                    {getTitleSortLabel()}
                </button>

                <button
                    onClick={handleSortByCreationDate} // Sort by request createdAt
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'createdAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    Added Date{' '}
                    {getDateSortLabel('createdAt')}
                </button>

                 <button
                    onClick={handleSortByUpdateDate} // Sort by request updatedAt
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'updatedAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    Updated Date{' '}
                    {getDateSortLabel('updatedAt')}
                </button>
            </div>
        </div>
    );
};

export default ModerationControls;