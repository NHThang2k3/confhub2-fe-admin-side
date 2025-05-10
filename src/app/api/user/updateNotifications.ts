// src/api/user/updateNotifications.ts
import { appConfig } from '@/src/middleware';
import { Notification } from '@/src/models/response/user.response'; // Make sure this import is correct

interface UpdateNotificationsData {
  notifications: Notification[];
}

const API_UPDATE_NOTIFICATIONS_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

async function updateNotifications( data: UpdateNotificationsData): Promise<void> {
  try {
    const response = await fetch(`${API_UPDATE_NOTIFICATIONS_ENDPOINT}/notification/user`, {
      method: 'PUT', // Use PUT for updating existing resources
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ensure token is set correctly
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Attempt to get error message
      throw new Error(`Failed to update notifications: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    //No need to return anything.

  } catch (error: any) {
    console.error('Error updating notifications:', error);
    throw error; // Re-throw the error for the calling function to handle
  }
}

export { updateNotifications };