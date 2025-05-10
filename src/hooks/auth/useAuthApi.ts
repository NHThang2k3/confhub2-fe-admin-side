import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Correct import for App Router
import { AuthResponse, UserResponse } from '@/src/models/response/user.response'; // Adjust path as needed
import { appConfig } from '@/src/middleware';

// --- Helper Functions (ngoài component để tránh tạo lại và chạy ở client) ---

/**
 * Đọc và parse thông tin user từ localStorage một cách an toàn.
 * Chỉ chạy ở client-side.
 * @returns {UserResponse | null} User object nếu hợp lệ, null nếu không.
 */
const getInitialUser = (): UserResponse | null => {
  // Chỉ chạy ở client-side nơi có window và localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedUser = localStorage.getItem('user');
    // Chỉ parse nếu user tồn tại và loginStatus là 'true'
    if (storedUser && localStorage.getItem('loginStatus') === 'true') {
      try {
        // TODO: Thêm bước xác thực cấu trúc dữ liệu nếu cần (ví dụ dùng Zod)
        return JSON.parse(storedUser) as UserResponse;
      } catch (e) {
        console.error("[useAuthApi - Init] Error parsing initial user from localStorage. Clearing invalid data.", e);
        // Xóa dữ liệu hỏng để tránh lỗi lặp lại
        localStorage.removeItem('user');
        localStorage.removeItem('loginStatus');
        return null;
      }
    }
  }
  // Trả về null nếu không ở client, không có user, hoặc loginStatus không phải 'true'
  return null;
};

export const login = (user: AuthResponse) => {
  // Lưu thông tin user vào localStorage
  localStorage.setItem('user', JSON.stringify(user.user));
  localStorage.setItem('loginStatus', 'true');
  // Lưu thông tin token vào localStorage
  localStorage.setItem('token', user.token);
  // Lưu thông tin returnUrl vào localStorage nếu cần
  const returnUrl = localStorage.getItem('returnUrl') || '/';
  localStorage.removeItem('returnUrl'); // Xóa sau khi đọc
  return returnUrl;
}

export const getToken = () => {
  return localStorage.getItem('token');
}

/**
 * Lấy trạng thái đăng nhập ban đầu từ localStorage.
 * Chỉ chạy ở client-side.
 * @returns {boolean} True nếu đã đăng nhập, False nếu không.
 */
const getInitialLoginStatus = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    // Chỉ coi là logged in nếu cả user và loginStatus='true' đều có vẻ hợp lệ ban đầu
    // (getInitialUser sẽ trả về null nếu một trong hai không hợp lệ)
    return !!getInitialUser() && localStorage.getItem('loginStatus') === 'true';
  }
  return false;
};


// --- Auth Hook Interface ---

interface AuthApiResult {
  /**
   * Thực hiện đăng nhập bằng email/password.
   * @param {Record<string, string>} credentials Thông tin đăng nhập.
   * @returns {Promise<void>}
   */
  signIn: (credentials: Record<string, string>) => Promise<void>;
  /**
   * Trạng thái loading (cho các thao tác bất đồng bộ như signIn, logout, initial load).
   */
  isLoading: boolean;
  /**
   * Thông báo lỗi nếu có.
   */
  error: string | null;
  /**
   * Thông tin user hiện tại nếu đã đăng nhập.
   */
  user: UserResponse | null;
  /**
   * Chuyển hướng đến trang đăng nhập Google. Lưu lại URL hiện tại để quay về.
   * @returns {Promise<void>}
   */
  googleSignIn: () => Promise<void>;
  /**
   * Thực hiện đăng xuất.
   * @returns {Promise<void>}
   */
  logout: () => Promise<void>;
  /**
   * Trạng thái đăng nhập (true/false).
   */
  isLoggedIn: boolean;
}

// --- useAuthApi Hook Implementation ---

