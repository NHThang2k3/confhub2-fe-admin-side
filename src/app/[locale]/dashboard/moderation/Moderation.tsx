// src/components/Moderation/Moderation.tsx
'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ModerationControls from './ModerationControls';
import ConferenceList from './ConferenceList';
import CommentModal from './CommentModal';
import { useModerationFilters } from '@/src/hooks/moderation/useModerationFilters';
import { useModerationData } from '@/src/hooks/moderation/useModerationData';
import { useModerationModal } from '@/src/hooks/moderation/useModerationModal';
import { ConferenceListSkeleton } from './ConferenceListSkeleton';
import { Frown, SearchX } from 'lucide-react';

const Moderation: React.FC = () => {
    const t = useTranslations('Moderation');

    // 1. Hooks for state management (no changes needed here)
    const {
        filterStatus, setFilterStatus,
        searchTerm, setSearchTerm,
        filterStartDate, setFilterStartDate,
        filterEndDate, setFilterEndDate,
        sortKey, sortDirection,
        handleSortByTitle, handleSortByDate, handleClearDateFilter,
    } = useModerationFilters();

    const {
        conferences: allFetchedConferences,
        loading,
        error,
        refetch,
    } = useModerationData({ filterStartDate, filterEndDate, sortKey, sortDirection });

    const { openModal, modalProps } = useModerationModal({ onUpdateSuccess: refetch });

    // 2. Derived state for display (no changes needed here)
    const processedConferences = useMemo(() => {
        let result = [...allFetchedConferences];
        if (filterStatus !== 'all') {
            result = result.filter(conf => conf.status === filterStatus);
        }
        if (searchTerm) {
            result = result.filter(conf =>
                conf.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sortKey === 'title') {
            result.sort((a, b) => {
                const titleA = a.title?.toLowerCase() || '';
                const titleB = b.title?.toLowerCase() || '';
                if (titleA < titleB) return sortDirection === 'asc' ? -1 : 1;
                if (titleA > titleB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [allFetchedConferences, filterStatus, searchTerm, sortKey, sortDirection]);

    const counts = useMemo(() => ({
        all: allFetchedConferences.length,
        pending: allFetchedConferences.filter(c => c.status === 'PENDING').length,
        approved: allFetchedConferences.filter(c => c.status === 'APPROVED').length,
        rejected: allFetchedConferences.filter(c => c.status === 'REJECTED').length,
    }), [allFetchedConferences]);

    // 3. REVAMPED RENDER: Professional dashboard layout
    return (
        <div className='min-h-screen w-full bg-slate-50 font-sans'>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Header */}
                <header className="mb-8">
                    <h1 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                        {t('ModerationPage_Title')}
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        {t('ModerationPage_Subtitle', {defaultValue: "Quản lý và duyệt các hội nghị được gửi lên."})}
                    </p>
                </header>

                {/* Main Content Card */}
                <main className='rounded-xl bg-white p-4 shadow-lg sm:p-6'>
                    <ModerationControls
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterStartDate={filterStartDate}
                        setFilterStartDate={setFilterStartDate}
                        filterEndDate={filterEndDate}
                        setFilterEndDate={setFilterEndDate}
                        handleClearDateFilter={handleClearDateFilter}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        handleSortByName={handleSortByTitle}
                        handleSortByCreationDate={() => handleSortByDate('createdAt')}
                        handleSortByUpdateDate={() => handleSortByDate('updatedAt')}
                        counts={counts}
                        isLoading={loading}
                    />

                    {/* Content Area with Loading/Error/Data states */}
                    <div className="mt-6">
                        {loading && processedConferences.length === 0 && (
                            <ConferenceListSkeleton />
                        )}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 text-center">
                                <p className="text-sm font-medium text-red-800">
                                    {t('Error_Generic')}: {error}
                                </p>
                            </div>
                        )}

                        {!loading && !error && processedConferences.length > 0 && (
                            <ConferenceList
                                conferences={processedConferences}
                                onModerateClick={openModal}
                                showCommentModal={modalProps.show}
                            />
                        )}

                        {!loading && !error && allFetchedConferences.length > 0 && processedConferences.length === 0 && (
                            <div className='flex flex-col items-center gap-4 py-16 text-center text-slate-500'>
                                <SearchX className="h-12 w-12" />
                                <p className='text-lg font-semibold'>{t('ModerationPage_NoResultsSearch')}</p>
                                <p className='max-w-md text-sm'>{t('ModerationPage_NoResultsHint', {defaultValue: "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn."})}</p>
                            </div>
                        )}
                        {!loading && !error && allFetchedConferences.length === 0 && (
                             <div className='flex flex-col items-center gap-4 py-16 text-center text-slate-500'>
                                <Frown className="h-12 w-12" />
                                <p className='text-lg font-semibold'>{t('ModerationPage_NoRequestsFound')}</p>
                                <p className='max-w-md text-sm'>{t('ModerationPage_NoRequestsHint', {defaultValue: "Hiện tại không có yêu cầu nào cần duyệt trong hệ thống."})}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <CommentModal {...modalProps} />
        </div>
    );
};

export default Moderation;