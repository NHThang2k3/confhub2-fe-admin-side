// src/components/common/StatusIcon.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaMinusCircle, FaBan } from 'react-icons/fa'; // Thêm FaBan hoặc icon khác cho skipped

interface StatusIconProps {
    success: boolean | 'skipped' | null | undefined; // Mở rộng kiểu ở đây
    attempted?: boolean | null | undefined;
    hasAttempts?: boolean;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ success, attempted, hasAttempts }) => {
    if (hasAttempts === true) return <FaExclamationTriangle className="text-yellow-500" title="Attempted / Partial Success" />;
    if (success === true) return <FaCheckCircle className="text-green-500" title="Success" />;
    if (success === false) return <FaTimesCircle className="text-red-500" title="Failed" />;
    if (success === 'skipped') return <FaBan className="text-gray-500" title="Skipped" />; // Xử lý 'skipped'
    if (attempted === false) return <FaMinusCircle className="text-gray-400" title="Not Attempted" />; // Đổi title cho rõ hơn

    // Default: Unknown/Not Run (nếu attempted là null/undefined và success cũng vậy)
    // Hoặc Processing (nếu attempted là true nhưng success chưa có giá trị boolean/skipped)
    // Cần xem xét lại logic default này.
    // Nếu 'attempted' là true và 'success' là null/undefined, có thể đó là 'Processing'
    if (attempted === true && (success === null || success === undefined)) {
        return <FaMinusCircle className="text-blue-500 animate-pulse" title="Processing" />; // Ví dụ cho processing
    }

    // Default cuối cùng cho trường hợp không xác định
    return <FaMinusCircle className="text-gray-400" title="Unknown / Not Run" />;
};