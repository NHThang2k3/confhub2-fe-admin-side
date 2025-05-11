// src/app/[locale]/dashboard/moderation/page.tsx
'use client'; // <-- Cần đánh dấu là client component vì sử dụng hooks

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import hook xác thực của bạn
import Moderation from './Moderation';

// Component Page cho route /dashboard/moderation/[locale]
export default function ModerationPage({ params: { locale } }: { params: { locale: string } }) {
    // Sử dụng hook xác thực
    const { isLoggedIn, isLoading } = useAuthApi();
    const router = useRouter();

    // Effect để kiểm tra trạng thái xác thực và chuyển hướng
    useEffect(() => {
        // Chỉ thực hiện kiểm tra sau khi hook useAuthApi hoàn tất quá trình tải trạng thái ban đầu
        if (!isLoading) {
            // Nếu người dùng CHƯA đăng nhập, chuyển hướng đến trang login
            if (!isLoggedIn) {
                console.log(`[${locale}/dashboard/moderation/page.tsx] User not logged in. Redirecting to login.`);
                // Sử dụng router.replace để ngăn người dùng back lại trang này
                router.replace(`/${locale}/auth/login`);
            } else {
                console.log(`[${locale}/dashboard/moderation/page.tsx] User is logged in. Rendering Moderation.`);
                // Nếu đã đăng nhập, không làm gì cả, component sẽ render nội dung bên dưới
            }
        } else {
             console.log(`[${locale}/dashboard/moderation/page.tsx] Checking auth status...`);
        }
    }, [isLoggedIn, isLoading, locale, router]); // Dependencies: chạy lại effect khi các giá trị này thay đổi


    // Ẩn nội dung hoặc hiển thị loading spinner trong lúc chờ kiểm tra xác thực
    // hoặc nếu người dùng chưa đăng nhập (useEffect sẽ xử lý chuyển hướng)
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
               Loading authentication status...
            </div>
        );
    }

    // Nếu không loading VÀ chưa đăng nhập, useEffect đã kích hoạt redirect rồi.
    // Render null hoặc một tin nhắn nhỏ trong khi chờ trình duyệt chuyển trang.
    if (!isLoggedIn) {
        return null; // Hoặc <div className="flex items-center justify-center w-full min-h-[50vh]">Redirecting to login...</div>;
    }

    // Nếu không loading VÀ đã đăng nhập, render component Moderation
    // Component Moderation không cần nhận locale trừ khi có logic i18n phức tạp bên trong nó
    // (ví dụ: tự load messages file, điều này thường được làm ở layout/root)
    return <Moderation />;
}