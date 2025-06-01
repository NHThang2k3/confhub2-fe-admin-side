import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UserManagementState {
  search: string;
  status: string;
  startDate?: string;
  endDate?: string;
  page: number;
  perPage: number;
}
const API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

export const useUserManagement = (type: 'users' | 'admins') => {
  const [state, setState] = useState<UserManagementState>({
    search: '',
    status: '',
    page: 1,
    perPage: 10
  });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(state.search, 500);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const response = await fetch(
        `${API_URL}/api/v1/admin/${type === 'users' ? 'users' : 'users/admins'}?${new URLSearchParams({
          ...state,
          page: state.page.toString(),
          perPage: state.perPage.toString()
        })}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [type, state]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, state.status, state.page, state.perPage, fetchData]);

  return {
    state,
    setState,
    data,
    loading,
    error,
    totalPages,
    refetch: fetchData
  };
}; 