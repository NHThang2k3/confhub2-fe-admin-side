// src/app/[locale]/auth/callback/page.tsx
'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

// Wrap the component that uses useSearchParams in Suspense
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isInitializing là trạng thái khởi tạo của AuthProvider
  // isLoading (đổi tên thành isProcessingLogin) là trạng thái khi processTokenFromOAuth đang chạy
  const {
    processTokenFromOAuth,
    isLoading: isProcessingLogin, // Đổi tên để rõ ràng hơn, đây là loading của action
    error: processingError,
    isLoggedIn,
    isInitializing: isAuthInitializing // Trạng thái khởi tạo chung của AuthProvider
  } = useAuth();

  useEffect(() => {
    // Nếu AuthProvider chưa khởi tạo xong, chưa làm gì cả
    if (isAuthInitializing) {
      console.log('[CallbackPage] Auth is still initializing. Waiting...');
      return;
    }

    // Nếu đã đăng nhập (ví dụ: người dùng quay lại trang này sau khi đã login), chuyển hướng đi
    if (isLoggedIn) {
      const returnUrl = localStorage.getItem('returnUrl') || '/';
      localStorage.removeItem('returnUrl'); // Xóa sau khi đọc
      console.log('[CallbackPage] Already logged in. Redirecting to:', returnUrl);
      router.push(returnUrl);
      return;
    }

    // Nếu AuthProvider đã khởi tạo xong và người dùng chưa đăng nhập
    const accessToken = searchParams.get('accessToken');
    const errorParam = searchParams.get('error'); // Lỗi từ backend (nếu có)

    if (errorParam) {
      console.error('[CallbackPage] OAuth Error from server:', errorParam);
      // Chuyển hướng về trang login với thông báo lỗi
      // Không cần thiết phải set lỗi trong useAuth ở đây, vì trang login sẽ hiển thị lỗi từ query param
      router.push(`/auth/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (accessToken) {
      console.log('[CallbackPage] Access Token found. Processing...');
      // processTokenFromOAuth sẽ xử lý việc xác thực token, lấy user info,
      // cập nhật state trong AuthProvider và tự động chuyển hướng khi thành công.
      processTokenFromOAuth(accessToken, localStorage.getItem('returnUrl') || '/');
    } else if (!isProcessingLogin && !isLoggedIn) {
      // Chỉ chuyển hướng nếu không có accessToken, không đang xử lý, và chưa đăng nhập
      console.warn('[CallbackPage] Missing access token and not currently processing. Redirecting to login.');
      router.push('/auth/login?error=missing_oauth_tokens_on_callback');
    }
  }, [
    searchParams,
    processTokenFromOAuth,
    router,
    isLoggedIn,
    isProcessingLogin,
    isAuthInitializing // Thêm isAuthInitializing vào dependencies
  ]);

  // Hiển thị trạng thái tải trong khi AuthProvider đang khởi tạo
  if (isAuthInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Initializing authentication...</div>
      </div>
    );
  }

  // Hiển thị trạng thái tải trong khi processTokenFromOAuth đang chạy
  if (isProcessingLogin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Completing login, please wait...</div>
      </div>
    );
  }

  // Nếu có lỗi trong quá trình xử lý token (ví dụ: token không hợp lệ)
  if (processingError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <p className="mb-4 text-red-600">Login failed: {processingError}</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try logging in again
        </button>
      </div>
    );
  }

  // Nếu không loading, không lỗi, nhưng chưa đăng nhập (ví dụ: useEffect chưa chạy xong hoặc có edge case)
  // Hoặc nếu accessToken không có trên URL và không có lỗi từ server
  if (!isLoggedIn && !searchParams.get('accessToken') && !searchParams.get('error')) {
     // Đây là trường hợp có thể người dùng tự gõ URL /auth/callback mà không có params
    return (
        <div className="flex h-screen items-center justify-center">
            <div>Invalid callback URL or missing parameters. Redirecting to login...</div>
        </div>
    );
  }


  // Nếu đã đăng nhập, useEffect sẽ chuyển hướng. Đây là fallback.
  // Hoặc nếu đang chờ useEffect chạy lần đầu sau khi isAuthInitializing thành false.
  return (
    <div className="flex h-screen items-center justify-center">
      <div>Processing authentication...</div>
    </div>
  );
}

const OAuthCallbackPage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div>Loading callback page...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
};

export default OAuthCallbackPage;