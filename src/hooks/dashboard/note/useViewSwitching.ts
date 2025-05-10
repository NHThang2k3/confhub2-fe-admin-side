// useViewSwitching.ts
import { useState, useRef, useEffect } from 'react';

type ViewType = 'day' | 'week' | 'month';

const useViewSwitching = (initialView: ViewType = 'month') => {
    const [view, setView] = useState<ViewType>(initialView);
    const [showViewOptions, setShowViewOptions] = useState(false);
    const viewOptionsRef = useRef<HTMLDivElement>(null);

    const toggleViewOptions = () => {
        setShowViewOptions(!showViewOptions);
    };
    const scrollToDate = (date: Date, viewType: ViewType, calendarRef: React.RefObject<HTMLDivElement>) => {
      if (calendarRef.current) {
        // Day view and week view scroll adjustment
        if (viewType === 'day' || viewType === 'week') {
          const containerRect = calendarRef.current.getBoundingClientRect();
          calendarRef.current.scrollTop = 0; // Reset scroll top
          const timeSlotHeight = 48; // Height of each time slot, you may need to adjust it
          const hour = date.getHours();

          const scrolltop = (hour * timeSlotHeight) - (containerRect.height / 4);
          calendarRef.current.scrollTo({
            top: scrolltop,
            behavior: 'smooth'
          });
        } else {
          // Month view
          const dayElement = calendarRef.current.querySelector(`[data-day="${date.getDate()}"]`);
          if (dayElement) {
            const containerRect = calendarRef.current.getBoundingClientRect();
            const elementRect = dayElement.getBoundingClientRect();
            const scrollLeft = elementRect.left - containerRect.left + calendarRef.current.scrollLeft - (containerRect.width / 2) + (elementRect.width / 2);

            calendarRef.current.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewOptionsRef.current && !viewOptionsRef.current.contains(event.target as Node)) {
                setShowViewOptions(false);
            }
        };

        if (showViewOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showViewOptions]);

    return { view, setView, showViewOptions, toggleViewOptions, viewOptionsRef, scrollToDate };
};

export default useViewSwitching;