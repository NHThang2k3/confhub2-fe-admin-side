// src/components/dashboard/recommendation/ProgressBar.tsx
'use client';

import React from 'react';

interface ProgressBarProps {
    progress: {
        description: string;
        percentage: number;
        current: number;
        total: number;
    };
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="my-3 p-3 bg-gray-20 rounded-md border">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-600 font-mono">
                <span>{progress.description}</span>
                <span>{progress.current} / {progress.total} ({progress.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;