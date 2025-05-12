// src/app/[locale]/page.tsx
'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
        router.replace(`/${locale}/dashboard`);
      } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        router.replace(`/${locale}/auth/login`);
      }
    } else {
       console.log(`[${locale}/page.tsx] Auth check in progress. isLoading: ${isLoading}`);
    }
  }, [isLoggedIn, isLoading, locale, router]); // Dependencies cho useEffect

  return (
    isLoading ? (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading authentication status...</p> {/* Hoặc một spinner */}
      </div>
    ) : null
  );
}