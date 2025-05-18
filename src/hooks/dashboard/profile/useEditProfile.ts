// src/hooks/dashboard/profile/useEditProfile.ts
import { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { UserResponse } from '@/src/models/response/user.response';
import { updateUser } from '@/src/app/api/user/updateUser'; // Đường dẫn này cần kiểm tra lại
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

export const useEditProfile = (
  initialUserData: UserResponse | null // initialUserData vẫn được truyền từ ProfileTab
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserResponse>>({});

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // user từ context là nguồn thông tin user hiện tại
  // processTokenFromOAuth có thể được dùng để "làm mới" state sau khi cập nhật,
  // bằng cách fetch lại user từ /me nếu API updateUser không trả về token mới.
  // Tuy nhiên, cách tốt hơn là API updateUser trả về UserResponse đã cập nhật,
  // và chúng ta sẽ cập nhật state của AuthProvider trực tiếp.
  const { user, getToken, updateAuthUser, isLoggedIn } = useAuth(); // Lấy hàm updateAuthUser

  // Khởi tạo editedData khi initialUserData (từ prop) hoặc user (từ context) thay đổi
  useEffect(() => {
    // Ưu tiên initialUserData nếu có, nếu không thì dùng user từ context
    const dataToEdit = initialUserData || user;
    setEditedData(dataToEdit || {});
  }, [initialUserData, user]);

  const handleEditClick = () => {
    setIsEditing(true);
    // Đảm bảo editedData được cập nhật với dữ liệu mới nhất khi bắt đầu edit
    const dataToEdit = initialUserData || user;
    setEditedData(dataToEdit || {});
  };

  const handleSaveClick = useCallback(async () => {
    if (!user || !isLoggedIn) { // Kiểm tra cả isLoggedIn
      console.error('User not logged in, cannot save profile.');
      return;
    }
    if (!initialUserData) {
      console.error('Initial user data is not available for comparison.');
      return;
    }


    try {
      const updatePayload: Partial<UserResponse> = {};
      let hasChanges = false;

      // So sánh editedData với initialUserData (dữ liệu lúc bắt đầu edit)
      for (const key in editedData) {
        if (Object.hasOwn(editedData, key)) {
          const typedKey = key as keyof UserResponse;
          if (editedData[typedKey] !== initialUserData[typedKey]) {
            updatePayload[typedKey] = editedData[typedKey] as any;
            hasChanges = true;
          }
        }
      }
      // Đặc biệt xử lý mảng interestedTopics vì so sánh mảng phức tạp hơn
      const initialTopics = initialUserData.interestedTopics || [];
      const editedTopics = editedData.interestedTopics || [];
      if (JSON.stringify(initialTopics.slice().sort()) !== JSON.stringify(editedTopics.slice().sort())) {
        updatePayload.interestedTopics = editedTopics;
        hasChanges = true;
      }


      if (!hasChanges) {
        console.log('No changes detected. Not saving.');
        setIsEditing(false);
        return;
      }

      const currentToken = getToken();
      if (!currentToken) {
        console.error('No token found. Cannot update profile.');
        return;
      }

      // Gọi API updateUser với user.id và payload, truyền token
      const updatedUserResponse = await updateUser(user.id, updatePayload, currentToken);

      // Sau khi cập nhật thành công từ API:
      // 1. Cập nhật UserResponse trong AuthProvider
      updateAuthUser(updatedUserResponse); // Cập nhật user trong context và localStorage

      // 2. Cập nhật localStorage (setAuthUser có thể đã làm điều này, nhưng để chắc chắn)
      // Nếu AuthProvider có cơ chế persist state (ví dụ: lưu vào localStorage khi user thay đổi),
      // thì việc gọi setAuthUser là đủ.
      // Nếu không, bạn cần cập nhật localStorage thủ công:
      localStorage.setItem('user', JSON.stringify(updatedUserResponse));
      // localStorage.setItem('loginStatus', 'true'); // loginStatus không đổi

      setIsEditing(false);
      // Không cần reload trang, vì state trong AuthProvider đã được cập nhật,
      // và các component khác sử dụng useAuth() sẽ tự re-render.
      // window.location.reload();

      // Quan trọng: initialUserData của ProfileTab sẽ không tự cập nhật sau khi save.
      // ProfileTab nên lấy initialUserData từ user của AuthContext để luôn có dữ liệu mới nhất.

    } catch (error: any) {
      console.error('Failed to update user:', error);
      // Xử lý lỗi: hiển thị thông báo cho người dùng
    }
  }, [user, isLoggedIn, initialUserData, editedData, getToken, updateAuthUser]); // Thêm updateAuthUser vào dependencies

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset editedData về initialUserData (hoặc user từ context nếu initialUserData là null)
    const dataToReset = initialUserData || user;
    setEditedData(dataToReset || {});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'aboutme' && value.length > 100) {
      return; // Giới hạn độ dài
    }

    setEditedData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInterestedTopicsChange = (topic: string) => {
    setEditedData((prevData) => {
      const currentTopics = prevData.interestedTopics || [];
      const isSelected = currentTopics.includes(topic);
      const updatedTopics = isSelected
        ? currentTopics.filter((t) => t !== topic)
        : [...currentTopics, topic];

      // Đảm bảo không có topic trùng lặp (mặc dù logic trên đã xử lý)
      // const uniqueTopics = Array.from(new Set(updatedTopics));
      return { ...prevData, interestedTopics: updatedTopics };
    });
  };

  return {
    isEditing,
    editedData,
    setEditedData,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange,
  };
};