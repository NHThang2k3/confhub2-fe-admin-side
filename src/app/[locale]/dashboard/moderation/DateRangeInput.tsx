// src/components/Moderation/DateRangeInput.tsx
'use client';

import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeInputProps {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
}

const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(
({ value, onClick, placeholder }, ref) => (
  <div className="relative">
    <input
      type="text"
      className="w-full cursor-pointer rounded-md border-slate-300 py-2 pl-3 pr-10 text-sm placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
      value={value}
      onClick={onClick}
      ref={ref}
      placeholder={placeholder}
      readOnly
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <Calendar className="h-5 w-5 text-slate-400" aria-hidden="true" />
    </div>
  </div>
));

DateRangeInput.displayName = 'DateRangeInput';

export default DateRangeInput;