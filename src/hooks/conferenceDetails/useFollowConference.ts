// hooks/useFollowConference.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { Follow, UserResponse } from '../../models/response/user.response';
import { appConfig } from '@/src/middleware';

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;
const useFollowConference = (conferenceData: ConferenceResponse | null) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conferenceData) {
      setIsFollowing(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('user');
      if (!userData) {
          setIsFollowing(false);
          setLoading(false);
          return;
      }

      try {
        const response = await fetch(`${API_ENDPOINT}/follow-conference/followed`, {
          method: 'GET',
          headers:{
            "Authorization": `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
            'Content-Type': 'application/json',
          }}
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const follows: Follow[] = await response.json();
        setIsFollowing(
          follows.some(
            (followedConf) => followedConf.id === conferenceData?.id
          ) ?? false
        );
      } catch (err:any) {
        setError(err.message || 'Error fetching user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [conferenceData]);

  const handleFollowClick = async () => {
    if (!conferenceData?.id) {
      setError("Conference data is missing.");
      return;
    }

    const conferenceId = conferenceData?.id;
    const userData = localStorage.getItem('user');

    if (!userData) {
      setError("User not logged in.");
      console.error('User not logged in');
      return;
    }

    const user = JSON.parse(userData);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/follow-conference${isFollowing ? '/remove' : '/add'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
        },
        
        body: JSON.stringify({ conferenceId, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message}`
        );
      }

      const follows: Follow[] = await response.json();
      console.log('follows', follows);
      setIsFollowing(!isFollowing); 
      // setIsFollowing(follows?.some(conf => conf.conferenceId === conferenceId) ?? false); // FIXED HERE
    } catch (err:any) {
      setError(err.message || 'Error following/unfollowing conference.');
      console.error('Error following/unfollowing conference:', err);
    } finally {
      setLoading(false);
    }
  };
  return { isFollowing, handleFollowClick, loading, error };
};

export default useFollowConference;