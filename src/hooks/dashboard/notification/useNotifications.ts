// src/hooks/dashboard/notification/useNotifications.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import useNotificationData from './useNotificationData';
import useNotificationState from './useNotificationState';
import useSelection from './useSelection';
import useFilteredNotifications from './useFilteredNotifications';
import useBulkReadActions from './useBulkReadActions';
import useBulkImportantActions from './useBulkImportantActions';
import { Notification } from '@/src/models/response/user.response'; // Đảm bảo import đúng đường dẫn

// --- QUAN TRỌNG: Đảm bảo interface Notification có trường createdAt ---
// interface Notification {
//   id: string;
//   title: string; // Ví dụ
//   message: string; // Ví dụ
//   createdAt: string | Date; // Trường này rất quan trọng cho việc sắp xếp
//   seenAt?: string | Date | null;
//   isImportant?: boolean;
//   deletedAt?: string | Date | null;
//   // ... các trường khác
// }
// ---

interface UseNotificationsReturn {
    notifications: Notification[]; // Sẽ là danh sách đã được sắp xếp
    checkedIndices: string[];
    selectAllChecked: boolean;
    loading: boolean;
    loggedIn: boolean;
    searchTerm: string;
    filteredNotifications: Notification[]; // Danh sách đã lọc và vẫn giữ thứ tự sắp xếp
    handleUpdateSeenAt: (id: string) => Promise<void>;
    handleToggleImportant: (id: string) => Promise<void>;
    handleDeleteNotification: (id: string) => Promise<void>;
    handleMarkUnseen: (id: string) => Promise<void>;
    handleCheckboxChangeTab: (id: string, checked: boolean) => void;
    handleDeleteSelected: () => Promise<void>;
    handleSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleMarkSelectedAsRead: () => Promise<void>;
    handleMarkSelectedAsUnread: () => Promise<void>;
    allSelectedAreRead: boolean;
    handleMarkSelectedAsImportant: () => Promise<void>;
    handleMarkSelectedAsUnimportant: () => Promise<void>;
    allSelectedAreImportant: boolean;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    fetchData: () => Promise<void>;
}

