// pages/oauth-callback.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/src/hooks/auth/useAuthApi';
const OAuthCallback = () => {
  const router = useRouter();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    console.log('Access Token:', accessToken);
    if (accessToken ) {
      localStorage.setItem('token', accessToken as string);
      router.push('/');
    } else {
      router.push('/login?error=missing_tokens');
    }
  }, [router]);

  return <div>Completing login...</div>;
};

export default OAuthCallback;
