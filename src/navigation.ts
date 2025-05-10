'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n'

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/conferences': '/conferences',
  '/dashboard': '/dashboard',
  '/journals': '/journals',

  '/chatbot/landingchatbot': '/chatbot/landingchatbot',
  '/chatbot/regularchat': '/chatbot/regularchat',
  '/chatbot/livechat': '/chatbot/livechat',
  '/chatbot/history': '/chatbot/history',
  
  '/visualization/landingvisualization': '/visualization/landingvisualization',
  '/visualization': '/visualization',
  
  '/support': '/support',
  '/other': '/other',
  '/addconference': '/addconference',
  '/conferences/detail': '/conferences/detail',
  '/journals/detail': '/journals/detail',
  '/auth/login': '/auth/login',
  '/auth/register': '/auth/register',
  '/auth/verify-email': '/auth/verify-email',
  '/auth/forgot-password': '/auth/forgot-password',
  '/auth/reset-password': '/auth/reset-password',
  '/updateconference': '/updateconference'
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })



// Export type này để sử dụng trong các component
export type AppPathname = keyof typeof pathnames;