const useNotifications = (): UseNotificationsReturn => {
    // console.log('useNotifications: Initializing');
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                // console.log("User ID from localStorage:", user.id);
                if (user && user.id) {
                    setUserId(user.id);
                } else {
                    console.error("User data from localStorage is missing id:", user);
                }
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }
    }, []);

    const {
        notifications: initialNotifications, // Dữ liệu gốc từ fetch
        loading,
        loggedIn,
        fetchData
    } = useNotificationData(userId);

    const {
        notifications: rawNotifications, // State nội bộ chưa sắp xếp
        setNotifications,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleMarkUnseen,
        updateUserNotifications // Hàm này cập nhật rawNotifications
    } = useNotificationState(initialNotifications, userId);

    // --- BƯỚC SẮP XẾP CHÍNH ---
    const sortedNotifications = useMemo(() => {
        // console.log('useNotifications: Sorting notifications');
        // Luôn tạo một bản sao trước khi sắp xếp để không thay đổi state `rawNotifications` trực tiếp
        return [...rawNotifications].sort((a, b) => {
            // Chuyển đổi sang timestamp (số milliseconds từ epoch) để so sánh
            // Xử lý trường hợp createdAt có thể là null/undefined hoặc không hợp lệ
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            // Kiểm tra NaN (Not-a-Number) nếu new Date() không parse được
            const validTimeA = !isNaN(timeA) ? timeA : 0;
            const validTimeB = !isNaN(timeB) ? timeB : 0;

            // Sắp xếp giảm dần (ngày mới hơn có timestamp lớn hơn sẽ đứng trước)
            return validTimeB - validTimeA;
        });
    }, [rawNotifications]); // Chỉ sắp xếp lại khi `rawNotifications` thay đổi
    // --- KẾT THÚC SẮP XẾP ---

    useEffect(() => {
        // Khi dữ liệu fetch ban đầu thay đổi, cập nhật state rawNotifications
        // Việc sắp xếp sẽ tự động diễn ra trong useMemo(sortedNotifications)
        // console.log('useNotifications: useEffect - initialNotifications changed, updating rawNotifications');
        // Chỉ cập nhật nếu initialNotifications khác với rawNotifications hiện tại (tránh vòng lặp vô hạn nếu có thể)
        // Hoặc đơn giản là luôn cập nhật khi initialNotifications thay đổi
         setNotifications(initialNotifications);
    }, [initialNotifications, setNotifications]); // Phụ thuộc vào dữ liệu fetch và hàm set

    // Lọc dựa trên danh sách *đã sắp xếp*
    const filteredNotifications = useFilteredNotifications(sortedNotifications, searchTerm);

    // Logic chọn lựa dựa trên danh sách *đã lọc* (và đã sắp xếp)
    const {
        checkedIndices,
        setCheckedIndices, // Cần thiết để reset sau khi xóa
        selectAllChecked,
        handleCheckboxChange: handleCheckboxChangeSelection,
        handleSelectAllChange
    } = useSelection(
        // Lấy ID từ danh sách đang hiển thị (đã lọc)
        useMemo(() => filteredNotifications.map(n => n.id), [filteredNotifications])
    );

    // Hành động hàng loạt dựa trên checkedIndices và danh sách *đã sắp xếp*
    const {
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        allSelectedAreRead
    } = useBulkReadActions(checkedIndices, sortedNotifications, updateUserNotifications);

    const {
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        allSelectedAreImportant
    } = useBulkImportantActions(checkedIndices, sortedNotifications, updateUserNotifications);

    // Callback cho checkbox trong từng item
    const handleCheckboxChangeTab = useCallback(
        (id: string, checked: boolean) => {
            // console.log(`useNotifications: handleCheckboxChangeTab called for id: ${id}, checked: ${checked}`);
            handleCheckboxChangeSelection(id, checked);
        },
        [handleCheckboxChangeSelection]
    );

    // Xóa các mục đã chọn
    const handleDeleteSelected = useCallback(async () => {
        // console.log('useNotifications: handleDeleteSelected called for indices:', checkedIndices);
        // Tạo danh sách ID cần xóa
        const idsToDelete = new Set(checkedIndices);
        // Tạo danh sách mới không chứa các mục đã xóa (logic này có thể nằm trong updateUserNotifications)
        // Hoặc nếu updateUserNotifications chỉ đánh dấu 'deletedAt', thì gọi nó cho từng mục
        const updatedNotifications = rawNotifications.map(n => // Cập nhật trên rawNotifications
            idsToDelete.has(n.id) ? { ...n, deletedAt: new Date().toISOString() } : n
        );

        try {
            // Gọi hàm cập nhật state (hàm này nên xử lý việc lưu lên server nếu cần)
             await updateUserNotifications(updatedNotifications); // Gửi danh sách đã cập nhật
             // Reset lại danh sách các mục đã chọn sau khi xóa thành công
             setCheckedIndices([]);
        } catch (error) {
             console.error("Failed to delete selected notifications:", error);
             // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        }

    }, [checkedIndices, rawNotifications, updateUserNotifications, setCheckedIndices]); // Thêm rawNotifications, setCheckedIndices

    // Fetch dữ liệu khi userId có hoặc khi component mount lần đầu (nếu userId có sẵn)
    useEffect(() => {
        if (userId) {
            // console.log('useNotifications: Fetching data because userId is available or changed.');
            fetchData();
        }
    }, [userId, fetchData]); // Thêm fetchData vào dependencies

    // console.log('useNotifications: Returning state', { loading, loggedIn, count: sortedNotifications.length });

    return {
        notifications: sortedNotifications, // Trả về danh sách ĐÃ SẮP XẾP
        checkedIndices,
        selectAllChecked,
        loading,
        loggedIn,
        searchTerm,
        filteredNotifications, // Danh sách lọc từ sortedNotifications
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification, // Hành động cho từng mục
        handleMarkUnseen,
        handleCheckboxChangeTab,
        handleDeleteSelected, // Hành động xóa hàng loạt
        handleSelectAllChange,
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        allSelectedAreRead,
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        allSelectedAreImportant,
        setSearchTerm,
        fetchData,
    };
};

export default useNotifications;