// src/hooks/useFilteredNotifications.ts
import { useMemo } from 'react';
import { Notification } from '@/src/models/response/user.response';

const useFilteredNotifications = (notifications: Notification[], searchTerm: string) => {
    const filteredNotifications = useMemo(() => {
        // console.log("useFilteredNotifications: Input notifications:", notifications, "searchTerm:", searchTerm); // Log input
        const result = notifications
            .filter(
                (notification) =>
                    notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter((n) => !n.deletedAt); // Corrected filter: Keep NOT deleted
        // console.log("useFilteredNotifications: Filtered notifications:", result); // Log result
        return result;
    }, [notifications, searchTerm]);

    return filteredNotifications;
};

export default useFilteredNotifications;