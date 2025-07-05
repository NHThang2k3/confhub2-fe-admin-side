'use client'; // Component này chạy ở client

import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import {
  AllCommunityModule,
  ModuleRegistry,
  RowSelectionModule,
} from 'ag-grid-community';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { FilterState, FilterOptions } from './utils/types';

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);


export const FilterSection = ({
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