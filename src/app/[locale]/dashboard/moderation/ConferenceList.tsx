// src/app/[locale]/dashboard/moderation/ConferenceList.tsx
'use client'; // <-- Add directive

import React from 'react';
// Import types
import { Conference, ConferenceStatus, ConferenceDate, Location, Organization } from '@/src/types';
// Import helpers
import { getStatusColorClass, getStatusBgClass } from '../../utils/moderationHelpers'; // Assume these helpers work with string status
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import

// Helper to format Date objects for display (can remain here, doesn't have translatable strings)
const formatDateTimeDisplay = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) return 'N/A';
     return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}


// FIXED: Changed the type of the `t` parameter from `ReturnType<typeof useTranslations>`
// to `(key: string) => string` to resolve the 'never' type inference issue.
const formatDateRangeDisplay = (fromDate: Date | undefined, toDate: Date | undefined, t: (key: string) => string) => {
     const formattedFrom = fromDate && !isNaN(fromDate.getTime()) ? formatDateTimeDisplay(fromDate).split(', ')[0] : t('Common_NA');
     const formattedTo = toDate && !isNaN(toDate.getTime()) ? formatDateTimeDisplay(toDate).split(', ')[0] : t('Common_NA');

     if (formattedFrom === t('Common_NA') && formattedTo === t('Common_NA')) return t('Common_NA');
     if (formattedFrom === formattedTo && formattedFrom !== t('Common_NA')) return formattedFrom;
     if (formattedFrom !== t('Common_NA') && formattedTo === t('Common_NA')) return `${formattedFrom} ${t('DateRange_Onwards')}`;
     if (formattedFrom === t('Common_NA') && formattedTo !== t('Common_NA')) return `${t('DateRange_Until')} ${formattedTo}`;

     return `${formattedFrom} - ${formattedTo}`;
};

// FIXED: Applied the same type fix to this helper for consistency.
const formatLocationDisplay = (location: Location | undefined | null, t: (key: string) => string) => {
     if (!location) return t('Common_NA');
     const parts = [];
     if (location.address) parts.push(location.address);
     if (location.cityStateProvince) parts.push(location.cityStateProvince);
     if (location.country) parts.push(location.country);
     if (location.continent && parts.length === 0 && !location.country && !location.cityStateProvince && !location.address) parts.push(location.continent);
     return parts.length > 0 ? parts.filter(p => p != null).join(', ') : t('Common_NA');
};


interface ConferenceListProps {
    conferences: Conference[];
    onModerateClick: (conferenceId: string, status: ConferenceStatus) => void;
    showCommentModal: boolean;
}

const ConferenceList: React.FC<ConferenceListProps> = ({
    conferences,
    onModerateClick,
    showCommentModal,
}) => {
     // `t` for component-specific keys
     const t = useTranslations('ConferenceList');
     // `tCommon` for shared keys like 'Common_NA'
     const tCommon = useTranslations('Common');

    if (!conferences || conferences.length === 0) {
        return null;
    }

    return (
        <ul>
            {conferences.map(conference => {
                 const mainOrganization = conference.organizations?.[0];
                 const mainLocation = mainOrganization?.locations?.[0];
                 const mainConferenceDates = mainOrganization?.conferenceDates;

                return (
                    <li
                        key={conference.id}
                        className={`border-b border-gray-20 py-0 px-0 last:border-b-0 ${getStatusBgClass(conference.status)}`}
                    >
                        <div className="p-4">
                             {conference.detailsFetchError && (
                                 <div className="mb-3 text-sm text-red-600 italic">
                                     {t('Error_DetailsLoadFailed_Label')}: {conference.detailsFetchError}
                                 </div>
                             )}

                            <div className='mb-3 flex items-start justify-between'>
                                <div>
                                    <h3 className='text-xl font-semibold '>
                                        {conference.title || t('Default_UntitledConference')}
                                        {conference.acronym && conference.acronym.trim() !== '' && (
                                             <span className="font-normal "> ({conference.acronym})</span>
                                        )}
                                    </h3>

                                     {mainOrganization?.link && mainOrganization.link.trim() !== '' && (
                                         <p className='text-sm text-blue-600 hover:underline'>
                                             <a href={mainOrganization.link} target="_blank" rel="noopener noreferrer">{mainOrganization.link}</a>
                                         </p>
                                     )}

                                     {mainOrganization?.accessType && (
                                          <p className='text-sm italic '>
                                            {mainOrganization.accessType}
                                          </p>
                                     )}

                                    <p className='text-xs  mt-1'>
                                        {t('Requested_Label')}: {formatDateTimeDisplay(conference.createdAt)}
                                    </p>
                                     <p className='text-xs '>
                                        {t('LastUpdated_Label')}: {formatDateTimeDisplay(conference.updatedAt)}
                                    </p>
                                </div>
                                <span
                                    className={`ml-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColorClass(conference.status)}`}
                                >
                                    {t(`Status_${conference.status}`)}
                                </span>
                            </div>

                             {mainConferenceDates && mainConferenceDates.length > 0 && (
                                 <div className="mb-3 text-sm ">
                                    <p><strong>{t('ImportantDates_Label')}:</strong></p>
                                     <ul className="list-disc list-inside ml-4">
                                         {mainConferenceDates.map((dateItem, index) => (
                                             dateItem && (
                                                <li key={index}>
                                                    {dateItem.name || dateItem.type || t('DateRange_DefaultLabel')}: {formatDateRangeDisplay(dateItem.fromDate, dateItem.toDate, tCommon)}
                                                </li>
                                             )
                                         ))}
                                     </ul>
                                 </div>
                             )}

                            {mainLocation && formatLocationDisplay(mainLocation, tCommon) !== tCommon('Common_NA') && (
                                <div className="mb-3 text-sm ">
                                    <p><strong>{t('Location_Label')}:</strong> {formatLocationDisplay(mainLocation, tCommon)}</p>
                                </div>
                             )}

                             {mainOrganization?.topics && mainOrganization.topics.length > 0 && (
                                 <div className="mb-3 text-sm ">
                                     <p><strong>{t('Topics_Label')}:</strong> {mainOrganization.topics.join(', ')}</p>
                                 </div>
                             )}

                            {(mainOrganization?.summary && mainOrganization.summary.trim() !== "") && (
                                <div className="mb-3 text-sm ">
                                    <p><strong>{t('Summary_Label')}:</strong> {mainOrganization.summary}</p>
                                </div>
                            )}

                            {conference.message && conference.message.trim() !== '' && (
                                 <div className="mb-3 text-sm  italic">
                                     <p><strong>{t('UserMessage_Label')}:</strong> {conference.message}</p>
                                 </div>
                            )}

                            {conference.comment && conference.comment.trim() !== '' && (
                                <div className="mb-4 text-sm  italic">
                                    <strong>{t('ModerationComment_Label')}:</strong> {conference.comment}
                                </div>
                            )}

                            <div className='flex flex-wrap gap-3'>
                                {conference.status !== 'APPROVED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'APPROVED')}
                                        className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {t('Approve_Button')}
                                    </button>
                                )}

                                {conference.status !== 'REJECTED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'REJECTED')}
                                        className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {t('Reject_Button')}
                                    </button>
                                )}

                                {conference.status !== 'PENDING' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'PENDING')}
                                        className='rounded bg-gray-30 px-4 py-2 text-sm  transition duration-150 ease-in-out hover:bg-gray-40 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {t('SetPending_Button')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default ConferenceList;