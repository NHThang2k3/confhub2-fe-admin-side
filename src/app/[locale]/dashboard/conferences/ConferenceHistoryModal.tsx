// FILE: /components/ConferenceHistoryModal.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Conference, Organization } from './utils/types'; // Điều chỉnh đường dẫn

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

interface ConferenceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference | null;
  onDeleteOrganization: (organization: Organization) => void; // Thêm prop để xử lý xóa
}

export const ConferenceHistoryModal = ({ isOpen, onClose, conference, onDeleteOrganization }: ConferenceHistoryModalProps) => {
  const t = useTranslations('conferencesPage');
  const tCommon = useTranslations('common');

  const [history, setHistory] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConferenceHistory = useCallback(async (conferenceId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${DATA_API_URL}/api/v1/admin/conferences/conference/${conferenceId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching conference history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && conference) {
      fetchConferenceHistory(conference.id);
    }
  }, [isOpen, conference, fetchConferenceHistory]);

  const renderOrganizationHistory = useCallback((organization: Organization) => (
    <div key={organization.id} className="mb-4 p-4 border rounded-lg bg-white-pure shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold">
            {t('modal.organizationDetails.yearHeader', { year: organization.year })}
          </h3>
          <p className="text-sm text-gray-500">
            {t('modal.organizationDetails.lastUpdated')}: {new Date(organization.updatedAt).toLocaleDateString()} {new Date(organization.updatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/en/dashboard/conferences/edit/${organization.id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('modal.editButton')}
          </Link>
          <button
            onClick={() => onDeleteOrganization(organization)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('modal.deleteButton')}
          </button>
        </div>
      </div>
      {/* ... Phần còn lại của JSX render chi tiết organization giữ nguyên ... */}
      <div className="grid grid-cols-1 gap-4">
        <div><span className="font-medium">{t('modal.organizationDetails.accessType')}</span> {organization.accessType}</div>
        <div><span className="font-medium">{t('modal.organizationDetails.publisher')}</span> {organization.publisher}</div>
        <div><span className="font-medium">{t('modal.organizationDetails.summary')}</span> {organization.summerize}</div>
        <div><span className="font-medium">{t('modal.organizationDetails.callForPaper')}</span> {organization.callForPaper}</div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.links')}</span>
          <div className="flex flex-col gap-1 mt-1">
            {organization.link && <a href={organization.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{t('modal.organizationDetails.mainLink')}</a>}
            {organization.cfpLink && <a href={organization.cfpLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{t('modal.organizationDetails.cfpLink')}</a>}
            {organization.impLink && <a href={organization.impLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{t('modal.organizationDetails.importantLink')}</a>}
          </div>
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.locations')}</span>
          {organization.locations.map((location, index) => (<div key={index} className="mt-1">{location.address}, {location.cityStateProvince}, {location.country}, {location.continent}</div>))}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.topics')}</span>
          <div className="flex flex-wrap gap-1 mt-1">{organization.topics.map((topic, index) => (<span key={index} className="px-2 py-1 bg-gray-10 rounded text-sm">{topic}</span>))}</div>
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.dates')}</span>
          {organization.dates.map((date, index) => (<div key={index} className="mt-1"><strong>{date.type}:</strong> {date.name && <span className="text-gray-600">({date.name})</span>} {new Date(date.startDate).toLocaleDateString()} {new Date(date.startDate).toLocaleTimeString()} - {new Date(date.endDate).toLocaleDateString()} {new Date(date.endDate).toLocaleTimeString()}</div>))}
        </div>
      </div>
    </div>
  ), [t, onDeleteOrganization]);

  if (!isOpen || !conference) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] transition-all duration-300">
      <div className="bg-white-pure rounded-lg p-6 w-full max-w-4xl max-h-[calc(100vh-8rem)] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4 top-0 bg-white-pure pb-4 z-10 border-b">
          <h2 className="text-xl font-bold">
            {t('modal.historyTitle', { conferenceTitle: conference.title })}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {tCommon('close')}
          </button>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">{tCommon('loading')}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t('modal.noHistory')}</div>
          ) : (
            <div className="space-y-4">{history.map(renderOrganizationHistory)}</div>
          )}
        </div>
      </div>
    </div>
  );
};