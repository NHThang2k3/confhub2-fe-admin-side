// src/app/[locale]/dashboard/moderation/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Thay đổi: Import useAuth từ AuthContext
import { useAuth } from '@/src/contexts/AuthContext';
import Moderation from './Moderation';
import { useTranslations } from 'next-intl';

// Component Page for route /dashboard/moderation/[locale]
export default function ModerationPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('ModerationPage');

    // Thay đổi: Sử dụng useAuth và lấy thêm isInitializing
    // isLoading từ useAuth thường dành cho các quá trình active (signIn, logout).
    // isInitializing cho biết AuthProvider đã hoàn tất kiểm tra trạng thái ban đầu hay chưa.
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Chỉ thực hiện hành động sau khi quá trình khởi tạo auth hoàn tất
        if (isInitializing) {
            console.log(`[${locale}/dashboard/moderation/page.tsx] AuthContext is initializing...`);
            return; // Đợi cho đến khi isInitializing là false
        }

        // Sau khi khởi tạo xong:
        if (!isLoggedIn) {
            console.log(`[${locale}/dashboard/moderation/page.tsx] User not logged in (after init). Redirecting to login.`);
            router.replace(`/${locale}/auth/login`);
        } else {
            console.log(`[${locale}/dashboard/moderation/page.tsx] User is logged in (after init). Rendering Moderation.`);
        }
    // Thêm isInitializing vào dependencies array
    }, [isLoggedIn, isInitializing, locale, router]);

    // Hiển thị spinner Tải TRONG KHI AuthContext đang khởi tạo
    // HOẶC nếu có một tiến trình xác thực đang diễn ra (ví dụ: logout từ trang này)
    if (isInitializing || isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
               {t('AuthStatus_Loading')}
            </div>
        );
    }

    // Nếu KHÔNG đang khởi tạo VÀ KHÔNG đăng nhập, useEffect đã/sẽ kích hoạt redirect.
    // Render null hoặc một thông báo nhỏ trong khi chờ điều hướng trình duyệt.
    if (!isLoggedIn) {
        // return <div className="flex items-center justify-center w-full min-h-[50vh]">{t('AuthStatus_Redirecting')}</div>;
        return null;
    }

    // Nếu KHÔNG đang khởi tạo VÀ ĐÃ đăng nhập, render Moderation component
    return <Moderation />; // Moderation component sẽ tự xử lý translations của nó
}