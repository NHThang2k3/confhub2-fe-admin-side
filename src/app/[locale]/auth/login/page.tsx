// src/app/[locale]/auth/login/page.tsx
"use client";

import LoginForm from "./LoginForm";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use standard Next.js router for page-level redirects
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { GoogleOAuthProvider } from '@react-oauth/google';

const LoginPage = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isInitializing is true during the first auth check
  // isLoggedIn will be updated after initialization
  const { isLoggedIn, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if initialization is complete AND user is logged in
    if (!isInitializing && isLoggedIn) {
      console.log("[LoginPage] Already logged in, redirecting...");
      router.push(`/${locale}`); // Redirect to the locale's home page
    }
  }, [isLoggedIn, isInitializing, router, locale]); // Add all dependencies

  // Don't render LoginForm if still initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading authentication status...</div>
      </div>
    );
  }

  // If already logged in (and initialization is complete), useEffect will handle redirect.
  // This is a fallback display while redirecting.
  if (isLoggedIn && !isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Redirecting...</div>
      </div>
    );
  }

  // The redirectUri for GoogleOAuthProvider for the @react-oauth/google library
  // is primarily for the popup/implicit flow if handled purely client-side.
  // Since our `useAuth.googleSignIn` initiates a redirect to our backend,
  // the backend handles the actual redirect to Google and then back to our `/auth/callback`.
  // The `GoogleOAuthProvider` is still useful if any child components (like a custom Google button hook)
  // from `@react-oauth/google` are used that require it.

  return (
    <>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GG_CLIENT_ID || ''}>
        {/* Show login form only if not initializing and not logged in */}
        {!isInitializing && !isLoggedIn && (
          <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
            <LoginForm />
          </div>
        )}
      </GoogleOAuthProvider>
    </>
  );
}

export default LoginPage;