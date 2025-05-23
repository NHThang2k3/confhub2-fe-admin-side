// src/appp/[locale]/dashboard/logAnalysis/steps/FileUploadStep.tsx
import React from 'react';
import { FaFileUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface FileUploadStepProps {
  file: File | null;
  isParsing: boolean;
  parseError: string | null;
  parsedDataLength: number;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  canProceed: boolean;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  file,
  isParsing,
  parseError,
  parsedDataLength,
  handleFileChange,
  onNext,
  canProceed,
}) => {
  const hasData = parsedDataLength > 0;

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 1: Import CSV File</h3>
      <p className="text-sm text-gray-600">
        Select a CSV file containing conference data. Required columns: Title, Acronym. Optional: link, cfpLink, impLink.
      </p>
      <div className='flex items-center space-x-4'>
        <label
          className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover: ${isParsing ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <FaFileUpload
            className={`mr-2 ${isParsing ? 'animate-spin' : ''}`}
          />
          <span>
            {isParsing
              ? 'Parsing...'
              : file
                ? 'Change File'
                : 'Choose File'}
          </span>
          <input
            type='file'
            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
            accept='.csv, text/csv'
            onChange={handleFileChange}
            disabled={isParsing}
          />
        </label>
        {file && !isParsing && (
          <span
            className='min-w-0 flex-shrink truncate text-sm text-gray-600'
            title={file.name}
          >
            {file.name}
          </span>
        )}
        {isParsing && (
          <FaSpinner className='animate-spin text-blue-500' />
        )}
      </div>

      {parseError && (
        <p className='mt-2 flex items-center text-sm text-red-600'>
          <FaTimesCircle className='mr-1' /> {parseError}
        </p>
      )}
      {hasData && !isParsing && !parseError && (
        <p className='mt-2 flex items-center text-sm text-green-600'>
          <FaCheckCircle className='mr-1' /> Parsed {parsedDataLength}{' '}
          conferences. Ready to proceed.
        </p>
      )}
      {!hasData && file && !isParsing && !parseError && (
        <p className='mt-2 flex items-center text-sm text-yellow-700'>
          <FaExclamationTriangle className='mr-1' /> Could not find
          valid conference data (Title, Acronym) in the selected file.
        </p>
      )}
       {!file && !isParsing && !parseError && (
         <p className="mt-2 text-sm text-gray-500">Please select a file to begin.</p>
       )}


      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Select Conferences
        </button>
      </div>
    </div>
  );
};

export default FileUploadStep;