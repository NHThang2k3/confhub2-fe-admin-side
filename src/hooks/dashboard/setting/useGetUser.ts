// src/hooks/useGetUser.ts
import { useState, useEffect } from 'react';
import { UserResponse } from '@/src/models/response/user.response';
import { getUserById } from '../../../app/api/user/getUserById'; // Adjust the path if necessary

interface GetUserResult {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void; // Add a refetch function
}

export const useGetUser = (userId: string | null): GetUserResult => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) {
      setLoading(false); // No userId, so don't load
      return;
    }
     setLoading(true);
    setError(null);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, [userId]); // Fetch when userId changes

  const refetch = () => {
    fetchData();
  };

  return { user, loading, error, refetch };
};