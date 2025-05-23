'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export default function ClientLayout({ children, locale }: ClientLayoutProps) {
  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={locale === 'ar' || locale === 'fa'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
      <Toaster position="top-right" />
      {children}
    </>
  );
} 