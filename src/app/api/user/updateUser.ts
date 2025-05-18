// src/app/api/user/updateUser.ts (Hoặc nơi bạn định nghĩa hàm này)
import { appConfig } from '@/src/middleware';
import { UserResponse } from '@/src/models/response/user.response';

export const updateUser = async (
  userId: string, // userId này có thể không cần thiết nếu backend lấy userId từ token
  updatedData: Partial<UserResponse>,
  token: string | null // <<<< THÊM THAM SỐ TOKEN >>>>
): Promise<UserResponse> => {
  if (!token) { // <<<< KIỂM TRA TOKEN >>>>
    throw new Error('Authentication token is required to update user data.');
  }

  const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // <<<< THÊM AUTHORIZATION HEADER >>>>
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Nếu không parse được JSON, dùng statusText hoặc thông báo chung
      throw new Error(response.statusText || `Failed to update user data. Status: ${response.status}`);
    }
    throw new Error(errorData.message || `Failed to update user data. Status: ${response.status}`);
  }

  return response.json();
};