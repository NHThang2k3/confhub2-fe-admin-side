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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis // Import PaginationEllipsis
} from '@/components/ui/pagination';
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

  // Hàm trợ giúp để tạo danh sách các trang cần hiển thị trong phân trang
  // Hiển thị trang đầu tiên, trang cuối cùng, và một số trang xung quanh trang hiện tại,
  // sử dụng dấu ba chấm để biểu thị các trang bị bỏ qua.
  const getPaginationPages = (currentPage: number, totalPages: number, pageRange = 2) => {
    const pages: (number | 'ellipsis')[] = [];
    // Đảm bảo không hiển thị số trang âm hoặc lớn hơn tổng số trang
    const startPage = Math.max(1, currentPage - pageRange);
    const endPage = Math.min(totalPages, currentPage + pageRange);

    // Thêm trang đầu tiên và dấu ba chấm nếu cần
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) { // Chỉ thêm dấu ba chấm nếu có hơn một trang bị bỏ qua
        pages.push('ellipsis');
      }
    }

    // Thêm các trang xung quanh trang hiện tại
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm trang cuối cùng và dấu ba chấm nếu cần
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) { // Chỉ thêm dấu ba chấm nếu có hơn một trang bị bỏ qua
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const paginationPages = getPaginationPages(state.page, totalPages);

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
          // Reset về trang 1 khi tìm kiếm mới
          onChange={(e) => setState((prev: UserManagementState) => ({ ...prev, search: e.target.value, page: 1 }))}
          className="max-w-sm border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:border-[var(--color-input-focus-border)] focus:ring-[var(--color-input-focus-ring)]"
        />
        <Select
          value={state.status || 'all'}
          // Reset về trang 1 khi thay đổi trạng thái lọc
          onValueChange={(value) => setState((prev: UserManagementState) => ({ ...prev, status: value === 'all' ? '' : value, page: 1 }))}
        >
          <SelectTrigger className="w-[180px] bg-[var(--color-bg-white)] border-[var(--color-input-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]">
            <SelectValue placeholder={t('statusAll')} />
          </SelectTrigger>
          {/* Đổi màu bg và cho nó đè lên trên (z-index) */}
          <SelectContent className="bg-[var(--color-bg-white)] z-50 shadow-lg border-[var(--color-input-border)]">
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--color-text-secondary)] py-4">
                    {t('noUsersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: User) => (
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
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 0 && ( // Chỉ hiển thị phân trang nếu có trang dữ liệu
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setState((prev: UserManagementState) => ({ ...prev, page: prev.page - 1 }))}
                      aria-disabled={state.page === 1}
                      className={`${state.page === 1 ? 'pointer-events-none opacity-50' : ''} text-[var(--color-text-primary)] hover:bg-[var(--color-button-outline-hover-bg)]`}
                    />
                  </PaginationItem>

                  {paginationPages.map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis className="text-[var(--color-text-primary)]" />
                      ) : (
                        <PaginationLink
                          onClick={() => setState((prev: UserManagementState) => ({ ...prev, page: page as number }))}
                          isActive={state.page === page}
                          className={`
                            text-[var(--color-text-primary)]
                            ${state.page === page
                               ? 'bg-[var(--color-primary)] text-[var(--color-button-primary-text)] hover:bg-[var(--color-primary)]' // Active state
                               : 'hover:bg-[var(--color-button-outline-hover-bg)]' // Hover state for non-active
                            }
                          `}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setState((prev: UserManagementState) => ({ ...prev, page: prev.page + 1 }))}
                      aria-disabled={state.page === totalPages}
                      className={`${state.page === totalPages ? 'pointer-events-none opacity-50' : ''} text-[var(--color-text-primary)] hover:bg-[var(--color-button-outline-hover-bg)]`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-sm text-center text-[var(--color-text-secondary)] mt-2">
                {t('pageInfo', { current: state.page, total: totalPages })}
              </div>
            </div>
          )}
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