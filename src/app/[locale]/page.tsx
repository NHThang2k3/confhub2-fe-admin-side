// src/app/[locale]/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Thay đổi: Import useAuth từ AuthContext
import { useAuth } from '@/src/contexts/AuthContext';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // Thay đổi: Sử dụng useAuth và lấy thêm isInitializing
  // isLoading từ useAuth thường dành cho các quá trình active (signIn, logout).
  // isInitializing cho biết AuthProvider đã hoàn tất kiểm tra trạng thái ban đầu hay chưa.
  const { isLoggedIn, isInitializing, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ thực hiện logic chuyển hướng sau khi quá trình khởi tạo auth hoàn tất
    if (isInitializing) {
      console.log(`[${locale}/page.tsx] AuthContext is initializing...`);
      return; // Đợi cho đến khi isInitializing là false
    }

    // isLoading ở đây để đảm bảo nếu có một hành động auth (vd: logout) đang diễn ra
    // từ nơi khác và context đang cập nhật, chúng ta đợi nó xong.
    if (isLoading) {
      console.log(`[${locale}/page.tsx] Auth operation in progress (isLoading is true)...`);
      return; // Đợi cho đến khi isLoading là false
    }

    // Sau khi khởi tạo xong và không có hoạt động auth nào đang diễn ra:
    console.log(`[${locale}/page.tsx] Auth check finished. LoggedIn: ${isLoggedIn}. Redirecting...`);
    if (isLoggedIn) {
      // Nếu đã đăng nhập, chuyển hướng đến trang dashboard
      router.replace(`/${locale}/dashboard`);
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang login
      router.replace(`/${locale}/auth/login`);
    }
  // Thêm isInitializing và isLoading vào dependencies array
  }, [isLoggedIn, isInitializing, isLoading, locale, router]);

  // Hiển thị spinner Tải TRONG KHI AuthContext đang khởi tạo HOẶC có tiến trình xác thực đang diễn ra
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Bạn có thể thêm một component Spinner đẹp hơn ở đây */}
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // Khi không còn loading nữa (isInitializing và isLoading đều false),
  // useEffect đã/sẽ xử lý việc chuyển hướng.
  // Trả về null để không hiển thị gì trong khi chờ redirect.
  return null;
}