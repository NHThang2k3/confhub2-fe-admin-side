// // components/Header/hooks/useSocketConnection.ts
// import { useState, useEffect, useRef, useCallback } from 'react';
// import io, { Socket } from 'socket.io-client';
// import { Notification } from '../../models/response/user.response'; // Adjust path
// import { UserResponse } from '../../models/response/user.response';

// interface UseSocketConnectionProps {
//   loginStatus: string | null;
//   user: UserResponse | null;
// }

// // --- START: Logic tính toán URL và path cho Socket.IO, lấy từ useChatSocketManager ---
// // Đặt tên biến môi trường cụ thể cho service notification nếu cần,
// // hoặc sử dụng một biến chung nếu cả chat và notification dùng chung endpoint API Gateway.
// // Ở đây, chúng ta sẽ sử dụng NEXT_PUBLIC_DATABASE_URL như đã có trong code gốc của bạn.
// const NOTIFICATION_SERVICE_URL_CONFIG = process.env.NEXT_PUBLIC_DATABASE_URL || "https://confhub.westus3.cloudapp.azure.com";

// let notificationSocketIoBaseUrl: string = '';
// let notificationSocketIoPathOption: string | undefined = undefined;

// if (typeof window !== 'undefined' && NOTIFICATION_SERVICE_URL_CONFIG) {
//     try {
//         const serviceUrlParsed = new URL(NOTIFICATION_SERVICE_URL_CONFIG);
//         // Xác định protocol cho WebSocket (ws hoặc wss)
//         const socketProtocol = serviceUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:';
//         notificationSocketIoBaseUrl = `${socketProtocol}//${serviceUrlParsed.hostname}${serviceUrlParsed.port ? `:${serviceUrlParsed.port}` : ''}`;

//         // Chuẩn hóa path từ URL config
//         let normalizedServicePath = serviceUrlParsed.pathname.startsWith('/') ? serviceUrlParsed.pathname : '/' + serviceUrlParsed.pathname;
//         // Đảm bảo path kết thúc bằng dấu '/' nếu nó không phải là root path
//         if (normalizedServicePath !== '/' && !normalizedServicePath.endsWith('/')) {
//             normalizedServicePath += '/';
//         }
//         // Ghép với 'socket.io/' để tạo path cho Socket.IO
//         notificationSocketIoPathOption = normalizedServicePath + 'socket.io/';

//         console.log(`[NotificationSocket Init] Calculated socket base URL: ${notificationSocketIoBaseUrl}`);
//         console.log(`[NotificationSocket Init] Calculated socket path option: ${notificationSocketIoPathOption}`);

//     } catch (e) {
//         console.error("[NotificationSocket Init] Failed to parse notification service URL from config:", e);
//         notificationSocketIoBaseUrl = ''; // Đánh dấu là không hợp lệ
//     }
// } else if (!NOTIFICATION_SERVICE_URL_CONFIG && typeof window !== 'undefined') {
//     console.warn("[NotificationSocket Init] NOTIFICATION_SERVICE_URL_CONFIG (e.g., NEXT_PUBLIC_DATABASE_URL) is not configured. Socket connection will not be attempted.");
// }
// // --- END: Logic tính toán URL và path cho Socket.IO ---


// export const useSocketConnection = ({ loginStatus, user }: UseSocketConnectionProps) => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [notificationEffect, setNotificationEffect] = useState(false);
//   const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
//   const socketRef = useRef<Socket | null>(null);
//   const isMountedRef = useRef(true); // Để tránh cập nhật state trên component đã unmount

//   useEffect(() => {
//     isMountedRef.current = true;
//     return () => {
//         isMountedRef.current = false;
//     };
//   }, []);

