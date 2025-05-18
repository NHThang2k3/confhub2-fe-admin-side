// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Sử dụng từ 'next/navigation' cho App Router
import { AuthResponse, UserResponse } from '@/src/models/response/user.response';
import { appConfig } from '@/src/middleware';

// --- Helper: LocalStorage Management ---
const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  LOGIN_STATUS: 'loginStatus',
  TOKEN: 'token',
  RETURN_URL: 'returnUrl',
};

const _getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
};

const _persistUserToLocalStorage = (userData: UserResponse | null): void => {
  if (typeof window === 'undefined') return;
  if (userData) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }
};

const _persistAuthDataToLocalStorage = (authData: AuthResponse): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(authData.user));
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, authData.token);
  localStorage.setItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS, 'true');
};

const _clearAuthDataFromLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL);
};

// --- Auth Context Interface ---
interface AuthContextType {
  user: UserResponse | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  signIn: (credentials: Record<string, string>) => Promise<void>;
  googleSignIn: () => Promise<void>;
  processTokenFromOAuth: (token: string, customRedirectPath?: string) => Promise<void>;
  logout: (options?: { callApi?: boolean; preventRedirect?: boolean }) => Promise<void>;
  getToken: () => string | null;
  updateAuthUser: (newUserData: UserResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateAuthUser = useCallback((newUserData: UserResponse) => {
    console.log("[AuthProvider] Updating auth user state with new data:", newUserData);
    setUserState(newUserData);
    _persistUserToLocalStorage(newUserData);
  }, []);

  const _handleAuthSuccess = useCallback((authData: AuthResponse, customRedirectPath?: string) => {
    _persistAuthDataToLocalStorage(authData);
    setUserState(authData.user);
    setIsLoggedIn(true);
    setError(null);


    const returnUrl = customRedirectPath || localStorage.getItem(LOCAL_STORAGE_KEYS.RETURN_URL) || '/';
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL);
    console.log("[AuthProvider] Auth success. Redirecting to:", returnUrl);
    router.push(returnUrl);
  }, [router]);

  const _performLogout = useCallback(async (options?: { preventRedirect?: boolean; callApi?: boolean }) => {
    console.log("[AuthProvider] Performing logout. Options:", options);
    const previousToken = _getStoredToken(); // Lấy token cũ TRƯỚC KHI clear localStorage

    _clearAuthDataFromLocalStorage();
    setUserState(null);
    setIsLoggedIn(false);
    setError(null);

    if (options?.callApi) {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        // Gửi token cũ (nếu có) để server có thể hủy session/token phía server
        if (previousToken) {
            headers['Authorization'] = `Bearer ${previousToken}`;
        }
        // Đảm bảo API route này tồn tại và xử lý đúng cách
        // Sử dụng POST cho logout là một good practice
        await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/logout`, { // Sử dụng URL đầy đủ nếu API ở domain khác
            method: 'POST',
            headers: headers,
        });
        console.log("[AuthProvider] Called server logout API successfully.");
      } catch (e) {
        console.warn("[AuthProvider] Failed to call server logout API.", e);
      }
    }

    if (!options?.preventRedirect) {
      console.log("[AuthProvider] Redirecting to / after logout.");
      router.push('/'); // Hoặc một trang đích logout cụ thể
    } else {
      console.log("[AuthProvider] Logout performed, redirect prevented by options.");
    }
  }, [router]); // Dependencies: router

  useEffect(() => {
    let isMounted = true;
    console.log("[AuthProvider] Initializing authentication state...");

    const initializeAuth = async () => {
      const token = _getStoredToken();
      const storedLoginStatus = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS) === 'true';

      if (token && storedLoginStatus) {
        console.log("[AuthProvider] Token found. Verifying with /me endpoint...");
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          });

          if (!isMounted) return;

          if (response.ok) {
            const userData = await response.json() as UserResponse;
            console.log("[AuthProvider] /me verification successful. User:", userData.email);
            _persistAuthDataToLocalStorage({ user: userData, token });
            setUserState(userData);
            setIsLoggedIn(true);
            // Sau khi xác thực thành công, xóa các lỗi UI cũ (nếu có từ lần load trước)
          } else if (response.status === 401 || response.status === 403) {
            console.warn(`[AuthProvider] /me verification failed (${response.status}). Token invalid or expired. Logging out.`);
            await _performLogout({ preventRedirect: true, callApi: false }); // callApi: false vì server đã từ chối token
          } else {
            console.error(`[AuthProvider] /me verification failed with status: ${response.status}. Logging out.`);
            if (isMounted) setError(`Session check failed (Status: ${response.status})`);
            await _performLogout({ preventRedirect: true, callApi: false });
          }
        } catch (err) {
          if (!isMounted) return;
          console.error("[AuthProvider] Network or fetch error during /me verification:", err);
          if (isMounted) setError("Network error during session verification.");
          // Trong trường hợp lỗi mạng, không chắc token có hợp lệ không, có thể không cần gọi API logout
          await _performLogout({ preventRedirect: true, callApi: false });
        }
      } else {
        console.log("[AuthProvider] No valid token or login status. Ensuring logged out state.");
        // Nếu client có state isLoggedIn=true hoặc user tồn tại mà không có token/loginStatus,
        // đó là trạng thái không nhất quán, cần logout client-side.
        if (isLoggedIn || user) {
            await _performLogout({ preventRedirect: true, callApi: false });
        }
      }
      if (isMounted) setIsInitializing(false);
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [_performLogout]); // Chỉ phụ thuộc vào _performLogout


  const signIn = async (credentials: Record<string, string>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, mode: "admin" }),
      });
      const data = await response.json();
      if (response.ok && data.user && data.token) {
        _handleAuthSuccess(data as AuthResponse);
      } else {
        setError(data.message || 'Incorrect email or password.');
      }
    } catch (err: any) {
      setError('Login failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem(LOCAL_STORAGE_KEYS.RETURN_URL, currentPath);
    window.location.href = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/google`;
  };

  const processTokenFromOAuth = useCallback(async (token: string, customRedirectPath?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const userData = await response.json();
      if (response.ok && userData) {
        _handleAuthSuccess({ user: userData as UserResponse, token }, customRedirectPath);
      } else {
        setError(userData.message || 'Failed to complete login after OAuth.');
        await _performLogout({ preventRedirect: true, callApi: false }); // callApi: false vì lỗi có thể do token OAuth
      }
    } catch (err: any) {
      setError('Network error while completing login.');
      await _performLogout({ preventRedirect: true, callApi: false });
    } finally {
      setIsLoading(false);
    }
  }, [_handleAuthSuccess, _performLogout]);

  const logout = async (options?: { callApi?: boolean; preventRedirect?: boolean }): Promise<void> => {
    setIsLoading(true);
    await _performLogout({
        callApi: options?.callApi ?? true, // Mặc định gọi API logout
        preventRedirect: options?.preventRedirect ?? false
    });
    setIsLoading(false);
  };

  const getToken = useCallback((): string | null => _getStoredToken(), []);

  const contextValue = {
    user,
    isLoggedIn,
    isLoading,
    isInitializing,
    error,
    signIn,
    googleSignIn,
    processTokenFromOAuth,
    logout,
    getToken,
    updateAuthUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};