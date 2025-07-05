// FILE: /hooks/useConferences.ts

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { FilterState, Conference, PaginationResponse } from '@/src/app/[locale]/dashboard/conferences/utils/types';

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

export const useConferences = () => {
  const t = useTranslations('conferencesPage');
  const [rowData, setRowData] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    lastPage: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    researchFields: '',
    rank: '',
  });

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
        lastPage: response.data.meta.lastPage,
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

  // Hàm để cập nhật lại rowData từ bên ngoài (sau khi xóa)
  const refreshData = () => {
     fetchConferences();
  };

  return {
    rowData,
    loading,
    pagination,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleResetFilters,
    setRowData, // Trả về để có thể cập nhật state từ bên ngoài
    refreshData,
  };
};