//   const fetchNotifications = useCallback(async () => {
//     if (user?.id) {
//       setIsLoadingNotifications(true);
//       try {
//         // Sử dụng NOTIFICATION_SERVICE_URL_CONFIG để đảm bảo nhất quán
//         const response = await fetch(`${NOTIFICATION_SERVICE_URL_CONFIG}/api/v1/notification/user`, {
//           method: 'GET',
//           headers : {
//             "Authorization" : `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//           }
//         });
//         if (response.ok) {
//           const data: Notification[] = await response.json();
//           const filteredNotifications = data.filter(n => n.deletedAt === null);
//           if (isMountedRef.current) {
//             setNotifications(filteredNotifications);
//           }
//         } else {
//           console.error('Failed to fetch notifications:', response.status);
//         }
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       } finally {
//         if (isMountedRef.current) {
//           setIsLoadingNotifications(false);
//         }
//       }
//     }
//   }, [user?.id]);

//   const markAllAsRead = useCallback(async () => {
//     if (!user?.id) return;
//     try {
//       const response = await fetch(`${NOTIFICATION_SERVICE_URL_CONFIG}/api/v1/notification/mark-all-as-read`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (response.ok) {
//         if (isMountedRef.current) {
//           setNotifications(prevNotifications =>
//             prevNotifications.map(n => ({ ...n, seenAt: new Date().toISOString() }))
//           );
//         }
//       } else {
//         console.error('Failed to mark all as read:', response.status);
//       }
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     const initializeSocket = () => {
//       if (!loginStatus || !user) {
//         console.log("[NotificationSocket] Not logged in or no user, skipping socket initialization.");
//         return;
//       }

//       if (!notificationSocketIoBaseUrl) {
//         console.warn("[NotificationSocket] Socket Base URL is not valid. Skipping connection for notifications.");
//         return;
//       }

//       // Nếu đã có socket và đang kết nối, không tạo mới trừ khi cần thiết (ví dụ: token thay đổi)
//       // Tuy nhiên, logic hiện tại của useSocketConnection đơn giản hơn, chỉ kết nối khi loginStatus và user có.
//       // Nếu socket đã tồn tại và có thể đang kết nối từ lần trước, hãy ngắt nó đi trước khi tạo mới
//       // để đảm bảo token mới nhất (nếu có) được sử dụng và tránh nhiều kết nối.
//       if (socketRef.current) {
//         console.log("[NotificationSocket] Disconnecting existing notification socket before creating a new one.");
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//           console.warn("[NotificationSocket] No token found in localStorage. Attempting to connect without auth, server might reject or require 'register' event.");
//           // Tùy server của bạn có cho phép kết nối không token rồi mới register không
//           // Nếu không, bạn có thể không cho kết nối ở đây.
//       }

//       console.log(`[NotificationSocket] Attempting to connect to ${notificationSocketIoBaseUrl} with path ${notificationSocketIoPathOption}`);
//       const newSocket = io(notificationSocketIoBaseUrl, {
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 5000,
//         timeout: 20000,
//         auth: { token: token }, // Gửi token trong handshake
//         transports: ['websocket', 'polling'], // Thêm polling làm fallback
//         ...(notificationSocketIoPathOption && notificationSocketIoPathOption !== '/socket.io/' && { path: notificationSocketIoPathOption }),
//       });
//       socketRef.current = newSocket;

//       newSocket.on('connect', () => {
//         console.log(`[NotificationSocket] Connected with ID: ${newSocket.id}. User ID: ${user.id}`);
//         // Vẫn gửi 'register' nếu backend của bạn yêu cầu user.id sau khi kết nối
//         // ngay cả khi đã có auth token, vì có thể server dùng nó để map user với socket ID.
//         newSocket.emit('register', user.id);
//       });

//       newSocket.on('disconnect', (reason) => {
//         console.log(`[NotificationSocket] Disconnected: ${reason}`);
//         // Cân nhắc việc set socketRef.current = null ở đây nếu bạn muốn logic tạo mới chạy lại
//         // khi có thay đổi ở loginStatus/user.
//         // Tuy nhiên, Socket.IO client sẽ tự động thử kết nối lại theo cấu hình.
//       });

//       newSocket.on('connect_error', (error) => {
//         console.error('[NotificationSocket] Connection Error:', error.message, error.cause || '');
//         // Có thể log thêm error.data nếu có thông tin hữu ích
//       });

//       newSocket.on('auth_error', (error) => { // Giả sử server của bạn emit 'auth_error'
//           console.error('[NotificationSocket] Authentication Error:', error.message);
//           // Nếu lỗi auth, có thể cần ngắt kết nối và không thử lại với token cũ
//           newSocket.disconnect();
//       });

//       newSocket.on('notification', (newNotification: Notification) => {
//         if (isMountedRef.current) {
//           console.log('[NotificationSocket] Received new notification:', newNotification);
//           setNotifications(prevNotifications => {
//             if (prevNotifications.some(n => n.id === newNotification.id) || newNotification.deletedAt !== null) {
//               return prevNotifications;
//             }
//             return [newNotification, ...prevNotifications];
//           });
//           setNotificationEffect(true);
//           setTimeout(() => {
//             if (isMountedRef.current) setNotificationEffect(false);
//           }, 1000);
//         }
//       });
//     };

//     if (loginStatus && user) {
//       fetchNotifications(); // Fetch initial notifications
//       initializeSocket();   // Initialize socket connection
//     } else {
//       // User logged out or session expired
//       if (socketRef.current) {
//         console.log("[NotificationSocket] User logged out or no user, disconnecting socket.");
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     }

//     return () => {
//       // Cleanup on component unmount or when dependencies change causing re-run before cleanup
//       if (socketRef.current) {
//         console.log("[NotificationSocket] Cleaning up socket connection.");
//         socketRef.current.off('connect');
//         socketRef.current.off('disconnect');
//         socketRef.current.off('connect_error');
//         socketRef.current.off('auth_error');
//         socketRef.current.off('notification');
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [loginStatus, user, fetchNotifications]); // Thêm fetchNotifications vào dependencies

//   return {
//     notifications,
//     notificationEffect,
//     markAllAsRead,
//     fetchNotifications,
//     isLoadingNotifications,
//     socketRef, // Trả về socketRef nếu cần truy cập trực tiếp từ bên ngoài
//   };
// };