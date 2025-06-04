'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: BanUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false); // State quản lý hiển thị phần nhập lý do
  const [reason, setReason] = useState('');

  const handleBanOrUnban = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/users/${user.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify({
          isBanned: !user.isBanned,
          reason: reason ? reason : '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update user status' }));
        throw new Error(errorData.message || 'Failed to update user status');
      }

      onSuccess();
      handleCloseAndReset();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryActionClick = () => {
    if (!showReasonInput) {
      // Nếu chưa hiển thị input lý do, thì hiển thị nó
      setShowReasonInput(true);
    } else {
      // Nếu đã hiển thị input lý do (và người dùng nhấn "Confirm"), thì thực hiện ban/unban
      handleBanOrUnban();
    }
  };

  const handleCloseAndReset = () => {
    onOpenChange(false);
    // Reset states khi dialog đóng hoàn toàn
    // Dùng setTimeout để đảm bảo UI đã ẩn trước khi reset, tránh giật lag
    setTimeout(() => {
      setShowReasonInput(false);
      setReason('');
      setLoading(false);
    }, 150); // Điều chỉnh delay nếu cần
  };

  if (!user) return null;

  const actionType = user?.isBanned ? 'unban' : 'ban';
  const dialogTitle = !showReasonInput
    ? `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} user ${user.firstName} ${user.lastName}`
    : `Reason for ${actionType} user ${user.firstName} ${user.lastName} (optional)`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCloseAndReset();
      } else {
        // Khi dialog được mở lại từ bên ngoài, đảm bảo reset về trạng thái ban đầu
        // (trừ khi bạn muốn nó nhớ trạng thái trước đó)
        setShowReasonInput(false);
        setReason('');
        onOpenChange(true);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {!showReasonInput && (
          <div className="py-4">
            <p>
              Are you sure you want to {actionType} user{' '}
              <strong>{user.firstName} {user.lastName}</strong>?
            </p>
          </div>
        )}

        {showReasonInput && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-2">
              <textarea
                id="reason-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter reason for ${actionType}...`}
                className="col-span-3 px-2 pt-1"
                rows={4}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {/* Nút Cancel luôn đóng dialog và reset */}
          <Button
            variant="outline"
            onClick={handleCloseAndReset}
            disabled={loading && showReasonInput} // Disable khi đang loading ở bước nhập lý do
          >
            Cancel
          </Button>

          {/* Nút hành động chính */}
          <Button
            variant={!showReasonInput && user.isBanned ? 'default' : (!showReasonInput ? 'destructive' : 'default')}
            onClick={handlePrimaryActionClick}
            disabled={loading}
          >
            {loading && showReasonInput ? 'Processing...' :
             !showReasonInput ? (actionType.charAt(0).toUpperCase() + actionType.slice(1)) :
             `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}