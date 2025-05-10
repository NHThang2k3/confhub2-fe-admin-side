// src/hooks/useBulkReadActions.ts
import { useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';

const useBulkReadActions = (
    selectedIds: string[],
    notifications: Notification[],
    updateUserNotifications: (updatedUserNotifications: Notification[]) => void
) => {
    const handleMarkSelectedAsRead = useCallback(async () => {
        const updatedUserNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && n.seenAt === null ? { ...n, seenAt: new Date().toISOString() } : n
        );
        updateUserNotifications(updatedUserNotifications);
    }, [selectedIds, notifications, updateUserNotifications]);

    const handleMarkSelectedAsUnread = useCallback(async () => {
        const updatedUserNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && n.seenAt !== null ? { ...n, seenAt: null } : n
        );
        updateUserNotifications(updatedUserNotifications);
    }, [selectedIds, notifications, updateUserNotifications]);

    const allSelectedAreRead = selectedIds.length > 0 && selectedIds.every(id => {
        const notification = notifications.find(n => n.id === id);
        return notification?.seenAt !== null;
    });


    return { handleMarkSelectedAsRead, handleMarkSelectedAsUnread, allSelectedAreRead };
};

export default useBulkReadActions;