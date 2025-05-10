// src/hooks/useChangePassword.ts (Đã cập nhật)
import { appConfig } from '@/src/middleware';
import { useState, useCallback } from 'react';

const API_VERIFY_PASSWORD_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/verify-password`;
const API_CHANGE_PASSWORD_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/change-password`;

export const useChangePassword = (userId: string, onClose: () => void) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'change'>('confirm');

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setError(null);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError(null);
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewPassword(e.target.value);
    setError(null);
  };

  const handleConfirmCurrentPassword = useCallback(async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(API_VERIFY_PASSWORD_ENDPOINT, { // Gọi API verify
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, currentPassword }), // Gửi id và currentPassword
      });

      const data = await response.json();

      if (response.ok) {
        setStep('change'); // Chuyển sang bước đổi mật khẩu
      } else {
        setError(data.message || 'Invalid current password');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPassword]);

  const handleChangePassword = useCallback(async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CHANGE_PASSWORD_ENDPOINT, { // Gọi API change-password
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, newPassword, confirmNewPassword }), // Gửi id, newPassword, confirmNewPassword
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          onClose(); // Đóng form
        }, 3000);
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, newPassword, confirmNewPassword, onClose]);

  return {
    currentPassword,
    newPassword,
    confirmNewPassword,
    error,
    message,
    isLoading,
    step,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleConfirmCurrentPassword,
    handleChangePassword,
  };
};