// hooks/useAddToCalendar.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { Calendar } from '../../models/response/user.response';
import { appConfig } from '@/src/middleware';

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

const useAddToCalendar = (conferenceData: ConferenceResponse | null) => {
  const [isAddToCalendar, setIsAddToCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conferenceData) {
      setIsAddToCalendar(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('user');
      if (!userData) {
        setIsAddToCalendar(false);
        setLoading(false);
        return;
      }
      const user = JSON.parse(userData);
      try {
        const response = await fetch(`${API_ENDPOINT}/calendar/events`,
          {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData: Calendar[] = await response.json();
        setIsAddToCalendar(
          userData.some(
            (calendarConf) => calendarConf.conferenceId === conferenceData?.id
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
  }, [conferenceData]); // Chạy lại khi conferenceData.conference.id thay đổi

  const handleAddToCalendar = async () => {
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
        const response = await fetch(`${API_ENDPOINT}${isAddToCalendar ? '/calendar/remove-event' :'/calendar/add-event'}`, {
          method: 'PUT',
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
  
        const updatedUser: Calendar[] = await response.json();
        setIsAddToCalendar(updatedUser.some(conf => conf.conferenceId === conferenceId) ?? false); // FIXED HERE
      } catch (err:any) {
        setError(err.message || 'Error addToCalendar/unAddToCalendar conference.');
        console.error('Error addToCalendar/unAddToCalendar conference:', err);
      } finally {
        setLoading(false);
      }
    };
  
    return { isAddToCalendar, handleAddToCalendar, loading, error };
  };

export default useAddToCalendar;
