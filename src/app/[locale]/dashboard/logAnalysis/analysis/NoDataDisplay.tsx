import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface NoDataDisplayProps {
    message: string;
    subMessage?: string;
    icon?: React.ReactNode;
    className?: string;
}

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({
    message,
    subMessage,
    icon = <FaInfoCircle size={24} className="mb-3 text-blue-500" />,
    className = "mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center"
}) => {
    return (
        <div className={className}>
            {icon}
            <p>{message}</p>
            {subMessage && <p className="text-sm mt-1 text-gray-500">{subMessage}</p>}
        </div>
    );
};

export default NoDataDisplay;