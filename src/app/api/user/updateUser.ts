import { appConfig } from '@/src/middleware';
import { UserResponse } from '@/src/models/response/user.response';

export const updateUser = async (userId: string, updatedData: Partial<UserResponse>): Promise<UserResponse> => {
    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user data');
    }
  
    return response.json();
  };