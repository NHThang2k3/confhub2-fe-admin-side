// components/Header/components/LoadingIndicator.tsx
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className=''>
      <div className='flex items-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#ffffff'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-log-in mr-2 animate-spin'
        >
          <path
            d='M12 22s8-4 8-10V4'
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <path
            d='M12 2s8 4 8 10'
            style={{ animation: 'spin 1s linear infinite', animationDelay: '0.5s' }}
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingIndicator;