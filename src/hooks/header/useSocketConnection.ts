
// components/Header/hooks/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Notification } from '../../models/response/user.response'; // Adjust path
import { UserResponse } from '../../models/response/user.response';
interface UseSocketConnectionProps {
  loginStatus: string | null;
  user: UserResponse  | null;
}
const NEXT_PUBLIC_DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL || "http://confhub.engineer"
const socketInitializer = () => {
  // // Lấy URL cơ sở từ biến môi trường (nếu có, hoặc để trống nếu chỉ dùng origin hiện tại)
  // // Trong trường hợp này, vì NEXT_PUBLIC_DATABASE_URL chỉ là "/api", chúng ta không cần chỉ định URL cơ sở,
  // // client sẽ tự dùng origin hiện tại (https://confhub.ddns.net).
  // const backendNamespace = process.env.NEXT_PUBLIC_DATABASE_URL || '/'; // Dùng /api

  // console.log(`Initializing socket connection to namespace: ${backendNamespace}`);
  // console.log(`Explicitly setting path to: ${backendNamespace}/api/socket.io`); // Log đường dẫn sẽ dùng

  // return io(backendNamespace, { // Kết nối đến namespace /api
  //   path: `${backendNamespace}/api/socket.io` // Quan trọng: Chỉ định rõ đường dẫn transport
  //   // transports: ['websocket', 'polling'] // Có thể thêm nếu muốn ưu tiên websocket
  // });
  return io(`${NEXT_PUBLIC_DATABASE_URL}`); // Your backend URL

};

export const useSocketConnection = ({ loginStatus, user }: UseSocketConnectionProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEffect, setNotificationEffect] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications (no changes needed here)
  const fetchNotifications = useCallback(async () => {
    if (user?.id) {
      setIsLoadingNotifications(true);
      try {
        const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user`, {
          method: 'GET',
          headers : {
            "Authorization" : `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data: Notification[] = await response.json();
          const filteredNotifications = data.filter(n => n.deletedAt === null);
          setNotifications(filteredNotifications);
        } else {
          console.error('Failed to fetch notifications:', response.status);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/mark-all-as-read`, {
        method: 'PUT', // Use PUT or POST, depending on your API design
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
        },
        // You might not need a body, if your backend uses the user ID from the URL
      });

      if (response.ok) {
        // Option 1: Refetch notifications (most accurate)
        // await fetchNotifications();

        // Option 2: Update local state (faster, but might be out of sync if other updates happened)
        setNotifications(prevNotifications =>
          prevNotifications.map(n => ({ ...n, seenAt: new Date().toISOString() }))
        );

      } else {
        console.error('Failed to mark all as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user?.id]); // Add fetchNotifications if you choose to refetch

  useEffect(() => {
        const initializeSocket = async () => {

        if (loginStatus && user && !socketRef.current) {
            const newSocket = socketInitializer();
            socketRef.current = newSocket;

            newSocket.on('connect', () => {
            newSocket.emit('register', user.id);
            });

            newSocket.on('notification', (newNotification: Notification) => {
            setNotifications(prevNotifications => {
                if (prevNotifications.some(n => n.id === newNotification.id) || newNotification.deletedAt !== null) {
                return prevNotifications;
                }
                return [newNotification, ...prevNotifications];
            });
            setNotificationEffect(true);
            setTimeout(() => setNotificationEffect(false), 1000);
            });
        }
        };

        if (loginStatus && user) {
             fetchNotifications();
             initializeSocket();
        }

        return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        };
    }, [loginStatus, user, fetchNotifications]);

  return {
    notifications,
    notificationEffect,
    markAllAsRead, // Return the new function
    fetchNotifications,
    isLoadingNotifications,
    socketRef,
  };
};