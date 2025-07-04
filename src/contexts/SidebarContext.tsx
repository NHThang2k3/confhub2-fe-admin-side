'use client';

import React, { 
  createContext, 
  useState, 
  useContext, 
  ReactNode, 
  FC, 
  useEffect,
  useRef // Thêm useRef
} from 'react';

// useMediaQuery giữ nguyên
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [matches, query]);
  return matches;
};

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STATE_KEY = 'app-sidebar-state';

export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // State khởi tạo vẫn là false để đảm bảo không có lỗi hydration.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // FIX: Sử dụng useRef để theo dõi lần render đầu tiên.
  // Giá trị của ref sẽ tồn tại qua các lần render mà không kích hoạt render lại.
  const isInitialMount = useRef(true);

  // useEffect để KHÔI PHỤC state từ localStorage.
  // Nó chỉ chạy một lần sau khi component mount.
  useEffect(() => {
    let initialValue;
    try {
      const savedState = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      if (savedState !== null) {
        initialValue = JSON.parse(savedState);
      } else {
        initialValue = isDesktop;
      }
    } catch (error) {
      console.error("Error reading sidebar state from localStorage", error);
      initialValue = isDesktop;
    }
    setIsSidebarOpen(initialValue);
  }, [isDesktop]); // Giữ isDesktop để xử lý trường hợp người dùng vào trang lần đầu tiên

  // useEffect để LƯU state vào localStorage.
  useEffect(() => {
    // FIX: Kiểm tra ref. Nếu đây là lần mount đầu tiên, chúng ta bỏ qua việc lưu.
    if (isInitialMount.current) {
      // Đánh dấu là đã qua lần mount đầu tiên cho các lần chạy sau.
      isInitialMount.current = false;
    } else {
      // Từ lần render thứ hai trở đi, chúng ta mới bắt đầu lưu state.
      try {
        window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarOpen));
      } catch (error) {
        console.error("Error saving sidebar state to localStorage", error);
      }
    }
  }, [isSidebarOpen]); // Vẫn phụ thuộc vào isSidebarOpen

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const value = { isSidebarOpen, toggleSidebar };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook useSidebar giữ nguyên
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};