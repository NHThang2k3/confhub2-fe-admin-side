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

  const handleBan = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isBanned: !user.isBanned,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user?.isBanned ? 'Unban User' : 'Ban User'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to {user?.isBanned ? 'unban' : 'ban'} user{' '}
            <strong>{user?.firstName} {user?.lastName}</strong>?
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={user?.isBanned ? 'default' : 'destructive'}
            onClick={handleBan}
            disabled={loading}
          >
            {loading ? 'Processing...' : user?.isBanned ? 'Unban' : 'Ban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 