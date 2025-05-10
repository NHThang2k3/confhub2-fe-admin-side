// src/hooks/useLoginForm.ts
import { useState, FormEvent } from 'react';
import useAuthApi from './useAuthApi';
import { UserResponse } from '@/src/models/response/user.response';

interface LoginFormResult {
    email: string;
    password: string;
    handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent) => Promise<void>;
    handleGoogleLogin: () => Promise<void>;
    error: string | null;
    isLoading: boolean;
    user: UserResponse | null;
}

const useLoginForm = (): LoginFormResult => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading, error, user, googleSignIn } = useAuthApi();

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!email) {
            alert('Please enter email');
            return;
        }
        if (!password) {
            alert('Please enter password');
            return;
        }
        await signIn({ email, password });
    };

    const handleGoogleLogin = async () => {
        await googleSignIn(); // Call googleSignIn
    };

    return {
        email,
        password,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin, // Use handleGoogleLogin
        error,
        isLoading,
        user,
    };
};

export default useLoginForm;