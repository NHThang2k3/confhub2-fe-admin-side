// src/hooks/useBulkImportantActions.ts
import { useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';

const useBulkImportantActions = (
    selectedIds: string[],
    notifications: Notification[],
    updateUserNotifications: (updatedUserNotifications: Notification[]) => void
) => {
    const handleMarkSelectedAsImportant = useCallback(async () => {
        const updatedUserNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && !n.isImportant ? { ...n, isImportant: true } : n
        );
        updateUserNotifications(updatedUserNotifications);
    }, [selectedIds, notifications, updateUserNotifications]);

    const handleMarkSelectedAsUnimportant = useCallback(async () => {
        const updatedUserNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && n.isImportant ? { ...n, isImportant: false } : n
        );
        updateUserNotifications(updatedUserNotifications);
    }, [selectedIds, notifications, updateUserNotifications]);

    const allSelectedAreImportant = selectedIds.length > 0 && selectedIds.every(id => {
        const notification = notifications.find(n => n.id === id);
        return notification?.isImportant;
    });

    return { handleMarkSelectedAsImportant, handleMarkSelectedAsUnimportant, allSelectedAreImportant };
};

export default useBulkImportantActions;