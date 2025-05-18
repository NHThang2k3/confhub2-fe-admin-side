// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) { // Changed to POST for simplicity, can be POST
  console.log("[Server API - /api/auth/logout] Attempting to clear cookies...");

  // If you set HttpOnly cookies from the backend for authentication, clear them here.
  // Example:
  // cookies().set({
  //   name: 'sessionToken', // The name of your HttpOnly auth cookie
  //   value: '',
  //   path: '/',
  //   expires: new Date(0), // Set to a past date
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'lax',
  // });

  // The cookies 'user' and 'loginStatus' if set by the client via document.cookie
  // cannot be reliably cleared here if they are not HttpOnly and were not sent with the request.
  // This API route is most effective for clearing HttpOnly server-set cookies.
  // For client-set localStorage/cookies, the client-side logout logic in useAuthApi handles it.

  // For demonstration, clearing the cookies you had:
  // Note: These might not be effective if they weren't HttpOnly and set by the server originally.
  cookies().delete('user');
  cookies().delete('loginStatus');


  console.log("[Server API - /api/auth/logout] Cookie clearing process completed.");
  // It's good practice to ensure the client knows the logout was processed,
  // even if the main effect is clearing HttpOnly cookies.
  return NextResponse.json({ message: 'Logged out successfully from server.' });
}