// src/components/Moderation/DateRangeInput.tsx
'use client'; // <-- Add directive

import React, { forwardRef } from 'react';

interface DateRangeInputProps {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
}

// Use forwardRef to allow DatePicker to attach ref to the input element
// DatePicker automatically manages the 'value' prop for custom inputs when selectsRange is true
const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(
({ value, onClick, placeholder }, ref) => (
  <input
    type="text"
    className="rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder={placeholder} // Placeholder prop is already translated by parent
    readOnly // Prevent manual text input
  />
));

DateRangeInput.displayName = 'DateRangeInput';

export default DateRangeInput;