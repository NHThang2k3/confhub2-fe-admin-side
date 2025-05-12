// src/components/Moderation/ConferenceList.tsx
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

// Helper to format a date range (uses Date objects and needs access to 't' for "N/A", "onwards", "until")
const formatDateRangeDisplay = (fromDate: Date | undefined, toDate: Date | undefined, t: ReturnType<typeof useTranslations>) => {
     const formattedFrom = fromDate && !isNaN(fromDate.getTime()) ? formatDateTimeDisplay(fromDate).split(', ')[0] : t('Common_NA'); // <-- Use t() for N/A
     const formattedTo = toDate && !isNaN(toDate.getTime()) ? formatDateTimeDisplay(toDate).split(', ')[0] : t('Common_NA'); // <-- Use t() for N/A

     if (formattedFrom === t('Common_NA') && formattedTo === t('Common_NA')) return t('Common_NA'); // <-- Use t() for N/A
     if (formattedFrom === formattedTo && formattedFrom !== t('Common_NA')) return formattedFrom;
     if (formattedFrom !== t('Common_NA') && formattedTo === t('Common_NA')) return `${formattedFrom} ${t('DateRange_Onwards')}`; // <-- Use t() for 'onwards'
     if (formattedFrom === t('Common_NA') && formattedTo !== t('Common_NA')) return `${t('DateRange_Until')} ${formattedTo}`; // <-- Use t() for 'until'

     return `${formattedFrom} - ${formattedTo}`;
};

// Helper to display a single location (needs access to 't' for "N/A")
const formatLocationDisplay = (location: Location | undefined | null, t: ReturnType<typeof useTranslations>) => {
     if (!location) return t('Common_NA'); // <-- Use t() for N/A
     const parts = [];
     if (location.address) parts.push(location.address);
     if (location.cityStateProvince) parts.push(location.cityStateProvince);
     if (location.country) parts.push(location.country);
     if (location.continent && parts.length === 0 && !location.country && !location.cityStateProvince && !location.address) parts.push(location.continent);
     return parts.length > 0 ? parts.filter(p => p != null).join(', ') : t('Common_NA'); // <-- Use t() for N/A
};


interface ConferenceListProps {
    conferences: Conference[];
    onModerateClick: (conferenceId: string, status: ConferenceStatus) => void;
    showCommentModal: boolean;
    // If using namespaces, pass the 't' function related to this component's namespace
    // t: ReturnType<typeof useTranslations>; // Or get t inside the component
}

