// src/hooks/home/usePopularConferences.ts (Đã cập nhật)
import { useState, useEffect, useRef, useCallback } from 'react';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';
import { getListConferenceFromDB, getListConferenceFromJSON } from '../../app/api/conference/getListConferences';

const CARD_WIDTH_MOBILE = 288; // w-72
const CARD_WIDTH_DESKTOP = 320; // w-80
const GAP = 16; // space-x-4
const DESKTOP_BREAKPOINT = 768; // sm breakpoint
const AUTO_SCROLL_INTERVAL = 5000; // 5 giây
const MANUAL_SCROLL_PAUSE_DURATION = 5000; // 10 giây chờ sau khi bấm nút

const usePopularConferences = () => {
  const [listConferences, setListConferences] = useState<ConferenceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer để bật lại auto-scroll
  const [isHovering, setIsHovering] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Fetch dữ liệu (giữ nguyên)
  useEffect(() => {
    const loadConferences = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListConferenceFromDB();
        console.log(data)
        const conferences = data.payload || [];
        setListConferences(conferences);
        if (conferences.length > 1 && scrollerRef.current) {
             setTimeout(() => updateScrollEdges(), 50);
        } else {
            setIsAtEnd(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load popular conferences.');
        console.error(err);
         setIsAtEnd(true);
      } finally {
        setLoading(false);
      }
    };
    loadConferences();
  }, []);

  // Hàm cập nhật trạng thái isAtStart, isAtEnd (giữ nguyên)
  const updateScrollEdges = useCallback(() => {
    if (!scrollerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
    setIsAtStart(scrollLeft <= 2);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  }, []);

  // Effect lắng nghe sự kiện scroll (giữ nguyên)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || loading) return;
    updateScrollEdges();
    scroller.addEventListener('scroll', updateScrollEdges, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', updateScrollEdges);
    };
  }, [loading, updateScrollEdges]);

  // --- Logic Auto Scroll ---
  // Hàm dừng auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
      // console.log("Auto-scroll stopped"); // Debug
    }
    // Cũng xóa timer chờ bật lại nếu đang chạy
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
      // console.log("Inactivity timer cleared"); // Debug
    }
  }, []);

  // Hàm bắt đầu hoặc lên lịch bắt đầu auto-scroll
  const scheduleOrStartAutoScroll = useCallback(() => {
    stopAutoScroll(); // Dừng mọi thứ đang chạy trước

    // Chỉ bắt đầu nếu thỏa mãn điều kiện
    if (!isHovering && !loading && !error && listConferences.length > 1 && !isAtEnd) {
       // console.log("Scheduling auto-scroll start..."); // Debug
      autoScrollIntervalRef.current = setInterval(() => {
        // console.log("Auto-scrolling..."); // Debug
        // Nếu có scroll về đầu khi end list
        // if (scrollerRef.current) {
        //   const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
        //   if (scrollLeft + clientWidth >= scrollWidth - 2) {
        //     scrollerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        // } 
        
        // else {
        //     // Tính toán scrollAmount ngay bên trong để không phụ thuộc vào hàm scroll ngoài
        //     const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
        //     const scrollAmount = (isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP) + GAP;
        //     scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        // }
        // Khi chặn scroll về đầu khi end list
        if (isAtEnd || !scrollerRef.current) {
            // console.log("Auto-scroll stopping because isAtEnd is true or ref is null."); // Debug
            stopAutoScroll(); // Dừng interval nếu đã đến cuối
            return;
        }
        else
        {
            // Logic cuộn sang phải (giữ nguyên)
            const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
            const scrollAmount = (isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP) + GAP;
            scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        //}
      }, AUTO_SCROLL_INTERVAL);
    }
  }, [isHovering, loading, error, listConferences.length, stopAutoScroll, isAtEnd]); //Thêm isAtEnd khi chặn tự scroll về đầu

  // Effect quản lý việc bắt đầu/dừng auto-scroll dựa trên hover, loading, error
  useEffect(() => {
    // Khi hover thay đổi hoặc loading/error thay đổi, hãy thử lên lịch lại
    // Nếu đang hover hoặc có lỗi/loading, stopAutoScroll sẽ được gọi bên trong scheduleOrStartAutoScroll
    scheduleOrStartAutoScroll();

    // Cleanup khi unmount
    return () => stopAutoScroll();
  }, [isHovering, loading, error, scheduleOrStartAutoScroll, stopAutoScroll]); // Chú ý dependencies

  // --- Logic Manual Scroll ---
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;

    // 1. Dừng ngay lập tức auto-scroll và timer chờ
    stopAutoScroll();
     // console.log("Manual scroll: Auto-scroll stopped and inactivity timer cleared"); // Debug

    // 2. Thực hiện cuộn thủ công
    const scroller = scrollerRef.current;
    const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    const scrollAmount = (isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP) + GAP;
    scroller.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    // 3. Đặt timer mới để bật lại auto-scroll sau một khoảng chờ
    // console.log(`Manual scroll: Setting inactivity timer for ${MANUAL_SCROLL_PAUSE_DURATION}ms`); // Debug
    inactivityTimerRef.current = setTimeout(() => {
      // console.log("Inactivity timer expired, scheduling auto-scroll check..."); // Debug
      scheduleOrStartAutoScroll(); // Lên lịch kiểm tra và bật lại auto-scroll
    }, MANUAL_SCROLL_PAUSE_DURATION);

  }, [stopAutoScroll, scheduleOrStartAutoScroll]); // Thêm dependencies

  return {
    listConferences,
    loading,
    error,
    scrollerRef,
    scroll, // Hàm scroll thủ công đã cập nhật
    isAtStart,
    isAtEnd,
    setIsHovering, // Để component có thể gọi khi hover
  };
};

export default usePopularConferences;