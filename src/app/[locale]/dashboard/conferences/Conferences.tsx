'use client'; // Component này chạy ở client

import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import parser from 'any-date-parser';
import {
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  ModuleRegistry,
  RowSelectionModule,
} from 'ag-grid-community';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

// --- Interfaces (Giữ lại các interface này trong file Conferences.tsx) ---
interface Conference {
  id: string;
  title: string;
  acronym: string;
  sources: string[];
  researchFields: string[];
  ranks: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  organizationHistory: Organization[];
}

interface Organization {
  id: string;
  year: number;
  accessType: string;
  isAvailable: boolean;
  publisher: string;
  summerize: string;
  callForPaper: string;
  link: string;
  cfpLink: string;
  impLink: string;
  locations: Location[];
  topics: string[];
  dates: ConferenceDate[];
  updatedAt: string;
}

interface Location {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
}

interface ConferenceDate {
  type: string;
  startDate: string;
  endDate: string;
  name: string;
}

interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

interface PaginationResponse {
  data: Conference[];
  meta: PaginationMeta;
}

interface FilterState {
  search: string;
  status: string;
  source: string;
  researchFields: string;
  rank: string;
}

interface FilterOptions {
  status: string[];
  sources: string[];
  researchFields: string[];
  ranks: string[];
}

interface UpdateHistoryFormData {
  year: number;
  accessType: string;
  isAvailable: boolean;
  publisher: string;
  summerize: string;
  callForPaper: string;
  link: string;
  cfpLink: string;
  impLink: string;
  locations: Location[];
  topics: string[];
  dates: ConferenceDate[];
}
// --- End Interfaces ---

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

