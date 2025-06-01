'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useUserManagement } from '@/src/hooks/useUserManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { BanUserDialog } from './BanUserDialog';
import { useTranslations } from 'next-intl';
import '@/src/styles/theme.scss';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isBanned: boolean;
  createdAt: string;
}

interface UserManagementState {
  search: string;
  status: string;
  page: number;
  perPage: number;
}

export default function UsersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('UsersPage');
  const { isLoggedIn, isInitializing, isLoading } = useAuth();
  const router = useRouter();

  const {
    state,
    setState,
    data: users,
    loading,
    error,
    totalPages,
    refetch
  } = useUserManagement('users');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  useEffect(() => {
    if (isInitializing) {
      console.log(`[${locale}/dashboard/accounts/users/page.tsx] AuthContext is initializing...`);
      return;
    }

    if (!isLoggedIn) {
      console.log(`[${locale}/dashboard/accounts/users/page.tsx] User not logged in. Redirecting to login.`);
      router.replace(`/${locale}/auth/login`);
    }
  }, [isLoggedIn, isInitializing, locale, router]);

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[50vh] text-[var(--color-text-primary)]">
        {t('AuthStatus_Loading')}
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder={t('searchPlaceholder')}
          value={state.search}
          onChange={(e) => setState((prev: UserManagementState) => ({ ...prev, search: e.target.value }))}
          className="max-w-sm border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:border-[var(--color-input-focus-border)] focus:ring-[var(--color-input-focus-ring)]"
        />
        <Select
          value={state.status || 'all'}
          onValueChange={(value) => setState((prev: UserManagementState) => ({ ...prev, status: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-[180px] bg-[var(--color-bg-white)] border-[var(--color-input-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]">
            <SelectValue placeholder={t('statusAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statusAll')}</SelectItem>
            <SelectItem value="active">{t('statusActive')}</SelectItem>
            <SelectItem value="banned">{t('statusBanned')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-[var(--color-text-primary)]">{t('loading')}</div>
      ) : error ? (
        <div className="text-[var(--color-status-error)]">{error}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--color-table-header-bg)]">
                <TableHead className="text-[var(--color-text-primary)]">{t('name')}</TableHead>
                <TableHead className="text-[var(--color-text-primary)]">{t('email')}</TableHead>
                <TableHead className="text-[var(--color-text-primary)]">{t('status')}</TableHead>
                <TableHead className="text-[var(--color-text-primary)]">{t('createdAt')}</TableHead>
                <TableHead className="text-[var(--color-text-primary)]">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id} className="hover:bg-[var(--color-table-hover-bg)]">
                  <TableCell className="text-[var(--color-text-primary)]">{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell className="text-[var(--color-text-primary)]">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded ${
                      user.isBanned 
                        ? 'bg-[var(--color-status-error-light)] text-[var(--color-status-error)]' 
                        : 'bg-[var(--color-status-success-light)] text-[var(--color-status-success)]'
                    }`}>
                      {user.isBanned ? t('statusBanned') : t('statusActive')}
                    </span>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-primary)]">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsBanDialogOpen(true);
                      }}
                      className="border-[var(--color-button-outline-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-outline-hover-bg)] hover:text-[var(--color-button-outline-hover-text)]"
                    >
                      {user.isBanned ? t('unban') : t('ban')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setState((prev: UserManagementState) => ({ ...prev, page: prev.page - 1 }))}
                    aria-disabled={state.page === 1}
                    className={state.page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>
                    {state.page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setState((prev: UserManagementState) => ({ ...prev, page: prev.page + 1 }))}
                    aria-disabled={state.page === totalPages}
                    className={state.page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

      <BanUserDialog
        open={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
        user={selectedUser}
        onSuccess={refetch}
      />
    </div>
  );
}