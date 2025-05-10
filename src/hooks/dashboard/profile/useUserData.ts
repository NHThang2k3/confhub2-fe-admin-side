// src/hooks/useUserData.ts
import { useState, useEffect } from 'react';
import { UserResponse } from '@/src/models/response/user.response';
import { getUserById } from '../../../app/api/user/getUserById';
import useAuthApi from '../../auth/useAuthApi'; // Import useAuthApi!

export const useUserData = () => {
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true); // Keep loading state
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuthApi(); // Get user and isLoggedIn from useAuthApi

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn && user) { // Rely on useAuthApi's state
        setLoading(true);
        setError(null);
        try {
          const fetchedUser = await getUserById(user.id);
          setUserData(fetchedUser);
        } catch (err: any) {
          setError(err.message || 'Error fetching user data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        // No longer set an error here. Just remain in a loading/null state.
        setLoading(false); // Or keep loading: true, if you prefer
        setUserData(null); // Clear any previous user data
      }
    };

    fetchUserData();
  }, [isLoggedIn, user]); // Depend on useAuthApi's state

  return { userData, loading, error }; // Simplified return
};