// --- Helper Components (Giữ lại các component nhỏ này) ---
const TagRenderer = ({ value, color }: { value: string; color: string }) => (
  <span className={`px-2 py-1 rounded text-sm ${color}`}>
    {value}
  </span>
);

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) => {
  const t = useTranslations('pagination');
  const tCommon = useTranslations('common');

  const [goToPageInput, setGoToPageInput] = useState(''); // State cho input số trang
  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (totalPages > 0 && endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (totalPages > 0) {
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setGoToPageInput(''); // Xóa input sau khi nhảy trang
    } else {
      // Bạn có thể thêm thông báo lỗi ở đây nếu muốn
      alert(t('invalidPageNumber', { totalPages }));
      setGoToPageInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPageInput(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  if (totalPages === 0) {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={10}>{t('tenPerPage')}</option>
            <option value={20}>{t('twentyPerPage')}</option>
            <option value={50}>{t('fiftyPerPage')}</option>
            <option value={100}>{t('hundredPerPage')}</option>
          </select>
          <span className="text-sm ">
            {t('noResults')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={10}>{t('tenPerPage')}</option>
          <option value={20}>{t('twentyPerPage')}</option>
          <option value={50}>{t('fiftyPerPage')}</option>
          <option value={100}>{t('hundredPerPage')}</option>
        </select>
        <span className="text-sm ">
          {t('pageInfo', { currentPage, totalPages })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {t('first')}
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {t('previous')}
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 border rounded"
            >
              1
            </button>
            {startPage > 2 && <span>{tCommon('ellipsis')}</span>}
          </>
        )}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''
              }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span>{tCommon('ellipsis')}</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 border rounded"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* === THÊM MỚI: Input và nút Go to Page === */}
        <div className="flex items-center gap-1 mx-2">
          <input
            type="number"
            value={goToPageInput}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyPress}
            className="w-24 px-2 py-1 border rounded text-left"
            placeholder={t('page')}
            min="1"

            max={totalPages}
            disabled={totalPages <= 1}
          />
          <button
            onClick={handleGoToPage}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={!goToPageInput || totalPages <= 1}
          >
            {t('goTo')}
          </button>
        </div>
        {/* === KẾT THÚC THÊM MỚI === */}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {t('next')}
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {t('last')}
        </button>
      </div>
    </div>
  );
};

const FilterSection = ({
  filters,
  onFilterChange,
  onReset
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
}) => {
  const t = useTranslations('filters');
  const tCommon = useTranslations('common');

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    sources: [],
    researchFields: [],
    ranks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [statusRes, sourcesRes, researchFieldsRes, ranksRes] = await Promise.all([
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/status`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/sources`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/research-fields`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/ranks`)
        ]);

        setFilterOptions({
          status: statusRes.data,
          sources: sourcesRes.data,
          researchFields: researchFieldsRes.data,
          ranks: ranksRes.data
        });
      } catch (error) {
        console.error(t('errorFetchingOptions'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [t]);

  const handleSourceChange = async (source: string) => {
    try {
      const response = await axios.get(
        `${DATA_API_URL}/api/v1/admin/conferences/filter-options/ranks/${source}`
      );
      const sourceRanks = response.data;
      const currentRank = filters.rank ? filters.rank.split(',').filter(Boolean) : [];
      const newRanks = [...new Set([...currentRank, ...sourceRanks])];
      onFilterChange('rank', newRanks.join(','));
    } catch (error) {
      console.error(t('errorFetchingRanksForSource'), error);
    }
  };

  if (loading) {
    return (
      <div className="mb-4 p-4 bg-white-pure rounded-lg shadow-sm">
        <div className="flex items-center justify-center">
          {/* <span>{tCommon('loading')}</span> */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-4 p-4 bg-white-pure rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm  "
        >
          {t('reset')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium  mb-1">
            {t('searchLabel')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium  mb-1">
            {t('statusLabel')}
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allStatuses')}</option>
            {filterOptions.status.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium  mb-1">
            {t('sourcesLabel')}
          </label>
          <select
            value={filters.source}
            onChange={(e) => {
              onFilterChange('source', e.target.value);
              if (e.target.value) {
                handleSourceChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allSources')}</option>
            {filterOptions.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium  mb-1">
            {t('researchFieldsLabel')}
          </label>
          <select
            value={filters.researchFields}
            onChange={(e) => onFilterChange('researchFields', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allResearchFields')}</option>
            {filterOptions.researchFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium  mb-1">
            {t('rankLabel')}
          </label>
          <select
            value={filters.rank}
            onChange={(e) => onFilterChange('rank', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allRanks')}</option>
            {filterOptions.ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
// --- End Helper Components ---

// --- Main Conferences Component ---
// Thay đổi: Đây là component chính, nhận locale nếu cần cho các logic khác,
// nhưng useTranslations tự lấy locale từ context
export default function Conferences({ locale }: { locale: string }) {
  const t = useTranslations('conferencesPage');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [rowData, setRowData] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    lastPage: 0
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    researchFields: '',
    rank: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  // Add new state for conference history
  const [conferenceHistory, setConferenceHistory] = useState<Organization[]>([]);
  // Add loading state for history
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add function to fetch conference history
  const fetchConferenceHistory = useCallback(async (conferenceId: string) => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(
        `${DATA_API_URL}/api/v1/admin/conferences/conference/${conferenceId}/history`
      );
      setConferenceHistory(response.data);
    } catch (error) {
      console.error('Error fetching conference history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Update the modal visibility handler to fetch history
  const handleViewHistory = useCallback((conference: Conference) => {
    setSelectedConference(conference);
    setIsModalVisible(true);
    fetchConferenceHistory(conference.id);
  }, [fetchConferenceHistory]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'title',
      headerName: t('columnHeaders.title'),
      flex: 2,
      filter: 'agTextColumnFilter',
      minWidth: 200,
    },
    {
      field: 'acronym',
      headerName: t('columnHeaders.acronym'),
      flex: 1,
      filter: 'agTextColumnFilter',
      minWidth: 120,
    },
    {
      field: 'sources',
      headerName: t('columnHeaders.sources'),
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((source: string) => (
            <TagRenderer
              key={source}
              value={source}
              color="bg-blue-100 text-blue-800"
            />
          ))}
        </div>
      ),
    },
    {
      field: 'researchFields',
      headerName: t('columnHeaders.researchFields'),
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((field: string) => (
            <TagRenderer
              key={field}
              value={field}
              color="bg-green-100 text-green-800"
            />
          ))}
        </div>
      ),
    },
    {
      field: 'ranks',
      headerName: t('columnHeaders.ranks'),
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((rank: string) => (
            <TagRenderer
              key={rank}
              value={rank}
              color="bg-purple-100 text-purple-800"
            />
          ))}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: t('columnHeaders.status'),
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <TagRenderer
          value={params.value}
          color={params.value === 'PUBLISHED'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
          }
        />
      ),
    },
    {
      headerName: t('columnHeaders.actions'),
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => handleViewHistory(params.data)}
        >
          {t('viewHistoryButton')}
        </button>
      ),
    },
  ], [t, handleViewHistory]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  }), []);

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.page,
        perPage: pagination.pageSize,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.researchFields) params.researchFields = filters.researchFields;
      if (filters.rank) params.rank = filters.rank;

      const response = await axios.get<PaginationResponse>(
        `${DATA_API_URL}/api/v1/admin/conferences/get`, { params }
      );
      setRowData(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta.total,
        lastPage: response.data.meta.lastPage
      }));
    } catch (error) {
      console.error(t('errorFetchingConferences'), error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, t]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: newPageSize }));
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ search: '', status: '', source: '', researchFields: '', rank: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

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
            onClick={() => {
              setSelectedOrganization(organization);
              setDeleteDialogOpen(true);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('modal.deleteButton')}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <span className="font-medium">{t('modal.organizationDetails.accessType')}</span> {organization.accessType}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.publisher')}</span> {organization.publisher}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.summary')}</span> {organization.summerize}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.callForPaper')}</span> {organization.callForPaper}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.links')}</span>
          <div className="flex flex-col gap-1 mt-1">
            {organization.link && (
              <a href={organization.link} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">{t('modal.organizationDetails.mainLink')}</a>
            )}
            {organization.cfpLink && (
              <a href={organization.cfpLink} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">{t('modal.organizationDetails.cfpLink')}</a>
            )}
            {organization.impLink && (
              <a href={organization.impLink} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">{t('modal.organizationDetails.importantLink')}</a>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.locations')}</span>
          {organization.locations.map((location, index) => (
            <div key={index} className="mt-1">
              {location.address}, {location.cityStateProvince}, {location.country}, {location.continent}
            </div>
          ))}
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.topics')}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {organization.topics.map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-gray-10 rounded text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="font-medium">{t('modal.organizationDetails.dates')}</span>
          {organization.dates.map((date, index) => (
            <div key={index} className="mt-1">
              <strong>{date.type}:</strong> {date.name && <span className="text-gray-600">({date.name})</span>} {new Date(date.startDate).toLocaleDateString()} {new Date(date.startDate).toLocaleTimeString()} - {new Date(date.endDate).toLocaleDateString()} {new Date(date.endDate).toLocaleTimeString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [t]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('pageTitle')}</h1>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="w-full h-[600px]">
        <AgGridReact
          className='ag-theme-alpine '
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          loading={loading}
          rowModelType="clientSide"
          getRowId={(params) => params.data.id}
          rowSelection="single"
          animateRows={true}
          suppressPaginationPanel={true}
        />
      </div>

      {loading && (
          <div className="text-center py-4">{tCommon('loading')}</div>
      )}

      <PaginationControls
        currentPage={pagination.page}
        totalPages={pagination.lastPage}
        onPageChange={handlePageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {isModalVisible && selectedConference && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] transition-all duration-300">
          <div className="bg-white-pure rounded-lg p-6 w-full max-w-4xl max-h-[calc(100vh-8rem)] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white-pure pb-4 z-10 border-b">
              <h2 className="text-xl font-bold">
                {t('modal.historyTitle', { conferenceTitle: selectedConference.title })}
              </h2>
              <button
                onClick={() => setIsModalVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {tCommon('close')}
              </button>
            </div>
            <div className="mt-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">{tCommon('loading')}</span>
                </div>
              ) : conferenceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('modal.noHistory')}
                </div>
              ) : (
                <div className="space-y-4">
                  {conferenceHistory.map(renderOrganizationHistory)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={selectedOrganization?.title || ''}
        onConfirm={async () => {
          if (selectedOrganization && selectedConference) {
            try {
              setHistoryLoading(true);
              await axios.delete(`${DATA_API_URL}/api/v1/admin/conferences/history/${selectedOrganization.id}`);
              // Refetch the conference history after successful deletion
              await fetchConferenceHistory(selectedConference.id);
              // Close the delete dialog
              setDeleteDialogOpen(false);
            } catch (error) {
              console.error('Error deleting conference history:', error);
            } finally {
              setHistoryLoading(false);
            }
          }
        }}
      />
    </div>
  );
}