const ConferenceList: React.FC<ConferenceListProps> = ({
    conferences,
    onModerateClick,
    showCommentModal,
    // If receiving t as prop: t,
}) => {
     // Call useTranslations hook here
     const t = useTranslations('ConferenceList'); // <-- Added hook call (using a namespace example)
     // Alternatively, if passing t from parent: const { t } = props;

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
                        className={`border-b border-gray-200 py-0 px-0 last:border-b-0 ${getStatusBgClass(conference.status)}`}
                    >
                        <div className="p-4">
                             {/* Display details fetch error if it occurred for this item */}
                             {conference.detailsFetchError && (
                                 <div className="mb-3 text-sm text-red-600 italic">
                                     {/* Translate error label */}
                                     {t('Error_DetailsLoadFailed_Label')}: {conference.detailsFetchError} {/* <-- Translated label */}
                                 </div>
                             )}

                            <div className='mb-3 flex items-start justify-between'>
                                <div>
                                    <h3 className='text-xl font-semibold text-gray-900'>
                                        {/* Translate default title if missing */}
                                        {conference.title || t('Default_UntitledConference')} {/* <-- Translated default */}
                                        {conference.acronym && conference.acronym.trim() !== '' && (
                                             <span className="font-normal text-gray-600"> ({conference.acronym})</span>
                                        )}
                                    </h3>

                                     {/* Display main conference link */}
                                     {mainOrganization?.link && mainOrganization.link.trim() !== '' && (
                                         <p className='text-sm text-blue-600 hover:underline'>
                                             <a href={mainOrganization.link} target="_blank" rel="noopener noreferrer">{mainOrganization.link}</a>
                                         </p>
                                     )}

                                     {/* Display access type */}
                                     {mainOrganization?.accessType && (
                                          <p className='text-sm italic text-gray-600'>
                                            {mainOrganization.accessType} {/* Assume accessType itself is a key or handled by backend */}
                                          </p>
                                     )}

                                    {/* Display request creation and update dates */}
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {/* Translate labels */}
                                        {t('Requested_Label')}: {formatDateTimeDisplay(conference.createdAt)} {/* <-- Translated label */}
                                    </p>
                                     <p className='text-xs text-gray-500'>
                                        {/* Translate labels */}
                                        {t('LastUpdated_Label')}: {formatDateTimeDisplay(conference.updatedAt)} {/* <-- Translated label */}
                                    </p>
                                    {/* Optionally display user info with translated label */}
                                    {/* <p className='text-xs text-gray-500'>{t('UserById_Label')}: {conference.userId}</p> */}
                                </div>
                                <span
                                    className={`ml-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColorClass(conference.status)}`}
                                >
                                    {/* Translate status string using t() */}
                                    {t(`Status_${conference.status}`)} {/* <-- Translated status */}
                                </span>
                            </div>

                             {/* Display Conference Dates */}
                             {mainConferenceDates && mainConferenceDates.length > 0 && (
                                 <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>{t('ImportantDates_Label')}:</strong></p> {/* <-- Translated label */}
                                     <ul className="list-disc list-inside ml-4">
                                         {mainConferenceDates.map((dateItem, index) => (
                                             dateItem && (
                                                <li key={index}>
                                                    {/* Translate default label if name/type missing */}
                                                    {dateItem.name || dateItem.type || t('DateRange_DefaultLabel')}: {formatDateRangeDisplay(dateItem.fromDate, dateItem.toDate, t)} {/* <-- Pass t() to helper */}
                                                </li>
                                             )
                                         ))}
                                     </ul>
                                 </div>
                             )}

                            {/* Display Location Details */}
                            {mainLocation && formatLocationDisplay(mainLocation, t) !== t('Common_NA') && (
                                <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>{t('Location_Label')}:</strong> {formatLocationDisplay(mainLocation, t)}</p> {/* <-- Translated label, Pass t() to helper */}
                                </div>
                             )}

                             {/* Display Topics */}
                             {mainOrganization?.topics && mainOrganization.topics.length > 0 && (
                                 <div className="mb-3 text-sm text-gray-700">
                                     <p><strong>{t('Topics_Label')}:</strong> {mainOrganization.topics.join(', ')}</p> {/* <-- Translated label */}
                                 </div>
                             )}

                            {/* Display Description */}
                            {(mainOrganization?.summary && mainOrganization.summary.trim() !== "") && (
                                <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>{t('Summary_Label')}:</strong> {mainOrganization.summary}</p> {/* <-- Translated label */}
                                </div>
                            )}

                            {/* Display User's Original Message */}
                            {conference.message && conference.message.trim() !== '' && (
                                 <div className="mb-3 text-sm text-gray-700 italic">
                                     <p><strong>{t('UserMessage_Label')}:</strong> {conference.message}</p> {/* <-- Translated label */}
                                 </div>
                            )}

                            {/* Display comment (client-side managed) */}
                            {conference.comment && conference.comment.trim() !== '' && (
                                <div className="mb-4 text-sm text-gray-600 italic">
                                    <strong>{t('ModerationComment_Label')}:</strong> {conference.comment} {/* <-- Translated label */}
                                </div>
                            )}

                            {/* Moderation Action Buttons */}
                            <div className='flex flex-wrap gap-3'>
                                {conference.status !== 'APPROVED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'APPROVED')}
                                        className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {/* Translate button text */}
                                        {t('Approve_Button')} {/* <-- Translated */}
                                    </button>
                                )}

                                {conference.status !== 'REJECTED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'REJECTED')}
                                        className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {/* Translate button text */}
                                        {t('Reject_Button')} {/* <-- Translated */}
                                    </button>
                                )}

                                {conference.status !== 'PENDING' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'PENDING')}
                                        className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        {/* Translate button text */}
                                        {t('SetPending_Button')} {/* <-- Translated */}
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