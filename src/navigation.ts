'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n'

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/auth/login': '/auth/login',
  '/auth/verify-email': '/auth/verify-email',
  '/auth/forgot-password': '/auth/forgot-password',
  '/auth/reset-password': '/auth/reset-password',
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })



// Export type này để sử dụng trong các component
export type AppPathname = keyof typeof pathnames;