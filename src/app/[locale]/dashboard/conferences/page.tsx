'use client'; // Page này cũng cần chạy ở client vì chứa hooks

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext'; // Import useAuth
import { useTranslations } from 'next-intl'; // Import useTranslations
import Conferences from './Conferences'; // Import component UI đã tách ra

// Component Page cho route /dashboard/conferences/[locale]
export default function ConferencesPage({ params: { locale } }: { params: { locale: string } }) {
    // Sử dụng useTranslations cho các thông báo liên quan đến Auth/Page loading
    const t = useTranslations('ConferencesPageAuth'); // Namespace mới hoặc chung cho auth

    // Sử dụng useAuth để lấy trạng thái đăng nhập và trạng thái khởi tạo
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();

    // Sử dụng useEffect để kiểm tra trạng thái auth sau khi component mount và AuthContext khởi tạo xong
    useEffect(() => {
        // Chỉ thực hiện hành động sau khi quá trình khởi tạo auth hoàn tất
        if (isInitializing) {
            console.log(`[${locale}/dashboard/conferences/page.tsx] AuthContext is initializing...`);
            return; // Đợi cho đến khi isInitializing là false
        }

        // Sau khi khởi tạo xong:
        if (!isLoggedIn) {
            console.log(`[${locale}/dashboard/conferences/page.tsx] User not logged in (after init). Redirecting to login.`);
            // Chuyển hướng đến trang đăng nhập của locale hiện tại
            router.replace(`/${locale}/auth/login`);
        } else {
            console.log(`[${locale}/dashboard/conferences/page.tsx] User is logged in (after init). Rendering Conferences.`);
        }
    // Thêm dependencies array: isLoggedIn, isInitializing, locale, router
    }, [isLoggedIn, isInitializing, locale, router]);

    // Hiển thị spinner Tải TRONG KHI AuthContext đang khởi tạo
    // HOẶC nếu có một tiến trình xác thực đang diễn ra
    if (isInitializing || isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
               {t('AuthStatus_Loading')} {/* Sử dụng key từ translations */}
            </div>
        );
    }

    // Nếu KHÔNG đang khởi tạo VÀ KHÔNG đăng nhập, useEffect đã/sẽ kích hoạt redirect.
    // Render null hoặc một thông báo nhỏ trong khi chờ điều hướng trình duyệt.
    if (!isLoggedIn) {
        // return <div className="flex items-center justify-center w-full min-h-[50vh]">{t('AuthStatus_Redirecting')}</div>;
        return null; // Trả về null để tránh render nội dung trong khi chờ chuyển hướng
    }

    // Nếu KHÔNG đang khởi tạo VÀ ĐÃ đăng nhập, render component Conferences đã tách
    // Truyền locale xuống nếu component con cần nó (useTranslations không cần,
    // nhưng có thể các logic khác cần)
    return <Conferences locale={locale} />;
}