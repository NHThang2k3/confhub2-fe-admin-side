// src/hooks/useEditProfile.ts
import { useState, useEffect } from 'react';
import { UserResponse } from '@/src/models/response/user.response';
import { updateUser } from '@/src/app/api/user/updateUser'; // Corrected path
import useAuthApi from '../../auth/useAuthApi'; // Import useAuthApi

export const useEditProfile = (
  initialUserData: UserResponse | null
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserResponse>>({});
    const { user, signIn } = useAuthApi();


  // Initialize editedData when initialUserData changes
  useEffect(() => {
    setEditedData(initialUserData || {});
  }, [initialUserData]);

  const handleEditClick = () => {
    setIsEditing(true);
    // No need to reset editedData here; it's handled by the useEffect
  };

  const handleSaveClick = async () => {
    if (!user) return; // Ensure user is logged in

    try {
      const updatePayload: Partial<UserResponse> = {};

      for (const key in editedData) {
        if (Object.hasOwn(editedData, key)) {
          const typedKey = key as keyof UserResponse;
          // Compare with initialUserData, not a potentially stale value
          if (
            initialUserData &&
            editedData[typedKey] !== initialUserData[typedKey]
          ) {
            updatePayload[typedKey] = editedData[typedKey] as any;
          }
        }
      }

      if (Object.keys(updatePayload).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedUser = await updateUser(user.id, updatePayload);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      //Sign in to trigger all update event of useAuth
      await signIn({email: updatedUser.email, password: ""}) //This will trigger all the localStorage change

      setIsEditing(false);
      window.location.reload();

    } catch (error: any) {
      console.error('Failed to update user:', error);
      // Consider a more user-friendly error message (perhaps using a state variable)
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData(initialUserData || {}); // Reset to original data
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'aboutme' && value.length > 100) {
      return;
    }

    setEditedData({
      ...editedData,
      [name]: value,
    });
  };

  const handleInterestedTopicsChange = (topic: string) => {
    setEditedData((prevData) => {
      const currentTopics = prevData.interestedTopics || [];
      const updatedTopics = currentTopics.includes(topic)
        ? currentTopics.filter((t) => t !== topic)
        : [...currentTopics, topic];

      const uniqueTopics = Array.from(new Set(updatedTopics)); // Ensure uniqueness
      return { ...prevData, interestedTopics: uniqueTopics };
    });
  };

  return {
    isEditing,
    editedData,
    setEditedData, // Expose setEditedData if needed by components
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange,
  };
};