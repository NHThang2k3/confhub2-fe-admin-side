// useDatePickerControl.ts
import { useState, useRef, useEffect } from 'react';

const useDatePickerControl = () => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    return { showDatePicker, setShowDatePicker, toggleDatePicker, datePickerRef };
};

export default useDatePickerControl;