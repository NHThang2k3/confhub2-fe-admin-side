// src/navigation.ts
// src/navigation.ts
'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n' // Make sure './i18n' correctly exports 'locales'

export const localePrefix = 'always' // Or your preferred setting

export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/dashboard/moderation': '/dashboard/moderation',
  '/dashboard/profile': '/dashboard/profile',
  '/dashboard/notification': '/dashboard/notification',
  '/dashboard/requestAdminTab': '/dashboard/requestAdminTab',
  '/dashboard/logAnalysis': '/dashboard/logAnalysis',
  '/dashboard/crawl': '/dashboard/crawl',
  '/dashboard/conferences': '/dashboard/conferences',
  '/dashboard/accounts/users': '/dashboard/accounts/users', // <-- Add this line
  '/auth/login': '/auth/login',
  '/auth/verify-email': '/auth/verify-email',
  '/auth/forgot-password': '/auth/forgot-password',
  '/auth/reset-password': '/auth/reset-password',
  // Add any other paths your application uses
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } = // Note: usePathname here is from next-intl
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })

// Export this type for use in components
export type AppPathname = keyof typeof pathnames;