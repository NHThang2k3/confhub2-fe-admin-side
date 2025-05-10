// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  console.log("[Server - /api/auth/logout] Clearing cookies...");
  cookies().delete('user');
  cookies().delete('loginStatus');

  console.log("[Server - /api/auth/logout] Cookies cleared.");
  return NextResponse.json({ message: 'Logged out successfully' });
}