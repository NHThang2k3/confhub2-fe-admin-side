// app/moderation/page.tsx
'use client'; // Đây phải là một Client Component vì sử dụng hook

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Sử dụng hook từ next/navigation
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import hook useAuthApi
import Moderation from './Moderation';

const ModerationPage = () => {
    // Sử dụng hook để lấy trạng thái đăng nhập và loading
    const { isLoggedIn, isLoading } = useAuthApi();
    const router = useRouter();
    const pathname = usePathname(); // Lấy đường dẫn hiện tại

    useEffect(() => {
        // Chờ cho quá trình kiểm tra xác thực ban đầu hoàn tất
        if (!isLoading) {
            // Nếu không đăng nhập sau khi kiểm tra xong
            if (!isLoggedIn) {
                console.log("[ModerationPage] User is not logged in. Redirecting to login.");
                // Lưu lại đường dẫn hiện tại để chuyển hướng lại sau khi login thành công
                // Đảm bảo chỉ chạy ở client-side
                if (typeof window !== 'undefined') {
                    localStorage.setItem('returnUrl', pathname);
                }
                // Chuyển hướng đến trang đăng nhập của bạn (ví dụ: /login)
                // Thay '/login' bằng đường dẫn thực tế của trang đăng nhập trong ứng dụng của bạn
                router.push('/login');
            } else {
                 console.log("[ModerationPage] User is logged in.");
                 // Người dùng đã đăng nhập, không làm gì cả, component Moderation sẽ được render
            }
        }
    }, [isLoading, isLoggedIn, router, pathname]); // Dependencies cho useEffect

    // Render UI dựa trên trạng thái
    // Nếu đang kiểm tra xác thực, hiển thị loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Checking authentication status...</p>
                {/* Bạn có thể thêm spinner hoặc hiệu ứng loading khác ở đây */}
            </div>
        );
    }

    // Nếu không loading và không đăng nhập (state này chỉ thoáng qua trước khi redirect)
    if (!isLoggedIn) {
        // Hiển thị thông báo hoặc trả về null để tránh flicker
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                <p>You are not authorized to view this page. Redirecting to login...</p>
            </div>
        );
    }

    // Nếu không loading và đã đăng nhập, hiển thị component Moderation
    return <Moderation />;
};

export default ModerationPage;