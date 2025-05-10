// src/hooks/useNotificationData.ts
import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '../../../app/api/user/getNotifications';
import { Notification } from '@/src/models/response/user.response';

const useNotificationData = (userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const fetchData = useCallback(async () => {
        // console.log(`useNotificationData: fetchData called for userId: ${userId}`); // Log when fetchData is called
        setLoading(true);
        try {
            if (userId) {
                const data = await getNotifications(userId);
                // console.log('useNotificationData: Fetched notifications:', data); // Log fetched data
                setNotifications(data || []);
                setLoggedIn(true);
            }
        } catch (error) {
            // console.error('useNotificationData: Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        // console.log(`useNotificationData: useEffect triggered. userId: ${userId}`); // Log when useEffect runs
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    // console.log(`useNotificationData: Returning.  notifications:`, notifications, `loading: ${loading}`, `loggedIn: ${loggedIn}`); // Log return values

    return { notifications, loading, loggedIn, fetchData };
};

export default useNotificationData;