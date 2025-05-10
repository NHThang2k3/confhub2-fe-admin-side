// src/hooks/useImageSelection.ts
import { useState } from 'react'
import { UserResponse } from '@/src/models/response/user.response';

export const useImageSelection = (type: 'avatar' | 'background', setEditedData: React.Dispatch<React.SetStateAction<Partial<UserResponse>>>) => { // Add setEditedData as a parameter
    const [showModal, setShowModal] = useState(false);
    const avatarOptions = [
        '/avatar1.jpg',
        '/avatar2.jpg',
        '/avatar3.jpg',
        '/avatar4.jpg'
    ];
    const backgroundOptions = ['/light.jpg', '/bg-2.jpg'];
    const options = type === 'avatar' ? avatarOptions : backgroundOptions;

    const handleImageSelect = (imageUrl: string) => {  // Simplified handler
        setEditedData(prevData => ({ ...prevData, [type]: imageUrl }));
        setShowModal(false);
    };

    return {
        showModal,
        setShowModal,
        options,
        handleImageSelect
    };
};