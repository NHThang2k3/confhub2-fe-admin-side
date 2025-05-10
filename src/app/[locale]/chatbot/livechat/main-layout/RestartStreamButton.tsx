// components/RestartStreamButton.tsx

import React from "react";

interface RestartStreamButtonProps {
    onRestart: () => void;
}
const RestartStreamButton:React.FC<RestartStreamButtonProps> = ({onRestart}) => {
    return (
        <button
            onClick={onRestart}
            className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition-all duration-200"
            title="Restart Stream"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
            </svg>
        </button>
    );
};

export default RestartStreamButton;