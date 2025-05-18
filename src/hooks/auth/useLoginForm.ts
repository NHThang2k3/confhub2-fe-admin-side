// src/hooks/auth/useLoginForm.ts
import { useState, FormEvent, ChangeEvent } from 'react'; // Thêm ChangeEvent
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { UserResponse } from '@/src/models/response/user.response'; // Giữ nguyên

interface LoginFormResult {
    email: string;
    password: string;
    handleEmailChange: (event: ChangeEvent<HTMLInputElement>) => void; // Sử dụng ChangeEvent
    handlePasswordChange: (event: ChangeEvent<HTMLInputElement>) => void; // Sử dụng ChangeEvent
    handleSubmit: (event: FormEvent) => Promise<void>;
    handleGoogleLogin: () => Promise<void>;
    error: string | null;       // Lỗi từ AuthContext
    isLoading: boolean;     // Trạng thái tải từ AuthContext
    user: UserResponse | null;  // Người dùng từ AuthContext (thường không cần trực tiếp trong form này)
}

const useLoginForm = (): LoginFormResult => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
    // isLoading, error, và user giờ đây đến từ AuthContext
    const { signIn, googleSignIn, isLoading, error, user } = useAuth();

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        // Có thể thêm validation chi tiết hơn ở đây và set lỗi cục bộ hoặc thông qua context
        if (!email) {
            // Thay vì alert, bạn có thể muốn set một state lỗi cục bộ cho form
            // hoặc nếu `signIn` có thể trả về lỗi cụ thể, hãy dựa vào `error` từ `useAuth`.
            console.error('Please enter email');
            // Ví dụ: setErrorFormLocal('Please enter email'); // Nếu có state lỗi cục bộ
            return;
        }
        if (!password) {
            console.error('Please enter password');
            return;
        }
        // `signIn` từ `useAuth` sẽ xử lý việc gọi API và cập nhật state trong AuthContext
        await signIn({ email, password });
    };

    const handleGoogleLogin = async () => {
        // `googleSignIn` từ `useAuth` sẽ xử lý việc chuyển hướng đến backend/Google
        await googleSignIn();
    };

    return {
        email,
        password,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin,
        error,      // Lỗi này là lỗi chung từ AuthContext (ví dụ: lỗi mạng, sai credentials)
        isLoading,  // Trạng thái tải chung từ AuthContext (khi đang signIn hoặc googleSignIn)
        user,       // Thông tin người dùng từ AuthContext
    };
};

export default useLoginForm;