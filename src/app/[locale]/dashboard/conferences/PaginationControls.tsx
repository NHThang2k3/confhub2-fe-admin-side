'use client'; // Component này chạy ở client

import { useEffect, useState } from 'react';

import {
  AllCommunityModule,
  ModuleRegistry,
  RowSelectionModule,
} from 'ag-grid-community';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { FilterOptions, FilterState } from './utils/types';

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);


export const PaginationControls = ({
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