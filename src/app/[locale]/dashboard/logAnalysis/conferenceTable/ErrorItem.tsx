// src/app/[locale]/dashboard/logAnalysis/ErrorItem.tsx

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';
import { LogError } from '@/src/models/logAnalysis';
import { getErrorDisplayProps } from './conferenceTableRowUtils';

interface ErrorItemProps {
  error: LogError;
}

export const ErrorItem: React.FC<ErrorItemProps> = ({ error }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { icon, textColor, bgColor, borderColor } = getErrorDisplayProps(error);

  return (
    <li className={`mb-2 p-2 border rounded ${bgColor} ${borderColor}`}>
      <div className="flex items-start mb-1">
        {icon}
        <div className="flex-grow min-w-0">
          <div className={`font-medium ${textColor} break-words`}>
            {error.sourceService && <span className="font-semibold text-red-900">[{error.sourceService}]</span>}{' '}
            <span className="break-all">{error.message}</span>
          </div>
          {error.errorCode && (
            <div className="text-xs text-gray-500 mt-0.5">
              Error Code: <span className="font-mono">{error.errorCode}</span>
            </div>
          )}
          {error.isRecovered && (
            <div className="text-xs text-green-700 mt-0.5 flex items-center font-semibold">
              <FaCheckCircle className="mr-1" /> Recovered
            </div>
          )}
        </div>
        {(error.details || error.context) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`ml-2 px-2 py-1 text-xs rounded-full ${error.isRecovered ? 'bg-green-200 text-green-700 hover:bg-green-300' : 'bg-red-200 text-red-700 hover:bg-red-300'} transition-colors duration-150 flex-shrink-0`}
            title={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>

      {showDetails && (error.details || error.context) && (
        <div className={`mt-2 p-2 border-t rounded-b-md ${error.isRecovered ? 'bg-green-100 border-green-200' : 'bg-red-150 border-red-200'}`}>
          {error.details && (
            <div className="mb-2">
              <h5 className={`font-semibold ${error.isRecovered ? 'text-green-800' : 'text-red-800'} mb-1`}>Details:</h5>
              <pre className={`custom-scrollbar max-h-[150px] overflow-auto p-1 rounded text-xs break-words ${error.isRecovered ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </div>
          )}
          {error.context && (
            <div>
              <h5 className={`font-semibold ${error.isRecovered ? 'text-green-800' : 'text-red-800'} mb-1`}>Context:</h5>
              <pre className={`custom-scrollbar max-h-[150px] overflow-auto p-1 rounded text-xs break-words ${error.isRecovered ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
};