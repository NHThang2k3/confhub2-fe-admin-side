// src/app/[locale]/dashboard/crawl/page.tsx
'use client';

import React, { useEffect } from 'react'; // Import React và useEffect
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Crawl from './Crawl';
import { useTranslations } from 'next-intl';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function CrawlPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('CrawlPage'); // Cần namespace 'CrawlPage' trong file messages/[locale].json

    // Sử dụng useAuth để lấy trạng thái đăng nhập và trạng thái khởi tạo
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();

    // Sử dụng useEffect để kiểm tra trạng thái auth sau khi component mount và AuthContext khởi tạo xong
    useEffect(() => {
        // Chỉ thực hiện hành động sau khi quá trình khởi tạo auth hoàn tất
        if (isInitializing) {
            console.log(`[${locale}/dashboard/crawl/page.tsx] AuthContext is initializing...`);
            return; // Đợi cho đến khi isInitializing là false
        }

        // Sau khi khởi tạo xong:
        if (!isLoggedIn) {
            console.log(`[${locale}/dashboard/crawl/page.tsx] User not logged in (after init). Redirecting to login.`);
            // Chuyển hướng đến trang đăng nhập của locale hiện tại
            router.replace(`/${locale}/auth/login`);
        } else {
            console.log(`[${locale}/dashboard/crawl/page.tsx] User is logged in (after init). Rendering Analysis.`);
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

    // Nếu KHÔNG đang khởi tạo VÀ ĐÃ đăng nhập, render Analysis component
    return <Crawl />; // Analysis component sẽ tự xử lý translations của nó
}