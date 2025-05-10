// src/hooks/useUpdateUser.ts
import { useState } from 'react';
import { UserResponse, Setting } from '@/src/models/response/user.response';  // Import your UserResponse and Setting type
import { updateUser } from '../../../app/api/user/updateUser'; // Adjust path if needed.
import { appConfig } from '@/src/middleware';

interface UpdateUserResult {
  updateUserSetting: (updatedSetting: Partial<Setting>) => Promise<void>;
  updateUserProfile:(userId: string, updatedProfile: Partial<UserResponse>) => Promise<void>
  loading: boolean;
  error: string | null;
}

export const useUpdateUser = (): UpdateUserResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserSetting = async (updatedSetting: Partial<Setting>) => {
    setLoading(true);
    setError(null);
    try {
      const updateResponse = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user/setting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
        },
        body: JSON.stringify({
          settings: updatedSetting,
        }),
      });
      if (!updateResponse.ok) {
        throw new Error(`Failed to update user setting. Status: ${updateResponse.status}`);
      }


    } catch (err: any) {
      setError(err.message || 'Failed to update user setting.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updatedProfile: Partial<UserResponse>) => {
    setLoading(true);
    setError(null);
    try{
        await updateUser(userId, updatedProfile);
    }
    catch(err: any){
        setError(err.message || 'Failed to update user profile');
    }
    finally{
        setLoading(false);
    }
  }

  return { updateUserSetting, updateUserProfile, loading, error };
};

export const getUserSettings = async (): Promise<Setting | null> => {
  try {
    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user/setting`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user settings. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}