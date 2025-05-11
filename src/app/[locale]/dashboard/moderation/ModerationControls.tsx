// src/components/Moderation/ModerationControls.tsx

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Styles might be imported globally
import DateRangeInput from './DateRangeInput'; // Import the custom input

import { Conference, ConferenceStatus, SortKey, SortDirection } from '@/src/types'; // Import types

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
    sortKey: SortKey;
    sortDirection: SortDirection;
    handleSortByName: () => void;
    handleSortByCreationDate: () => void;

    // Data for counts (optional, can be derived in parent)
    allConferencesCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
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
    handleSortByName,
    handleSortByCreationDate,
    allConferencesCount,
    pendingCount,
    approvedCount,
    rejectedCount,
}) => {
    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:flex-wrap gap-4">
            {/* Filter Control */}
            <div className="flex items-center shrink-0">
                <label htmlFor="statusFilter" className="mr-2 text-gray-700 text-sm">Filter by Status:</label>
                <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ConferenceStatus | 'all')}
                    className="rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm"
                >
                    <option value="all">All ({allConferencesCount})</option>
                    <option value="pending">Pending ({pendingCount})</option>
                    <option value="approved">Approved ({approvedCount})</option>
                    <option value="rejected">Rejected ({rejectedCount})</option>
                </select>
            </div>

            {/* Search Control */}
            <div className="flex items-center flex-grow">
                <label htmlFor="conferenceSearch" className="mr-2 text-gray-700 text-sm shrink-0">Search by Name:</label>
                <input
                    id="conferenceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter conference name..."
                    className="w-full rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm"
                />
            </div>

            {/* Date Filter Control */}
            <div className="flex items-center gap-2 shrink-0">
                <label className="text-gray-700 text-sm shrink-0">Added Date Range:</label>
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
                />
                {(filterStartDate || filterEndDate) && (
                    <button
                        onClick={handleClearDateFilter}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 shrink-0"
                    >
                        Clear Dates
                    </button>
                )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <label className="text-gray-700 text-sm shrink-0">Sort by:</label>
                <button
                    onClick={handleSortByName}
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out
                        ${sortKey === 'name' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                >
                    Name{' '}
                    {sortKey === 'name' && (
                        sortDirection === 'asc' ? ' (A-Z)' : ' (Z-A)'
                    )}
                    {sortKey !== 'name' && ' (A-Z)'}
                </button>

                <button
                    onClick={handleSortByCreationDate}
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out
                        ${sortKey === 'createdAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                >
                    Added Date{' '}
                    {sortKey === 'createdAt' && (
                        sortDirection === 'asc' ? ' (Oldest First)' : ' (Newest First)'
                    )}
                    {sortKey !== 'createdAt' && ' (Newest First)'}
                </button>
            </div>
        </div>
    );
};

export default ModerationControls;