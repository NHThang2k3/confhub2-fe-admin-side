// src/components/common/StatusIcon.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaMinusCircle } from 'react-icons/fa';

interface StatusIconProps {
    success: boolean | null | undefined;
    attempted?: boolean | null | undefined;
    hasAttempts?: boolean; // Special case for partial success/attempted
}

export const StatusIcon: React.FC<StatusIconProps> = ({ success, attempted, hasAttempts }) => {
    if (hasAttempts === true) return <FaExclamationTriangle className="text-yellow-500" title="Attempted / Partial Success" />;
    if (success === true) return <FaCheckCircle className="text-green-500" title="Success" />;
    if (success === false) return <FaTimesCircle className="text-red-500" title="Failed" />;
    if (attempted === false) return <FaMinusCircle className="text-gray-400" title="Not Attempted / Skipped" />;
    // Default: Unknown/Not Run/Processing
    return <FaMinusCircle className="text-yellow-500" title="Unknown / Not Run / Processing" />;
};