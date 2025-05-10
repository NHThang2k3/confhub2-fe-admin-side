// src/hooks/auth/useUserBlacklist.ts
import { useState, useEffect, useCallback } from 'react';
import { appConfig } from '@/src/middleware';

interface UseUserBlacklistResult {
  blacklistedEventIds: string[]; // Array of event IDs that are blacklisted
  loading: boolean;              // Whether the blacklist data is currently loading
  error: string | null;          // Any error that occurred during fetching
  isLoggedIn: boolean;           // Whether the user is currently logged in based on localStorage
  refetch: () => void;           // Function to manually refetch the blacklist
}

const API_GET_BLACKLIST_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`;

const useUserBlacklist = (): UseUserBlacklistResult => {
  const [blacklistedEventIds, setBlacklistedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // Using a state variable or refetch dependency to trigger manual refetches
  const [refetchTrigger, setRefetchTrigger] = useState(0);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      // Check if user data and token exist
      if (!userData || !token) {
        setIsLoggedIn(false);
        setBlacklistedEventIds([]); // Clear blacklist if not logged in
        setLoading(false);
        return;
      }

      setIsLoggedIn(true); // User data found, assume logged in

      const response = await fetch(API_GET_BLACKLIST_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error fetching blacklist' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: Array<{ conferenceId: string, [key: string]: any }> = await response.json(); // API response is an array of objects including conferenceId

      // Extract only the conference IDs
      const ids = data.map(item => item.conferenceId).filter(id => id != null); // Filter out any potential null/undefined IDs

      setBlacklistedEventIds(ids);

    } catch (err: any) {
      console.error('Failed to fetch blacklist data:', err);
      setError(err.message || 'Failed to fetch blacklist data');
      setBlacklistedEventIds([]); // Clear list on error
    } finally {
      setLoading(false);
    }
  }, [refetchTrigger]); // Add refetchTrigger as a dependency

  // Fetch data when the component mounts or refetchTrigger changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to trigger a manual refetch
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    blacklistedEventIds,
    loading,
    error,
    isLoggedIn,
    refetch // Return the refetch function
  };
};

export default useUserBlacklist;