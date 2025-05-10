// useDialogPosition.ts
import { useState, useCallback } from 'react';
// import useViewSwitching from './useViewSwitching'; // Import useViewSwitching

const useDialogPosition = (
    calendarRef: React.RefObject<HTMLDivElement>,
    dialogRef: React.RefObject<HTMLDivElement>,
    defaultDOMRect: DOMRect,
    view: string // Thêm view vào tham số
) => {
    const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
    // const { view } = useViewSwitching(); // Get the current view

    const calculateDialogPosition = useCallback((targetRect: DOMRect) => {
        const calendarRect = calendarRef.current?.getBoundingClientRect() ?? defaultDOMRect;

        setTimeout(() => {
            if (dialogRef.current) {
                const dialogWidth = dialogRef.current.offsetWidth;
                const dialogHeight = dialogRef.current.offsetHeight;
                
                let x;
                let y;

                // console.log(view); // Log the current view

                if (view === 'day') {
                    // --- DayView Specific Logic ---
                    // Calculate the initial position, centered on the target
                    x = targetRect.left - calendarRect.left + (targetRect.width / 2) - (dialogWidth / 2);
                    y = targetRect.top - calendarRect.top + (targetRect.height / 2) - (dialogHeight / 2);

                    // Adjust x-coordinate to ensure the dialog stays within the calendar bounds
                    x = Math.max(0, x); // Ensure it doesn't go off the left edge
                    x = Math.min(calendarRect.width - dialogWidth, x); // Ensure it doesn't go off the right edge

                    // Adjust y-coordinate (optional, depends on your needs)
                    y = Math.max(0, y);       // Keep dialog within top
                    y = Math.min(calendarRect.height - dialogHeight, y); //Keep dialog with bottom
                    y += 100; // Offset the dialog slightly from the center

                    // --- End DayView Logic ---
                    
                } else {
                    // --- Existing Month/Week Logic ---
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    const availableRight = viewportWidth - targetRect.right;
                    const availableBottom = viewportHeight - targetRect.bottom;

                    x = targetRect.right - calendarRect.left;

                    const calendarMidpointY = calendarRect.top + calendarRect.height / 2;

                    if (targetRect.top < calendarMidpointY) {
                        y = targetRect.top - calendarRect.top;
                    } else {
                        y = targetRect.bottom - calendarRect.top - dialogHeight;
                    }

                    if (availableRight < dialogWidth) {
                        x = targetRect.left - calendarRect.left - dialogWidth;
                    }

                    if (availableBottom < dialogHeight && targetRect.top >= calendarMidpointY) {
                        y = targetRect.top - calendarRect.top - dialogHeight;
                        if (availableRight < dialogWidth) {
                            y = targetRect.top - calendarRect.top - dialogHeight;
                        }
                    }

                    if (targetRect.top < calendarMidpointY && (targetRect.top - calendarRect.top) < dialogHeight) {
                        y = targetRect.bottom - calendarRect.top;
                    }
                    // --- End Existing Logic ---
                    
                }


                setDialogPosition({ x, y });
            }
        }, 0);
    }, [calendarRef, dialogRef, defaultDOMRect, view]); // Add 'view' to dependencies

    return { dialogPosition, calculateDialogPosition };
};

export default useDialogPosition;