const useAuthApi = (): AuthApiResult => {
  // --- State Initialization ---
  // Khởi tạo state trực tiếp từ localStorage để tránh vấn đề với StrictMode
  const [user, setUser] = useState<UserResponse | null>(getInitialUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getInitialLoginStatus);
  // Ban đầu coi là loading cho đến khi kiểm tra xong localStorage/cookie
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Hooks ---
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook để lấy query params

  // --- Core Logic Functions ---

  const logout = useCallback(async (): Promise<void> => {
    console.log("[useAuthApi - logout] Initiating logout...");
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API backend để hủy session/token phía server (nếu có)
      // await fetch('/api/auth/logout', { method: 'POST' }); // Ví dụ

      // 1. Xóa localStorage TRƯỚC khi cập nhật state
      localStorage.removeItem('user');
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('token');
      localStorage.removeItem('returnUrl'); // Xóa luôn returnUrl nếu có

      // 2. Xóa Cookie
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 3. Cập nhật State
      setUser(null);
      setIsLoggedIn(false);

      console.log("[useAuthApi - logout] Logout successful. Redirecting to home.");
      router.push("/"); // Chuyển về trang chủ sau khi logout
    } catch (error) {
      console.error("[useAuthApi - logout] Logout failed:", error);
      setError("Logout failed. Please try again.");
      // Vẫn nên xóa storage/cookie và cập nhật state ở client ngay cả khi API server lỗi
      localStorage.removeItem('user');
      localStorage.removeItem('loginStatus');
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // Kết thúc loading cho hành động logout
  }
  }, [router]); // router là dependency của logout

  // --- Effects ---

  /**
   * Effect chạy một lần sau khi component mount ở client-side.
   * Gọi syncStateFromStorage để xử lý cookie fallback và kết thúc trạng thái loading ban đầu.
   */
  useEffect(() => {
    console.log("[useAuthApi - Initial Effect] Component mounted. Running initial sync/load.");

    const checkAuthStatus = async () => {
      const token = getToken(); // Lấy token từ localStorage

      if (token) {
        console.log("[useAuthApi - Initial Effect] Token found. Verifying with /me endpoint...");
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log("[useAuthApi - /me Check] Response status:", response.status);

          if (response.ok) {
            const userData = await response.json() as UserResponse;
            console.log("[useAuthApi - /me Check] Verification successful. User:", userData.email);
            // Xác nhận đăng nhập thành công
            setUser(userData);
            setIsLoggedIn(true);
            // Đảm bảo localStorage cũng nhất quán (phòng trường hợp user data thay đổi)
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('loginStatus', 'true');
            // Token vẫn giữ nguyên vì nó hợp lệ
          } else if (response.status === 401 || response.status === 403) {
            // Lỗi Unauthorized hoặc Forbidden -> Token không hợp lệ/hết hạn
            console.warn("[useAuthApi - /me Check] Verification failed (401/403 Unauthorized). Logging out.");
            logout(); // Logout nhưng không redirect ngay lập tức
          } else {
            // Lỗi khác (server error, network error trong fetch đã bị catch)
            console.error(`[useAuthApi - /me Check] Verification failed with status: ${response.status}. Logging out.`);
            setError(`Failed to verify session (Status: ${response.status}).`); // Set lỗi
            logout(); // Logout khi không thể xác thực
          }
        } catch (err) {
          // Lỗi mạng hoặc lỗi trong quá trình fetch
          console.error("[useAuthApi - /me Check] Network or fetch error during verification:", err);
          setError("Network error during session verification."); // Set lỗi
          logout(); // Logout khi có lỗi mạng
        } finally {
          // Bất kể kết quả của try-catch, quá trình kiểm tra ban đầu đã xong.
          // logout() tự quản lý isLoading của nó.
          // Ta chỉ cần đảm bảo isLoading của initial load được set false.
          console.log("[useAuthApi - checkAuthStatus] Initial auth check process finished.");
          setIsLoading(false); // Set isLoading false Ở ĐÂY, một cách nhất quán.
        }
      } else {
        // Không có token -> Chắc chắn chưa đăng nhập
        console.log("[useAuthApi - Initial Effect] No token found. User is logged out.");
        // Đảm bảo trạng thái là logged out và kết thúc loading
        if (isLoggedIn || user) { // Nếu state hiện tại lại đang là logged in -> Sai -> Logout
          logout();
        } else {
          setIsLoading(false); // Nếu state đã đúng là logged out thì chỉ cần tắt loading
        }
      }
    };

    // --- Listener tùy chọn cho đồng bộ hóa giữa các tab ---
    // const handleStorageChange = (event: StorageEvent) => {
    //   if (event.key === 'loginStatus' || event.key === 'user') {
    //     console.log('[useAuthApi - Storage Listener] Storage changed in another tab. Re-syncing...');
    //     syncStateFromStorage();
    //   }
    // };
    // window.addEventListener('storage', handleStorageChange);

    checkAuthStatus();
    return () => {
      console.log("[useAuthApi - Initial Effect] Component unmounting.");
      // window.removeEventListener('storage', handleStorageChange);
    };
    // Chạy một lần sau mount ban đầu
  }, [logout]); // Chỉ chạy lại nếu syncStateFromStorage thay đổi (thường là không)

  /**
   * Effect đồng bộ state `user` và `isLoggedIn` vào localStorage BẤT KỲ KHI NÀO chúng thay đổi.
   * Điều này giữ cho localStorage luôn cập nhật với trạng thái React.
   */
  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log("[useAuthApi - Sync Effect] State changed. Syncing TO localStorage...", { user: !!user, isLoggedIn });
      if (isLoggedIn && user) {
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('loginStatus', 'true');
        } catch (e) {
          console.error("[useAuthApi - Sync Effect] Error stringifying user for localStorage.", e);
          // Xử lý lỗi nếu user data không thể stringify (hiếm khi xảy ra)
        }
      } else {
        // Nếu không loggedIn hoặc không có user -> xóa khỏi localStorage
        const storedStatus = localStorage.getItem('loginStatus');
        if (storedStatus === 'true') { // Chỉ xóa nếu trước đó nó đang là true
          console.log("[useAuthApi - Sync Effect] State changed to logged out. Clearing localStorage...");
          localStorage.removeItem('user');
          localStorage.removeItem('loginStatus');
          localStorage.removeItem('token');
        }
      }
    }
  }, [user, isLoggedIn]); // Chạy mỗi khi user hoặc isLoggedIn thay đổi

  // --- API Call Functions ---

  const signIn = async (credentials: Record<string, string>): Promise<void> => {
    console.log("[useAuthApi - signIn] Attempting sign-in...");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, mode: "user" }),
      });

      const data = await response.json();
      console.log("[useAuthApi - signIn] Server response:", { status: response.status, ok: response.ok, data });

      if (response.ok && data.user) {
        const loggedInUser = data.user as UserResponse;
        console.log("[useAuthApi - signIn] Sign-in successful for user:", loggedInUser.email);

        // 1. Cập nhật localStorage TRƯỚC khi cập nhật state
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('loginStatus', 'true');
        localStorage.setItem('token', data.token); // Lưu token nếu cần
        // 2. Cập nhật Cookie (vẫn hữu ích cho một số trường hợp và server-side)
        document.cookie = `loginStatus=true; path=/; SameSite=Lax; max-age=2592000`; // max-age=30 days
        // Lưu ý: Không nên lưu toàn bộ user object vào cookie nếu nó quá lớn hoặc chứa thông tin nhạy cảm không cần thiết ở cookie.
        // Có thể chỉ lưu ID hoặc token nếu cần. Ở đây tạm giữ nguyên để giống code gốc.
        try {
          document.cookie = `user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; SameSite=Lax; max-age=2592000`;
        } catch (e) {
          console.error("[useAuthApi - signIn] Error encoding user for cookie.", e);
        }


        // 3. Cập nhật State (sẽ kích hoạt effect [user, isLoggedIn] nhưng không sao)
        setUser(loggedInUser);
        setIsLoggedIn(true);
        setIsLoading(false); // Kết thúc loading

        // 4. Xử lý chuyển hướng
        const returnUrl = localStorage.getItem('returnUrl') || '/';
        localStorage.removeItem('returnUrl'); // Xóa ngay sau khi đọc
        console.log("[useAuthApi - signIn] Redirecting to:", returnUrl);
        router.push(returnUrl);

      } else {
        console.error("[useAuthApi - signIn] Sign-in failed:", data.message || 'Unknown error');
        setError(data.message || 'Incorrect email or password.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("[useAuthApi - signIn] Network or other error during sign-in:", err);
      setError('Login failed. Please check your connection or credentials.');
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    // Lấy URL đầy đủ bao gồm cả query params
    const fullUrl = `${window.location.pathname}${window.location.search}`;

    console.log("[useAuthApi - googleSignIn] Storing return URL:", fullUrl);
    localStorage.setItem('returnUrl', fullUrl);
    console.log("[useAuthApi - googleSignIn] Redirecting to Google OAuth endpoint...");
    // Chuyển hướng đến API route xử lý Google OAuth phía backend/Next.js
    window.history.pushState(null, '', '/api/v1/auth/google');

  };



  // --- Return Value ---
  return {
    signIn,
    isLoading,
    error,
    user,
    googleSignIn,
    logout,
    isLoggedIn,
  };
};

export default useAuthApi;