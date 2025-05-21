import React from 'react';
import { FaSyncAlt } from 'react-icons/fa';

interface LoadingScreenProps {
    children?: React.ReactNode; // To allow embedding header or other static elements
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ children, message = "Loading Analysis Data..." }) => {
    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
            {children}
            <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600">
                <FaSyncAlt className="mr-2 animate-spin text-xl" /> {message}
            </div>
        </div>
    );
};

export default LoadingScreen;