// src/hooks/conferenceDetails/useBlacklistConference.ts
import { useState, useEffect, useCallback } from 'react';
import { ConferenceResponse } from '@/src/models/response/conference.response'; // Adjust path
import { UserResponse } from '@/src/models/response/user.response'; // Adjust path
import { appConfig } from '@/src/middleware';

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`; // Base user endpoint

const useBlacklistConference = (conferenceData: ConferenceResponse | null) => {
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state specific to blacklist action
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conferenceData) {
      setIsBlacklisted(false);
      return;
    }
    const fetchUser = async () => {
      // setLoading(true);
      // setError(null);
      // const userData = localStorage.getItem('user');
      // if (!userData) {
      //   setIsBlacklisted(false);
      //   setLoading(false);
      //   return;
      // }

      //const user = JSON.parse(userData);
      try {
        const response = await fetch(`${API_ENDPOINT}`, {
          headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        console.log('blacklist')
        console.log(userData)
        setIsBlacklisted(
          userData?.some(
            (blacklistConf: any) => blacklistConf.conferenceId === conferenceData.id
          ) ?? false
        );
      } catch (err: any) {
        setError(err.message || 'Error fetching user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [conferenceData]);

  const handleBlacklistClick = async () => {
    if (!conferenceData?.id) {
      setError("Conference ID is missing.");
      console.error("Conference ID is missing for blacklist action.");
      return;
    }

    const conferenceId = conferenceData.id;
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError("User not logged in.");
      console.error('User not logged in for blacklist action.');
      // Optionally trigger redirect to login here if needed
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/${isBlacklisted ? 'remove' : 'add'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if you use token-based auth:
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ conferenceId }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }

      const blacklistConference = await response.json();

      // Update state based on the response from the server
      let nowBlacklisted = blacklistConference?.conferenceId === conferenceId;
      if(isBlacklisted) {
        nowBlacklisted = !nowBlacklisted;
      }
      setIsBlacklisted(nowBlacklisted);

    } catch (err: any) {
      setError(err.message || 'Error updating blacklist status.');
      console.error('Error updating blacklist status:', err);
      // Optionally revert optimistic UI update here if you implemented one
    } finally {
      setLoading(false);
    }

  };

  return { isBlacklisted, handleBlacklistClick, loading, error };
};

export default useBlacklistConference;