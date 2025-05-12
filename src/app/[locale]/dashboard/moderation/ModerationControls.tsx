// src/components/Moderation/ModerationControls.tsx
'use client'; // <-- Marked as client component

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateRangeInput from './DateRangeInput';
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import

// Import types
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
    sortKey: SortKey;
    sortDirection: SortDirection;
    handleSortByName: () => void;
    handleSortByCreationDate: () => void;
    handleSortByUpdateDate: () => void;

    // Data for counts
    allConferencesCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;

    // Loading state
    isLoading?: boolean;

    // (Optional) If not using useTranslations here, receive t as prop:
    // t: ReturnType<typeof useTranslations>;
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
    handleSortByUpdateDate,
    allConferencesCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading,
    // If receiving t as prop:
    // t,
}) => {
    // Call useTranslations hook here
    const t = useTranslations('ModerationControls'); // <-- Added hook call (using a namespace example)

    // Translate sort labels
    const getDateSortLabel = (key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ` ${t('SortDirection_OldestFirst')}` : ` ${t('SortDirection_NewestFirst')}`; // <-- Translated
        }
        return ` ${t('SortDirection_NewestFirst')}`; // <-- Translated (default)
    };

     const getTitleSortLabel = () => {
         if (sortKey === 'title') {
              return sortDirection === 'asc' ? ` ${t('SortDirection_AZ')}` : ` ${t('SortDirection_ZA')}`; // <-- Translated
         }
         return ` ${t('SortDirection_AZ')}`; // <-- Translated (default)
     };


    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:flex-wrap gap-4">
            {/* Filter Control */}
            <div className="flex items-center shrink-0">
                {/* Translate label */}
                <label htmlFor="statusFilter" className="mr-2 text-gray-700 text-sm">{t('FilterByStatus_Label')}:</label> {/* <-- Translated */}
                <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ConferenceStatus | 'all')}
                    className="rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                     {/* Translate options with counts */}
                    <option value="all">{t('Status_All', { count: allConferencesCount })}</option> {/* <-- Translated with interpolation */}
                    <option value="PENDING">{t('Status_Pending', { count: pendingCount })}</option> {/* <-- Translated with interpolation */}
                    <option value="APPROVED">{t('Status_Approved', { count: approvedCount })}</option> {/* <-- Translated with interpolation */}
                    <option value="REJECTED">{t('Status_Rejected', { count: rejectedCount })}</option> {/* <-- Translated with interpolation */}
                </select>
            </div>

            {/* Search Control - Searching by Title */}
            <div className="flex items-center flex-grow">
                {/* Translate label */}
                <label htmlFor="conferenceSearch" className="mr-2 text-gray-700 text-sm shrink-0">{t('SearchByTitle_Label')}:</label> {/* <-- Translated */}
                <input
                    id="conferenceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // Translate placeholder
                    placeholder={t('SearchByTitle_Placeholder')} 
                    className="w-full rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                />
            </div>

            {/* Date Filter Control */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Translate label */}
                <label className="text-gray-700 text-sm shrink-0">{t('AddedDateRange_Label')}:</label> {/* <-- Translated */}
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
                    // Assuming DateRangeInput takes a placeholder prop that needs translation
                    customInput={<DateRangeInput placeholder={t('DateRangeInput_Placeholder')}/>} 
                    dateFormat="yyyy/MM/dd"
                    disabled={isLoading}
                />
                {(filterStartDate || filterEndDate) && (
                    <button
                        onClick={handleClearDateFilter}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {/* Translate button text */}
                        {t('ClearDates_Button')} {/* <-- Translated */}
                    </button>
                )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Translate label */}
                <label className="text-gray-700 text-sm shrink-0">{t('SortBy_Label')}:</label> {/* <-- Translated */}
                <button
                    onClick={handleSortByName}
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'title' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    {/* Translate button text and append translated sort label */}
                    {t('SortBy_Title_Button')}{getTitleSortLabel()} {/* <-- Translated */}
                </button>

                <button
                    onClick={handleSortByCreationDate}
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'createdAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    {/* Translate button text and append translated sort label */}
                    {t('SortBy_AddedDate_Button')}{getDateSortLabel('createdAt')} {/* <-- Translated */}
                </button>

                 <button
                    onClick={handleSortByUpdateDate}
                    className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                        ${sortKey === 'updatedAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                    `}
                    disabled={isLoading}
                >
                    {/* Translate button text and append translated sort label */}
                    {t('SortBy_UpdatedDate_Button')}{getDateSortLabel('updatedAt')} {/* <-- Translated */}
                </button>
            </div>
        </div>
    );
};

export default ModerationControls;