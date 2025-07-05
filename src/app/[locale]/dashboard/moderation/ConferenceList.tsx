'use client';

import React, { useState } from 'react';
// --- MODIFIED: Import a new specific type ---
import { Conference, Location, Organization, ConferenceDate, ConferenceRealStatus } from '@/src/types';
import { useTranslations } from 'next-intl';
import {
    ChevronDown, Check, X, Undo2, ExternalLink, MapPin, CalendarDays, Tag,
    FileText, MessageSquare, Edit, Building, Globe, Calendar, Printer,
    FilePenLine, Link as LinkIcon
} from 'lucide-react';
import { clsx } from 'clsx';

// ============================================================================
// Helper Functions (FIXED)
// ============================================================================

const formatDateTimeDisplay = (dateStr: string | Date | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- FIXED: Lỗi Expected 1 arguments, but got 2 ---
const formatDateRangeDisplay = (fromDate: Date | undefined, toDate: Date | undefined, t: (key: string) => string) => {
    const formattedFrom = fromDate ? new Date(fromDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
    const formattedTo = toDate ? new Date(toDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

    if (!formattedFrom && !formattedTo) return t('Common_NA') || 'N/A';
    if (formattedFrom === formattedTo) return formattedFrom;
    if (formattedFrom && !formattedTo) return `${formattedFrom} - ${t('DateRange_Onwards') || 'onwards'}`;
    if (!formattedFrom && formattedTo) return `${t('DateRange_Until') || 'until'} ${formattedTo}`;
    return `${formattedFrom} - ${formattedTo}`;
};

const formatLocationDisplay = (location: Location | undefined | null, t: (key: string) => string) => {
    if (!location) return t('Common_NA') || 'N/A';
    const parts = [location.address, location.cityStateProvince, location.country, location.continent].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : t('Common_NA') || 'N/A';
};

// ============================================================================
// Reusable Sub-components
// ============================================================================

interface DetailItemProps {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, children, className }) => {
    if (!children) return null;
    return (
        <div className={clsx("flex items-start gap-4", className)}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1">
                <dt className="font-semibold text-slate-800">{label}</dt>
                <dd className="mt-1 text-slate-600">{children}</dd>
            </div>
        </div>
    );
};

const LinkDisplay: React.FC<{ href: string | null | undefined, children: React.ReactNode }> = ({ href, children }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 hover:underline">
            <ExternalLink className="h-4 w-4" />
            <span>{children}</span>
        </a>
    );
};
// ============================================================================
// ConferenceItem Component (FIXED)
// ============================================================================

type StatusStyle = {
    borderColor: string;
    bgColor: string;
    textColor: string;
    ringColor: string;
};

// --- FIXED: Use ConferenceRealStatus for the Record type ---
// Now, this Record only requires keys for 'PENDING', 'APPROVED', 'REJECTED'
const statusStyles: Record<ConferenceRealStatus, StatusStyle> = {
    PENDING: { borderColor: 'border-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-800', ringColor: 'ring-amber-600/20' },
    APPROVED: { borderColor: 'border-green-500', bgColor: 'bg-green-50', textColor: 'text-green-800', ringColor: 'ring-green-600/20' },
    REJECTED: { borderColor: 'border-red-500', bgColor: 'bg-red-50', textColor: 'text-red-800', ringColor: 'ring-red-600/20' },
};

// This helper function now correctly accepts a ConferenceRealStatus
const getStatusStyle = (status: ConferenceRealStatus): StatusStyle => {
    return statusStyles[status] || statusStyles.PENDING;
};


const ConferenceItem: React.FC<{
    conference: Conference;
    // --- MODIFIED: The onModerateClick function will receive a real status ---
    onModerateClick: (conferenceId: string, status: ConferenceRealStatus) => void;
    showCommentModal: boolean;
}> = ({ conference, onModerateClick, showCommentModal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('ConferenceList');
    const tCommon = useTranslations('Common');

    const mainOrganization = conference.organizations?.[0];
    const mainLocation = mainOrganization?.locations?.[0];
    const mainConferenceDates = mainOrganization?.conferenceDates;

    // 4. Use the safe helper function
    const currentStatusStyle = getStatusStyle(conference.status);

    return (
        <li className={clsx(
            'overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300',
            `border-l-4 ${currentStatusStyle.borderColor}`,
            { 'ring-2 ring-offset-2': isOpen, [currentStatusStyle.ringColor]: isOpen }
        )}>
            {/* --- Accordion Header --- */}
            <div className="flex cursor-pointer items-center gap-4 p-4" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                <div className="flex-1 min-w-0">
                    <p className="truncate text-lg font-bold text-slate-900">
                        {conference.title || t('Default_UntitledConference')}
                        {conference.acronym && <span className="ml-2 font-normal text-slate-500">({conference.acronym})</span>}
                    </p>
                    <div className="mt-1 flex flex-col gap-x-4 gap-y-1 text-sm text-slate-500 sm:flex-row sm:items-center">
                        {mainOrganization?.year && <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>{mainOrganization.year}</span></div>}
                        {mainLocation?.country && <div className="flex items-center gap-1.5"><Globe className="h-4 w-4" /><span>{mainLocation.country}</span></div>}
                    </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-4">
                    <span className={clsx('hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex', currentStatusStyle.bgColor, currentStatusStyle.textColor)}>
                        {t(`Status_${conference.status}`)}
                    </span>
                    <ChevronDown className={clsx('h-6 w-6 text-slate-400 transition-transform duration-300', { 'rotate-180': isOpen })} />
                </div>
            </div>

            {/* --- Accordion Content (Collapsible) --- */}
            {isOpen && (
                <div className="border-t border-slate-200 p-4 sm:p-6">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        <DetailItem icon={Calendar} label="Year">{mainOrganization?.year}</DetailItem>
                        <DetailItem icon={Printer} label="Publisher">{mainOrganization?.publisher}</DetailItem>

                        <DetailItem icon={CalendarDays} label={t('ImportantDates_Label')} className="sm:col-span-2">
                            {mainConferenceDates && mainConferenceDates.length > 0 ? (
                                <ul className="space-y-1">
                                    {mainConferenceDates.map((dateItem, index) => (
                                        dateItem && <li key={index}><strong>{dateItem.name || dateItem.type}:</strong> {formatDateRangeDisplay(dateItem.fromDate, dateItem.toDate, tCommon)}</li>
                                    ))}
                                </ul>
                            ) : tCommon('Common_NA')}
                        </DetailItem>

                        <DetailItem icon={MapPin} label={t('Location_Label')} className="sm:col-span-2">
                            {formatLocationDisplay(mainLocation, tCommon)}
                        </DetailItem>

                        <DetailItem icon={LinkIcon} label="Important Links" className="sm:col-span-2">
                            <div className="space-y-2">
                                <LinkDisplay href={mainOrganization?.link}>Main Website</LinkDisplay>
                                <LinkDisplay href={mainOrganization?.impLink}>Important Link</LinkDisplay>
                                <LinkDisplay href={mainOrganization?.cfpLink}>Call for Papers Link</LinkDisplay>
                            </div>
                        </DetailItem>

                        <DetailItem icon={Tag} label={t('Topics_Label')} className="sm:col-span-2">
                            {mainOrganization?.topics && mainOrganization.topics.length > 0 ? mainOrganization.topics.join(', ') : tCommon('Common_NA')}
                        </DetailItem>

                        <DetailItem icon={FilePenLine} label="Call For Paper" className="sm:col-span-2">
                            <p className="whitespace-pre-wrap">{mainOrganization?.callForPaper || tCommon('Common_NA')}</p>
                        </DetailItem>

                        <DetailItem icon={FileText} label="Summary" className="sm:col-span-2">
                            <p className="whitespace-pre-wrap">{mainOrganization?.summary || tCommon('Common_NA')}</p>
                        </DetailItem>

                    </dl>

                    {/* Communication Blocks */}
                    <div className="mt-8 space-y-4">
                        {conference.message && (
                            <div className="rounded-lg bg-blue-50 p-4"><p className="flex items-center gap-2 font-semibold text-blue-800"><MessageSquare className="h-5 w-5" />{t('UserMessage_Label')}</p><p className="mt-2 pl-7 italic text-blue-700">{conference.message}</p></div>
                        )}
                        {conference.comment && (
                            <div className="rounded-lg bg-amber-50 p-4"><p className="flex items-center gap-2 font-semibold text-amber-800"><Edit className="h-5 w-5" />{t('ModerationComment_Label')}</p><p className="mt-2 pl-7 italic text-amber-700">{conference.comment}</p></div>
                        )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className='mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6'>
                        <div className="text-xs text-slate-400">
                            <p>Requested: {formatDateTimeDisplay(conference.createdAt)}</p>
                            <p>Last Updated: {formatDateTimeDisplay(conference.updatedAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {conference.status !== 'APPROVED' && <button onClick={() => onModerateClick(conference.id, 'APPROVED')} className='inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50' disabled={showCommentModal}><Check className="h-4 w-4" />{t('Approve_Button')}</button>}
                            {conference.status !== 'REJECTED' && <button onClick={() => onModerateClick(conference.id, 'REJECTED')} className='inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50' disabled={showCommentModal}><X className="h-4 w-4" />{t('Reject_Button')}</button>}
                            {conference.status !== 'PENDING' && <button onClick={() => onModerateClick(conference.id, 'PENDING')} className='inline-flex items-center gap-2 rounded-md bg-slate-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 disabled:opacity-50' disabled={showCommentModal}><Undo2 className="h-4 w-4" />{t('SetPending_Button')}</button>}
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
};


// ============================================================================
// Main List Component (Wrapper)
// ============================================================================
const ConferenceList: React.FC<{
    conferences: Conference[];
    // --- MODIFIED: The onModerateClick prop now expects a real status ---
    onModerateClick: (conferenceId: string, status: ConferenceRealStatus) => void;
    showCommentModal: boolean;
}> = ({ conferences, onModerateClick, showCommentModal }) => {
    if (!conferences || conferences.length === 0) return null;
    return (
        <ul className="space-y-4">
            {conferences.map(conference => (
                <ConferenceItem key={conference.id} conference={conference} onModerateClick={onModerateClick} showCommentModal={showCommentModal} />
            ))}
        </ul>
    );
};

export default ConferenceList;