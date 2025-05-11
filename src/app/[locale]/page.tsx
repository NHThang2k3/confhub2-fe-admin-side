// src/app/[locale]/page.tsx
'use client'; // Hook requires client component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Đảm bảo đường dẫn import useAuthApi là chính xác so với cấu trúc dự án của bạn
import useAuthApi from '@/src/hooks/auth/useAuthApi';

// Thay đổi signature tại đây:
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // Lấy trạng thái đăng nhập và trạng thái loading từ hook
  const { isLoggedIn, isLoading } = useAuthApi();
  const router = useRouter();

  useEffect(() => {
    // Chỉ thực hiện logic chuyển hướng khi isLoading hoàn tất
    if (!isLoading) {
      console.log(`[${locale}/page.tsx] Auth check finished. LoggedIn: ${isLoggedIn}. Redirecting...`);
      if (isLoggedIn) {
        // Nếu đã đăng nhập, chuyển hướng đến trang dashboard
        // Bây giờ locale sẽ có giá trị đúng (ví dụ: 'en', 'vi')
        router.replace(`/${locale}/dashboard`);
      } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        // Bây giờ locale sẽ có giá trị đúng
        router.replace(`/${locale}/auth/login`);
      }
    } else {
       console.log(`[${locale}/page.tsx] Auth check in progress. isLoading: ${isLoading}`);
    }
  }, [isLoggedIn, isLoading, locale, router]); // Dependencies cho useEffect

  // Trong lúc loading, hiển thị thông báo hoặc spinner
  // Khi loading xong, useEffect sẽ chuyển hướng và component này sẽ không hiển thị gì thêm
  return (
    isLoading ? (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading authentication status...</p> {/* Hoặc một spinner */}
      </div>
    ) : null
  );
}