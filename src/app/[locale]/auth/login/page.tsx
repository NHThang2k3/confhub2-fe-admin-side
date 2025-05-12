"use client";

import LoginForm from "./LoginForm";
import React, { useEffect, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi';
import { GoogleOAuthProvider } from '@react-oauth/google';

const LoginPage = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const { isLoggedIn, isLoading } = useAuthApi();
  const router = useRouter();

  // Use state to hold the redirect URI, initialize to null
  const [redirectUri, setRedirectUri] = useState<string | null>(null);

  useEffect(() => {
    // Redirect logic: only if logged in and loading is complete
    if (isLoggedIn && !isLoading) {
      router.push(`/${locale}`);
      return; // Stop further execution if redirecting
    }

    // Calculate redirectUri ONLY on the client side after mounting
    // The check 'typeof window !== 'undefined'' is a safeguard,
    // but code inside useEffect generally runs client-side anyway.
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/${locale}/auth/callback`);
    }

  }, [isLoggedIn, isLoading, locale, router]); // Add locale and router to dependencies

  // Get clientId once
  const googleClientId = process.env.NEXT_PUBLIC_GG_CLIENT_ID || '';

  // Only render the form and provider when not loading, not logged in,
  // AND redirectUri has been set (meaning client-side script has run)
  if (isLoading || isLoggedIn || !redirectUri) {
    // You might want to render a loading state here
    // or nothing while waiting for the state/check
    return (
       <div className="min-h-screen flex items-center justify-center">
           {isLoading ? 'Loading...' : isLoggedIn ? 'Redirecting...' : 'Initializing...'}
       </div>
    );
  }

  // If not loading, not logged in, and redirectUri is available, render the form
  return (
    <>
      <GoogleOAuthProvider clientId={googleClientId}>
        <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
          <LoginForm redirectUri={redirectUri} />
        </div>
      </GoogleOAuthProvider>
    </>
  );
}

export default LoginPage;