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

interface UpdateAdminStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: any;
  onSuccess: () => void;
}

export function UpdateAdminStatusDialog({
  open,
  onOpenChange,
  admin,
  onSuccess,
}: UpdateAdminStatusDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (!admin) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/admins/${admin.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !admin.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {admin?.isActive ? 'Deactivate Admin' : 'Activate Admin'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to {admin?.isActive ? 'deactivate' : 'activate'} admin{' '}
            <strong>{admin?.firstName} {admin?.lastName}</strong>?
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
            variant={admin?.isActive ? 'destructive' : 'default'}
            onClick={handleStatusUpdate}
            disabled={loading}
          >
            {loading ? 'Processing...' : admin?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 